import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormStore, selectionSignature } from './useFormStore'
import * as api from '@/api/api'
import type { FieldDef } from '@/types/api'

const fieldsA: FieldDef[] = [
	{ name: 'Name', kind: 'text' },
	{ name: 'Age', kind: 'number' },
]
const fieldsB: FieldDef[] = [
	{ name: 'Name', kind: 'text' },
	{ name: 'Country', kind: 'text' },
]

describe('useFormStore', () => {
	beforeEach(() => {
		useFormStore.getState().reset()
	})

	it('selectionSignature is order-independent', () => {
		expect(selectionSignature(['b.pdf', 'a.pdf'])).toBe(selectionSignature(['a.pdf', 'b.pdf']))
	})

	it('caches combined fields per selection signature only', async () => {
		const spy = vi.spyOn(api, 'getCombinedFields')
			.mockResolvedValueOnce({ fields: fieldsA })
			.mockResolvedValueOnce({ fields: fieldsB })

		await useFormStore.getState().setSelectedPdfs(['a.pdf', 'b.pdf'])
		const first = useFormStore.getState().combinedFields
		// Reorder selection; should hit cache, not call API again
		await useFormStore.getState().setSelectedPdfs(['b.pdf', 'a.pdf'])
		const second = useFormStore.getState().combinedFields

		expect(spy).toHaveBeenCalledTimes(1)
		expect(first.map((f) => f.name)).toEqual(['Name', 'Age'])
		expect(second.map((f) => f.name)).toEqual(['Name', 'Age'])
	})

	it('has no filterMode anywhere', () => {
		const state = useFormStore.getState() as any
		expect('filterMode' in state).toBe(false)
	})
})
