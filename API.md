# PDF Complete API Documentation

This document describes the backend API endpoints used by the PDF Complete application.

## Base URL

The API is typically available at `/api` relative to the frontend application, but can be configured using the `VITE_API_BASE` environment variable.

## Endpoints

### PDF Management

#### List PDFs
```http
GET /api/pdfs
```

Returns a list of available PDF files on the server.

**Response:**
```json
[
  "form1.pdf",
  "form2.pdf",
  "application.pdf"
]
```

**Response Type:** `string[]`

### Schema Management

#### Get Schema Metadata
```http
GET /api/fields_schema
```

Returns metadata about the current field schema version and configuration.

**Response:**
```json
{
  "version": "1.0.0",
  "generated_at": "2024-01-01T00:00:00Z",
  "total_pdfs": 15
}
```

**Response Type:** `SchemaMeta`

### Field Operations

#### Get Combined Fields
```http
POST /api/combined_fields
```

Analyzes the selected PDF files and returns a combined list of form fields with deduplication and merging.

**Request Body:**
```json
{
  "pdfs": ["form1.pdf", "form2.pdf"]
}
```

**Response:**
```json
{
  "fields": [
    {
      "name": "Full Name",
      "kind": "text",
      "required": true,
      "occurrences": {
        "form1.pdf": 1,
        "form2.pdf": 1
      }
    },
    {
      "name": "Age",
      "kind": "number",
      "required": false,
      "occurrences": {
        "form1.pdf": 1
      }
    },
    {
      "name": "Country",
      "kind": "text",
      "options": ["US", "CA", "MX"],
      "occurrences": {
        "form2.pdf": 1
      }
    }
  ],
  "notes": [
    "Merged 3 duplicate 'name' fields across PDFs",
    "Found 2 PDFs with overlapping field structure"
  ]
}
```

**Response Type:** `CombinedFieldsResponse`

**Field Properties:**
- `name`: The field identifier/label
- `kind`: Field type (`text`, `number`, `checkbox`, `radio`, `date`)
- `required`: Whether the field is mandatory (optional)
- `options`: Available options for select/radio fields (optional)
- `occurrences`: Map of PDF filename to occurrence count (optional)

### PDF Form Filling

#### Fill PDF Form
```http
POST /api/fill
```

Fills a PDF form with the provided field values and returns the completed PDF.

**Request Body:**
```json
{
  "pdf_filename": "application.pdf",
  "field_values": {
    "Full Name": "John Doe",
    "Age": 30,
    "Country": "US",
    "Married": true
  },
  "download_name": "john_doe_application.pdf"
}
```

**Parameters:**
- `pdf_filename`: Name of the PDF file to fill (required)
- `field_values`: Object mapping field names to values (required)
- `download_name`: Suggested filename for download (optional)

**Response:** Binary PDF file

**Content-Type:** `application/pdf`

### Administrative

#### Regenerate Schema
```http
POST /api/admin/regenerate
```

Administrative endpoint to trigger schema regeneration. Requires admin authentication.

**Headers:**
```
ADMIN_KEY: your-admin-key-here
```

**Response:**
```json
{
  "ok": true,
  "version": "1.0.1"
}
```

**Response Type:** `{ ok: boolean; version: string }`

## Field Types

The API supports the following field types:

### Text Fields (`text`)
```json
{
  "name": "Full Name",
  "kind": "text",
  "required": true
}
```

### Number Fields (`number`)
```json
{
  "name": "Age",
  "kind": "number",
  "required": false
}
```

### Checkbox Fields (`checkbox`)
```json
{
  "name": "Married",
  "kind": "checkbox"
}
```

### Radio/Select Fields (`radio`)
```json
{
  "name": "Country",
  "kind": "radio",
  "options": ["US", "CA", "MX"]
}
```

### Date Fields (`date`)
```json
{
  "name": "Birth Date",
  "kind": "date",
  "required": true
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required (admin endpoints)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

## Data Types

### TypeScript Definitions

```typescript
type PdfName = string;

type FieldKind = 'text' | 'number' | 'checkbox' | 'radio' | 'date';

interface FieldDef {
  name: string;
  kind: FieldKind;
  required?: boolean;
  options?: string[];
  occurrences?: Record<PdfName, number>;
}

interface CombinedFieldsResponse {
  fields: FieldDef[];
  notes?: string[];
}

type SchemaMeta = { version: string } & Record<string, unknown>;
```

## Rate Limiting

The API may implement rate limiting on a per-client basis. Typical limits:

- PDF listing: 100 requests/minute
- Field operations: 50 requests/minute  
- PDF filling: 20 requests/minute
- Admin operations: 10 requests/minute

## Authentication

Currently, only admin endpoints require authentication via the `ADMIN_KEY` header. Regular PDF operations are publicly accessible.

For production deployments, consider implementing user authentication and authorization as needed.

## CORS

The API supports CORS for cross-origin requests from web applications. Ensure your deployment properly configures CORS headers for your domain.

## File Upload

Currently, the API works with pre-uploaded PDF files on the server. File upload functionality would require additional endpoints:

```http
POST /api/upload
Content-Type: multipart/form-data

# Upload new PDF files to the server
```

This endpoint is not yet implemented but could be added for dynamic PDF management.