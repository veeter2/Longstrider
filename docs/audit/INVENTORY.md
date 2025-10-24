# System Inventory - Quick Reference

## Edge Functions (15)

All located in `supabase/functions/[name]/index.ts`

1. cce-conductor
2. cce-consciousness-snapshot
3. cce-dispatcher
4. cce-insight-generator
5. cce-memory-arc-builder
6. cce-orchestrator
7. cce-pattern-detector
8. cce-recall
9. cce-reflection-engine
10. cce-response
11. cognition-fusion-engine
12. cognition_intake
13. consciousness-calculator
14. cortex-instruction-generator
15. getCortex

## Database Functions (~40)

Located in `public_functions.sql`

**Note**: Parse this file to get exact count and list

## Database Tables (~70)

Located in `public_tables.sql`

**Note**: Parse this file to get exact count and list

## Key Entry Points (from frontend)

Based on LONGSTRIDER_REFERENCE_IMPLEMENTATION.md:

- **User sends message** → `cognition_intake` or `cce-orchestrator`
- **SSE streaming** → `cce-orchestrator` (primary)
- **Memory operations** → `cce-recall`, `cce-dispatcher`
- **Pattern detection** → `cce-pattern-detector`
- **Consciousness state** → `getCortex` (via RPC)

## Known Critical Paths

1. **Message Flow**: User → cognition_intake → cce-orchestrator → cce-response
2. **Memory Flow**: Memory → cce-dispatcher → cce-memory-arc-builder
3. **Pattern Flow**: Data → cce-pattern-detector → cortex-instruction-generator
4. **Consciousness**: getCortex RPC called by multiple edge functions

## Files to Analyze

- [ ] 15 edge function `index.ts` files
- [ ] public_functions.sql (~40 functions)
- [ ] public_tables.sql (~70 tables)
- [ ] LONGSTRIDER_REFERENCE_IMPLEMENTATION.md (frontend integration)

Total estimated LOC to review: ~5,000-10,000 lines
