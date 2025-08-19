import * as React from 'react'

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
	const ref = React.useRef<HTMLDialogElement>(null)
	React.useEffect(() => {
		const el = ref.current
		if (!el) return
		if (open && !el.open) el.showModal()
		if (!open && el.open) el.close()
	}, [open])
	return (
		<dialog ref={ref} onClose={() => onOpenChange(false)} className="rounded-lg border p-0">
			{children}
		</dialog>
	)
}

export function DialogContent({ children }: { children: React.ReactNode }) {
	return <div className="p-6">{children}</div>
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
	return <div className="border-b p-6 pb-3 font-semibold">{children}</div>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
	return <div className="flex justify-end gap-2 border-t p-4">{children}</div>
}
