import * as React from 'react'
import { useFormStore } from '@/stores/useFormStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export function LibraryList() {
	const {
		allPdfs,
		selectedPdfs,
		isLoadingPdfs,
		isLoadingFields,
		combinedFields,
		loadPdfs,
		setSelectedPdfs,
	} = useFormStore()

	const [query, setQuery] = React.useState('')
	const [tagFilter, setTagFilter] = React.useState<'all' | 'hasTag' | 'noTag'>('all')

	React.useEffect(() => {
		if (allPdfs.length === 0) {
			void loadPdfs()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase()
		let list = allPdfs
		if (q) list = list.filter((n) => n.toLowerCase().includes(q))
		// Tag filter stub: currently not implemented; placeholder for future logic
		if (tagFilter !== 'all') {
			list = list
		}
		return list
	}, [allPdfs, query, tagFilter])

	function onToggle(name: string) {
		const set = new Set(selectedPdfs)
		if (set.has(name)) set.delete(name)
		else set.add(name)
		void setSelectedPdfs(Array.from(set))
	}

	function onSelectAll() {
		const union = Array.from(new Set([...selectedPdfs, ...filtered]))
		void setSelectedPdfs(union)
	}

	function onClearAll() {
		void setSelectedPdfs([])
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center gap-2">
					<Input
						placeholder="Search PDFs..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="max-w-sm"
					/>
					<Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value as any)}>
						<option value="all">All tags (stub)</option>
						<option value="hasTag">Has tag (stub)</option>
						<option value="noTag">No tag (stub)</option>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="secondary" onClick={onSelectAll} disabled={filtered.length === 0}>
						Select all
					</Button>
					<Button variant="outline" onClick={onClearAll} disabled={selectedPdfs.length === 0}>
						Clear all
					</Button>
				</div>
			</div>

			<div className="rounded-md border">
				{isLoadingPdfs ? (
					<div className="p-4 text-sm text-muted-foreground">Loading PDFs…</div>
				) : filtered.length === 0 ? (
					<div className="p-4 text-sm text-muted-foreground">No PDFs found.</div>
				) : (
					<ul className="divide-y">
						{filtered.map((name) => {
							const checked = selectedPdfs.includes(name)
							return (
								<li key={name} className="flex items-center gap-3 px-4 py-2">
									<input
										type="checkbox"
										checked={checked}
										onChange={() => onToggle(name)}
										className="h-4 w-4"
									/>
									<span className="flex-1 truncate">{name}</span>
									{checked ? (
										<span className="rounded-full border bg-accent px-2 py-0.5 text-xs text-accent-foreground">Selected</span>
									) : null}
								</li>
							)
						})}
					</ul>
				)}
			</div>

			<div className="flex flex-col gap-2">
				<div className="text-sm text-muted-foreground">
					Selected {selectedPdfs.length} of {allPdfs.length} PDFs
					{' • '}
					{isLoadingFields ? 'Loading fields…' : `Combined fields: ${combinedFields.length}`}
				</div>
				{selectedPdfs.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{selectedPdfs.map((name) => (
							<span key={name} className="rounded-full border px-2 py-0.5 text-xs">
								{name}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
