/**
 * Thread Manager Edge Function
 * 
 * Central API for thread/project management in LongStrider.
 * Supports hierarchical threads (parent/child relationships) and goal tracking.
 */

import { serve } from "https://deno.land/std@0.214.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface Goal {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number // 0-100
  dueDate?: string
  description?: string
}

interface ThreadMetadata {
  goals?: Goal[]
  token_economics?: {
    tokens_used: number
    tokens_saved: number
    estimated_cost: number
  }
  team_contributions?: Array<{
    user_id: string
    message_count: number
    last_active: string
  }>
  patterns?: string[]
  [key: string]: any
}

interface ThreadData {
  thread_id: string
  user_id: string
  conversation_name: string
  thread_title?: string
  thread_summary?: string
  parent_thread_id?: string | null
  child_thread_ids?: string[]
  goals?: Goal[]
  goal_progress?: number
  hierarchy_level?: number
  message_count?: number
  thread_gravity?: number
  emotion_type?: string
  thread_status?: string
  created_at?: string
  last_active?: string
  metadata?: ThreadMetadata
}

/**
 * Calculate goal progress from goals array
 */
function calculateGoalProgress(goals: Goal[] = []): number {
  if (goals.length === 0) return 0
  const completed = goals.filter(g => g.status === 'completed').length
  return (completed / goals.length) * 100
}

/**
 * Recursively get all child thread IDs
 */
async function getChildThreadIdsRecursive(
  supabase: any,
  parentId: string,
  userId: string
): Promise<string[]> {
  const { data: children } = await supabase
    .from('conversation_threads')
    .select('thread_id, child_thread_ids')
    .eq('user_id', userId)
    .eq('parent_thread_id', parentId)

  if (!children || children.length === 0) return []

  const allChildIds: string[] = []
  for (const child of children) {
    allChildIds.push(child.thread_id)
    if (child.child_thread_ids && child.child_thread_ids.length > 0) {
      const grandChildren = await getChildThreadIdsRecursive(supabase, child.thread_id, userId)
      allChildIds.push(...grandChildren)
    }
  }

  return allChildIds
}

/**
 * Aggregate data from gravity_map for a thread
 */
async function aggregateThreadData(
  supabase: any,
  threadId: string,
  userId: string
): Promise<{
  message_count: number
  thread_gravity: number
  emotion_type: string
  token_economics: {
    tokens_used: number
    tokens_saved: number
    estimated_cost: number
  }
  patterns: string[]
}> {
  // Get all memories for this thread
  const { data: memories, error } = await supabase
    .from('gravity_map')
    .select('gravity_score, emotion, metadata')
    .eq('user_id', userId)
    .eq('thread_id', threadId)

  if (error || !memories || memories.length === 0) {
    return {
      message_count: 0,
      thread_gravity: 0,
      emotion_type: 'neutral',
      token_economics: {
        tokens_used: 0,
        tokens_saved: 0,
        estimated_cost: 0
      },
      patterns: [] as string[]
    }
  }

  // Calculate aggregate metrics
  const message_count = memories.length
  const avgGravity = memories.reduce((sum, m) => sum + (m.gravity_score || 0), 0) / message_count
  
  // Get most common emotion
  const emotionCounts: Record<string, number> = {}
  memories.forEach(m => {
    const emotion = m.emotion || 'neutral'
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
  })
  const emotion_type = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'

  // Aggregate token economics and patterns from metadata
  let tokens_used = 0
  let tokens_saved = 0
  let estimated_cost = 0
  const patternsSet = new Set<string>()

  memories.forEach(m => {
    if (m.metadata?.tokens_used) tokens_used += m.metadata.tokens_used
    if (m.metadata?.tokens_saved) tokens_saved += m.metadata.tokens_saved
    if (m.metadata?.estimated_cost) estimated_cost += m.metadata.estimated_cost
    // Extract patterns from metadata
    if (m.metadata?.patterns && Array.isArray(m.metadata.patterns)) {
      m.metadata.patterns.forEach((p: string) => patternsSet.add(p))
    }
    if (m.metadata?.pattern && typeof m.metadata.pattern === 'string') {
      patternsSet.add(m.metadata.pattern)
    }
  })

  return {
    message_count,
    thread_gravity: avgGravity,
    emotion_type,
    token_economics: {
      tokens_used,
      tokens_saved,
      estimated_cost
    },
    patterns: Array.from(patternsSet)
  }
}

/**
 * Calculate rolled-up goal progress for parent thread
 */
