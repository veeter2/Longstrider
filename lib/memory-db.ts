import { getSupabaseClient } from "@/lib/supabase"

export type MemoryFragment = {
  id: string
  content: string
  timestamp: string
  source: string
  importance: number
  tags: string[]
}

export type MemoryArc = {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  fragments?: MemoryFragment[]
}

export type MemoryStats = {
  totalFragments: number
  totalArcs: number
  oldestFragment: string | null
  newestFragment: string | null
}

// Fetch all memory fragments
export async function fetchMemoryFragments(): Promise<MemoryFragment[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase.from("memory_fragments").select("*").order("timestamp", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching memory fragments:", error)
    return []
  }
}

// Search memory fragments
export async function searchMemoryFragments(query: string): Promise<MemoryFragment[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase
      .from("memory_fragments")
      .select("*")
      .textSearch("content", query)
      .order("timestamp", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error searching memory fragments:", error)
    return []
  }
}

// Add a new memory fragment
export async function addMemoryFragment(fragment: Omit<MemoryFragment, "id">): Promise<MemoryFragment | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    const { data, error } = await supabase.from("memory_fragments").insert([fragment]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding memory fragment:", error)
    return null
  }
}

// Fetch all memory arcs
export async function fetchMemoryArcs(): Promise<MemoryArc[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return []
  }

  try {
    const { data, error } = await supabase.from("memory_arcs").select("*").order("updated_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching memory arcs:", error)
    return []
  }
}

// Fetch a memory arc with its fragments
export async function fetchMemoryArcWithFragments(arcId: string): Promise<MemoryArc | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    // First get the arc
    const { data: arc, error: arcError } = await supabase.from("memory_arcs").select("*").eq("id", arcId).single()

    if (arcError) throw arcError
    if (!arc) return null

    // Then get the fragments associated with this arc
    const { data: arcFragments, error: fragmentsError } = await supabase
      .from("arc_fragments")
      .select("fragment_id")
      .eq("arc_id", arcId)

    if (fragmentsError) throw fragmentsError

    if (arcFragments && arcFragments.length > 0) {
      const fragmentIds = arcFragments.map((af) => af.fragment_id)

      const { data: fragments, error: fragmentsQueryError } = await supabase
        .from("memory_fragments")
        .select("*")
        .in("id", fragmentIds)
        .order("timestamp", { ascending: false })

      if (fragmentsQueryError) throw fragmentsQueryError

      return {
        ...arc,
        fragments: fragments || [],
      }
    }

    return {
      ...arc,
      fragments: [],
    }
  } catch (error) {
    console.error("Error fetching memory arc with fragments:", error)
    return null
  }
}

// Create a new memory arc
export async function createMemoryArc(
  arc: Omit<MemoryArc, "id" | "created_at" | "updated_at">,
): Promise<MemoryArc | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("memory_arcs")
      .insert([
        {
          ...arc,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating memory arc:", error)
    return null
  }
}

// Add fragments to a memory arc
export async function addFragmentsToArc(arcId: string, fragmentIds: string[]): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return false
  }

  try {
    const arcFragments = fragmentIds.map((fragmentId) => ({
      arc_id: arcId,
      fragment_id: fragmentId,
    }))

    const { error } = await supabase.from("arc_fragments").insert(arcFragments)

    if (error) throw error

    // Update the arc's updated_at timestamp
    const { error: updateError } = await supabase
      .from("memory_arcs")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", arcId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error("Error adding fragments to arc:", error)
    return false
  }
}

// Get memory statistics
export async function getMemoryStats(): Promise<MemoryStats> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return {
      totalFragments: 0,
      totalArcs: 0,
      oldestFragment: null,
      newestFragment: null,
    }
  }

  try {
    // Get total fragments
    const { count: fragmentCount, error: fragmentError } = await supabase
      .from("memory_fragments")
      .select("*", { count: "exact", head: true })

    if (fragmentError) throw fragmentError

    // Get total arcs
    const { count: arcCount, error: arcError } = await supabase
      .from("memory_arcs")
      .select("*", { count: "exact", head: true })

    if (arcError) throw arcError

    // Get oldest fragment
    const { data: oldestData, error: oldestError } = await supabase
      .from("memory_fragments")
      .select("timestamp")
      .order("timestamp", { ascending: true })
      .limit(1)
      .single()

    if (oldestError && oldestError.code !== "PGRST116") throw oldestError

    // Get newest fragment
    const { data: newestData, error: newestError } = await supabase
      .from("memory_fragments")
      .select("timestamp")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single()

    if (newestError && newestError.code !== "PGRST116") throw newestError

    return {
      totalFragments: fragmentCount || 0,
      totalArcs: arcCount || 0,
      oldestFragment: oldestData?.timestamp || null,
      newestFragment: newestData?.timestamp || null,
    }
  } catch (error) {
    console.error("Error getting memory stats:", error)
    return {
      totalFragments: 0,
      totalArcs: 0,
      oldestFragment: null,
      newestFragment: null,
    }
  }
}
