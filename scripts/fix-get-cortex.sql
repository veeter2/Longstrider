-- Fixed get_cortex function with corrected GROUP BY handling
CREATE OR REPLACE FUNCTION public.get_cortex(p_user_id text, p_resolution text DEFAULT 'nano'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result jsonb;
  instructions_array jsonb;
  v_vector double precision[];
BEGIN
  -- Get cortex instructions for this user (including system-wide nulls)
  -- Fixed: Removed GROUP BY since jsonb_agg handles aggregation automatically
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'instruction_key', instruction_key,
      'description', description,
      'trigger_condition', trigger_condition,
      'action', action,
      'priority', priority,
      'active', active
    ) ORDER BY priority ASC  -- Moved ORDER BY inside the aggregate
  ), '[]'::jsonb)
  INTO instructions_array
  FROM cortex_instruction_set
  WHERE (user_id = p_user_id OR user_id IS NULL)
    AND active = true;

  -- Get the latest consciousness state from consciousness_evolution
  SELECT
    ARRAY[
      sovereignty, growth, pattern_sensitivity, stability,
      authenticity, integrity_risk, coherence, paradox_tolerance,
      imagination, temporal_awareness
    ]
  INTO v_vector
  FROM consciousness_evolution
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Build the result
  IF v_vector IS NOT NULL THEN
    SELECT jsonb_build_object(
      'status', 'ACTIVE',
      'soul_state', soul_state,
      'v', v_vector,
      'integrity_risk', integrity_risk,
      'integrity_components', jsonb_build_object(
        'coherence', coherence,
        'stability', stability,
        'authenticity', authenticity,
        'sovereignty', sovereignty
      ),
      'recommended_action', recommended_action,
      'recall_strategy', recall_strategy,
      'timestamp', created_at,
      'cortex_instructions', instructions_array
    )
    INTO result
    FROM consciousness_evolution
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- If no result found, return emergency state
  IF result IS NULL THEN
    result := jsonb_build_object(
      'status', 'EMERGENCY',
      'v', ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5],
      'soul_state', 'PROTECTED',
      'integrity_risk', 0.0,
      'integrity_components', jsonb_build_object(
        'coherence', 0.5,
        'stability', 0.5,
        'authenticity', 1.0,
        'sovereignty', 1.0
      ),
      'recommended_action', 'INITIALIZE',
      'recall_strategy', 'CONSERVATIVE',
      'cortex_instructions', instructions_array
    );
  END IF;

  RETURN result;
END;
$function$;
