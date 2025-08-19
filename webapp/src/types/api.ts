export type PdfName = string;

export type FieldKind = 'text' | 'number' | 'checkbox' | 'radio' | 'date';

export interface FieldDef {
	name: string;
	kind: FieldKind;
	required?: boolean;
	options?: string[];
	/** Map of PDF filename to number of occurrences for this field */
	occurrences?: Record<PdfName, number>;
}

export interface CombinedFieldsResponse {
	fields: FieldDef[];
	notes?: string[];
}

export type SchemaMeta = { version: string } & Record<string, unknown>;
