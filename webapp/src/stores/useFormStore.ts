import { create } from 'zustand'
import { dedupeFields } from '@/lib/dedupeFields'
import type { FieldDef, SchemaMeta } from '@/types/api'
import { getCombinedFields, getSchema, listPdfs } from '@/api/api'

export interface FormStoreState {
	// Data
	allPdfs: string[]
	selectedPdfs: string[]
	combinedFields: FieldDef[]
	fieldValues: Record<string, any>
	schemaVersion: string | null
	// Busy flags
	isLoadingPdfs: boolean
	isLoadingFields: boolean
	isFilling: boolean
	// Cache: signature => combinedFields
	fieldsCache: Record<string, FieldDef[]>
	// Actions
	loadPdfs: () => Promise<void>
	loadSchema: () => Promise<void>
	setSelectedPdfs: (pdfs: string[]) => Promise<void>
	fetchCombinedFields: () => Promise<void>
	updateFieldValue: (name: string, value: any) => void
	reset: () => void
}

function selectionSignature(pdfs: string[]): string {
	// Order-independent signature for caching
	return [...pdfs].sort((a, b) => a.localeCompare(b)).join('||')
}

export const useFormStore = create<FormStoreState>((set, get) => ({
	allPdfs: [],
	selectedPdfs: [],
	combinedFields: [],
	fieldValues: {},
	schemaVersion: null,
	isLoadingPdfs: false,
	isLoadingFields: false,
	isFilling: false,
	fieldsCache: {},

	async loadPdfs() {
		set({ isLoadingPdfs: true })
		try {
			const pdfs = await listPdfs()
			set({ allPdfs: pdfs })
		} finally {
			set({ isLoadingPdfs: false })
		}
	},

	async loadSchema() {
		const schema: SchemaMeta = await getSchema()
		const version = typeof schema.version === 'string' ? schema.version : String(schema.version)
		set({ schemaVersion: version })
	},

	async setSelectedPdfs(pdfs: string[]) {
		set({ selectedPdfs: pdfs })
		await get().fetchCombinedFields()
	},

	async fetchCombinedFields() {
		const pdfs = get().selectedPdfs
		const sig = selectionSignature(pdfs)
		// Serve from cache if available
		const cached = get().fieldsCache[sig]
		if (cached) {
			set({ combinedFields: cached })
			return
		}
		if (pdfs.length === 0) {
			set({ combinedFields: [] })
			return
		}
		set({ isLoadingFields: true })
		try {
			const res = await getCombinedFields(pdfs)
			const deduped = dedupeFields(res.fields)
			set((state) => ({
				combinedFields: deduped,
				fieldsCache: { ...state.fieldsCache, [sig]: deduped },
			}))
		} finally {
			set({ isLoadingFields: false })
		}
	},

	updateFieldValue(name: string, value: any) {
		set((state) => ({ fieldValues: { ...state.fieldValues, [name]: value } }))
	},

	reset() {
		set({
			allPdfs: [],
			selectedPdfs: [],
			combinedFields: [],
			fieldValues: {},
			schemaVersion: null,
			isLoadingPdfs: false,
			isLoadingFields: false,
			isFilling: false,
			fieldsCache: {},
		})
	},
}))

export { selectionSignature }
