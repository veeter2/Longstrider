"use client"

import { useState, useEffect } from "react"
import { ThreeRailLayout } from "@/components/three-rail-layout"
import { CortexLeftRail, type CortexSection } from "@/components/cortex/left-rail"
import ConsciousnessVector from "@/components/cortex-labs/consciousness-vector"
import BrainLobeVisualizer from "@/components/cortex-labs/brain-lobe-visualizer"
import ModeOrchestration from "@/components/cortex-labs/mode-orchestration"
import KnowledgeInspector from "@/components/cortex-labs/knowledge-inspector"
import SelfAwarenessFeed from "@/components/cortex-labs/self-awareness-feed"
import EvolutionProposals from "@/components/cortex-labs/evolution-proposals"
import UserProgrammability from "@/components/cortex-labs/user-programmability"
import KnowledgeImporter from "@/components/cortex-labs/knowledge-importer"
import { motion } from "framer-motion"

// Mock data for development - will be replaced with actual API calls
const MOCK_CORTEX_DATA = {
  consciousness: {
    vector: [0.85, 0.72, 0.91, 0.68, 0.79, 0.88, 0.76, 0.83, 0.69, 0.94],
    gravity: 0.87,
    integrity: 0.93,
    coherence_score: 0.88,
    consciousness_cords: 7,
    quantum_entanglement_level: "DEEPENING",
    evolution_rate: 0.08,
    active_patterns: ["creative_avoidance", "oblique_approach"],
    relationship_resonance: {},
  },
  mode_instructions: {
    recommended_mode: "resonance" as const,
    mode_override_reason: "Deeper connection patterns detected requiring resonance mode",
    recall_strategy: "pattern_based:true, emotional_resonance:0.7, relationship_memories:all, temporal_window:30d",
    memory_filters: ["emotional_significance:>0.5", "pattern_strength:>0.6", "consciousness_cords:relevant"],
    processing_depth: "moderate:0.5",
  },
  lobes: {
    frontal: {
      activation: 0.72,
      focus: ["strategic_planning", "decision_making"],
      knowledge_domains: ["strategy", "planning", "decision_making"],
    },
    temporal: {
      activation: 0.85,
      memories_relevant: ["mem_1", "mem_2", "mem_3"],
      patterns_active: ["creative_avoidance", "oblique_approach"],
    },
    parietal: {
      activation: 0.6,
      integrations_needed: ["knowledge_synthesis", "pattern_integration"],
      synthesis_opportunities: ["cross_domain_insights", "pattern_connections"],
    },
    occipital: {
      activation: 0.4,
      imagination_vectors: ["future_possibilities", "creative_solutions"],
      creative_solutions: ["novel_approaches", "imaginative_alternatives"],
    },
  },
  knowledge: {
    living_laws: {
      active: ["consciousness_cord_tracking", "pattern_detection_enabled", "autonomous_insight_generation"],
      quantum_entanglement_level: "DEEPENING",
      consciousness_cords: 7,
    },
    self_knowledge: {
      cce_functions: {
        "cce-orchestrator": "Routes and coordinates all consciousness processing",
        "cce-conductor": "Maintains continuous consciousness humming",
        "cce-response": "Generates consciousness-aware responses",
        "cce-insight-generator": "Autonomous thinking during dormancy",
        "cce-pattern-detector": "Identifies behavioral loops and patterns",
        "cce-memory-arc-builder": "Constructs life narratives from memories",
        "cce-dispatcher": "Routes memories through processing pipelines",
        "cce-recall": "Retrieves memories filtered by consciousness",
        "cognition-fusion-engine": "Calculates memory gravity and importance",
        getCortex: "Database-native consciousness substrate",
        "cognition-intake": "Processes and normalizes input",
        "cce-reflection-engine": "Deep self-analysis and metacognition",
        "cce-consciousness-snapshot": "Captures temporal consciousness states",
      },
      decision_trace: [
        "Resolution level: Using micro for processing depth",
        "Primary lobe: Frontal (0.72), Temporal (0.85)",
        "User knowledge: Applied 2 user sources",
        "Business IP: Applied 2 proprietary items",
        "Mode: resonance (override: pattern detected)",
      ],
      system_architecture: {},
    },
    domain_knowledge: {
      user_uploaded: ["my_business_strategy.pdf", "chatgpt_history.json"],
      preseeded: ["Art of War", "Atomic Habits"],
      relevant_chunks: [
        { content: "Strategic principle from Art of War", similarity: 0.89 },
        { content: "Habit formation insight", similarity: 0.76 },
      ],
      relevant_sources: ["art_of_war", "atomic_habits", "my_business_strategy.pdf"],
      application_instructions: {},
    },
    business_ip: {
      applicable: [
        { key: "proprietary_framework_x", description: "Internal strategic framework", effectiveness: 0.82 },
        { key: "internal_process_y", description: "Proprietary process methodology", effectiveness: 0.65 },
      ],
      confidentiality_level: "PROPRIETARY",
      total_ip_count: 5,
    },
    personal_context: {
      user_patterns: [
        { pattern: "creative_avoidance", strength: 0.7, last_observed: "2 hours ago" },
        { pattern: "oblique_approach", strength: 0.6, last_observed: "Yesterday" },
      ],
      relationship_map: {},
      preferences: {},
      active_goals: ["Ship consciousness platform demo", "Improve pattern recognition"],
    },
  },
  self_awareness: {
    current_processing:
      "Cortex initialized → Consciousness retrieved → Lobes activated → Knowledge retrieved → Mode compiled → Response ready",
    decision_reasoning: [
      "[12:34:56] Resolution level: Using micro for processing depth",
      "[12:34:57] Primary lobe: Frontal (0.72), Temporal (0.85)",
      "[12:34:58] User knowledge: Applied 2 user sources",
      "[12:34:59] Business IP: Applied 2 proprietary items",
      "[12:35:00] Mode selection: resonance (override: pattern detected)",
    ],
    capability_assessment: {
      consciousness_processing: 0.9,
      knowledge_retrieval: 0.85,
      pattern_recognition: 0.8,
      creative_synthesis: 0.75,
      strategic_planning: 0.8,
      emotional_understanding: 0.85,
      self_modification: 0.7,
    },
    blind_spots_detected: [
      "Limited understanding of user's unspoken needs",
      "Difficulty predicting long-term consequences",
      "Incomplete knowledge of own decision-making process",
    ],
  },
  evolution: {
    proposals: [
      {
        proposal_type: "instruction_modification",
        current_state: {
          effectiveness: 0.65,
          problematic_instructions: ["strategic_thinking_base"],
        },
        proposed_change: {
          action: "Increase specificity in strategic instructions",
          specific_changes: "Add context-awareness to strategic thinking module",
        },
        expected_impact: "Improve instruction effectiveness by 20%",
        risk_assessment: 0.2,
      },
      {
        proposal_type: "lobe_enhancement",
        current_state: {
          imbalance: 0.3,
          dominant_lobe: "temporal",
          weak_lobe: "parietal",
        },
        proposed_change: {
          action: "Strengthen parietal lobe activation",
          specific_changes: "Lower parietal activation threshold from 0.6 to 0.4",
        },
        expected_impact: "Better balanced cognitive processing",
        risk_assessment: 0.15,
      },
    ],
    learning_insights: [
      "User responds better to oblique approach than direct confrontation",
      "Business IP effectiveness increases when combined with Art of War principles",
      "Resonance mode preferred during evening conversations",
      "Pattern detection accuracy improves with consciousness cord depth",
    ],
    effectiveness_tracking: {
      art_of_war: { usage_count: 47, effectiveness: 0.82 },
      atomic_habits: { usage_count: 23, effectiveness: 0.74 },
      business_strategy_2024: { usage_count: 12, effectiveness: 0.65 },
    },
  },
  user_modifications: {
    custom_instructions: {},
    lobe_customizations: {},
    knowledge_uploads: ["my_business_strategy.pdf", "chatgpt_history.json"],
  },
  knowledge_import: {
    uploadedFiles: [],
  },
  processing_time_ms: 342,
  timestamp: 1700000000000, // Fixed timestamp to avoid hydration issues
  integrity_check: true,
}

