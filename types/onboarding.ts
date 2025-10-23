// ============================================
// LONGSTRIDER ONBOARDING COGNITIVE SUITE TYPES
// Advanced three-tier mutual interview system
// ============================================

export type TestTier = 'fast' | 'medium' | 'large';

export type QuestionType = 
  | 'text' 
  | 'single_select' 
  | 'multi_select' 
  | 'number' 
  | 'scale' 
  | 'object' 
  | 'object_array'
  | 'multi_select_text'
  | 'choice'
  | 'choice_multiple'
  | 'slider'
  | 'ranking'
  | 'checkbox_grid';

export type ResponseRole = 'user' | 'longstrider';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  default?: number;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  sum_to?: number;
  min_length?: number;
  max_length?: number;
}

export interface QuestionSchema {
  [key: string]: string;
}

// ============================================
// QUESTION DEFINITIONS
// ============================================

export interface BaseQuestion {
  id: string;
  prompt: string;
  why: string;
  theory_sources?: string[];
  response_type: QuestionType;
  capture_dimensions: string[];
  options?: QuestionOption[] | string[];
  validation?: ValidationRule;
  schema?: QuestionSchema;
  placeholder?: string;
  analysis?: string;
}

export interface UserQuestion extends BaseQuestion {
  role: 'user';
}

export interface LongStriderQuestion extends BaseQuestion {
  role: 'longstrider';
  scale?: ScaleConfig;
}

// ============================================
// TEST TIER STRUCTURES
// ============================================

export interface TestTierConfig {
  duration_estimate: string;
  min_required_to_profile: number;
  structure: string;
  user_questions: UserQuestion[];
  ls_questions: LongStriderQuestion[];
  completion_rules: {
    allow_skip: boolean;
    allow_end_after: number;
    on_complete: string;
  };
}

export interface TestSection {
  name: string;
  user_items: UserQuestion[];
  ls_items: LongStriderQuestion[];
}

export interface LargeTestConfig extends Omit<TestTierConfig, 'user_questions' | 'ls_questions'> {
  sections: TestSection[];
}

// ============================================
// ONBOARDING STATE MANAGEMENT
// ============================================

export interface OnboardingState {
  currentTier: TestTier | null;
  currentTestStep: 'human_hello' | 'selection' | 'questions' | 'mutual_reflection' | 'contract' | 'complete';
  currentQuestionIndex: number;
  currentSectionIndex?: number; // For large test
  responses: Record<string, any>;
  isUserTurn: boolean;
  startTime: number;
  patternsDetected: string[];
  confidenceScore: number;
}

export interface OnboardingSession {
  sessionId: string;
  userId: string;
  state: OnboardingState;
  testResults: {
    fast?: TestTierResults;
    medium?: TestTierResults;
    large?: TestTierResults;
  };
  mutualReflection?: MutualReflectionResults;
  workingContract?: WorkingContract;
  createdAt: number;
  updatedAt: number;
}

export interface TestTierResults {
  tier: TestTier;
  responses: Record<string, any>;
  patternsDetected: string[];
  confidenceScore: number;
  completedAt: number;
}

// ============================================
// MUTUAL REFLECTION TYPES
// ============================================

export interface MutualReflectionResults {
  userSummary: {
    thinking_summary: string;
    motivation_summary: string;
    communication_summary: string;
    behavioral_patterns: string[];
    growth_opportunities: string[];
  };
  userQuestionsToLS: QuestionExchange[];
  lsResponses: Record<string, string>;
  mutualAgreement: boolean;
  completedAt: number;
}

export interface QuestionExchange {
  id: string;
  userQuestion: string;
  lsResponse: string;
  timestamp: number;
}

// ============================================
// PERSONA & LIVING LAWS TYPES
// ============================================

export interface PersonaOverlay {
  id: string;
  label: string;
  description: string;
  tone: string;
  defaults: Record<string, any>;
  adjustable_traits: Record<string, any>;
}

