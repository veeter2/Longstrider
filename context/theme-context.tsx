"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ThemeType = "sovereign" | "tracker" | "strategist" | "companion" | "architect" | "challenger"

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "sovereign",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("sovereign")
  const [isClient, setIsClient] = useState(false)

  // Set client state on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    const savedTheme = localStorage.getItem("ivy-theme") as ThemeType | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [isClient])

  // Save to localStorage when theme changes (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    localStorage.setItem("ivy-theme", theme)
  }, [theme, isClient])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useThemeContext = () => useContext(ThemeContext)