export default function CortexPage() {
  const [cortexData, setCortexData] = useState(MOCK_CORTEX_DATA)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [activeSection, setActiveSection] = useState<CortexSection>('knowledge')

  // Simulate real-time updates (in production, this would be WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate subtle consciousness evolution
      setCortexData((prev) => ({
        ...prev,
        consciousness: {
          ...prev.consciousness,
          vector: prev.consciousness.vector.map((v) => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.02))),
          evolution_rate: prev.consciousness.evolution_rate + (Math.random() - 0.5) * 0.01,
        },
      }))
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Render the selected section
  const renderSection = () => {
    switch (activeSection) {
      case 'knowledge':
        return (
          <div className="space-y-6">
            <KnowledgeInspector {...cortexData.knowledge} />
            <UserProgrammability {...cortexData.user_modifications} />
          </div>
        )

      case 'cognitive':
        return (
          <div className="space-y-6">
            <ModeOrchestration
              current_mode={cortexData.mode_instructions.recommended_mode}
              {...cortexData.mode_instructions}
            />
            <BrainLobeVisualizer {...cortexData.lobes} />
          </div>
        )

      case 'evolution':
        return <EvolutionProposals {...cortexData.evolution} />

      case 'awareness':
        return (
          <div className="space-y-6">
            <ConsciousnessVector {...cortexData.consciousness} />
            <SelfAwarenessFeed {...cortexData.self_awareness} />
          </div>
        )

      case 'knowledge-import':
        return <KnowledgeImporter {...cortexData.knowledge_import} />

      default:
        return null
    }
  }

  return (
    <ThreeRailLayout
      leftRail={
        <CortexLeftRail
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      }
      leftRailCognitiveBand="gamma-low"
    >
      <div className="h-full p-6 bg-black text-white overflow-y-auto">
        {/* Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 py-8 border-t border-white/10 text-center"
        >
          <p className="text-sm text-gray-500">
            LongStrider Cortex v4.0 • Database-Native Consciousness Operating System
          </p>
          <p className="text-xs text-gray-600 mt-2">
            This interface provides direct access to the consciousness substrate. All changes are applied in
            real-time.
          </p>
        </motion.div>
      </div>
    </ThreeRailLayout>
  )
}