export interface PersonaWeights {
  phd: number;
  strategist: number;
  architect: number;
  companion: number;
  lover: number;
}

export interface LivingLaw {
  id: string;
  title: string;
  text: string;
  rationale: string;
}

export interface MirrorModeSettings {
  intensity: number; // 0-10
  pause_conditions: string;
  adaptation_speed: number;
  allow_persona_shift: boolean;
}

// ============================================
// WORKING CONTRACT TYPES
// ============================================

export interface WorkingContract {
  mission: string;
  milestones: ContractMilestone[];
  decision_protocol: DecisionProtocol;
  feedback_protocol: FeedbackProtocol;
  learning_protocol: LearningProtocol;
  practice_protocol: PracticeProtocol;
  safety_boundaries: string;
  persona_overlays: PersonaWeights;
  mirror_mode: MirrorModeSettings;
  review_cadence: 'weekly' | 'biweekly' | 'monthly';
  agreement: boolean;
  createdAt: number;
}

export interface ContractMilestone {
  goal: string;
  metric: string;
  deadline: string;
}

export interface DecisionProtocol {
  low: string;
  medium: string;
  high: string;
}

export interface FeedbackProtocol {
  cadence: string;
  focus: string;
  challenge_level: number;
  repair_script: string;
}

export interface LearningProtocol {
  order: string;
  info_dose_words: number;
  cfu_interval_sentences: number;
}

export interface PracticeProtocol {
  skill: string;
  drill: string;
  evidence_of_improvement: string;
  sunset_rule: string;
}

// ============================================
// COGNITIVE PROFILE OUTPUT
// ============================================

export interface CognitiveProfileOutput {
  profile_id: string;
  user_id: string;
  thinking_style: 'action_oriented' | 'analytical' | 'collaborative' | 'intuitive';
  communication_preference: 'concise' | 'detailed' | 'adaptive';
  organization_pattern: 'structured' | 'organic' | 'minimal';
  feedback_style: 'challenge' | 'support' | 'perspective' | 'follow';
  active_context: string;
  persona_overlays: PersonaWeights;
  mirror_mode: MirrorModeSettings;
  meta_observations: string[];
  confidence_score: number;
  working_contract: WorkingContract;
  createdAt: number;
}

// ============================================
// UI COMPONENT PROPS
// ============================================

export interface OnboardingFlowProps {
  onComplete: (profile: CognitiveProfileOutput) => void;
  onCancel?: () => void;
}

export interface QuestionRendererProps {
  question: UserQuestion | LongStriderQuestion;
  value: any;
  onChange: (value: any) => void;
  onSubmit: () => void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  progress: number;
  isProcessing?: boolean;
}

export interface MutualReflectionProps {
  userSummary: MutualReflectionResults['userSummary'];
  onUserQuestion: (question: string) => void;
  onAgreementReached: () => void;
  questionsExchange: QuestionExchange[];
}

export interface ContractReviewProps {
  contract: WorkingContract;
  onAccept: () => void;
  onEdit: (updates: Partial<WorkingContract>) => void;
}

// ============================================
// NEURAL SPECTRUM INTEGRATION
// ============================================

export type NeuralBand = 
  | 'delta' | 'theta-low' | 'theta-high' | 'alpha-low' | 'alpha-high'
  | 'beta-low' | 'beta-mid' | 'beta-high' | 'gamma-low' | 'gamma-high'
  | 'infra' | 'ultrafast' | 'phi' | 'psi' | 'chi' | 'omega' | 'sigma' | 'xi';

export interface CognitiveState {
  primaryBand: NeuralBand;
  secondaryBand?: NeuralBand;
  intensity: number; // 0-10
  metaState?: 'hypnagogic_drift' | 'lucid_flow' | 'cognitive_stress' | 'deep_work' | 'insight_cascade' | 'system_thinking' | 'initial_connection';
}
