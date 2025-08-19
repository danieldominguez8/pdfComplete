import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Switch({ className, ...props }: SwitchProps) {
	return (
		<label className={twMerge('inline-flex cursor-pointer items-center gap-2', className)}>
			<input type="checkbox" className="peer sr-only" {...props} />
			<span className="h-5 w-9 rounded-full border bg-muted peer-checked:bg-primary"></span>
		</label>
	)
}
