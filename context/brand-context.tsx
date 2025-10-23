"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import BRAND_CONFIG from "@/config/brand"

interface BrandConfig {
  name: string
  tagline: string
  primaryColor: string
}

interface BrandContextType {
  brand: BrandConfig
  updateBrand: (config: Partial<BrandConfig>) => void
  resetBrand: () => void
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>({
    name: BRAND_CONFIG.name,
    tagline: BRAND_CONFIG.tagline,
    primaryColor: BRAND_CONFIG.primaryColor,
  })

  // Load saved brand config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('longstrider_brand_config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setBrand({
          name: config.name || BRAND_CONFIG.name,
          tagline: config.tagline || BRAND_CONFIG.tagline,
          primaryColor: config.primaryColor || BRAND_CONFIG.primaryColor,
        })
      } catch (e) {
        console.error('Failed to load brand config:', e)
      }
    }
  }, [])

  const updateBrand = (config: Partial<BrandConfig>) => {
    setBrand(prev => {
      const newBrand = { ...prev, ...config }
      localStorage.setItem('longstrider_brand_config', JSON.stringify(newBrand))
      return newBrand
    })
  }

  const resetBrand = () => {
    setBrand({
      name: BRAND_CONFIG.name,
      tagline: BRAND_CONFIG.tagline,
      primaryColor: BRAND_CONFIG.primaryColor,
    })
    localStorage.removeItem('longstrider_brand_config')
  }

  return (
    <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrandContext() {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error("useBrandContext must be used within a BrandProvider")
  }
  return context
}
