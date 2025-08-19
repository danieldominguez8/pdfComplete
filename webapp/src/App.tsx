import { useEffect } from 'react'
import { LibraryList } from '@/components/LibraryList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './index.css'

function TopBar() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background">
			<div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4">
				<div className="font-semibold">PDF Form Filler</div>
				<ThemeToggle />
			</div>
		</header>
	)
}

function ThemeToggle() {
	useEffect(() => {
		const root = document.documentElement
		const stored = localStorage.getItem('theme')
		if (stored) root.classList.toggle('dark', stored === 'dark')
	}, [])

	function toggle() {
		const root = document.documentElement
		const isDark = root.classList.toggle('dark')
		localStorage.setItem('theme', isDark ? 'dark' : 'light')
	}

	return (
		<button onClick={toggle} className="rounded border px-3 py-1 text-sm">
			Toggle theme
		</button>
	)
}

export default function App() {
	return (
		<div className="flex min-h-screen flex-col">
			<TopBar />
			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
				<Card>
					<CardHeader>
						<CardTitle>Select PDFs</CardTitle>
					</CardHeader>
					<CardContent>
						<LibraryList />
					</CardContent>
				</Card>
			</main>
		</div>
	)
}
