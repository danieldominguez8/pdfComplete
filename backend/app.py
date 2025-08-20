# backend/app.py
import io
import os
import json
import time
import hashlib
import logging
from typing import Dict, Any, List, Tuple

from flask import Flask, jsonify, request, send_file, abort, send_from_directory
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject, NumberObject

# ---------------------------
# Config & app factory
# ---------------------------

def create_app() -> Flask:
    here = os.path.dirname(os.path.abspath(__file__))
    files_dir = os.environ.get("FILES_DIR", os.path.join(here, "files"))
    schema_path = os.environ.get("SCHEMA_PATH", os.path.join(here, "fields_schema.json"))
    admin_key = os.environ.get("ADMIN_KEY")
    static_dir = os.path.join(here, "static")

    app = Flask(
        __name__,
        static_folder=static_dir if os.path.isdir(static_dir) else None,
        static_url_path="/static" if os.path.isdir(static_dir) else None,
    )
    app.config.update(FILES_DIR=files_dir, SCHEMA_PATH=schema_path, ADMIN_KEY=admin_key)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    app.logger.info(
        "PDFComplete backend starting | FILES_DIR=%s | SCHEMA_PATH=%s | ADMIN_KEY set: %s",
        files_dir, schema_path, "yes" if admin_key else "no"
    )

    os.makedirs(files_dir, exist_ok=True)

    # Routes
    register_routes(app)

    # Optional index if you place a frontend build in /static
    if app.static_folder and os.path.isfile(os.path.join(app.static_folder, "index.html")):
        @app.get("/")
        def root():
            return send_from_directory(app.static_folder, "index.html")

    return app


# ---------------------------
# Utilities / core logic
# ---------------------------

def canonicalize(name: str) -> str:
    """Lowercase and drop spaces/underscores -> for robust dedupe/matching."""
    return "".join(ch for ch in name.lower() if ch not in {" ", "_"})

def list_pdfs(files_dir: str) -> List[str]:
    pdfs = [
        f for f in os.listdir(files_dir)
        if f.lower().endswith(".pdf") and os.path.isfile(os.path.join(files_dir, f))
    ]
    pdfs.sort(key=str.lower)
    return pdfs

def _field_kind_from_annot(annot) -> str:
    """
    Map PDF /FT to simple kinds:
      /Tx -> text, /Btn -> checkbox or radio (bit 15), /Ch -> treat as text, /Sig -> text
    """
    ft = annot.get("/FT")
    if ft == NameObject("/Tx"):
        return "text"
    if ft == NameObject("/Ch"):
        return "text"
    if ft == NameObject("/Sig"):
        return "text"
    if ft == NameObject("/Btn"):
        ff = annot.get("/Ff")
        try:
            flags = int(ff) if isinstance(ff, (int, NumberObject)) else 0
        except Exception:
            flags = 0
        is_radio = bool(flags & (1 << 15))
        return "radio" if is_radio else "checkbox"
    return "text"

