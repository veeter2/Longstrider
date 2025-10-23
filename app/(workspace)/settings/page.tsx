"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SettingsIcon,
  Database,
  User,
  Building2,
  Brain,
  RefreshCw,
  Loader2,
  Trash2,
  Save,
  Key,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TestTube,
  AlertCircle,
} from "lucide-react"

// ========================================
// TYPES & CONSTANTS
// ========================================

type AccountType = "personal" | "business" | "enterprise"
type LLMProvider = "openai" | "anthropic" | "groq" | "local"

interface SettingsState {
  firstName: string
  lastName: string
  email: string
  userId: string
  memoryTraceId: string
  accountType: AccountType
  companyName: string
  department: string
  division: string
  orgId: string
  llmProvider: LLMProvider
  llmModel: string
  temperature: number
  maxTokens: number
  supabaseUrl: string
  supabaseKey: string
  isConnected: boolean
  isAwakening: boolean
  lastAwakening: Date | null
}

// ========================================
// UTILITIES
// ========================================

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function SettingsPage() {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    business: false,
    connections: true,
  })

  const [settings, setSettings] = useState<SettingsState>({
    firstName: "",
    lastName: "",
    email: "",
    userId: "",
    memoryTraceId: "",
    accountType: "personal",
    companyName: "",
    department: "",
    division: "",
    orgId: "",
    llmProvider: "openai",
    llmModel: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    supabaseUrl: "",
    supabaseKey: "",
    isConnected: false,
    isAwakening: false,
    lastAwakening: null,
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // MIGRATION: Copy old ivy_* keys to ls_* keys
    const migrateKey = (oldKey: string, newKey: string) => {
      const oldValue = localStorage.getItem(oldKey)
      const newValue = localStorage.getItem(newKey)
      if (oldValue && !newValue) {
        localStorage.setItem(newKey, oldValue)
        console.log(`[Settings] Migrated ${oldKey} -> ${newKey}`)
      }
    }

    migrateKey('ivy_user_email', 'ls_user_email')
    migrateKey('ivy_user_id', 'ls_user_id')
    migrateKey('ivy_memory_trace_id', 'ls_memory_trace_id')
    migrateKey('ivy_supabase_url', 'ls_supabase_url')
    migrateKey('ivy_supabase_key', 'ls_supabase_key')
    migrateKey('ivy_org_id', 'ls_org_id')

    const savedFirstName = localStorage.getItem("ls_first_name") || ""
    const savedLastName = localStorage.getItem("ls_last_name") || ""
    const savedEmail = localStorage.getItem("ls_user_email") || ""
    const savedUserId = localStorage.getItem("ls_user_id") || ""
    const savedMemoryTraceId = localStorage.getItem("ls_memory_trace_id") || ""
    const savedSupabaseUrl = localStorage.getItem("ls_supabase_url") || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const savedSupabaseKey = localStorage.getItem("ls_supabase_key") || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    const savedCompanyName = localStorage.getItem("ls_company_name") || ""
    const savedDepartment = localStorage.getItem("ls_department") || ""
    const savedDivision = localStorage.getItem("ls_division") || ""
    const savedOrgId = localStorage.getItem("ls_org_id") || ""

    // Auto-create session ID if it doesn't exist
    let savedSessionId = localStorage.getItem("ls_session_id")
    if (!savedSessionId) {
      savedSessionId = crypto.randomUUID()
      localStorage.setItem("ls_session_id", savedSessionId)
    }
    const savedLLMProvider = (localStorage.getItem("ls_llm_provider") || "openai") as LLMProvider
    const savedLLMModel = localStorage.getItem("ls_llm_model") || "gpt-4"

    setSettings((prev) => ({
      ...prev,
      firstName: savedFirstName,
      lastName: savedLastName,
      email: savedEmail,
      userId: savedUserId,
      memoryTraceId: savedMemoryTraceId,
      supabaseUrl: savedSupabaseUrl,
      supabaseKey: savedSupabaseKey,
      companyName: savedCompanyName,
      department: savedDepartment,
      division: savedDivision,
      orgId: savedOrgId,
      accountType: savedOrgId ? "enterprise" : "personal",
      llmProvider: savedLLMProvider,
      llmModel: savedLLMModel,
      isConnected: !!savedUserId && !!savedSupabaseUrl,
    }))
  }, [])

  const generateId = (type: "user" | "memory" | "org") => {
    const id = crypto.randomUUID()
    if (type === "user") {
      setSettings((prev) => ({ ...prev, userId: id }))
      localStorage.setItem("ls_user_id", id)
    } else if (type === "memory") {
      setSettings((prev) => ({ ...prev, memoryTraceId: id }))
      localStorage.setItem("ls_memory_trace_id", id)
    } else if (type === "org") {
      setSettings((prev) => ({ ...prev, orgId: id }))
      localStorage.setItem("ls_org_id", id)
    }
    setHasChanges(true)
  }

  const saveSettings = useCallback(() => {
    // Validate critical fields
    if (!settings.userId) {
      alert("❌ ERROR: User ID is required! Click 'Generate' to create one.")
      return
    }

    if (!settings.supabaseUrl || !settings.supabaseKey) {
      alert("❌ ERROR: Supabase URL and Key are required!\n\nPlease fill in both fields before saving.")
      return
    }

    // Save all settings
    localStorage.setItem("ls_first_name", settings.firstName || "")
    localStorage.setItem("ls_last_name", settings.lastName || "")
    localStorage.setItem("ls_user_email", settings.email || "")
    localStorage.setItem("ls_user_id", settings.userId)
    localStorage.setItem("ls_memory_trace_id", settings.memoryTraceId || crypto.randomUUID())
    localStorage.setItem("ls_supabase_url", settings.supabaseUrl)
    localStorage.setItem("ls_supabase_key", settings.supabaseKey)
    localStorage.setItem("ls_company_name", settings.companyName || "")
    localStorage.setItem("ls_department", settings.department || "")
    localStorage.setItem("ls_division", settings.division || "")
    localStorage.setItem("ls_org_id", settings.orgId || "")
    localStorage.setItem("ls_llm_provider", settings.llmProvider || "openai")
    localStorage.setItem("ls_llm_model", settings.llmModel || "gpt-4")

    // Ensure session_id exists
    if (!localStorage.getItem("ls_session_id")) {
      localStorage.setItem("ls_session_id", crypto.randomUUID())
    }

    setHasChanges(false)

    // Verify what actually saved
    const saved = {
      userId: localStorage.getItem("ls_user_id"),
      memoryId: localStorage.getItem("ls_memory_trace_id"),
      sessionId: localStorage.getItem("ls_session_id"),
      supabaseUrl: localStorage.getItem("ls_supabase_url"),
      supabaseKey: localStorage.getItem("ls_supabase_key")
    }

    const message = "✅ SAVED SUCCESSFULLY!\n\n" +
      "User ID: " + (saved.userId || "❌ MISSING") + "\n" +
      "Memory ID: " + (saved.memoryId || "❌ MISSING") + "\n" +
      "Session ID: " + (saved.sessionId || "❌ MISSING") + "\n" +
      "Supabase URL: " + (saved.supabaseUrl ? "✓ SET" : "❌ MISSING") + "\n" +
      "Supabase Key: " + (saved.supabaseKey ? "✓ SET" : "❌ MISSING")

    alert(message)
    console.log("[Settings] Saved configuration:", saved)
  }, [settings])

  const testConnection = useCallback(async () => {
    setSettings((prev) => ({ ...prev, isAwakening: true }))

    try {
      // Test Supabase connection
      if (settings.supabaseUrl && settings.supabaseKey) {
        const client = createClient(settings.supabaseUrl, settings.supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })

        // Simple connection test
        const { error } = await client.from("meta_memory_log").select("*", { head: true, count: "exact" })

        if (error) {
          alert(`Connection test failed: ${error.message}`)
          setSettings((prev) => ({ ...prev, isAwakening: false, isConnected: false }))
          return
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSettings((prev) => ({
        ...prev,
        isAwakening: false,
        isConnected: true,
        lastAwakening: new Date(),
      }))

      alert("Connection test successful!")
    } catch (error: any) {
      alert(`Connection test failed: ${error.message}`)
      setSettings((prev) => ({ ...prev, isAwakening: false, isConnected: false }))
    }
  }, [settings.supabaseUrl, settings.supabaseKey])

  const clearCache = () => {
    // Clear old IVY keys if they exist
    localStorage.removeItem("ivy_preflight_last_test")
    localStorage.removeItem("ivy_preflight_last_result")
    localStorage.removeItem("ivy_preflight_ok")
    localStorage.removeItem("ivy_session_active")
    alert("Cache cleared successfully")
  }

  const resetOnboarding = () => {
    if (!confirm("This will clear your onboarding profile so you can retake it. Continue?")) return

    localStorage.removeItem("longstrider_cognitive_profile")
    localStorage.removeItem("ls_onboarding_complete")
    
    alert("Onboarding has been reset! Go to Home and click to start fresh.")
  }

  const resetAll = () => {
    if (!confirm("This will reset ALL settings. Are you sure?")) return

    const keysToRemove = [
      "ls_first_name",
      "ls_last_name",
      "ls_user_email",
      "ls_user_id",
      "ls_supabase_url",
      "ls_supabase_key",
      "ls_company_name",
      "ls_department",
      "ls_division",
      "ls_org_id",
      "ls_session_id",
      "ls_memory_trace_id",
      "ls_llm_provider",
      "ls_llm_model",
      "longstrider_cognitive_profile",
      "ls_onboarding_complete",
    ]

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    setSettings({
      firstName: "",
      lastName: "",
      email: "",
      userId: "",
      memoryTraceId: "",
      accountType: "personal",
      companyName: "",
      department: "",
      division: "",
      orgId: "",
      llmProvider: "openai",
      llmModel: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      supabaseUrl: "",
      supabaseKey: "",
      isConnected: false,
      isAwakening: false,
      lastAwakening: null,
    })

    setHasChanges(false)
    alert("All settings have been reset")
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="h-full bg-[#16161c] text-slate-100 overflow-y-auto pt-16">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header with status and actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-light text-white mb-2">Settings</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${settings.isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-slate-600"}`} />
                <span className="text-slate-400">
                  {settings.isConnected ? "Connected" : "Not connected"}
                </span>
              </div>
              {hasChanges && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-amber-400">Unsaved changes</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testConnection}
              disabled={settings.isAwakening || !settings.supabaseUrl || !settings.supabaseKey}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {settings.isAwakening ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  <span>Test Connection</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30 text-sm text-violet-300 hover:bg-violet-600/30 hover:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              style={{
                textShadow: hasChanges ? "0 0 12px rgba(139,92,246,0.3)" : "none",
              }}
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </motion.button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Personal Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection("personal")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-gray-400">Personal Information</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.personal ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSections.personal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">First Name</label>
                        <input
                          type="text"
                          value={settings.firstName}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, firstName: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-violet-500/50 focus:outline-none transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={settings.lastName}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, lastName: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-violet-500/50 focus:outline-none transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, email: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-violet-500/50 focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">User ID</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.userId}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, userId: e.target.value }))
                              setHasChanges(true)
                            }}
                            className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-100 font-mono placeholder:text-gray-400 focus:border-violet-500/50 focus:outline-none transition-colors"
                            placeholder="Auto-generated"
                          />
                          <Button
                            onClick={() => generateId("user")}
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-400 hover:text-white h-9 px-3"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Memory Trace ID</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.memoryTraceId}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, memoryTraceId: e.target.value }))
                              setHasChanges(true)
                            }}
                            className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-100 font-mono placeholder:text-gray-400 focus:border-violet-500/50 focus:outline-none transition-colors"
                            placeholder="Auto-generated"
                          />
                          <Button
                            onClick={() => generateId("memory")}
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-400 hover:text-white h-9 px-3"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Business Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection("business")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-gray-400">Business & Organization</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.business ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSections.business && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, companyName: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-cyan-500/50 focus:outline-none transition-colors"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Department</label>
                        <input
                          type="text"
                          value={settings.department}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, department: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-cyan-500/50 focus:outline-none transition-colors"
                          placeholder="Engineering"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Division</label>
                        <input
                          type="text"
                          value={settings.division}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, division: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-cyan-500/50 focus:outline-none transition-colors"
                          placeholder="Product"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Organization ID</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.orgId}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, orgId: e.target.value }))
                              setHasChanges(true)
                            }}
                            className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-100 font-mono placeholder:text-gray-400 focus:border-cyan-500/50 focus:outline-none transition-colors"
                            placeholder="Auto-generated"
                          />
                          <Button
                            onClick={() => generateId("org")}
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-400 hover:text-white h-9 px-3"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connections Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => toggleSection("connections")}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-gray-400">Connections & AI</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.connections ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSections.connections && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 pt-0 space-y-10 border-t border-slate-800">
                    {/* Database subsection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Supabase URL <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={settings.supabaseUrl}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, supabaseUrl: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 font-mono placeholder:text-gray-400 focus:border-emerald-500/50 focus:outline-none transition-colors"
                          placeholder="https://your-project.supabase.co"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Supabase API Key <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="password"
                          value={settings.supabaseKey}
                          onChange={(e) => {
                            setSettings((prev) => ({ ...prev, supabaseKey: e.target.value }))
                            setHasChanges(true)
                          }}
                          className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 font-mono placeholder:text-gray-400 focus:border-emerald-500/50 focus:outline-none transition-colors"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          required
                        />
                      </div>
                    </div>

                    {/* AI subsection */}
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Brain className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-300">AI Configuration</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Provider</label>
                          <select
                            value={settings.llmProvider}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, llmProvider: e.target.value as LLMProvider }))
                              setHasChanges(true)
                            }}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-emerald-500/50 focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="groq">Groq</option>
                            <option value="local">Local</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Model</label>
                          <select
                            value={settings.llmModel}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, llmModel: e.target.value }))
                              setHasChanges(true)
                            }}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-emerald-500/50 focus:outline-none transition-colors cursor-pointer"
                          >
                            {settings.llmProvider === "openai" && (
                              <>
                                <option value="gpt-4">GPT-4</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                              </>
                            )}
                            {settings.llmProvider === "anthropic" && (
                              <>
                                <option value="claude-3-opus">Claude 3 Opus</option>
                                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                              </>
                            )}
                            {settings.llmProvider === "groq" && (
                              <>
                                <option value="llama-3-70b">Llama 3 70B</option>
                                <option value="mixtral-8x7b">Mixtral 8x7B</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            Temperature: {settings.temperature}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))
                              setHasChanges(true)
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">Max Tokens</label>
                          <select
                            value={settings.maxTokens}
                            onChange={(e) => {
                              setSettings((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))
                              setHasChanges(true)
                            }}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-emerald-500/50 focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value={1000}>1K</option>
                            <option value={2000}>2K</option>
                            <option value={4000}>4K</option>
                            <option value={8000}>8K</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-red-500/20 p-4 overflow-hidden">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4" />
            Danger Zone
          </h3>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCache}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Cache</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetOnboarding}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500/50 transition-all flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              <span>Reset Onboarding</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAll}
              className="px-4 py-2 rounded-lg bg-red-950/30 border border-red-900/50 text-sm text-red-400 hover:bg-red-950/50 hover:border-red-800 transition-all flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset All Settings</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
