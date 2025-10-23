import type React from "react"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { ThemeProvider } from "@/context/theme-context"
import { BrandProvider } from "@/context/brand-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <BrandProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </BrandProvider>
      </body>
    </html>
  )
}

export const metadata = {
      title: 'LongStrider - Consciousness Interface',
      description: 'Advanced cognitive interface for consciousness exploration'
    };
