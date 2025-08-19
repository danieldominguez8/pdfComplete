import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
	return (
		<select
			className={twMerge(
				'flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		>
			{children}
		</select>
	)
}