def discover_fields_for_pdf(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Return FieldDef-like dicts unique by display name (/T):
      [{ name, kind, occurrences }, ...]
    """
    reader = PdfReader(pdf_path)
    counts: Dict[str, Dict[str, Any]] = {}
    for page in reader.pages:
        annots = page.get("/Annots") or []
        for ref in annots:
            annot = ref.get_object() if hasattr(ref, "get_object") else ref
            if annot.get("/Subtype") != NameObject("/Widget"):
                continue
            name_obj = annot.get("/T")
            if not name_obj:
                continue
            raw_name = str(name_obj)
            kind = _field_kind_from_annot(annot)
            if raw_name not in counts:
                counts[raw_name] = {"name": raw_name, "kind": kind, "occurrences": 0}
            counts[raw_name]["occurrences"] += 1
    return sorted(counts.values(), key=lambda d: d["name"].lower())

def union_and_dedupe_fields(selected_pdfs: List[str], per_pdf_fields: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    Merge fields across selected PDFs into a union, deduped by canonical name.
    Keep first-seen display name/kind; merge occurrence counts by PDF.
    """
    merged: Dict[str, Dict[str, Any]] = {}
    for pdf in selected_pdfs:
        fields = per_pdf_fields.get(pdf) or []
        for f in fields:
            name = f["name"]
            canon = canonicalize(name)
            if canon not in merged:
                merged[canon] = {
                    "name": name,
                    "kind": f.get("kind", "text"),
                    "required": False,
                    "options": None,
                    "occurrences": {pdf: int(f.get("occurrences", 1))},
                }
            else:
                ex = merged[canon]
                ex["occurrences"][pdf] = ex["occurrences"].get(pdf, 0) + int(f.get("occurrences", 1))
                if ex["kind"] == "text" and f.get("kind") in {"checkbox", "radio"}:
                    ex["kind"] = f.get("kind")
    out = list(merged.values())
    out.sort(key=lambda d: d["name"].lower())
    return out

def _compute_version(files_dir: str, per_pdf: List[Dict[str, Any]]) -> str:
    """
    Version hash from filenames + mtimes + sizes + field names/kinds/counts (stable for cache busting).
    """
    h = hashlib.sha256()
    for name in list_pdfs(files_dir):
        path = os.path.join(files_dir, name)
        st = os.stat(path)
        h.update(name.encode("utf-8"))
        h.update(str(int(st.st_mtime)).encode("ascii"))
        h.update(str(st.st_size).encode("ascii"))
    for entry in per_pdf:
        h.update(entry["pdf"].encode("utf-8"))
        for f in entry.get("fields", []):
            h.update(f["name"].lower().encode("utf-8"))
            h.update((f.get("kind") or "").encode("utf-8"))
            h.update(str(int(f.get("occurrences", 0))).encode("ascii"))
    return h.hexdigest()[:16]

def regenerate_schema(files_dir: str, schema_path: str) -> Dict[str, Any]:
    per_pdf = []
    for pdf in list_pdfs(files_dir):
        fields = discover_fields_for_pdf(os.path.join(files_dir, pdf))
        per_pdf.append({"pdf": pdf, "fields": fields})
    data = {
        "version": _compute_version(files_dir, per_pdf),
        "generated_at": int(time.time()),
        "pdfs": [p["pdf"] for p in per_pdf],
        "per_pdf": per_pdf,
        "notes": ["Union-of-fields frontend; dedupe by case-insensitive name; spaces/underscores ignored."],
    }
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

def load_or_build_schema(files_dir: str, schema_path: str) -> Dict[str, Any]:
    if os.path.isfile(schema_path):
        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "version" in data:
                    return data
        except Exception:
            pass
    return regenerate_schema(files_dir, schema_path)

def _page_field_names_with_types(page) -> List[Tuple[str, str]]:
    names: List[Tuple[str, str]] = []
    annots = page.get("/Annots") or []
    for ref in annots:
        annot = ref.get_object() if hasattr(ref, "get_object") else ref
        if annot.get("/Subtype") != NameObject("/Widget"):
            continue
        name_obj = annot.get("/T")
        if not name_obj:
            continue
        raw_name = str(name_obj)
        kind = _field_kind_from_annot(annot)
        names.append((raw_name, kind))
    return names

def _coerce_checkbox(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        v = value.strip().lower()
        return v in {"1", "true", "yes", "y", "on", "checked"}
    return False

def fill_pdf_bytes(pdf_path: str, field_values: Dict[str, Any]) -> bytes:
    """
    Fill a PDF: match input keys by canonicalized name so repeated widgets
    and minor name variations are all set.
    """
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    writer.append(reader)

    normalized_inputs: Dict[str, Any] = {canonicalize(k): v for k, v in field_values.items()}

    for page in writer.pages:
        page_fields = _page_field_names_with_types(page)
        to_update: Dict[str, Any] = {}
        for actual_name, kind in page_fields:
            canon = canonicalize(actual_name)
            if canon not in normalized_inputs:
                continue
            raw_val = normalized_inputs[canon]
            if kind == "checkbox":
                to_update[actual_name] = _coerce_checkbox(raw_val)
            elif kind == "radio":
                to_update[actual_name] = "" if raw_val is None else str(raw_val)
            else:
                to_update[actual_name] = "" if raw_val is None else str(raw_val)
        if to_update:
            writer.update_page_form_field_values(page, to_update)

    try:
        if "/AcroForm" in writer._root_object:
            acro = writer._root_object["/AcroForm"]
            acro.update({NameObject("/NeedAppearances"): BooleanObject(True)})
    except Exception:
        pass

    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


# ---------------------------
# Routes (fixed contract)
# ---------------------------

def register_routes(app: Flask) -> None:
    @app.get("/healthz")
    def healthz():
        return jsonify({"ok": True})

    @app.get("/pdfs")
    def get_pdfs():
        return jsonify(list_pdfs(app.config["FILES_DIR"]))

    @app.get("/fields_schema")
    def fields_schema():
        data = load_or_build_schema(app.config["FILES_DIR"], app.config["SCHEMA_PATH"])
        # Contract: at least { version: string, ... }
        return jsonify(data)

    @app.post("/combined_fields")
    def combined_fields():
        body = request.get_json(silent=True) or {}
        pdfs = body.get("pdfs")
        if not isinstance(pdfs, list) or not all(isinstance(p, str) for p in pdfs):
            abort(400, description="Body must be { pdfs: string[] }")

        data = load_or_build_schema(app.config["FILES_DIR"], app.config["SCHEMA_PATH"])
        per_pdf = {item["pdf"]: item["fields"] for item in data.get("per_pdf", [])}
        fields = union_and_dedupe_fields(pdfs, per_pdf)

        notes: List[str] = []
        missing = [p for p in pdfs if p not in per_pdf]
        if missing:
            notes.append(f"Some PDFs were not indexed yet: {', '.join(missing)}. Try /admin/regenerate.")

        return jsonify({"fields": fields, "notes": notes or None})

    @app.post("/fill")
    def fill():
        body = request.get_json(silent=True) or {}
        pdf_filename = body.get("pdf_filename")
        field_values = body.get("field_values", {})
        download_name = body.get("download_name")

        if not isinstance(pdf_filename, str) or not pdf_filename.lower().endswith(".pdf"):
            abort(400, description="pdf_filename is required and must end with .pdf")
        if not isinstance(field_values, dict):
            abort(400, description="field_values must be an object")

        safe = os.path.basename(pdf_filename)
        source_path = os.path.join(app.config["FILES_DIR"], safe)
        if not os.path.isfile(source_path):
            abort(404, description="PDF not found")

        pdf_bytes = fill_pdf_bytes(source_path, field_values)
        download_name = download_name or f"{os.path.splitext(safe)[0]}_filled.pdf"

        return send_file(io.BytesIO(pdf_bytes),
                         mimetype="application/pdf",
                         as_attachment=True,
                         download_name=download_name,
                         max_age=0)

    @app.post("/admin/regenerate")
    def admin_regenerate():
        # Require ADMIN_KEY if configured (do not log or expose its value)
        required = app.config.get("ADMIN_KEY")
        if required:
            provided = request.headers.get("X-Admin-Key") or request.headers.get("ADMIN_KEY")
            if provided != required:
                abort(403, description="Admin key required")
        data = regenerate_schema(app.config["FILES_DIR"], app.config["SCHEMA_PATH"])
        return jsonify({"ok": True, "version": data["version"]})


# ---------------------------
# Entrypoint
# ---------------------------

if __name__ == "__main__":
    # Allow `python backend/app.py` as a quick run (dev only)
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)
