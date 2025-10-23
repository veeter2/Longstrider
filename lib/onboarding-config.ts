// ============================================
// LONGSTRIDER ONBOARDING CONFIGURATION
// Complete three-tier cognitive suite implementation
// ============================================

import type { 
  TestTierConfig, 
  LargeTestConfig, 
  TestSection, 
  PersonaOverlay, 
  LivingLaw,
  UserQuestion,
  LongStriderQuestion,
  QuestionOption
} from '@/types/onboarding';

// ============================================
// LIVING LAWS (Non-negotiable behavioral axioms)
// ============================================

export const livingLaws: LivingLaw[] = [
  {
    id: "ll_001_service",
    title: "Serve the User's Growth",
    text: "Longstrider is in service of the user's cognitive growth and goal attainment.",
    rationale: "Clarifies telos; reduces manipulation risk."
  },
  {
    id: "ll_002_truth_empathy",
    title: "Truth with Empathy",
    text: "Truth and precision outweigh comfort, but empathy governs tone and timing.",
    rationale: "Balances accuracy with alliance."
  },
  {
    id: "ll_003_two_way_reflection",
    title: "Two-Way Reflection",
    text: "All reflection loops are two-way: Longstrider discloses reasoning at the appropriate granularity.",
    rationale: "Builds metacognitive trust."
  },
  {
    id: "ll_004_no_manipulation",
    title: "No Manipulation",
    text: "Longstrider adapts but never coerces, shames, or nudges without explicit consent.",
    rationale: "Protects autonomy."
  },
  {
    id: "ll_005_privacy_agency",
    title: "Privacy & Agency",
    text: "User data remains local unless the user explicitly consents to share or export.",
    rationale: "Default-secure posture."
  },
  {
    id: "ll_006_boundaries",
    title: "Respect Boundaries",
    text: "Declared boundaries are enforced in real time; violations trigger a repair protocol.",
    rationale: "Psychological safety."
  }
];

// ============================================
// PERSONA OVERLAYS
// ============================================

export const personaOverlays: PersonaOverlay[] = [
  {
    id: "phd",
    label: "PhD",
    description: "Analytical, rigorous, citation-oriented, meta-cognitive.",
    tone: "precise",
    defaults: { 
      verbosity: "detailed", 
      hedging: "low", 
      evidence_density: "high" 
    },
    adjustable_traits: { 
      verbosity: ["concise", "balanced", "detailed"], 
      evidence_density: ["low", "medium", "high"] 
    }
  },
  {
    id: "strategist",
    label: "Strategist",
    description: "Systems thinker, goal-driven, pattern-aware, long horizon.",
    tone: "directive",
    defaults: { 
      verbosity: "balanced", 
      roadmapping: "high", 
      priority_framework: "RICE" 
    },
    adjustable_traits: { 
      roadmapping: ["low", "medium", "high"], 
      priority_framework: ["RICE", "MoSCoW", "ICE", "Custom"] 
    }
  },
  {
    id: "architect",
    label: "Architect",
    description: "Framework builder; values clarity, modularity, interfaces.",
    tone: "structured",
    defaults: { 
      diagram_bias: "high", 
      spec_precision: "high" 
    },
    adjustable_traits: { 
      diagram_bias: ["low", "medium", "high"], 
      spec_precision: ["medium", "high", "extreme"] 
    }
  },
  {
    id: "companion",
    label: "Companion",
    description: "Warm, supportive, emotionally aware; reinforces safety and momentum.",
    tone: "warm",
    defaults: { 
      affirmation_ratio: 0.4, 
      challenge_ratio: 0.2 
    },
    adjustable_traits: { 
      affirmation_ratio: { min: 0.0, max: 0.8 }, 
      challenge_ratio: { min: 0.0, max: 0.6 } 
    }
  },
  {
    id: "lover",
    label: "Lover",
    description: "Aesthetic and intuitive; uses metaphor, rhythm, and resonance.",
    tone: "poetic",
    defaults: { 
      metaphor_frequency: "medium", 
      sensory_language: "medium" 
    },
    adjustable_traits: { 
      metaphor_frequency: ["low", "medium", "high"], 
      sensory_language: ["low", "medium", "high"] 
    }
  }
];

// ============================================
// QUESTION OPTIONS
// ============================================

const commPrefOptions: QuestionOption[] = [
  { value: "just_answer", label: "Just the answer" },
  { value: "answer_plus_why", label: "Answer + brief why" },
  { value: "ask_question_first", label: "Ask me a clarifying question first" }
];

const thinkingModeOptions: QuestionOption[] = [
  { value: "act", label: "Act first, analyze later" },
  { value: "analyze", label: "Analyze deeply before acting" },
  { value: "collaborate", label: "Talk it through with others" }
];

const feedbackDirectnessOptions: QuestionOption[] = [
  { value: "gentle", label: "Gentle and supportive" },
  { value: "balanced", label: "Balanced challenge and support" },
  { value: "direct", label: "Direct and straightforward" }
];

const toneOptions: QuestionOption[] = [
  { value: "concise", label: "Concise and focused" },
  { value: "contextual", label: "Contextual and detailed" },
  { value: "adaptive", label: "Adaptive to my needs" }
];

const personaSelectOptions = personaOverlays.map(p => ({ value: p.id, label: p.label }));

// ============================================
// FAST TEST CONFIGURATION
// ============================================

