"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function setupDatabase() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        error: "Supabase credentials not configured. Please set environment variables.",
      }
    }

    // Create settings table
    const { error: settingsError } = await supabase.rpc("create_settings_table")
    if (settingsError) throw new Error(`Error creating settings table: ${settingsError.message}`)

    // Create memory_fragments table
    const { error: fragmentsError } = await supabase.rpc("create_memory_fragments_table")
    if (fragmentsError) throw new Error(`Error creating memory_fragments table: ${fragmentsError.message}`)

    // Create memory_arcs table
    const { error: arcsError } = await supabase.rpc("create_memory_arcs_table")
    if (arcsError) throw new Error(`Error creating memory_arcs table: ${arcsError.message}`)

    // Create arc_fragments table
    const { error: arcFragmentsError } = await supabase.rpc("create_arc_fragments_table")
    if (arcFragmentsError) throw new Error(`Error creating arc_fragments table: ${arcFragmentsError.message}`)

    // Insert default settings
    const { error: insertError } = await supabase.from("settings").upsert({
      id: 1,
      memory_retention: "high",
      auto_sync: true,
      sync_interval: 30,
      max_memory_fragments: 1000,
      last_sync_time: new Date().toISOString(),
    })

    if (insertError) throw new Error(`Error inserting default settings: ${insertError.message}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Database setup error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
