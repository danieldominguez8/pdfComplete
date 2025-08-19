import * as React from 'react'

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
	return (
		<span title={content}>
			{children}
		</span>
	)
}
