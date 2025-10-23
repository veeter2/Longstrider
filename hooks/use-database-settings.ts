"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"

export type DatabaseSettings = {
  memoryRetention: "low" | "medium" | "high"
  autoSync: boolean
  syncInterval: number // in minutes
  maxMemoryFragments: number
  connectionStatus: "connected" | "disconnected" | "error" | "checking" | "not_configured"
  lastSyncTime: string | null
}

export const useDatabaseSettings = () => {
  const [settings, setSettings] = useState<DatabaseSettings>({
    memoryRetention: "high",
    autoSync: true,
    syncInterval: 30,
    maxMemoryFragments: 1000,
    connectionStatus: "checking",
    lastSyncTime: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from Supabase
  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setSettings((prev) => ({
        ...prev,
        connectionStatus: "not_configured",
      }))
      setError("Supabase credentials not configured. Please set environment variables.")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("settings").select("*").single()

      if (error) throw error

      if (data) {
        setSettings({
          ...settings,
          memoryRetention: data.memory_retention || "high",
          autoSync: data.auto_sync !== undefined ? data.auto_sync : true,
          syncInterval: data.sync_interval || 30,
          maxMemoryFragments: data.max_memory_fragments || 1000,
          lastSyncTime: data.last_sync_time,
        })
      }
    } catch (err) {
      console.error("Error loading settings:", err)
      setError("Failed to load settings from database")
    } finally {
      setLoading(false)
    }
  }

  // Save settings to Supabase
  const saveSettings = async (newSettings: Partial<DatabaseSettings>) => {
    setLoading(true)
    setError(null)

    const supabase = getSupabaseClient()
    if (!supabase) {
      setError("Supabase credentials not configured. Please set environment variables.")
      setLoading(false)
      return
    }

    try {
      const updatedSettings = { ...settings, ...newSettings }

      const { error } = await supabase.from("settings").upsert({
        id: 1, // Assuming a single settings record
        memory_retention: updatedSettings.memoryRetention,
        auto_sync: updatedSettings.autoSync,
        sync_interval: updatedSettings.syncInterval,
        max_memory_fragments: updatedSettings.maxMemoryFragments,
        last_sync_time: new Date().toISOString(),
      })

      if (error) throw error

      setSettings({
        ...updatedSettings,
        lastSyncTime: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings to database")
    } finally {
      setLoading(false)
    }
  }

  // Test database connection
  const testConnection = async () => {
    setSettings((prev) => ({ ...prev, connectionStatus: "checking" }))

    const supabase = getSupabaseClient()
    if (!supabase) {
      setSettings((prev) => ({ ...prev, connectionStatus: "not_configured" }))
      setError("Supabase credentials not configured. Please set environment variables.")
      return false
    }

    try {
      const { error } = await supabase.from("settings").select("count", { count: "exact", head: true })

      if (error) throw error

      setSettings((prev) => ({ ...prev, connectionStatus: "connected" }))
      return true
    } catch (err) {
      console.error("Database connection error:", err)
      setSettings((prev) => ({ ...prev, connectionStatus: "error" }))
      setError("Failed to connect to database")
      return false
    }
  }

  // Initialize connection check
  useEffect(() => {
    testConnection()
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    saveSettings,
    testConnection,
    loadSettings,
  }
}
