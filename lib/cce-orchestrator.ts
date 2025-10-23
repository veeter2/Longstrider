import { getIvyConfig } from './supabase';

// CCE-O Interface for getting rich consciousness data
export async function fetchConstellationData(userId: string) {
  const config = getIvyConfig();
  
  if (!config.edgeFunctions['cce-orchestrator']) {
    console.warn('[CCE-O] No orchestrator endpoint configured');
    return null;
  }
  
  try {
    const response = await fetch(config.edgeFunctions['cce-orchestrator'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseKey}`
      },
      body: JSON.stringify({
        user_id: userId,
        action: 'get_constellation',
        include_memory_constellation: true,
        constellation_depth: 200,
        include_patterns: true,
        include_arcs: true,
        include_emotional_field: true,
        include_consciousness_state: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`CCE-O returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[CCE-O] Failed to fetch constellation data:', error);
    return null;
  }
}

// Get memory patterns and arcs
export async function fetchMemoryPatterns(userId: string) {
  const config = getIvyConfig();
  
  if (!config.edgeFunctions['cce-pattern-detector']) {
    console.warn('[CCE-O] No pattern detector endpoint configured');
    return null;
  }
  
  try {
    const response = await fetch(config.edgeFunctions['cce-pattern-detector'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseKey}`
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: config.sessionId,
        trace_id: config.memoryTraceId,
        depth: 100
      })
    });
    
    if (!response.ok) {
      throw new Error(`Pattern detector returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[CCE-O] Failed to fetch patterns:', error);
    return null;
  }
}

// Get memory arcs
export async function fetchMemoryArcs(userId: string) {
  const config = getIvyConfig();
  
  if (!config.edgeFunctions['cce-arc-builder']) {
    console.warn('[CCE-O] No arc builder endpoint configured');
    return null;
  }
  
  try {
    const response = await fetch(config.edgeFunctions['cce-arc-builder'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseKey}`
      },
      body: JSON.stringify({
        user_id: userId,
        build_arcs: true,
        max_arcs: 10
      })
    });
    
    if (!response.ok) {
      throw new Error(`Arc builder returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[CCE-O] Failed to fetch arcs:', error);
    return null;
  }
}
