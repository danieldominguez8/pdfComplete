import { describe, it, expect } from 'vitest'
import type { FieldDef } from '@/types/api'
import { dedupeFields } from './dedupeFields'

describe('dedupeFields', () => {
	it('dedupes by case-insensitive name and merges occurrences', () => {
		const input: FieldDef[] = [
			{ name: 'Name', kind: 'text', required: true, occurrences: { 'a.pdf': 1 } },
			{ name: 'name', kind: 'text', occurrences: { 'a.pdf': 2, 'b.pdf': 1 } },
			{ name: 'NAME', kind: 'text', occurrences: { 'b.pdf': 3 } },
		]
		const out = dedupeFields(input)
		expect(out).toHaveLength(1)
		const f = out[0]
		expect(f.name).toBe('Name')
		expect(f.kind).toBe('text')
		expect(f.required).toBe(true)
		expect(f.occurrences).toEqual({ 'a.pdf': 3, 'b.pdf': 4 })
	})

	it('merges options as a unique union', () => {
		const input: FieldDef[] = [
			{ name: 'Country', kind: 'text', options: ['US', 'CA'] },
			{ name: 'country', kind: 'text', options: ['CA', 'MX'] },
		]
		const out = dedupeFields(input)
		expect(out).toHaveLength(1)
		expect(out[0].options).toEqual(['US', 'CA', 'MX'])
	})
})
