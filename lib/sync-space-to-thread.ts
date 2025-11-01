/**
 * Sync Space to conversation_threads Table
 * 
 * Syncs a Space (from consciousness-store) to the conversation_threads table
 * with full hierarchy support (parent, children, grandchildren).
 * 
 * This connects the frontend Space system to the database for:
 * - Thread management via conversation_threads
 * - Living Memory integration
 * - Future thread-manager edge function
 */

import { getSupabaseClient, getIvyConfig } from './supabase'
import type { Space } from '@/stores/consciousness-store'

/**
 * Sync a single Space to conversation_threads
 */
export async function syncSpaceToThread(
  space: Space,
  userId?: string,
  options?: {
    parentThreadId?: string | null
    hierarchyLevel?: number
    updateOnly?: boolean
  }
): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('[sync-space-to-thread] Cannot sync: Supabase not configured')
    return null
  }

  // Get user ID from config if not provided
  const resolvedUserId = userId || getIvyConfig().userId || null
  if (!resolvedUserId) {
    console.warn('[sync-space-to-thread] Cannot sync: no user_id available')
    return null
  }

  try {
    
    const hierarchyLevel = options?.hierarchyLevel ?? 
      (space.parent_space_id ? (space.space_path?.length || 1) : 0)

    const threadData = {
      // Use space.id as thread_id (or generate UUID if space.id is not UUID format)
      thread_id: space.id.includes('-') ? space.id : crypto.randomUUID(),
      user_id: resolvedUserId,
      conversation_name: space.name,
      thread_title: space.name,
      thread_summary: space.description || space.name,
      
      // Hierarchy fields (from migration)
      parent_thread_id: options?.parentThreadId || space.parent_space_id || null,
      child_thread_ids: space.child_spaces || [],
      hierarchy_level: hierarchyLevel,
      
      // Goals (convert Space goals to JSONB)
      goals: space.goals?.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        status: g.status,
        created_at: g.created_at,
        completed_at: g.completed_at,
        parent_goal_id: g.parent_goal_id
      })) || [],
      goal_progress: space.goals 
        ? space.goals.filter(g => g.status === 'completed').length / space.goals.length
        : 0,
      
      // Basic metadata
      message_count: space.analytics?.message_count || 0,
      thread_status: space.status === 'active' ? 'active' : 
                     space.status === 'concluded' ? 'archived' : 
                     space.status === 'hibernated' ? 'paused' : 'active',
      
      // Cognitive metrics
      thread_gravity: space.analytics?.gravity_score || 0,
      gravity_score: space.analytics?.gravity_score || 0,
      emotion_type: space.analytics?.emotional_signature?.dominant_emotion || null,
      
      // Timestamps
      created_at: new Date(space.created_at).toISOString(),
      last_active: new Date(space.last_activity_at || space.updated_at).toISOString(),
      
      // Rich metadata (JSONB)
      metadata: {
        space_id: space.id,
        space_path: space.space_path || [],
        type: space.type,
        is_anchored: space.is_anchored,
        is_favorite: space.is_favorite,
        domain_id: space.domain_id,
        cluster_id: space.cluster_id,
        tokens_used: space.analytics?.tokens_used || 0,
        tokens_saved: space.analytics?.tokens_saved || 0,
        estimated_cost: space.analytics?.estimated_cost || 0,
        emotional_signature: space.analytics?.emotional_signature,
        meta_cognition_profile: space.meta_cognition_profile,
        signals: space.signals?.map(s => ({
          type: s.type,
          content: s.content,
          gravity: s.gravity
        })),
        links: space.links?.map(l => ({
          target_id: l.target_id,
          type: l.type,
          strength: l.strength
        }))
      },
      
      // Session/thread tracking
      session_id: space.id, // Use space.id as session_id initially
      memory_trace_id: space.id
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('conversation_threads')
      .upsert(threadData, {
        onConflict: 'thread_id',
        ignoreDuplicates: false
      })
      .select('thread_id')
      .single()

    if (error) {
      console.error('[sync-space-to-thread] Upsert error:', error)
      throw error
    }

    console.log(`✅ Synced space "${space.name}" to conversation_threads (thread_id: ${data.thread_id})`)
    return data.thread_id

  } catch (error) {
    console.error('[sync-space-to-thread] Failed to sync:', error)
    // Don't throw - this is non-critical, spaces still work locally
    return null
  }
}

