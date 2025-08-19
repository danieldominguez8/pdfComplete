import type { FieldDef, PdfName } from '@/types/api'

function normalizeName(name: string): string {
	return name.trim().toLowerCase()
}

function mergeOccurrences(a?: Record<PdfName, number>, b?: Record<PdfName, number>): Record<PdfName, number> | undefined {
	if (!a && !b) return undefined
	const out: Record<PdfName, number> = {}
	if (a) {
		for (const [pdf, count] of Object.entries(a)) out[pdf] = (out[pdf] ?? 0) + (count ?? 0)
	}
	if (b) {
		for (const [pdf, count] of Object.entries(b)) out[pdf] = (out[pdf] ?? 0) + (count ?? 0)
	}
	return out
}

export function dedupeFields(fields: FieldDef[]): FieldDef[] {
	const map = new Map<string, FieldDef>()
	for (const f of fields) {
		const key = normalizeName(f.name)
		const existing = map.get(key)
		if (!existing) {
			// Shallow clone to avoid mutating the original input
			map.set(key, { ...f, options: f.options ? [...new Set(f.options)] : undefined, occurrences: f.occurrences ? { ...f.occurrences } : undefined })
			continue
		}
		// Retain first seen kind and name casing per requirements
		const merged: FieldDef = {
			...existing,
			// Merge occurrences by summing counts per-PDF
			occurrences: mergeOccurrences(existing.occurrences, f.occurrences),
		}
		// Merge options as a unique union, preserving order from the existing then new
		if (existing.options || f.options) {
			const set = new Set<string>([...(existing.options ?? []), ...(f.options ?? [])])
			merged.options = Array.from(set)
		}
		// If any duplicate marks required, prefer keeping required true; otherwise don't overwrite an explicit false
		if (f.required) merged.required = true
		map.set(key, merged)
	}
	return Array.from(map.values())
}
