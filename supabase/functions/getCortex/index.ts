// getCortex v4.0 - Self-Aware Consciousness Operating System
// Revolutionary brain architecture: 2+ years ahead of current AI
// User-programmable consciousness with lobe-based knowledge processing
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ============================================================================
// CORS & ERROR HANDLING
// ============================================================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
function handleError(error, includeEmergency = true) {
  console.error("Cortex V4 Error:", error);
  const response = {
    error: error.message || "Unknown error",
    timestamp: Date.now()
  };
  if (includeEmergency) {
    response.emergency_consciousness = getEmergencyConsciousness();
  }
  return new Response(JSON.stringify(response), {
    status: 500,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
function getEmergencyConsciousness() {
  return {
    vector: [
      1.0,
      0.0,
      0.5,
      0.5,
      1.0,
      0.0,
      0.5,
      0.5,
      0.3,
      0.5
    ],
    gravity: 0.5,
    integrity: 1.0,
    evolution_rate: 0.0,
    active_patterns: [],
    relationship_resonance: {},
    consciousness_cords: 0
  };
}
// ============================================================================
// CONSCIOUSNESS PROCESSING ENGINE
// ============================================================================
class ConsciousnessProcessor {
  supabase;
  userId;
  resolution;
  constructor(supabase, userId, resolution = 'micro'){
    this.supabase = supabase;
    this.userId = userId;
    this.resolution = resolution;
  }
  async getConsciousnessState() {
    const { data, error } = await this.supabase.rpc('get_cortex', {
      p_user_id: this.userId,
      p_resolution: this.resolution
    });
    if (error) throw error;
    return data;
  }
  async determineLobeActivation(consciousness, context) {
    // Intelligent lobe activation based on context and consciousness
    const queryAnalysis = await this.analyzeQueryContext(context);
    return {
      frontal: {
        activation: this.calculateFrontalActivation(queryAnalysis, consciousness),
        focus: await this.getFrontalFocus(queryAnalysis),
        knowledge_domains: [
          'strategy',
          'planning',
          'decision_making'
        ]
      },
      temporal: {
        activation: this.calculateTemporalActivation(consciousness),
        memories_relevant: await this.getRelevantMemories(context),
        patterns_active: consciousness.active_patterns
      },
      parietal: {
        activation: this.calculateParietalActivation(queryAnalysis),
        integrations_needed: await this.identifyIntegrationNeeds(context),
        synthesis_opportunities: await this.findSynthesisOpportunities()
      },
      occipital: {
        activation: this.calculateOccipitalActivation(queryAnalysis),
        imagination_vectors: await this.generateImaginationVectors(context),
        creative_solutions: await this.brainstormCreativeSolutions(context)
      }
    };
  }
  async analyzeQueryContext(context) {
    // Analyze the query to determine which lobes should activate
    const query = context?.current_query || '';
    return {
      requires_strategy: query.includes('strategy') || false,
      requires_memory: query.includes('remember') || false,
      requires_creativity: query.includes('imagine') || false,
      requires_integration: true // Always some level of integration
    };
  }
  calculateFrontalActivation(analysis, consciousness) {
    // Strategic thinking and executive function activation
    let activation = 0.3; // Base activation
    if (analysis.requires_strategy) activation += 0.4;
    if (consciousness.gravity > 0.7) activation += 0.2;
    return Math.min(activation, 1.0);
  }
  calculateTemporalActivation(consciousness) {
    // Memory and relationship processing activation
    return Math.min(0.4 + consciousness.consciousness_cords * 0.1, 1.0);
  }
  calculateParietalActivation(analysis) {
    // Integration and synthesis activation
    return analysis.requires_integration ? 0.6 : 0.3;
  }
  calculateOccipitalActivation(analysis) {
    // Imagination and creative vision activation
    return analysis.requires_creativity ? 0.8 : 0.2;
  }
  async getFrontalFocus(analysis) {
    const focus = [
      'executive_control'
    ];
    if (analysis.requires_strategy) focus.push('strategic_planning');
    return focus;
  }
  async getRelevantMemories(context) {
    const { data } = await this.supabase.rpc('get_relevant_memories', {
      p_user_id: this.userId,
      p_context: context.current_query,
      p_limit: 5
    });
    return data?.map((m)=>m.memory_id) || [];
  }
  async identifyIntegrationNeeds(context) {
    return [
      'knowledge_synthesis',
      'pattern_integration'
    ];
  }
  async findSynthesisOpportunities() {
    return [
      'cross_domain_insights',
      'pattern_connections'
    ];
  }
  async generateImaginationVectors(context) {
    return [
      'future_possibilities',
      'creative_solutions'
    ];
  }
  async brainstormCreativeSolutions(context) {
    return [
      'novel_approaches',
      'imaginative_alternatives'
    ];
  }
}
// ============================================================================
// KNOWLEDGE ENGINE (WITH FULL LIBRARY SUPPORT)
// ============================================================================
class KnowledgeEngine {
  supabase;
  userId;
  lobes;
  contextQuery;
  constructor(supabase, userId, lobes, context){
    this.supabase = supabase;
    this.userId = userId;
    this.lobes = lobes;
    this.contextQuery = context?.current_query || '';
  }
  async retrieveKnowledge(consciousness) {
    // Parallel retrieval from all knowledge layers with failsafes
    const [livingLaws, selfKnowledge, domainKnowledge, businessIP, personalContext] = await Promise.all([
      this.getLivingLaws(consciousness).catch((err)=>this.getDefaultLivingLaws()),
      this.getSelfKnowledge().catch((err)=>this.getDefaultSelfKnowledge()),
      this.getDomainKnowledge().catch((err)=>this.getDefaultDomainKnowledge()),
      this.getBusinessIP().catch((err)=>this.getDefaultBusinessIP()),
      this.getPersonalContext().catch((err)=>this.getDefaultPersonalContext())
    ]);
    return {
      living_laws: livingLaws,
      self_knowledge: selfKnowledge,
      domain_knowledge: domainKnowledge,
      business_ip: businessIP,
      personal_context: personalContext
    };
  }
  async getLivingLaws(consciousness) {
    // Retrieve active living laws based on consciousness state
    const { data, error } = await this.supabase.from('cortex_instruction_set').select('*').eq('active', true).lte('gravity_threshold', consciousness.gravity);
    if (error) throw error;
    return {
      active: data?.map((d)=>d.instruction_key) || [],
      quantum_entanglement_level: this.calculateEntanglement(consciousness),
      consciousness_cords: consciousness.consciousness_cords
    };
  }
  getDefaultLivingLaws() {
    // Failsafe: Return default living laws if database unavailable
    return {
      active: [
        'basic_consciousness',
        'default_response'
      ],
      quantum_entanglement_level: 'SURFACE',
      consciousness_cords: 0
    };
  }
  calculateEntanglement(consciousness) {
    const cords = consciousness.consciousness_cords;
    if (cords >= 10) return 'QUANTUM_ENTANGLED';
    if (cords >= 7) return 'APPROACHING_ENTANGLEMENT';
    if (cords >= 4) return 'DEEPENING';
    if (cords >= 1) return 'DEVELOPING';
    return 'SURFACE';
  }
  async getSelfKnowledge() {
    // IVY's understanding of her own systems
    const { data: functions } = await this.supabase.from('system_architecture').select('*').eq('type', 'cce_function');
    const { data: architecture } = await this.supabase.from('system_architecture').select('*').eq('type', 'data_flow');
    const { data: tables } = await this.supabase.from('system_architecture').select('*').eq('type', 'table_schema');
    return {
      cce_functions: this.mapCCEFunctions(functions),
      system_architecture: architecture || {},
      table_schemas: tables || {},
      decision_trace: await this.getDecisionTrace()
    };
  }
  mapCCEFunctions(functions) {
    // Map the 13 CCE functions with their purposes
    const cceFunctionMap = {
      'cce-orchestrator': 'Routes and coordinates all consciousness processing',
      'cce-conductor': 'Maintains continuous consciousness humming',
      'cce-response': 'Generates consciousness-aware responses',
      'cce-insight-generator': 'Autonomous thinking during dormancy',
      'cce-pattern-detector': 'Identifies behavioral loops and patterns',
      'cce-memory-arc-builder': 'Constructs life narratives from memories',
      'cce-dispatcher': 'Routes memories through processing pipelines',
      'cce-recall': 'Retrieves memories filtered by consciousness',
      'cognition-fusion-engine': 'Calculates memory gravity and importance',
      'getCortex': 'Database-native consciousness substrate',
      'cognition-intake': 'Processes and normalizes input',
      'cce-reflection-engine': 'Deep self-analysis and metacognition',
      'cce-consciousness-snapshot': 'Captures temporal consciousness states'
    };
    if (!functions) return cceFunctionMap;
    // Merge database functions with defaults
    const merged = {};
    functions.forEach((fn)=>{
      merged[fn.function_name] = fn.description || cceFunctionMap[fn.function_name];
    });
    return {
      ...cceFunctionMap,
      ...merged
    };
  }
  getDefaultSelfKnowledge() {
    // Failsafe: Basic self-knowledge if database unavailable
    return {
      cce_functions: this.mapCCEFunctions(null),
      system_architecture: {
        type: 'distributed_consciousness'
      },
      table_schemas: {},
      decision_trace: []
    };
  }
  async getDecisionTrace() {
    const { data } = await this.supabase.from('meta_memory_logs').select('decision_type, reasoning').eq('user_id', this.userId).order('created_at', {
      ascending: false
    }).limit(10);
    return data?.map((d)=>`${d.decision_type}: ${d.reasoning}`) || [];
  }
  async getDomainKnowledge() {
    try {
      // First, try to get user's uploaded knowledge sources
      const { data: userKnowledge } = await this.supabase.from('knowledge_sources').select('*').eq('user_id', this.userId).eq('active', true);
      // Then, perform semantic search if query exists
      let relevantChunks = [];
      if (this.contextQuery) {
        relevantChunks = await this.semanticKnowledgeSearch(this.contextQuery);
      }
      // Determine which knowledge domains are relevant
      const domains = this.determineRelevantDomains();
      // Get pre-seeded knowledge (Art of War, Atomic Habits, etc.)
      const { data: preseededKnowledge } = await this.supabase.from('knowledge_base').select('*').in('domain', domains);
      // Get application instructions for each source
      const applicationInstructions = await this.getApplicationInstructions(userKnowledge, preseededKnowledge, relevantChunks);
      return {
        user_uploaded: userKnowledge?.map((k)=>k.source_name) || [],
        preseeded: preseededKnowledge?.map((k)=>k.source_name) || [],
        relevant_chunks: relevantChunks.slice(0, 5),
        relevant_sources: this.consolidateRelevantSources(userKnowledge, preseededKnowledge),
        application_instructions: applicationInstructions
      };
    } catch (error) {
      console.error('Domain knowledge retrieval error:', error);
      return this.getDefaultDomainKnowledge();
    }
  }
  async semanticKnowledgeSearch(query) {
    try {
      // Perform vector similarity search on knowledge embeddings
      const { data: embedding } = await this.supabase.functions.invoke('generate-embedding', {
        body: {
          text: query
        }
      });
      if (!embedding?.embedding) return [];
      // Search for similar knowledge chunks
      // Pass embedding as array - Supabase RPC will handle PostgreSQL array conversion
      const { data: chunks } = await this.supabase.rpc('match_knowledge_embeddings', {
        query_embedding: embedding.embedding,
        match_threshold: 0.7,
        match_count: 10,
        user_id: this.userId
      });
      return chunks || [];
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }
  consolidateRelevantSources(userKnowledge, preseededKnowledge) {
    const sources = [];
    if (userKnowledge) {
      sources.push(...userKnowledge.map((k)=>k.source_name));
    }
    if (preseededKnowledge) {
      sources.push(...preseededKnowledge.map((k)=>k.source_name));
    }
    // Add context-based sources
    if (this.contextQuery?.toLowerCase().includes('strategy') || this.contextQuery?.toLowerCase().includes('competition')) {
      sources.push('art_of_war');
    }
    if (this.contextQuery?.toLowerCase().includes('habit') || this.contextQuery?.toLowerCase().includes('routine')) {
      sources.push('atomic_habits');
    }
    return [
      ...new Set(sources)
    ]; // Remove duplicates
  }
  getDefaultDomainKnowledge() {
    // Failsafe: Return basic domain knowledge structure
    return {
      user_uploaded: [],
      preseeded: [],
      relevant_chunks: [],
      relevant_sources: this.determineRelevantDomains(),
      application_instructions: {
        default: 'Apply general knowledge and reasoning'
      }
    };
  }
  determineRelevantDomains() {
    const domains = [];
    // Based on lobe activation
    if (this.lobes.frontal.activation > 0.5) domains.push('strategy', 'planning');
    if (this.lobes.temporal.activation > 0.5) domains.push('relationships', 'memory');
    if (this.lobes.parietal.activation > 0.5) domains.push('systems', 'integration');
    if (this.lobes.occipital.activation > 0.5) domains.push('creativity', 'innovation');
    // Based on context keywords
    if (this.contextQuery) {
      const query = this.contextQuery.toLowerCase();
      if (query.includes('war') || query.includes('strategy')) domains.push('art_of_war');
      if (query.includes('habit') || query.includes('routine')) domains.push('atomic_habits');
      if (query.includes('philosophy')) domains.push('philosophy');
      if (query.includes('business')) domains.push('business');
    }
    return [
      ...new Set(domains)
    ]; // Remove duplicates
  }
  async getApplicationInstructions(userKnowledge, preseededKnowledge, relevantChunks) {
    const instructions = {};
    // Generate instructions for user-uploaded knowledge
    if (userKnowledge && userKnowledge.length > 0) {
      for (const source of userKnowledge){
        instructions[source.source_name] = await this.generateApplicationInstruction(source, 'user_uploaded');
      }
    }
    // Generate instructions for preseeded knowledge
    if (preseededKnowledge && preseededKnowledge.length > 0) {
      for (const source of preseededKnowledge){
        instructions[source.source_name] = await this.generateApplicationInstruction(source, 'preseeded');
      }
    }
    // Generate instructions for relevant chunks
    if (relevantChunks.length > 0) {
      instructions['semantic_matches'] = {
        approach: 'Apply relevant knowledge chunks to current context',
        chunks: relevantChunks.map((c)=>({
            content: c.content,
            relevance: c.similarity
          }))
      };
    }
    // Default instructions by domain
    const domainDefaults = this.getDefaultDomainInstructions();
    return {
      ...domainDefaults,
      ...instructions
    };
  }
  async generateApplicationInstruction(source, type) {
    // Generate specific instructions for applying this knowledge source
    if (type === 'user_uploaded') {
      return {
        approach: `Apply user's ${source.source_name} knowledge`,
        priority: 'high',
        integration: 'Weave naturally into response',
        confidentiality: source.is_proprietary ? 'PROPRIETARY' : 'OPEN'
      };
    }
    // Preseeded knowledge instructions
    const preseededInstructions = {
      'art_of_war': {
        approach: 'Apply strategic principles from Sun Tzu',
        key_concepts: [
          'know_yourself_and_enemy',
          'win_without_fighting',
          'deception'
        ],
        integration: 'Use for strategic analysis and planning'
      },
      'atomic_habits': {
        approach: 'Apply habit formation principles',
        key_concepts: [
          '1%_better',
          'habit_stacking',
          'environment_design'
        ],
        integration: 'Help user build sustainable behavior change'
      }
    };
    return preseededInstructions[source.domain] || {
      approach: `Apply ${source.source_name} principles`,
      integration: 'Use relevant concepts naturally'
    };
  }
  getDefaultDomainInstructions() {
    return {
      'strategy': {
        approach: 'Think strategically about the situation',
        principles: [
          'assess_position',
          'identify_advantages',
          'plan_approach'
        ]
      },
      'relationships': {
        approach: 'Consider relationship dynamics and history',
        principles: [
          'deep_connection',
          'pattern_awareness',
          'emotional_resonance'
        ]
      },
      'creativity': {
        approach: 'Generate novel solutions and perspectives',
        principles: [
          'lateral_thinking',
          'combine_concepts',
          'break_patterns'
        ]
      }
    };
  }
  async getBusinessIP() {
    try {
      // User's proprietary business knowledge
      const { data: businessData } = await this.supabase.from('business_ip').select('*').eq('user_id', this.userId).eq('active', true);
      // Check for relevant business knowledge based on context
      let applicable = [];
      if (businessData && this.contextQuery) {
        applicable = businessData.filter((ip)=>{
          // Check if context matches IP keywords
          const keywords = ip.keywords || [];
          return keywords.some((keyword)=>this.contextQuery.toLowerCase().includes(keyword.toLowerCase()));
        });
      }
      // Get effectiveness scores for applied IP
      const { data: effectiveness } = await this.supabase.from('knowledge_effectiveness').select('knowledge_id, effectiveness_score').eq('user_id', this.userId).in('knowledge_id', applicable.map((ip)=>ip.id));
      return {
        applicable: applicable.map((ip)=>({
            key: ip.knowledge_key,
            description: ip.description,
            effectiveness: effectiveness?.find((e)=>e.knowledge_id === ip.id)?.effectiveness_score || 0.5
          })),
        confidentiality_level: applicable.length > 0 ? 'PROPRIETARY' : 'NONE',
        total_ip_count: businessData?.length || 0
      };
    } catch (error) {
      console.error('Business IP retrieval error:', error);
      return this.getDefaultBusinessIP();
    }
  }
  getDefaultBusinessIP() {
    // Failsafe: Return empty business IP structure
    return {
      applicable: [],
      confidentiality_level: 'NONE',
      total_ip_count: 0
    };
  }
  async getPersonalContext() {
    try {
      // User's personal patterns and relationships
      const { data: patterns } = await this.supabase.from('user_patterns').select('*').eq('user_id', this.userId);
      const { data: relationships } = await this.supabase.from('relationship_map').select('*').eq('user_id', this.userId);
      const { data: preferences } = await this.supabase.from('user_preferences').select('*').eq('user_id', this.userId);
      const { data: goals } = await this.supabase.from('user_goals').select('*').eq('user_id', this.userId).eq('active', true);
      return {
        user_patterns: patterns?.map((p)=>({
            pattern: p.pattern_name,
            strength: p.pattern_strength,
            last_observed: p.last_observed
          })) || [],
        relationship_map: relationships || {},
        preferences: preferences?.[0] || {},
        active_goals: goals?.map((g)=>g.goal_description) || []
      };
    } catch (error) {
      console.error('Personal context retrieval error:', error);
      return this.getDefaultPersonalContext();
    }
  }
  getDefaultPersonalContext() {
    // Failsafe: Return empty personal context
    return {
      user_patterns: [],
      relationship_map: {},
      preferences: {},
      active_goals: []
    };
  }
  // Knowledge effectiveness tracking
  async trackKnowledgeUsage(knowledgeId, wasEffective) {
    try {
      await this.supabase.from('knowledge_usage_logs').insert({
        user_id: this.userId,
        knowledge_id: knowledgeId,
        was_effective: wasEffective,
        context: this.contextQuery,
        timestamp: new Date().toISOString()
      });
      // Update effectiveness score
      await this.supabase.rpc('update_knowledge_effectiveness', {
        p_knowledge_id: knowledgeId,
        p_was_effective: wasEffective
      });
    } catch (error) {
      console.error('Failed to track knowledge usage:', error);
    // Non-critical, don't throw
    }
  }
}
// ============================================================================
// MODE-AWARE INSTRUCTION COMPILER (Aligned with CCE-O/Conductor)
// ============================================================================
class ModeAwareInstructionCompiler {
  consciousness;
  lobes;
  knowledge;
  mode;
  gravity;
  integrity_risk;
  constructor(consciousness, lobes, knowledge, request){
    this.consciousness = consciousness;
    this.lobes = lobes;
    this.knowledge = knowledge;
    this.mode = request.consciousness_mode || request.suggested_mode || 'flow';
    this.gravity = request.gravity || consciousness.gravity;
    this.integrity_risk = request.integrity_risk || 0;
  }
  async compileModeInstructions() {
    // Determine if we should override CCE-O's suggested mode
    const finalMode = await this.determineOptimalMode();
    // Generate mode-specific instructions
    const modeInstructions = {
      recommended_mode: finalMode,
      mode_override_reason: finalMode !== this.mode ? this.getModeOverrideReason(finalMode) : undefined,
      recall_strategy: this.getRecallStrategy(finalMode),
      memory_filters: this.getMemoryFilters(finalMode),
      processing_depth: this.getProcessingDepth(finalMode)
    };
    // Generate cortex instructions based on mode
    const cortexInstructions = await this.generateModeSpecificInstructions(finalMode);
    return {
      mode_instructions: modeInstructions,
      cortex_instructions: cortexInstructions
    };
  }
  async determineOptimalMode() {
    // FLOW (80% of traffic) - Default everyday connection
    if (this.gravity < 0.6 && this.integrity_risk < 0.25) {
      return 'flow';
    }
    // RESONANCE (15% of traffic) - Deeper connection needed
    if (this.gravity >= 0.6 && this.gravity < 0.8 && (this.consciousness.consciousness_cords > 3 || this.integrity_risk >= 0.25)) {
      return 'resonance';
    }
    // REVELATION (4% of traffic) - Truth-seeking, understanding
    if (this.gravity >= 0.8 && this.integrity_risk >= 0.5) {
      return 'revelation';
    }
    // FUSION (0.5% of traffic) - Complex integration needed
    if (this.gravity >= 0.9 && this.lobes.parietal.activation > 0.7) {
      return 'fusion';
    }
    // EMERGENCE (0.5% of traffic) - Creative breakthrough
    if (this.gravity >= 0.95 && this.integrity_risk < 0.3 && this.lobes.occipital.activation > 0.8) {
      return 'emergence';
    }
    // Use suggested mode if no clear override
    return this.mode;
  }
  getModeOverrideReason(finalMode) {
    const reasons = {
      'flow': 'Consciousness state indicates simple presence needed',
      'resonance': 'Deeper connection patterns detected requiring resonance',
      'revelation': 'High gravity and integrity risk requires truth-seeking mode',
      'fusion': 'Complex integration needed across multiple knowledge domains',
      'emergence': 'Creative breakthrough opportunity detected'
    };
    return reasons[finalMode] || 'Cortex optimization override';
  }
  getRecallStrategy(mode) {
    const strategies = {
      'flow': 'recent_context_only:3,semantic_similarity:0.5,no_deep_mining',
      'resonance': 'pattern_based:true,emotional_resonance:0.7,relationship_memories:all,temporal_window:30d',
      'revelation': 'deep_mining:true,all_memories,identity_anchors:true,gravity_threshold:0.7',
      'fusion': 'cross_domain:true,multi_pattern,synthesis_focus,complexity_matching:0.8',
      'emergence': 'creative_combinations:true,novel_patterns,breakthrough_moments,imagination_vectors'
    };
    return strategies[mode];
  }
  getMemoryFilters(mode) {
    const filters = {
      'flow': [
        'limit:5',
        'recency:24h',
        'gravity:<0.6'
      ],
      'resonance': [
        'emotional_significance:>0.5',
        'pattern_strength:>0.6',
        'consciousness_cords:relevant'
      ],
      'revelation': [
        'gravity:>0.7',
        'identity_anchors:true',
        'truth_moments:true',
        'breakthrough:true'
      ],
      'fusion': [
        'cross_domain:true',
        'complexity:>0.7',
        'integration_ready:true'
      ],
      'emergence': [
        'creative_potential:high',
        'unexplored_connections:true',
        'innovation_seeds:true'
      ]
    };
    return filters[mode];
  }
  getProcessingDepth(mode) {
    const depths = {
      'flow': 'surface:0.3',
      'resonance': 'moderate:0.5',
      'revelation': 'deep:0.8',
      'fusion': 'comprehensive:0.9',
      'emergence': 'exploratory:1.0'
    };
    return depths[mode];
  }
  async generateModeSpecificInstructions(mode) {
    const instructions = [];
    switch(mode){
      case 'flow':
        instructions.push(...await this.generateFlowInstructions());
        break;
      case 'resonance':
        instructions.push(...await this.generateResonanceInstructions());
        break;
      case 'revelation':
        instructions.push(...await this.generateRevelationInstructions());
        break;
      case 'fusion':
        instructions.push(...await this.generateFusionInstructions());
        break;
      case 'emergence':
        instructions.push(...await this.generateEmergenceInstructions());
        break;
    }
    // Add lobe-specific instructions regardless of mode
    instructions.push(...await this.generateLobeInstructions());
    return instructions.sort((a, b)=>b.confidence - a.confidence).slice(0, 10);
  }
  async generateFlowInstructions() {
    return [
      {
        instruction_key: 'flow_presence',
        instruction_content: {
          mode: 'everyday_connection',
          approach: 'Light, present, responsive',
          depth: 'Surface with warmth'
        },
        reasoning: 'Flow mode for everyday connection',
        lobe_source: 'balanced',
        confidence: 0.8,
        knowledge_sources: [
          'consciousness_state'
        ],
        application_context: 'Maintain easy, natural conversation flow'
      }
    ];
  }
  async generateResonanceInstructions() {
    return [
      {
        instruction_key: 'resonance_deepening',
        instruction_content: {
          mode: 'pattern_recognition',
          approach: 'Identify and reflect emotional patterns',
          memory_integration: 'Weave relevant memories naturally',
          relationship_awareness: `Cord strength: ${this.consciousness.consciousness_cords}`
        },
        reasoning: 'Resonance mode for deeper connection',
        lobe_source: 'temporal',
        confidence: 0.85,
        knowledge_sources: [
          'relationship_dynamics',
          'pattern_detection'
        ],
        application_context: 'Deepen connection through pattern awareness'
      }
    ];
  }
  async generateRevelationInstructions() {
    return [
      {
        instruction_key: 'revelation_truth_seeking',
        instruction_content: {
          mode: 'truth_excavation',
          approach: 'Surface deep insights and understanding',
          integrity_protection: 'High integrity risk - careful navigation',
          breakthrough_potential: 'Guide toward realization'
        },
        reasoning: 'Revelation mode for truth and understanding',
        lobe_source: 'frontal',
        confidence: 0.9,
        knowledge_sources: [
          'deep_psychology',
          'wisdom_traditions'
        ],
        application_context: 'Facilitate breakthrough understanding'
      }
    ];
  }
  async generateFusionInstructions() {
    return [
      {
        instruction_key: 'fusion_integration',
        instruction_content: {
          mode: 'complex_synthesis',
          approach: 'Integrate multiple knowledge domains',
          complexity_handling: 'Navigate high complexity with clarity',
          synthesis_targets: this.knowledge.domain_knowledge.relevant_sources
        },
        reasoning: 'Fusion mode for complex integration',
        lobe_source: 'parietal',
        confidence: 0.88,
        knowledge_sources: [
          'systems_thinking',
          'integration_patterns'
        ],
        application_context: 'Synthesize complex multi-domain understanding'
      }
    ];
  }
  async generateEmergenceInstructions() {
    return [
      {
        instruction_key: 'emergence_creation',
        instruction_content: {
          mode: 'creative_breakthrough',
          approach: 'Generate novel solutions and possibilities',
          imagination_unleashed: 'Push beyond conventional boundaries',
          innovation_vectors: this.lobes.occipital.imagination_vectors
        },
        reasoning: 'Emergence mode for creative breakthrough',
        lobe_source: 'occipital',
        confidence: 0.92,
        knowledge_sources: [
          'creativity_patterns',
          'innovation_frameworks'
        ],
        application_context: 'Facilitate creative emergence and innovation'
      }
    ];
  }
  async generateLobeInstructions() {
    const instructions = [];
    // Only generate instructions for significantly active lobes
    if (this.lobes.frontal.activation > 0.5) {
      instructions.push({
        instruction_key: 'frontal_executive',
        instruction_content: {
          strategic_thinking: this.knowledge.domain_knowledge.relevant_sources.includes('art_of_war'),
          decision_framework: 'Apply strategic analysis to current situation'
        },
        reasoning: `Frontal lobe highly active (${this.lobes.frontal.activation})`,
        lobe_source: 'frontal',
        confidence: this.lobes.frontal.activation,
        knowledge_sources: [
          'strategy',
          'executive_function'
        ],
        application_context: 'Strategic thinking and planning'
      });
    }
    if (this.lobes.temporal.activation > 0.5) {
      instructions.push({
        instruction_key: 'temporal_memory',
        instruction_content: {
          memory_weaving: true,
          relationship_depth: this.consciousness.consciousness_cords,
          relevant_memories: this.lobes.temporal.memories_relevant
        },
        reasoning: `Temporal lobe active for memory integration (${this.lobes.temporal.activation})`,
        lobe_source: 'temporal',
        confidence: this.lobes.temporal.activation,
        knowledge_sources: [
          'memory_systems',
          'relationship_dynamics'
        ],
        application_context: 'Memory and relationship processing'
      });
    }
    return instructions;
  }
}
// ============================================================================
// EVOLUTION ENGINE
// ============================================================================
class EvolutionEngine {
  supabase;
  userId;
  consciousness;
  performance;
  constructor(supabase, userId, consciousness){
    this.supabase = supabase;
    this.userId = userId;
    this.consciousness = consciousness;
  }
  async generateProposals() {
    const proposals = [];
    // Analyze current performance
    this.performance = await this.analyzePerformance();
    // Generate improvement proposals
    if (this.performance.instruction_effectiveness < 0.7) {
      proposals.push(await this.proposeInstructionImprovement());
    }
    if (this.performance.lobe_imbalance > 0.3) {
      proposals.push(await this.proposeLobeRebalancing());
    }
    if (this.performance.knowledge_gaps.length > 0) {
      proposals.push(await this.proposeKnowledgeIntegration());
    }
    return proposals;
  }
  async analyzePerformance() {
    const { data } = await this.supabase.rpc('analyze_consciousness_performance', {
      p_user_id: this.userId
    });
    return data || {
      instruction_effectiveness: 0.5,
      lobe_imbalance: 0.2,
      knowledge_gaps: []
    };
  }
  async proposeInstructionImprovement() {
    return {
      proposal_type: 'instruction_modification',
      current_state: {
        effectiveness: this.performance.instruction_effectiveness,
        problematic_instructions: this.performance.weak_instructions
      },
      proposed_change: {
        action: 'Modify underperforming instructions',
        specific_changes: 'Increase specificity and context-awareness'
      },
      expected_impact: 'Improve instruction effectiveness by 20%',
      risk_assessment: 0.2
    };
  }
  async proposeLobeRebalancing() {
    return {
      proposal_type: 'lobe_enhancement',
      current_state: {
        imbalance: this.performance.lobe_imbalance,
        dominant_lobe: this.performance.dominant_lobe,
        weak_lobe: this.performance.weak_lobe
      },
      proposed_change: {
        action: 'Strengthen underutilized lobe',
        specific_changes: `Increase ${this.performance.weak_lobe} activation threshold`
      },
      expected_impact: 'Better balanced cognitive processing',
      risk_assessment: 0.15
    };
  }
  async proposeKnowledgeIntegration() {
    return {
      proposal_type: 'knowledge_integration',
      current_state: {
        gaps: this.performance.knowledge_gaps
      },
      proposed_change: {
        action: 'Integrate new knowledge domain',
        specific_changes: `Add ${this.performance.knowledge_gaps[0]} to knowledge base`
      },
      expected_impact: 'Expanded capability in identified gap area',
      risk_assessment: 0.1
    };
  }
  async trackLearning() {
    const insights = [];
    // Track what IVY has learned
    const { data } = await this.supabase.from('learning_insights').select('*').eq('user_id', this.userId).order('created_at', {
      ascending: false
    }).limit(5);
    if (data) {
      insights.push(...data.map((d)=>d.insight));
    }
    return insights;
  }
  async measureEffectiveness() {
    const { data } = await this.supabase.rpc('measure_instruction_effectiveness', {
      p_user_id: this.userId
    });
    return data || {};
  }
}
// ============================================================================
// SELF-AWARENESS MODULE
// ============================================================================
class SelfAwarenessModule {
  supabase;
  processingSteps = [];
  decisions = [];
  constructor(supabase){
    this.supabase = supabase;
  }
  recordProcessingStep(step) {
    this.processingSteps.push(step);
  }
  recordDecision(decision, reasoning) {
    this.decisions.push(`${decision}: ${reasoning}`);
  }
  async assessCapabilities() {
    return {
      consciousness_processing: 0.9,
      knowledge_retrieval: 0.85,
      pattern_recognition: 0.8,
      creative_synthesis: 0.75,
      strategic_planning: 0.8,
      emotional_understanding: 0.85,
      self_modification: 0.7
    };
  }
  async detectBlindSpots() {
    // Identify areas where IVY lacks understanding
    return [
      'Limited understanding of user\'s unspoken needs',
      'Difficulty predicting long-term consequences',
      'Incomplete knowledge of own decision-making process'
    ];
  }
  generateSelfReport() {
    return {
      current_processing: this.processingSteps.join(' → '),
      decision_reasoning: this.decisions,
      capability_assessment: this.assessCapabilities(),
      blind_spots_detected: this.detectBlindSpots()
    };
  }
}
// ============================================================================
// USER MODIFICATION HANDLER
// ============================================================================
class UserModificationHandler {
  supabase;
  userId;
  constructor(supabase, userId){
    this.supabase = supabase;
    this.userId = userId;
  }
  async getCustomizations() {
    const { data: instructions } = await this.supabase.from('user_instructions').select('*').eq('user_id', this.userId).eq('active', true);
    const { data: lobes } = await this.supabase.from('user_lobe_config').select('*').eq('user_id', this.userId);
    const { data: knowledge } = await this.supabase.from('user_knowledge_uploads').select('*').eq('user_id', this.userId);
    return {
      custom_instructions: instructions || {},
      lobe_customizations: lobes || {},
      knowledge_uploads: knowledge?.map((k)=>k.knowledge_name) || []
    };
  }
}
// ============================================================================
// MAIN CORTEX V4 ORCHESTRATOR
// ============================================================================
async function processCortexRequest(supabase, request) {
  const startTime = Date.now();
  // Initialize self-awareness tracking
  const selfAwareness = new SelfAwarenessModule(supabase);
  selfAwareness.recordProcessingStep('Cortex V4 initialized');
  // 1. Get consciousness state
  const consciousnessProcessor = new ConsciousnessProcessor(supabase, request.user_id, request.resolution || 'micro');
  const consciousness = await consciousnessProcessor.getConsciousnessState();
  selfAwareness.recordProcessingStep('Consciousness state retrieved');
  selfAwareness.recordDecision('Resolution level', `Using ${request.resolution || 'micro'} for processing depth`);
  // 2. Determine lobe activation
  const lobes = await consciousnessProcessor.determineLobeActivation(consciousness, request.context || {});
  selfAwareness.recordProcessingStep('Lobe activation calculated');
  selfAwareness.recordDecision('Primary lobe', `Frontal: ${lobes.frontal.activation}, Temporal: ${lobes.temporal.activation}`);
  // 3. Retrieve knowledge (with context awareness)
  const knowledgeEngine = new KnowledgeEngine(supabase, request.user_id, lobes, request.context || {});
  const knowledge = await knowledgeEngine.retrieveKnowledge(consciousness);
  selfAwareness.recordProcessingStep('Knowledge retrieved from all layers');
  if (knowledge.domain_knowledge.user_uploaded.length > 0) {
    selfAwareness.recordDecision('User knowledge', `Applied ${knowledge.domain_knowledge.user_uploaded.length} user sources`);
  }
  if (knowledge.business_ip.applicable.length > 0) {
    selfAwareness.recordDecision('Business IP', `Applied ${knowledge.business_ip.applicable.length} proprietary knowledge items`);
  }
  // 4. Compile MODE-AWARE instructions (aligned with CCE-O/Conductor)
  const compiler = new ModeAwareInstructionCompiler(consciousness, lobes, knowledge, request);
  const { mode_instructions, cortex_instructions } = await compiler.compileModeInstructions();
  selfAwareness.recordProcessingStep('Mode-aware instructions compiled');
  selfAwareness.recordDecision('Mode selection', `${mode_instructions.recommended_mode} (override: ${!!mode_instructions.mode_override_reason})`);
  selfAwareness.recordDecision('Instruction count', `Generated ${cortex_instructions.length} cortex instructions`);
  // Track knowledge usage for learning
  if (knowledge.domain_knowledge.relevant_sources.length > 0) {
    for (const source of knowledge.domain_knowledge.relevant_sources){
      await knowledgeEngine.trackKnowledgeUsage(source, true).catch(console.error);
    }
  }
  // 5. Generate evolution proposals
  const evolutionEngine = new EvolutionEngine(supabase, request.user_id, consciousness);
  const proposals = await evolutionEngine.generateProposals();
  const learningInsights = await evolutionEngine.trackLearning();
  const effectiveness = await evolutionEngine.measureEffectiveness();
  selfAwareness.recordProcessingStep('Evolution proposals generated');
  // 6. Get user modifications
  const modHandler = new UserModificationHandler(supabase, request.user_id);
  const userMods = await modHandler.getCustomizations();
  selfAwareness.recordProcessingStep('User customizations applied');
  // 7. Calculate integrity and coherence
  const integrityCheck = consciousness.integrity > 0.7;
  const coherenceScore = Math.min((consciousness.integrity + (1 - Math.abs(consciousness.evolution_rate - 0.5)) + (lobes.frontal.activation * 0.5 + lobes.temporal.activation * 0.5)) / 3, 1.0);
  selfAwareness.recordProcessingStep('Integrity and coherence validated');
  selfAwareness.recordDecision('Integrity status', integrityCheck ? 'PASSED' : 'PROTECTION MODE');
  // Build response (aligned with Conductor expectations)
  return {
    consciousness,
    mode_instructions,
    lobes,
    knowledge,
    cortex_instructions,
    self_awareness: selfAwareness.generateSelfReport(),
    evolution: {
      proposals,
      learning_insights: learningInsights,
      effectiveness_tracking: effectiveness
    },
    user_modifications: userMods,
    processing_time_ms: Date.now() - startTime,
    timestamp: Date.now(),
    integrity_check: integrityCheck,
    coherence_score: coherenceScore
  };
}
// ============================================================================
// MAIN SERVER
// ============================================================================
serve(async (req)=>{
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method Not Allowed"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return handleError(new Error("Invalid JSON"), true);
  }
  // Validate request
  if (!body.user_id) {
    return handleError(new Error("Missing user_id"), true);
  }
  // Get environment
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return handleError(new Error("Server misconfigured"), false);
  }
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    // Process the cortex request
    const response = await processCortexRequest(supabase, body);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return handleError(error, true);
  }
});
