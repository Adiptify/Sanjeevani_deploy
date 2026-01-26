import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sanjeevni AI - Your Health Companion',
  description: 'AI-Powered Healthcare Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full font-['Montserrat']">{children}</body>
    </html>
  )
}
