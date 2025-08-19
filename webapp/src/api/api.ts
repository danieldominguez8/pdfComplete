import type { CombinedFieldsResponse, FieldDef, SchemaMeta } from '@/types/api'

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? '/api'

type HttpMethod = 'GET' | 'POST'

interface RequestOptions {
	method?: HttpMethod
	path: string
	body?: unknown
	headers?: Record<string, string>
	responseType?: 'json' | 'blob'
}

class ApiError extends Error {
	status: number
	url: string
	constructor(message: string, status: number, url: string) {
		super(message)
		this.status = status
		this.url = url
	}
}

async function request<T = unknown>({ method = 'GET', path, body, headers, responseType = 'json' }: RequestOptions): Promise<T> {
	const url = `${API_BASE}${path}`
	const init: RequestInit = {
		method,
		headers: {
			...(responseType === 'json' ? { Accept: 'application/json' } : {}),
			...(body != null ? { 'Content-Type': 'application/json' } : {}),
			...headers,
		},
		body: body != null ? JSON.stringify(body) : undefined,
	}
	const res = await fetch(url, init)
	if (!res.ok) {
		let detail = res.statusText
		try {
			const data = await res.json()
			detail = typeof data?.message === 'string' ? data.message : JSON.stringify(data)
		} catch {
			// ignore
		}
		throw new ApiError(`Request failed: ${detail}`, res.status, url)
	}
	if (responseType === 'blob') {
		return (await res.blob()) as unknown as T
	}
	return (await res.json()) as T
}

export async function listPdfs(): Promise<string[]> {
	return request<string[]>({ path: '/pdfs' })
}

export async function getSchema(): Promise<SchemaMeta> {
	return request<SchemaMeta>({ path: '/fields_schema' })
}

export async function getCombinedFields(pdfs: string[]): Promise<CombinedFieldsResponse> {
	return request<CombinedFieldsResponse>({ method: 'POST', path: '/combined_fields', body: { pdfs } })
}

export async function fillPdf(args: { pdf_filename: string; field_values: Record<string, any>; download_name?: string }): Promise<Blob> {
	return request<Blob>({ method: 'POST', path: '/fill', body: args, responseType: 'blob' })
}

export async function adminRegenerate(adminKey?: string): Promise<{ ok: boolean; version: string }> {
	return request<{ ok: boolean; version: string }>({ method: 'POST', path: '/admin/regenerate', headers: adminKey ? { ADMIN_KEY: adminKey } : undefined })
}

export type { FieldDef }
