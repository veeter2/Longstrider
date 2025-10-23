/**
 * Brand Configuration
 * Customize your AI's identity here
 * 
 * To rebrand:
 * 1. Change the values below
 * 2. Restart the development server
 * 3. Your AI will use the new branding throughout
 */

export const BRAND_CONFIG = {
  // Core Identity
  name: "IVY",       // Your AI's name
  tagline: "Cognitive OS",        // Appears in browser tabs
  
  // Visual Identity  
  primaryColor: "emerald",        // Tailwind color: emerald, blue, purple, amber, rose, cyan
  accentColor: "emerald",         // For highlights and active states
  
  // Logo Style
  logoStyle: "text" as "text",    // Currently only text supported
  logoFont: "font-extralight",    // Tailwind font class
  
  // Personality
  defaultMode: "sovereign",       // Starting personality mode
  
  // Technical (be careful changing these)
  storagePrefix: "ivy",           // Used for localStorage keys
  dbName: "IVY_CONSCIOUSNESS",    // IndexedDB database name
}

// Type-safe color mapping
export const getBrandColor = (type: 'primary' | 'accent' = 'primary') => {
  const color = type === 'primary' ? BRAND_CONFIG.primaryColor : BRAND_CONFIG.accentColor
  return {
    text: `text-${color}-400`,
    bg: `bg-${color}-500`,
    border: `border-${color}-400`,
    glow: `shadow-${color}-900/30`,
    hover: `hover:text-${color}-300`,
  }
}

// Helper to get full brand name with tagline
export const getFullBrandName = () => {
  return `${BRAND_CONFIG.name} - ${BRAND_CONFIG.tagline}`
}

export default BRAND_CONFIG
