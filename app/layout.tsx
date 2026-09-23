import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbit — Social Media Agent Hub',
  description: 'Create, review, and publish social content from one focused workspace.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090b',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}</body></html>
}