/**
 * Sync entire hierarchy (parent → children → grandchildren) to conversation_threads
 */
export async function syncHierarchyToThreads(
  spaces: { parent: Space; children: Space[]; grandchildren: Space[] },
  userId?: string
): Promise<{ parentThreadId: string | null; childThreadIds: string[]; grandchildThreadIds: string[] }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('[sync-hierarchy-to-threads] Cannot sync: Supabase not configured')
    return { parentThreadId: null, childThreadIds: [], grandchildThreadIds: [] }
  }

  // Get user ID from config if not provided
  const resolvedUserId = userId || getIvyConfig().userId || null
  if (!resolvedUserId) {
    console.warn('[sync-hierarchy-to-threads] Cannot sync: no user_id available')
    return { parentThreadId: null, childThreadIds: [], grandchildThreadIds: [] }
  }

  const results = {
    parentThreadId: null as string | null,
    childThreadIds: [] as string[],
    grandchildThreadIds: [] as string[]
  }

  try {
    // 1. Sync parent (hierarchy_level = 0)
    results.parentThreadId = await syncSpaceToThread(spaces.parent, resolvedUserId, {
      hierarchyLevel: 0
    })

    // 2. Sync children (hierarchy_level = 1)
    const childPromises = spaces.children.map(async (child) => {
      const childThreadId = await syncSpaceToThread(child, resolvedUserId, {
        parentThreadId: results.parentThreadId,
        hierarchyLevel: 1
      })
      if (childThreadId) results.childThreadIds.push(childThreadId)
      return childThreadId
    })

    await Promise.all(childPromises)

    // 3. Sync grandchildren (hierarchy_level = 2)
    const grandchildPromises = spaces.grandchildren.map(async (grandchild) => {
      // Find parent child thread_id
      const parentChildIndex = spaces.children.findIndex(c => c.id === grandchild.parent_space_id)
      const parentChildThreadId = parentChildIndex >= 0 ? results.childThreadIds[parentChildIndex] : null

      const gcThreadId = await syncSpaceToThread(grandchild, resolvedUserId, {
        parentThreadId: parentChildThreadId,
        hierarchyLevel: 2
      })
      if (gcThreadId) results.grandchildThreadIds.push(gcThreadId)
      return gcThreadId
    })

    await Promise.all(grandchildPromises)

    // 4. Update parent with child_thread_ids
    if (results.parentThreadId && results.childThreadIds.length > 0) {
      await supabase
        .from('conversation_threads')
        .update({ child_thread_ids: results.childThreadIds })
        .eq('thread_id', results.parentThreadId)
    }

    // 5. Update children with grandchild_thread_ids
    for (let i = 0; i < spaces.children.length; i++) {
      const child = spaces.children[i]
      const childThreadId = results.childThreadIds[i]
      if (childThreadId && child.child_spaces.length > 0) {
        // Find grandchildren for this child
        const gcIds = spaces.grandchildren
          .filter(gc => gc.parent_space_id === child.id)
          .map((gc) => {
            // Find the grandchild thread_id by matching parent_space_id
            const gcIndex = spaces.grandchildren.findIndex(g => g.id === gc.id)
            return results.grandchildThreadIds[gcIndex]
          })
          .filter(Boolean) as string[]

        if (gcIds.length > 0) {
          await supabase
            .from('conversation_threads')
            .update({ child_thread_ids: gcIds })
            .eq('thread_id', childThreadId)
        }
      }
    }

    console.log(`✅ Synced full hierarchy: ${results.parentThreadId ? 1 : 0} parent, ${results.childThreadIds.length} children, ${results.grandchildThreadIds.length} grandchildren`)

  } catch (error) {
    console.error('[sync-hierarchy-to-threads] Failed to sync hierarchy:', error)
    // Non-critical - continue even if sync fails
  }

  return results
}

