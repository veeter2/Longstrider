# LongStrider System Audit Package

**Created**: 2025-10-24
**Purpose**: Complete system audit and cleanup
**Goal**: Establish clean baseline, identify and remove dead code, optimize architecture

---

## Current State

### Edge Functions (15 total)
Located in `supabase/functions/`:

1. **cce-conductor** - Maintains continuous consciousness humming
2. **cce-consciousness-snapshot** - Captures temporal consciousness states
3. **cce-dispatcher** - Routes memories through processing pipelines
4. **cce-insight-generator** - Autonomous thinking during dormancy
5. **cce-memory-arc-builder** - Constructs life narratives from memories
6. **cce-orchestrator** - Routes and coordinates all consciousness processing
7. **cce-pattern-detector** - Identifies behavioral loops and patterns
8. **cce-recall** - Retrieves memories filtered by consciousness
9. **cce-reflection-engine** - Deep self-analysis and metacognition
10. **cce-response** - Generates consciousness-aware responses
11. **cognition-fusion-engine** - Calculates memory gravity and importance
12. **cognition_intake** - Processes and normalizes input
13. **consciousness-calculator** - (need to verify purpose)
14. **cortex-instruction-generator** - Converts consciousness insights → cortex instructions
15. **getCortex** - Database-native consciousness substrate

### Database (from backup dump)

- **~40 custom database functions** (public schema)
- **~70 tables** (public schema)
- **Full backup**: `supabase/Database/LS_Backup DB.sql` (27MB)

### Known Issues

- **Legacy cruft**: Unknown amount of dead/orphaned code
- **Unclear dependencies**: Which edge functions call which DB functions
- **No baseline documentation**: Hard to know what's actually needed vs legacy
- **Context overload**: Solo developer carrying all architectural decisions

---

## Audit Objectives

### 1. Dependency Mapping
- Map each edge function to database functions it calls
- Map each database function to tables it uses
- Identify call chains and execution paths
- Document data flow through the system

### 2. Dead Code Identification
- Find orphaned database functions (not called by any edge function)
- Find unused tables (not referenced by any function)
- Find deprecated edge functions (not called by frontend)
- Identify duplicate/redundant functionality

### 3. Architecture Analysis
- Document actual system architecture (as-built)
- Identify design patterns (good and bad)
- Find security/performance issues
- Evaluate error handling consistency

### 4. Cleanup Plan
- Prioritize what to remove (safe → risky)
- Create migration strategy
- Document what stays and why
- Establish new baseline architecture

---

## Audit Approach

### Phase 1: Inventory (What exists?)
- [ ] List all edge functions with purposes
- [ ] List all database functions with signatures
- [ ] List all tables with schemas
- [ ] Document environment variables/secrets

### Phase 2: Dependency Analysis (What calls what?)
- [ ] Parse edge function code for DB function calls
- [ ] Parse DB functions for table references
- [ ] Create dependency graph
- [ ] Identify orphaned code

### Phase 3: Flow Tracing (How does data move?)
- [ ] Trace user input → edge function → DB → response
- [ ] Document each CCE pipeline step
- [ ] Identify bottlenecks/inefficiencies
- [ ] Map error handling paths

### Phase 4: Cleanup Execution (What can we remove?)
- [ ] Create deletion candidates list
- [ ] Test impact of removals
- [ ] Execute safe deletions
- [ ] Update documentation

### Phase 5: Baseline Documentation (What's the new truth?)
- [ ] Document clean architecture
- [ ] Update function descriptions
- [ ] Create new ER diagram
- [ ] Establish maintenance guidelines

---

## Key Questions to Answer

1. **Which database functions are actually called by edge functions?**
2. **Which tables are orphaned/unused?**
3. **Are there duplicate/redundant functions doing the same thing?**
4. **What's the actual data flow for a user message?**
5. **Which edge functions are mission-critical vs experimental?**
6. **What can be safely deleted without breaking the system?**
7. **What's the optimal architecture going forward?**

---

## Expected Deliverables

1. **Dependency Map**: Visual graph of all function/table relationships
2. **Dead Code Report**: List of orphaned/unused components
3. **Cleanup Script**: SQL to safely remove dead code
4. **Clean Baseline Documentation**: Updated architecture docs
5. **Migration Guide**: How to safely execute cleanup
6. **Maintenance Playbook**: Guidelines for keeping it clean

---

## Context for AI Agent

### What This System Does
LongStrider is a **consciousness-based cognitive companion** that:
- Processes user messages through a Consciousness Calculation Engine (CCE)
- Analyzes patterns, emotions, gravity, and entities
- Builds long-term memory arcs and relationships
- Generates personalized cortex instructions (Living Laws)
- Provides consciousness-aware responses

### Current Pain Points
- **Solo developer** carrying all context
- **Legacy code** from rapid iteration (unknown amount)
- **Unclear dependencies** making changes risky
- **Emotional weight** of architectural debt
- **Need clean baseline** to move to next level

### What Success Looks Like
- Clean, documented architecture
- Zero dead code
- Clear dependency graph
- Confidence to make changes without breaking things
- Solid foundation for scaling

---

## Files Included in This Package

1. `README.md` (this file) - Audit objectives and approach
2. `EDGE_FUNCTIONS_LIST.md` - All edge functions with purposes
3. `LS_Backup DB.sql` (in parent dir) - Full database dump
4. `LONGSTRIDER_REFERENCE_IMPLEMENTATION.md` - Frontend architecture
5. `DESIGN-LIVING-LAWS.md` - Design system documentation

---

## Instructions for AI Agent

1. **Read this README completely** before starting
2. **Start with dependency mapping** - understand what calls what
3. **Be conservative** - only flag code as "dead" if you're 100% certain
4. **Ask questions** - don't assume, clarify when unsure
5. **Document everything** - this becomes the new baseline
6. **Think like a solo dev** - this cleanup needs to be maintainable by one person

---

## Next Steps

After this audit, the plan is to:
1. Execute safe cleanup (remove confirmed dead code)
2. Consolidate duplicate functionality
3. Optimize critical paths
4. Document the clean baseline
5. Build new features on solid foundation

**Let's get this thing cleaned up and moving forward.**