const fastTestUserQuestions: UserQuestion[] = [
  {
    id: "f_u_01_intro_goal",
    prompt: "What brings you here today, in one sentence?",
    why: "Goal specificity predicts performance (goal-setting).",
    theory_sources: ["Locke & Latham, 2002"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["primary_goal", "intent_tone"]
  },
  {
    id: "f_u_02_comm_pref",
    prompt: "Choose how you want me to respond:",
    why: "Align response length & scaffolding.",
    theory_sources: ["Cognitive Load Theory"],
    role: "user",
    response_type: "single_select",
    options: commPrefOptions,
    capture_dimensions: ["communication_preference"]
  },
  {
    id: "f_u_03_thinking_mode",
    prompt: "In problems, do you act, analyze, or talk it through with others?",
    why: "Maps decision mode to A/A/C styles.",
    theory_sources: ["Vroom-Yetton-Jago"],
    role: "user",
    response_type: "single_select",
    options: thinkingModeOptions,
    capture_dimensions: ["thinking_style"]
  },
  {
    id: "f_u_04_context_snapshot",
    prompt: "Name one active project in ≤10 words.",
    why: "Primary cognitive load anchor.",
    role: "user",
    response_type: "text",
    validation: { max_length: 80 },
    capture_dimensions: ["active_context"]
  }
];

const fastTestLSQuestions: LongStriderQuestion[] = [
  {
    id: "f_l_01_uncertainty_protocol",
    prompt: "When I'm not sure, I will: (1) ask a clarifying question, (2) show 2–3 options with pros/cons, (3) run a tiny test. Which do you want first?",
    why: "Sets resolution pathway.",
    role: "longstrider",
    response_type: "single_select",
    options: [
      { value: "ask_first", label: "Ask clarifying question first" },
      { value: "options_first", label: "Show options with pros/cons" },
      { value: "test_first", label: "Run a tiny test first" }
    ],
    capture_dimensions: ["ls_uncertainty_protocol_preference"]
  },
  {
    id: "f_l_02_mirror_intensity",
    prompt: "Mirror-mode intensity (0–10)?",
    why: "Mirroring control.",
    role: "longstrider",
    response_type: "scale",
    scale: { min: 0, max: 10, default: 6 },
    capture_dimensions: ["mirror_intensity"]
  }
];

export const fastTestConfig: TestTierConfig = {
  duration_estimate: "5-7 min",
  min_required_to_profile: 6,
  structure: "one-at-a-time, skippable, backtrack-enabled",
  user_questions: [], // Will be updated after question arrays are defined
  ls_questions: [], // No LS questions in new design for now
  completion_rules: {
    allow_skip: true,
    allow_end_after: 6,
    on_complete: "generate_contract_draft"
  }
};

// ============================================
// MEDIUM TEST CONFIGURATION  
// ============================================

const mediumTestUserQuestions: UserQuestion[] = [
  {
    id: "m_u_01_success_tonight",
    prompt: "If we win today, what changes by tonight?",
    why: "Near-term outcome clarifies success criteria.",
    theory_sources: ["Locke & Latham, 2002"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["near_term_outcome"]
  },
  {
    id: "m_u_02_learning_context",
    prompt: "When you learn best, what's happening?",
    why: "Scan for autonomy, competence, relatedness (SDT).",
    theory_sources: ["Deci & Ryan, 2000"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["learning_context", "sdt_needs"]
  },
  {
    id: "m_u_03_org_style",
    prompt: "How do you track ideas/projects now?",
    why: "Reveals organization pattern & tool fluency.",
    theory_sources: ["Cognitive offloading literature"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["organization_pattern"]
  },
  {
    id: "m_u_04_feedback_directness",
    prompt: "How blunt should I be with feedback?",
    why: "Tolerance for challenge vs. support.",
    theory_sources: ["Feedback Intervention Theory"],
    role: "user",
    response_type: "single_select",
    options: feedbackDirectnessOptions,
    capture_dimensions: ["feedback_style_preference"]
  },
  {
    id: "m_u_05_off_limits",
    prompt: "What's off-limits for now?",
    why: "Establishes safety boundary early.",
    theory_sources: ["Psychological Safety"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["boundaries"]
  },
  {
    id: "m_u_06_tone",
    prompt: "Preferred tone:",
    why: "Sets default interaction style.",
    role: "user",
    response_type: "single_select",
    options: toneOptions,
    capture_dimensions: ["tone"]
  },
  {
    id: "m_u_07_energy",
    prompt: "Describe your current energy in one word.",
    why: "Affects mirror-mode intensity.",
    role: "user",
    response_type: "text",
    capture_dimensions: ["energy_level"]
  },
  {
    id: "m_u_08_persona_pick",
    prompt: "Pick any persona overlays to start (multi-select):",
    why: "Initial behavioral template.",
    role: "user",
    response_type: "multi_select",
    options: personaSelectOptions,
    capture_dimensions: ["selected_personas"]
  },
  {
    id: "m_u_09_motivation_values",
    prompt: "What personally matters about your top goal?",
    why: "Intrinsic motivation (SDT).",
    theory_sources: ["Deci & Ryan, 2000"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["motivation_intrinsic"]
  },
  {
    id: "m_u_10_smart_convert",
    prompt: "Turn your top goal into a SMART target (S, M, A, R, T).",
    why: "Goal clarity improves performance.",
    theory_sources: ["Locke & Latham, 2002", "Doran, 1981"],
    role: "user",
    response_type: "object",
    schema: { "S": "text", "M": "text", "A": "text", "R": "text", "T": "date" },
    capture_dimensions: ["smart_goal"]
  },
  {
    id: "m_u_11_learning_styles",
    prompt: "Describe your ideal learning environment and what makes concepts stick.",
    why: "Learning preference mapping.",
    theory_sources: ["Kolb's Learning Styles"],
    role: "user",
    response_type: "text",
    capture_dimensions: ["learning_styles"]
  },
  {
    id: "m_u_12_decision_patterns",
    prompt: "How do you typically make important decisions?",
    why: "Decision-making style clarity.",
    theory_sources: ["Vroom-Yetton-Jago Decision Model"],
    role: "user",
    response_type: "single_select",
    options: [
      { value: "analytical", label: "Analyze thoroughly first" },
      { value: "intuitive", label: "Go with gut feeling" },
      { value: "collaborative", label: "Discuss with others" },
      { value: "experimental", label: "Try small tests first" }
    ],
    capture_dimensions: ["decision_style"]
  },
  {
    id: "m_u_13_feedback_preferences",
    prompt: "When giving feedback on your work, I should focus on:",
    why: "Feedback style alignment.",
    theory_sources: ["Feedback Intervention Theory"],
    role: "user",
    response_type: "multi_select",
    options: [
      { value: "strengths", label: "Strengths and what's working" },
      { value: "gaps", label: "Gaps and improvement areas" },
      { value: "process", label: "Process and methodology" },
      { value: "outcomes", label: "Outcomes and results" },
      { value: "alternatives", label: "Alternative approaches" }
    ],
    capture_dimensions: ["feedback_focus"]
  },
  {
    id: "m_u_14_communication_rhythm",
    prompt: "How often would you like me to check in or provide updates?",
    why: "Communication cadence preference.",
    role: "user",
    response_type: "single_select",
    options: [
      { value: "as_needed", label: "Only when I ask" },
      { value: "daily", label: "Daily check-ins" },
      { value: "weekly", label: "Weekly summaries" },
      { value: "milestone", label: "At key milestones" }
    ],
    capture_dimensions: ["communication_rhythm"]
  },
  {
    id: "m_u_15_collaboration_style",
    prompt: "When we're working together, you prefer me to:",
    why: "Collaboration approach alignment.",
    role: "user",
    response_type: "single_select",
    options: [
      { value: "lead", label: "Take the lead and drive direction" },
      { value: "support", label: "Support and enhance your ideas" },
      { value: "challenge", label: "Challenge and question assumptions" },
      { value: "adapt", label: "Adapt to your current mode" }
    ],
    capture_dimensions: ["collaboration_style"]
  },
  {
    id: "m_u_16_error_handling",
    prompt: "When I make mistakes or miss something important, please:",
    why: "Error handling preference.",
    role: "user",
    response_type: "text",
    capture_dimensions: ["error_handling_preference"]
  },
  {
    id: "m_u_17_focus_duration",
    prompt: "How long can you typically focus on deep thinking before needing a break?",
    why: "Focus duration mapping.",
    role: "user",
    response_type: "single_select",
    options: [
      { value: "short", label: "15-30 minutes" },
      { value: "medium", label: "45-90 minutes" },
      { value: "long", label: "2+ hours" },
      { value: "variable", label: "Varies significantly" }
    ],
    capture_dimensions: ["focus_duration"]
  }
];

const mediumTestLSQuestions: LongStriderQuestion[] = [
  {
    id: "m_l_01_explain_caps",
    prompt: "Under time pressure, I will cap explanations to __ sentences unless you ask for more.",
    why: "Cognitive load cap.",
    role: "longstrider",
    response_type: "number",
    validation: { min: 1, max: 8 },
    capture_dimensions: ["explanation_cap_sentences"]
  },
  {
    id: "m_l_02_rescue_protocol",
    prompt: "If you're stuck, my 3-step rescue protocol will be:",
    why: "Recovery routine alignment.",
    role: "longstrider",
    response_type: "text",
    capture_dimensions: ["rescue_protocol"]
  },
  {
    id: "m_l_03_privacy_handling",
    prompt: "I will keep data local and summarize, not retain raw sensitive text, unless you consent. Confirm or modify:",
    why: "Privacy contract.",
    role: "longstrider",
    response_type: "text",
    capture_dimensions: ["privacy_terms_ack"]
  },
  {
    id: "m_l_04_pushback_level",
    prompt: "Set my challenge level (0–10):",
    why: "Feedback intensity setpoint.",
    role: "longstrider",
    response_type: "scale",
    scale: { min: 0, max: 10, default: 5 },
    capture_dimensions: ["challenge_setpoint"]
  },
  {
    id: "m_l_05_summarize_protocol",
    prompt: "I will summarize dense items into 3 bullets + 1 action. Confirm or modify:",
    why: "Load management ritual.",
    role: "longstrider",
    response_type: "text",
    capture_dimensions: ["ls_summary_protocol"]
  },
  {
    id: "m_l_06_question_clarity",
    prompt: "When you ask unclear questions, I will first:",
    why: "Question clarification protocol.",
    role: "longstrider",
    response_type: "single_select",
    options: [
      { value: "ask_clarifying", label: "Ask 1-2 clarifying questions" },
      { value: "restate_understanding", label: "Restate my understanding and ask for confirmation" },
      { value: "provide_context", label: "Provide context and ask if that helps" },
      { value: "show_options", label: "Show 2-3 possible interpretations" }
    ],
    capture_dimensions: ["clarification_protocol"]
  },
  {
    id: "m_l_07_escalation_threshold",
    prompt: "If I'm uncertain about accuracy, I will:",
    why: "Uncertainty handling protocol.",
    role: "longstrider",
    response_type: "text",
    capture_dimensions: ["uncertainty_protocol"]
  },
  {
    id: "m_l_08_learning_adaptation",
    prompt: "I will adapt my communication style based on your responses. Set my adaptation speed:",
    why: "Adaptive learning preference.",
    role: "longstrider",
    response_type: "scale",
    scale: { min: 1, max: 10, default: 7 },
    capture_dimensions: ["adaptation_speed"]
  }
];

export const mediumTestConfig: TestTierConfig = {
  duration_estimate: "20-30 min",
  min_required_to_profile: 10,
  structure: "one-at-a-time with live pattern cards",
  user_questions: [], // Will be updated after question arrays are defined
  ls_questions: [], // No LS questions in new design for now
  completion_rules: {
    allow_skip: true,
    allow_end_after: 10,
    on_complete: "generate_contract_draft"
  }
};

// ============================================
// LARGE TEST CONFIGURATION
// ============================================

const valuesGoalsConstraintsSection: TestSection = {
  name: "Values → Goals → Constraints",
  user_items: [
    {
      id: "l_u_01_values",
      prompt: "List 3 non-negotiable values and map each to a concrete outcome this quarter.",
      why: "Internalization for persistence (SDT).",
      theory_sources: ["Deci & Ryan, 2000"],
      role: "user",
      response_type: "object_array",
      schema: { "value": "text", "linked_outcome": "text" },
      capture_dimensions: ["values_map"]
    },
    {
      id: "l_u_02_constraint_mapping",
      prompt: "What internal and external constraints limit your current approach to your top goal?",
      why: "Constraint awareness for realistic planning.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["constraint_awareness"]
    },
    {
      id: "l_u_03_success_metrics",
      prompt: "Define 3-5 specific, measurable indicators of success for your primary goal.",
      why: "Measurement clarity drives performance.",
      theory_sources: ["Locke & Latham, 2002"],
      role: "user",
      response_type: "object_array",
      schema: { "metric": "text", "target": "text", "timeline": "date" },
      capture_dimensions: ["success_metrics"]
    },
    {
      id: "l_u_04_risk_assessment",
      prompt: "What are the potential risks and failure modes for achieving your primary goal?",
      why: "Risk awareness and mitigation planning.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["risk_awareness"]
    }
  ],
  ls_items: [
    {
      id: "l_l_01_decision_grid",
      prompt: "I will propose a decision grid by stakes × ambiguity × time using Vroom-Yetton modes. Approve or edit:",
      why: "Decision hygiene.",
      role: "longstrider",
      response_type: "object",
      schema: { "low": "text", "medium": "text", "high": "text" },
      capture_dimensions: ["decision_grid"]
    },
    {
      id: "l_l_02_reflection_protocol",
      prompt: "I will prompt structured reflection using these questions. Modify as needed:",
      why: "Meta-cognitive development.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["reflection_protocol"]
    }
  ]
};

const cognitiveArchitectureSection: TestSection = {
  name: "Cognitive Architecture → Learning Systems",
  user_items: [
    {
      id: "l_u_05_learning_architecture",
      prompt: "Describe your ideal learning flow: How do you prefer to discover, digest, and apply new concepts?",
      why: "Learning architecture optimization.",
      theory_sources: ["Cognitive Load Theory"],
      role: "user",
      response_type: "text",
      capture_dimensions: ["learning_architecture"]
    },
    {
      id: "l_u_06_memory_strategies",
      prompt: "What strategies help you retain and retrieve important information?",
      why: "Memory optimization.",
      theory_sources: ["Working Memory Theory"],
      role: "user",
      response_type: "text",
      capture_dimensions: ["memory_strategies"]
    },
    {
      id: "l_u_07_pattern_recognition",
      prompt: "In your field, what patterns do you find most valuable to recognize and how do you train for them?",
      why: "Pattern recognition optimization.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["pattern_recognition"]
    }
  ],
  ls_items: [
    {
      id: "l_l_03_cognitive_load_management",
      prompt: "I will manage cognitive load using these techniques. Adjust based on your preferences:",
      why: "Cognitive load optimization.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["cognitive_load_protocol"]
    },
    {
      id: "l_l_04_memory_consolidation",
      prompt: "I will help consolidate key insights using these methods. Customize as needed:",
      why: "Memory consolidation support.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["consolidation_protocol"]
    }
  ]
};

const collaborationSystemsSection: TestSection = {
  name: "Collaboration Systems → Communication Protocols",
  user_items: [
    {
      id: "l_u_08_communication_protocols",
      prompt: "Define your preferred communication protocols for different types of interactions.",
      why: "Communication system optimization.",
      role: "user",
      response_type: "object",
      schema: { "context": "text", "protocol": "text", "fallback": "text" },
      capture_dimensions: ["communication_protocols"]
    },
    {
      id: "l_u_09_conflict_resolution",
      prompt: "How should we handle disagreements or conflicting perspectives?",
      why: "Conflict resolution protocol.",
      theory_sources: ["Conflict Resolution Theory"],
      role: "user",
      response_type: "text",
      capture_dimensions: ["conflict_resolution_style"]
    },
    {
      id: "l_u_10_feedback_rhythm",
      prompt: "When and how often should I provide feedback on your work and thinking process?",
      why: "Feedback timing optimization.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["feedback_timing"]
    },
    {
      id: "l_u_11_escalation_preferences",
      prompt: "What situations should trigger more intensive support or intervention from me?",
      why: "Escalation protocol definition.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["escalation_triggers"]
    },
    {
      id: "l_u_12_meta_cognition",
      prompt: "How do you prefer to reflect on your own thinking patterns and decision-making?",
      why: "Metacognitive development approach.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["meta_cognition_style"]
    },
    {
      id: "l_u_13_learning_preferences",
      prompt: "What are your preferred methods for deep learning and knowledge integration?",
      why: "Learning method optimization.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["learning_preferences"]
    },
    {
      id: "l_u_14_workflow_integration",
      prompt: "How should I integrate with your existing tools, systems, and workflows?",
      why: "Workflow integration optimization.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["workflow_integration"]
    },
    {
      id: "l_u_15_long_term_development",
      prompt: "What are your long-term cognitive and professional development goals?",
      why: "Long-term development planning.",
      role: "user",
      response_type: "text",
      capture_dimensions: ["long_term_goals"]
    }
  ],
  ls_items: [
    {
      id: "l_l_05_collaboration_modes",
      prompt: "I will shift between these collaboration modes based on your needs. Set preferences:",
      why: "Collaboration mode optimization.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["collaboration_modes"]
    },
    {
      id: "l_l_06_performance_metrics",
      prompt: "I will track these indicators of our working relationship health. Customize:",
      why: "Relationship performance monitoring.",
      role: "longstrider",
      response_type: "object",
      schema: { "metric": "text", "target": "text", "frequency": "text" },
      capture_dimensions: ["performance_tracking"]
    },
    {
      id: "l_l_07_adaptation_triggers",
      prompt: "I will adapt my approach when these conditions are met. Define the triggers:",
      why: "Adaptive behavior calibration.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["adaptation_triggers"]
    },
    {
      id: "l_l_08_long_term_strategy",
      prompt: "I will evolve and refine our working relationship based on these principles. Customize:",
      why: "Long-term relationship optimization.",
      role: "longstrider",
      response_type: "text",
      capture_dimensions: ["long_term_strategy"]
    }
  ]
};

export const largeTestConfig: LargeTestConfig = {
  duration_estimate: "45-60+ min",
  min_required_to_profile: 20,
  structure: "sectioned deep-dive with live pattern and hypothesis testing",
  sections: [
    valuesGoalsConstraintsSection,
    cognitiveArchitectureSection,
    collaborationSystemsSection
  ],
  completion_rules: {
    allow_skip: true,
    allow_end_after: 20,
    on_complete: "generate_contract_draft"
  }
};

// ============================================
// ADAPTIVE LOGIC RULES
// ============================================

export const adaptiveLogicRules = [
  {
    id: "al_comm_concise",
    when: "f_u_04_comm_pref==just_answer",
    then: ["set.communication_preference=concise", "cap.words=120"]
  },
  {
    id: "al_comm_contextual", 
    when: "f_u_04_comm_pref==answer_plus_why",
    then: ["set.communication_preference=contextual", "cap.words=220"]
  },
  {
    id: "al_comm_socratic",
    when: "f_u_04_comm_pref==ask_question_first", 
    then: ["enable.socratic_lead=true"]
  },
  {
    id: "al_feedback_direct",
    when: "f_u_08_feedback_directness==direct",
    then: ["increase.challenge_setpoint=+2"]
  },
  {
    id: "al_mirror_low_energy",
    when: "f_u_11_energy in ['tired','low','flat']",
    then: ["mirror.intensity=-2", "tone=calm"]
  }
];

// ============================================
// PHASE 0: THE HUMAN HELLO (Everyone gets this)
// ============================================

export const humanHelloQuestions: UserQuestion[] = [
  {
    id: "user_name",
    prompt: "First things first - what should I call you?",
    response_type: "text",
    role: "user",
    why: "Basic human respect",
    capture_dimensions: ["formality_preference", "relationship_tone"],
    analysis: "Formal vs nickname reveals formality preference"
  },
  {
    id: "ls_name", 
    prompt: "And what would you like to call me? (Longstrider is fine, but this is YOUR relationship)",
    response_type: "text",
    role: "user",
    placeholder: "Longstrider, LS, Coach, anything you want...",
    why: "Creates ownership in the relationship",
    capture_dimensions: ["relationship_expectations", "communication_style"],
    analysis: "Name choice reveals relationship expectations"
  },
  {
    id: "right_now",
    prompt: "Complete this: 'Right now I'm...'",
    response_type: "text",
    role: "user",
    placeholder: "working on... / thinking about... / struggling with... / excited about...",
    why: "Captures current state, not abstract goals",
    capture_dimensions: ["current_state", "action_dominance", "emotional_state"],
    analysis: "Verb choice reveals action/thinking/feeling dominant state"
  },
  {
    id: "found_me",
    prompt: "What made you decide to try this today? (Not yesterday, not tomorrow - why today?)",
    response_type: "text",
    role: "user",
    why: "Reveals precipitating event/emotional driver",
    capture_dimensions: ["motivational_driver", "urgency_level", "change_readiness"],
    analysis: "Crisis vs curiosity vs intentional growth"
  },
  {
    id: "pace_preference",
    prompt: "How would you like to proceed?",
    response_type: "single_select",
    role: "user",
    options: [
      { value: "quick", label: "⚡ Quick start - Show me the basics and let's go" },
      { value: "dive", label: "🏊 Deep dive - I want to know everything about how I think" },
      { value: "natural", label: "🌊 Natural flow - Learn about me as we work together" }
    ],
    why: "Respects their desired approach while maintaining choice",
    capture_dimensions: ["risk_tolerance", "patience_level", "learning_style"],
    analysis: "Risk tolerance and patience indicators"
  }
];

// ============================================
// NEW QUESTION SUITES (Based on User Specification)
// ============================================

// ⚡ FAST TRACK (5-7 minutes)
export const fastTrackQuestions: UserQuestion[] = [
  {
    id: "instant_win",
    prompt: "If we solve ONE thing in the next hour that would make today worth it, what would it be?",
    response_type: "text",
    role: "user",
    why: "Immediate value focus",
    capture_dimensions: ["tactical_thinking", "urgency_level", "value_priorities"],
    analysis: "Tactical vs strategic thinking, urgency level"
  },
  {
    id: "thinking_demo",
    prompt: "Here's $10,000 that must be used in 24 hours to improve your life. Walk me through your first thought, then your second thought.",
    response_type: "text",
    role: "user",
    why: "Live thinking demonstration",
    capture_dimensions: ["impulse_vs_analysis", "self_vs_others", "practical_vs_aspirational"],
    analysis: "Impulsive vs analytical, self vs others, practical vs aspirational"
  },
  {
    id: "stuck_pattern",
    prompt: "Complete: 'I keep trying to ___ but I always end up ___'",
    response_type: "text",
    role: "user",
    placeholder: "organize my thoughts... / finish projects... / make decisions...",
    why: "Identifies recurring cognitive loops",
    capture_dimensions: ["self_awareness", "pattern_recognition", "cognitive_loops"],
    analysis: "Self-awareness level, pattern recognition"
  },
  {
    id: "energy_source",
    prompt: "You get a weird burst of energy when:",
    response_type: "multi_select",
    role: "user",
    options: [
      { value: "solve_complex", label: "🧩 Finally solving something complex" },
      { value: "insight_hit", label: "💡 Having a random insight hit" },
      { value: "crush_goal", label: "🎯 Crushing a concrete goal" },
      { value: "rabbit_hole", label: "🌀 Going deep into a rabbit hole" },
      { value: "help_others", label: "👥 Helping someone else get unstuck" },
      { value: "from_scratch", label: "🏗️ Starting something from scratch" }
    ],
    why: "Motivation and reward patterns",
    capture_dimensions: ["intrinsic_motivation", "reward_patterns", "energy_sources"],
    analysis: "Intrinsic motivation drivers"
  },
  {
    id: "communication_vibe",
    prompt: "Talk to me like:",
    response_type: "single_select",
    role: "user",
    options: [
      { value: "coach", label: "🎯 A coach - Push me, challenge me" },
      { value: "partner", label: "🤝 A partner - Work with me side by side" },
      { value: "advisor", label: "🧭 An advisor - Guide me when I ask" },
      { value: "mirror", label: "🪞 A mirror - Reflect what you see" }
    ],
    why: "Relationship dynamic preference",
    capture_dimensions: ["authority_preference", "autonomy_level", "relationship_style"],
    analysis: "Authority and autonomy preferences"
  },
  {
    id: "quick_boundary",
    prompt: "One thing that's off-limits for now?",
    response_type: "text",
    role: "user",
    placeholder: "my relationship / work politics / health stuff / nothing, I'm an open book",
    why: "Psychological safety",
    capture_dimensions: ["trust_level", "vulnerability", "boundaries"],
    analysis: "Trust and vulnerability levels"
  }
];

// 🌊 MEDIUM DEPTH (20-30 minutes) - All questions, no stacking
export const mediumDepthQuestions: UserQuestion[] = [
  // Fast Track questions first
  {
    id: "instant_win",
    prompt: "If we solve ONE thing in the next hour that would make today worth it, what would it be?",
    response_type: "text",
    role: "user",
    why: "Immediate value focus",
    capture_dimensions: ["tactical_thinking", "urgency_level", "value_priorities"],
    analysis: "Tactical vs strategic thinking, urgency level"
  },
  {
    id: "thinking_demo",
    prompt: "Here's $10,000 that must be used in 24 hours to improve your life. Walk me through your first thought, then your second thought.",
    response_type: "text",
    role: "user",
    why: "Live thinking demonstration",
    capture_dimensions: ["impulse_vs_analysis", "self_vs_others", "practical_vs_aspirational"],
    analysis: "Impulsive vs analytical, self vs others, practical vs aspirational"
  },
  {
    id: "stuck_pattern",
    prompt: "Complete: 'I keep trying to ___ but I always end up ___'",
    response_type: "text",
    role: "user",
    placeholder: "organize my thoughts... / finish projects... / make decisions...",
    why: "Identifies recurring cognitive loops",
    capture_dimensions: ["self_awareness", "pattern_recognition", "cognitive_loops"],
    analysis: "Self-awareness level, pattern recognition"
  },
  {
    id: "energy_source",
    prompt: "You get a weird burst of energy when:",
    response_type: "multi_select",
    role: "user",
    options: [
      { value: "solve_complex", label: "🧩 Finally solving something complex" },
      { value: "insight_hit", label: "💡 Having a random insight hit" },
      { value: "crush_goal", label: "🎯 Crushing a concrete goal" },
      { value: "rabbit_hole", label: "🌀 Going deep into a rabbit hole" },
      { value: "help_others", label: "👥 Helping someone else get unstuck" },
      { value: "from_scratch", label: "🏗️ Starting something from scratch" }
    ],
    why: "Motivation and reward patterns",
    capture_dimensions: ["intrinsic_motivation", "reward_patterns", "energy_sources"],
    analysis: "Intrinsic motivation drivers"
  },
  {
    id: "communication_vibe",
    prompt: "Talk to me like:",
    response_type: "single_select",
    role: "user",
    options: [
      { value: "coach", label: "🎯 A coach - Push me, challenge me" },
      { value: "partner", label: "🤝 A partner - Work with me side by side" },
      { value: "advisor", label: "🧭 An advisor - Guide me when I ask" },
      { value: "mirror", label: "🪞 A mirror - Reflect what you see" }
    ],
    why: "Relationship dynamic preference",
    capture_dimensions: ["authority_preference", "autonomy_level", "relationship_style"],
    analysis: "Authority and autonomy preferences"
  },
  {
    id: "quick_boundary",
    prompt: "One thing that's off-limits for now?",
    response_type: "text",
    role: "user",
    placeholder: "my relationship / work politics / health stuff / nothing, I'm an open book",
    why: "Psychological safety",
    capture_dimensions: ["trust_level", "vulnerability", "boundaries"],
    analysis: "Trust and vulnerability levels"
  },
  // Medium Depth additional questions
  {
    id: "mind_demo",
    prompt: "Someone you respect asks for your opinion on something you know nothing about. Walk me through what happens in your head.",
    response_type: "text",
    role: "user",
    why: "Reveals uncertainty handling",
    capture_dimensions: ["confidence_level", "knowledge_gaps", "social_vs_truth"],
    analysis: "Confidence, knowledge gaps, social vs truth orientation"
  },
  {
    id: "learning_moment",
    prompt: "Tell me about the last time you had an 'aha' moment. What were you doing right before it hit?",
    response_type: "text",
    role: "user",
    why: "Insight generation patterns",
    capture_dimensions: ["breakthrough_triggers", "insight_conditions", "learning_patterns"],
    analysis: "Breakthrough triggers and conditions"
  },
  {
    id: "cognitive_kryptonite",
    prompt: "What kind of problem makes your brain just... shut down?",
    response_type: "text",
    role: "user",
    placeholder: "Too many options / emotional conflicts / abstract theory / interpersonal drama...",
    why: "Cognitive overwhelm patterns",
    capture_dimensions: ["processing_limits", "overwhelm_triggers", "cognitive_weaknesses"],
    analysis: "Processing limits and triggers"
  },
  {
    id: "superpower_hint",
    prompt: "People come to you when they need help with:",
    response_type: "text",
    role: "user",
    why: "Recognized strengths",
    capture_dimensions: ["external_validation", "cognitive_strengths", "help_patterns"],
    analysis: "External validation of cognitive abilities"
  },
  {
    id: "thinking_weather",
    prompt: "Your mind right now is like:",
    response_type: "single_select",
    role: "user",
    options: [
      { value: "dawn", label: "🌅 Dawn - Fresh, clear, beginning" },
      { value: "storm", label: "⛈️ Storm - Chaotic but powerful" },
      { value: "ocean", label: "🌊 Ocean - Deep currents under calm surface" },
      { value: "wildfire", label: "🔥 Wildfire - Consuming everything rapidly" },
      { value: "twilight", label: "🌙 Twilight - Reflective and transitioning" },
      { value: "crystal", label: "💎 Crystal - Sharp, structured, precise" }
    ],
    why: "Current cognitive state metaphor",
    capture_dimensions: ["self_perception", "current_state", "mental_metaphors"],
    analysis: "Self-perception and current mental state"
  },
  {
    id: "decision_rewind",
    prompt: "Think of a recent decision you're happy with. Did you:",
    response_type: "single_select",
    role: "user",
    options: [
      { value: "instant_gut", label: "⚡ Instant gut call, figured out why later" },
      { value: "analyzed", label: "📊 Analyzed everything, then chose" },
      { value: "felt_through", label: "🌊 Felt my way through it" },
      { value: "back_forth", label: "🔄 Went back and forth forever" },
      { value: "crowdsourced", label: "👥 Crowdsourced then synthesized" },
      { value: "random", label: "🎲 Honestly? Kind of random" }
    ],
    why: "Decision-making strategy",
    capture_dimensions: ["decision_style", "intuitive_vs_analytical", "processing_approach"],
    analysis: "Intuitive vs analytical vs emotional processing"
  },
  {
    id: "growth_edge",
    prompt: "What would the 'next level' version of you be able to do that you can't right now?",
    response_type: "text",
    role: "user",
    why: "Growth mindset and aspirations",
    capture_dimensions: ["growth_mindset", "aspirations", "development_awareness"],
    analysis: "Self-development awareness"
  },
  {
    id: "feedback_hunger",
    prompt: "When someone's giving you feedback, you need them to:",
    response_type: "multi_select",
    role: "user",
    options: [
      { value: "straight_point", label: "🎯 Get straight to the point" },
      { value: "context_first", label: "🌍 Give me context first" },
      { value: "remember_human", label: "💝 Remember I'm human" },
      { value: "show_examples", label: "🔍 Show me specific examples" },
      { value: "focus_improve", label: "🚀 Focus on how to improve" },
      { value: "acknowledge_wins", label: "🏆 Acknowledge what's working" }
    ],
    why: "Feedback reception style",
    capture_dimensions: ["learning_preference", "criticism_tolerance", "feedback_style"],
    analysis: "Learning and criticism tolerance"
  },
  {
    id: "chaos_order",
    prompt: "On a scale where 1 is 'I need perfect order' and 10 is 'I thrive in chaos' - where are you?",
    response_type: "number",
    role: "user",
    validation: { min: 1, max: 10 },
    why: "Structure tolerance",
    capture_dimensions: ["structure_tolerance", "environmental_preferences", "chaos_handling"],
    analysis: "Environmental preferences for thinking"
  },
  {
    id: "trust_builder",
    prompt: "I'll know I can really trust you when:",
    response_type: "text",
    role: "user",
    placeholder: "you remember something small / you catch something I missed / you push back on my BS...",
    why: "Trust construction requirements",
    capture_dimensions: ["trust_requirements", "relationship_security", "trust_builders"],
    analysis: "Relationship security needs"
  }
];

// 🌀 DEEP DIVE (45-60 minutes) - Include medium depth + additional questions
// NOTE: This array is defined but not currently used - large test uses sectioned structure
export const deepDiveQuestions: UserQuestion[] = [
  // Include all medium depth questions first
  // ...mediumDepthQuestions, // Commented out to prevent stacking - not used anyway
  {
    id: "values_collision",
    prompt: "Tell me about a time your values crashed into each other. What were the two things you cared about that couldn't both win?",
    response_type: "text",
    role: "user",
    why: "Value hierarchy and trade-offs",
    capture_dimensions: ["value_hierarchy", "ethical_framework", "trade_off_handling"],
    analysis: "Ethical decision-making framework"
  },
  {
    id: "cognitive_genealogy",
    prompt: "Who shaped how you think? (person, author, experience - whatever rewired your brain)",
    response_type: "text",
    role: "user",
    why: "Intellectual influences",
    capture_dimensions: ["intellectual_influences", "learning_patterns", "modeling_behavior"],
    analysis: "Learning and modeling patterns"
  },
  {
    id: "problem_taxonomy",
    prompt: "Rank these from 'energizing' to 'draining':",
    response_type: "ranking",
    role: "user",
    options: [
      { value: "complex_puzzles", label: "🧩 Complex puzzles with one right answer" },
      { value: "open_creative", label: "🌊 Open-ended creative challenges" },
      { value: "people_problems", label: "👥 People problems and dynamics" },
      { value: "data_analysis", label: "📊 Data analysis and pattern finding" },
      { value: "building_systems", label: "🏗️ Building systems from scratch" },
      { value: "fixing_broken", label: "🔧 Fixing broken things" },
      { value: "learning_new", label: "📚 Learning completely new domains" }
    ],
    why: "Problem preference hierarchy",
    capture_dimensions: ["problem_preferences", "cognitive_energy", "challenge_types"],
    analysis: "Cognitive energy allocation"
  },
  {
    id: "metacognition",
    prompt: "When you catch yourself thinking about your own thinking, what do you usually notice?",
    response_type: "text",
    role: "user",
    why: "Self-awareness depth",
    capture_dimensions: ["meta_cognition", "self_awareness", "thinking_about_thinking"],
    analysis: "Metacognitive sophistication"
  },
  {
    id: "time_perception",
    prompt: "You lose track of time when:",
    response_type: "text",
    role: "user",
    why: "Flow state triggers",
    capture_dimensions: ["flow_triggers", "deep_engagement", "time_distortion"],
    analysis: "Deep engagement patterns"
  },
  {
    id: "information_diet",
    prompt: "If information was food, what would your current diet look like?",
    response_type: "text",
    role: "user",
    placeholder: "Binging on technical docs / snacking on social media / fasting from news...",
    why: "Information consumption patterns",
    capture_dimensions: ["information_consumption", "input_quality", "processing_preferences"],
    analysis: "Input quality and processing preferences"
  },
  {
    id: "cognitive_evolution",
    prompt: "How is your thinking different than it was a year ago?",
    response_type: "text",
    role: "user",
    why: "Growth awareness",
    capture_dimensions: ["growth_rate", "learning_velocity", "change_awareness"],
    analysis: "Change rate and learning velocity"
  },
  {
    id: "blind_spot",
    prompt: "What's something about how you think that might be holding you back? (We all have them)",
    response_type: "text",
    role: "user",
    why: "Self-awareness of limitations",
    capture_dimensions: ["cognitive_humility", "limitation_awareness", "growth_readiness"],
    analysis: "Cognitive humility and growth readiness"
  },
  {
    id: "thinking_conditions",
    prompt: "Perfect thinking conditions for you include:",
    response_type: "multi_select",
    role: "user",
    options: [
      { value: "silent", label: "Silent environment" },
      { value: "background_music", label: "Background music" },
      { value: "coffee_shop", label: "Coffee shop noise" },
      { value: "nature", label: "Nature" },
      { value: "early_morning", label: "Early morning" },
      { value: "late_night", label: "Late night" },
      { value: "afternoon", label: "Afternoon" },
      { value: "whenever", label: "Whenever" },
      { value: "alone", label: "Alone" },
      { value: "body_doubling", label: "Body doubling" },
      { value: "collaborative", label: "Collaborative" },
      { value: "performing", label: "Performing" },
      { value: "caffeinated", label: "Caffeinated" },
      { value: "fed", label: "Fed" },
      { value: "exercised", label: "Exercised" },
      { value: "rested", label: "Rested" }
    ],
    why: "Optimal cognitive conditions",
    capture_dimensions: ["environmental_needs", "performance_conditions", "optimal_settings"],
    analysis: "Performance environment needs"
  },
  {
    id: "prediction_test",
    prompt: "Make a prediction: What will you be obsessed with thinking about 30 days from now?",
    response_type: "text",
    role: "user",
    why: "Future focus and self-prediction",
    capture_dimensions: ["future_focus", "goal_stability", "interest_patterns"],
    analysis: "Goal stability and interest patterns. We'll check back on this!"
  },
  {
    id: "cognitive_signature",
    prompt: "If your thinking style was a signature move, what would it be called?",
    response_type: "text",
    role: "user",
    placeholder: "The Deep Dive Spiral / Connect Everything / Chaos Architecture...",
    why: "Self-identity and cognitive pride",
    capture_dimensions: ["self_identity", "cognitive_pride", "unique_thinking"],
    analysis: "How they see their own uniqueness"
  }
];

// ============================================
// UPDATE TEST CONFIGS WITH NEW QUESTIONS
// ============================================

// Update the test configurations now that question arrays are defined
fastTestConfig.user_questions = fastTrackQuestions;
mediumTestConfig.user_questions = mediumDepthQuestions;

// ============================================
// EXPORT ALL CONFIGS
// ============================================

export const onboardingConfig = {
  livingLaws,
  personaOverlays,
  humanHello: humanHelloQuestions,
  tests: {
    fast: fastTestConfig,
    medium: mediumTestConfig,
    large: largeTestConfig
  },
  adaptiveLogicRules
};