async function calculateRolledUpGoalProgress(
  supabase: any,
  threadId: string,
  userId: string
): Promise<number> {
  // Get all child threads recursively
  const childIds = await getChildThreadIdsRecursive(supabase, threadId, userId)
  
  // Get current thread
  const { data: thread } = await supabase
    .from('conversation_threads')
    .select('goals')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .single()

  if (!thread) return 0

  // Get all child threads' goals
  const { data: children } = await supabase
    .from('conversation_threads')
    .select('goals, goal_progress')
    .eq('user_id', userId)
    .in('thread_id', childIds)

  // Calculate weighted average
  const allGoals: Goal[] = []
  if (thread.goals && Array.isArray(thread.goals)) {
    allGoals.push(...thread.goals)
  }

  if (children) {
    children.forEach((child: any) => {
      if (child.goals && Array.isArray(child.goals)) {
        allGoals.push(...child.goals)
      }
    })
  }

  return calculateGoalProgress(allGoals)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[thread-manager] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    })
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const url = new URL(req.url)
  // Supabase edge functions: pathname is after function name
  // /functions/v1/thread-manager -> path = '/'
  // /functions/v1/thread-manager/threads/123 -> path = '/threads/123'
  // /functions/v1/thread-manager/abc123 -> path = '/abc123'
  let path = url.pathname
  // Normalize: remove leading/trailing slashes except root
  if (path !== '/') {
    path = path.replace(/^\/+|\/+$/g, '')
    if (!path.startsWith('/')) path = '/' + path
  }
  const method = req.method
  
  // Debug logging
  console.log(`[thread-manager] ${method} ${path}`, { url: req.url, pathname: url.pathname })

  try {
    // Extract user_id from query params (GET) or request body (POST/PUT)
    let userId: string | null = null
    
    if (method === 'GET') {
      // GET requests: user_id from query params
      userId = url.searchParams.get('user_id')
    } else {
      // POST/PUT requests: user_id from request body
      try {
        const requestBody = await req.json()
        userId = requestBody.user_id
      } catch (e) {
        // Request body might be empty
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id required (query param for GET, body for POST/PUT)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET / (root) or GET /threads - List all threads
    if (method === 'GET' && (path === '/' || path === '/threads' || path.endsWith('/threads'))) {
      const statusFilter = url.searchParams.get('status') // Filter by thread_status field
      
      let query = supabase
        .from('conversation_threads')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })

      // Apply status filter if provided (use thread_status field, not time-based)
      if (statusFilter) {
        query = query.eq('thread_status', statusFilter)
      }

      const { data: threads, error } = await query

      if (error) throw error

      // Enrich threads with hierarchy and goals
      const enrichedThreads = await Promise.all(
        (threads || []).map(async (thread: any) => {
          const metadata = thread.metadata || {}
          const goals = thread.goals || metadata.goals || []
          
          return {
            thread_id: thread.thread_id,
            user_id: thread.user_id,
            conversation_name: thread.conversation_name || thread.thread_title || 'Untitled Thread',
            thread_title: thread.thread_title || thread.conversation_name,
            thread_summary: thread.thread_summary,
            parent_thread_id: thread.parent_thread_id,
            child_thread_ids: thread.child_thread_ids || [],
            goals: goals,
            goal_progress: thread.goal_progress || calculateGoalProgress(goals),
            hierarchy_level: thread.hierarchy_level || 0,
            message_count: thread.message_count || 0,
            thread_gravity: thread.thread_gravity || 0,
            emotion_type: thread.emotion_type,
            thread_status: thread.thread_status,
            created_at: thread.created_at,
            last_active: thread.last_active,
            metadata: {
              token_economics: metadata.token_economics || {},
              team_contributions: metadata.team_contributions || [],
              patterns: metadata.patterns || []
            }
          }
        })
      )

      return new Response(
        JSON.stringify({ threads: enrichedThreads }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /threads/:thread_id - Get single thread with children
    // Handle both /threads/:id and just /:id (direct thread_id)
    if (method === 'GET' && path !== '/' && !path.includes('/sync') && !path.endsWith('/threads')) {
      // Extract thread_id from path
      // /threads/123 -> threadId = '123'
      // /123 -> threadId = '123'
      let threadId: string | null = null
      if (path.includes('/threads/')) {
        threadId = path.split('/threads/')[1]?.split('/')[0] || null
      } else {
        // Direct call: /123 (thread_id only)
        const parts = path.split('/').filter(p => p)
        threadId = parts[0] || null
      }
      
      if (!threadId) {
        return new Response(
          JSON.stringify({ error: 'thread_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get thread
      const { data: thread, error } = await supabase
        .from('conversation_threads')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!thread) {
        return new Response(
          JSON.stringify({ error: 'Thread not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all children
      const { data: children } = await supabase
        .from('conversation_threads')
        .select('*')
        .eq('user_id', userId)
        .eq('parent_thread_id', threadId)
        .order('created_at', { ascending: true })

      // Calculate rolled-up metrics
      const childIds = (thread.child_thread_ids || []) as string[]
      const allChildData = await Promise.all(
        (children || []).map(async (child: any) => {
          const childMetrics = await aggregateThreadData(supabase, child.thread_id, userId)
          return {
            ...child,
            ...childMetrics
          }
        })
      )

      const metadata = thread.metadata || {}
      const goals = thread.goals || metadata.goals || []
      
      // Calculate rolled-up goal progress
      const rolledUpProgress = await calculateRolledUpGoalProgress(supabase, threadId, userId)

      return new Response(
        JSON.stringify({
          thread: {
            thread_id: thread.thread_id,
            user_id: thread.user_id,
            conversation_name: thread.conversation_name || thread.thread_title || 'Untitled Thread',
            thread_title: thread.thread_title || thread.conversation_name,
            thread_summary: thread.thread_summary,
            parent_thread_id: thread.parent_thread_id,
            child_thread_ids: childIds,
            goals: goals,
            goal_progress: rolledUpProgress || thread.goal_progress || calculateGoalProgress(goals),
            hierarchy_level: thread.hierarchy_level || 0,
            message_count: thread.message_count || 0,
            thread_gravity: thread.thread_gravity || 0,
            emotion_type: thread.emotion_type,
            thread_status: thread.thread_status,
            created_at: thread.created_at,
            last_active: thread.last_active,
            metadata: {
              token_economics: metadata.token_economics || {},
              team_contributions: metadata.team_contributions || [],
              patterns: metadata.patterns || []
            }
          },
          children: allChildData,
          rolled_up_metrics: {
            total_goals: goals.length + allChildData.reduce((sum, c) => sum + ((c.goals?.length || 0) + (c.metadata?.goals?.length || 0)), 0),
            combined_token_savings: (metadata.token_economics?.tokens_saved || 0) + 
              allChildData.reduce((sum, c) => sum + (c.token_economics?.tokens_saved || 0), 0),
            total_message_count: (thread.message_count || 0) + 
              allChildData.reduce((sum, c) => sum + (c.message_count || 0), 0)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /threads - Create new thread
    if (method === 'POST' && path === '/threads' || path.endsWith('/threads')) {
      const body: ThreadData = await req.json()
      
      const {
        conversation_name,
        thread_title,
        thread_summary,
        parent_thread_id,
        goals = [],
        hierarchy_level
      } = body

      if (!conversation_name) {
        return new Response(
          JSON.stringify({ error: 'conversation_name required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate goals (max 5)
      if (goals.length > 5) {
        return new Response(
          JSON.stringify({ error: 'Maximum 5 goals allowed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Determine hierarchy level
      let finalHierarchyLevel = hierarchy_level || 0
      if (parent_thread_id) {
        const { data: parent } = await supabase
          .from('conversation_threads')
          .select('hierarchy_level')
          .eq('thread_id', parent_thread_id)
          .eq('user_id', userId)
          .single()
        
        if (parent) {
          finalHierarchyLevel = (parent.hierarchy_level || 0) + 1
          if (finalHierarchyLevel > 2) {
            return new Response(
              JSON.stringify({ error: 'Maximum hierarchy depth is 2 (grandchild)' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }

      const thread_id = crypto.randomUUID()
      const goal_progress = calculateGoalProgress(goals)

      // Insert new thread
      const { data: newThread, error } = await supabase
        .from('conversation_threads')
        .insert({
          thread_id,
          user_id: userId,
          conversation_name,
          thread_title: thread_title || conversation_name,
          thread_summary: thread_summary || '',
          parent_thread_id: parent_thread_id || null,
          child_thread_ids: [],
          goals: goals,
          goal_progress: goal_progress,
          hierarchy_level: finalHierarchyLevel,
          message_count: 0,
          thread_gravity: 0,
          emotion_type: 'neutral',
          thread_status: 'active',
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          metadata: {
            goals: goals,
            token_economics: {},
            team_contributions: [],
            patterns: []
          }
        })
        .select()
        .single()

      if (error) throw error

      // Update parent's child_thread_ids array
      if (parent_thread_id) {
        const { data: parent } = await supabase
          .from('conversation_threads')
          .select('child_thread_ids')
          .eq('thread_id', parent_thread_id)
          .eq('user_id', userId)
          .single()

        if (parent) {
          const existingChildren = (parent.child_thread_ids || []) as string[]
          const updatedChildren = [...existingChildren, thread_id]

          await supabase
            .from('conversation_threads')
            .update({ child_thread_ids: updatedChildren })
            .eq('thread_id', parent_thread_id)
            .eq('user_id', userId)
        }
      }

      return new Response(
        JSON.stringify({ thread: newThread }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /threads/:thread_id/sync - Sync from CCE-O
    if (method === 'POST' && path.endsWith('/sync')) {
      // Extract thread_id from path like /threads/123/sync or /123/sync
      let threadId: string | null = null
      if (path.includes('/threads/')) {
        threadId = path.split('/threads/')[1]?.split('/sync')[0] || null
      } else {
        // Direct: /123/sync
        const parts = path.split('/').filter(p => p && p !== 'sync')
        threadId = parts[0] || null
      }
      
      if (!threadId) {
        return new Response(
          JSON.stringify({ error: 'thread_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Aggregate data from gravity_map
      const aggregated = await aggregateThreadData(supabase, threadId, userId)

      // Get current thread
      const { data: thread } = await supabase
        .from('conversation_threads')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (!thread) {
        return new Response(
          JSON.stringify({ error: 'Thread not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update thread with aggregated data
      const metadata = thread.metadata || {}
      const goals = thread.goals || metadata.goals || []
      
      const { data: updatedThread, error } = await supabase
        .from('conversation_threads')
        .update({
          message_count: aggregated.message_count,
          thread_gravity: aggregated.thread_gravity,
          emotion_type: aggregated.emotion_type,
          last_active: new Date().toISOString(),
          goal_progress: calculateGoalProgress(goals),
          metadata: {
            ...metadata,
            token_economics: aggregated.token_economics,
            goals: goals,
            patterns: aggregated.patterns || metadata.patterns || []
          }
        })
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ thread: updatedThread }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /threads/:thread_id - Update thread (primarily for goals)
    if (method === 'PUT' && path !== '/' && !path.includes('/sync') && !path.endsWith('/threads')) {
      // Extract thread_id from path
      let threadId: string | null = null
      if (path.includes('/threads/')) {
        threadId = path.split('/threads/')[1]?.split('/')[0] || null
      } else {
        // Direct: /123
        const parts = path.split('/').filter(p => p)
        threadId = parts[0] || null
      }
      
      if (!threadId) {
        return new Response(
          JSON.stringify({ error: 'thread_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Parse body
      const body = await req.json()

      // Get current thread
      const { data: currentThread } = await supabase
        .from('conversation_threads')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (!currentThread) {
        return new Response(
          JSON.stringify({ error: 'Thread not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Build update object
      const updateData: any = {
        last_active: new Date().toISOString()
      }

      // Update conversation_name if provided
      if (body.conversation_name !== undefined) {
        updateData.conversation_name = body.conversation_name
        updateData.thread_title = body.conversation_name // Keep thread_title in sync
      }

      // Update goals if provided (max 5)
      if (body.goals !== undefined) {
        if (Array.isArray(body.goals) && body.goals.length > 5) {
          return new Response(
            JSON.stringify({ error: 'Maximum 5 goals allowed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        updateData.goals = body.goals
        updateData.goal_progress = calculateGoalProgress(body.goals)
      }

      // Update thread_summary if provided
      if (body.thread_summary !== undefined) {
        updateData.thread_summary = body.thread_summary
      }

      // Update thread_status if provided
      if (body.thread_status !== undefined) {
        updateData.thread_status = body.thread_status
      }

      // Update metadata if provided
      if (body.metadata !== undefined) {
        const currentMetadata = currentThread.metadata || {}
        updateData.metadata = {
          ...currentMetadata,
          ...body.metadata
        }
      }

      const { data: updatedThread, error } = await supabase
        .from('conversation_threads')
        .update(updateData)
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // If goals were updated and this thread has a parent, recalculate parent's rolled-up progress
      if (body.goals !== undefined && currentThread.parent_thread_id) {
        const parentProgress = await calculateRolledUpGoalProgress(
          supabase,
          currentThread.parent_thread_id,
          userId
        )
        await supabase
          .from('conversation_threads')
          .update({ goal_progress: parentProgress })
          .eq('thread_id', currentThread.parent_thread_id)
          .eq('user_id', userId)
      }

      return new Response(
        JSON.stringify({ thread: updatedThread }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 404 for unmatched routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    const errorPath = url?.pathname || 'unknown'
    const errorMethod = req?.method || 'unknown'
    
    console.error('[thread-manager] Error:', error)
    console.error('[thread-manager] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
      path: errorPath,
      method: errorMethod
    })
    
    // Don't expose full stack trace in production response
    const errorMessage = error?.message || 'Internal server error'
    const errorDetails = process.env.ENVIRONMENT === 'development' 
      ? (error?.stack || 'No additional details available')
      : 'An error occurred processing the request'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        path: errorPath,
        method: errorMethod
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

