import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	pressed?: boolean
}

export function Toggle({ className, pressed, ...props }: ToggleProps) {
	return (
		<button
			data-state={pressed ? 'on' : 'off'}
			className={twMerge(
				'inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm data-[state=on]:bg-accent',
				className,
			)}
			{...props}
		/>
	)
}
