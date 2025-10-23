-- CORRECTED get_cortex function that queries the ACTUAL database schema
-- This function queries cortex_vector_state (not consciousness_evolution)
CREATE OR REPLACE FUNCTION public.get_cortex(p_user_id text, p_resolution text DEFAULT 'nano'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result jsonb;
  instructions_array jsonb;
BEGIN
  -- Get cortex instructions for this user (including system-wide nulls)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'instruction_key', instruction_key,
      'description', description,
      'trigger_condition', trigger_condition,
      'action', action,
      'priority', priority,
      'active', active
    ) ORDER BY priority ASC
  ), '[]'::jsonb)
  INTO instructions_array
  FROM cortex_instruction_set
  WHERE (user_id = p_user_id OR user_id IS NULL)
    AND active = true;

  -- Get the latest cortex vector state from cortex_vector_state table
  -- Note: user_id is UUID in cortex_vector_state, so we need to cast
  SELECT jsonb_build_object(
    'status', 'ACTIVE',
    'soul_state', COALESCE(soul_state, '{}'::jsonb),
    'v', COALESCE(v::text::double precision[], ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]),
    'integrity_risk', COALESCE(integrity_risk, 0.0),
    'integrity_components', COALESCE(integrity_components, jsonb_build_object(
      'coherence', 0.5,
      'stability', 0.5,
      'authenticity', 1.0,
      'sovereignty', 1.0
    )),
    'recommended_action', COALESCE(recommended_action, 'INITIALIZE'),
    'recall_strategy', COALESCE(recall_strategy, '"CONSERVATIVE"'::jsonb),
    'timestamp', created_at,
    'cortex_instructions', instructions_array
  )
  INTO result
  FROM cortex_vector_state
  WHERE user_id::text = p_user_id
    AND (resolution = p_resolution OR p_resolution IS NULL)
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no result found, return emergency state
  IF result IS NULL THEN
    result := jsonb_build_object(
      'status', 'EMERGENCY',
      'v', ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5],
      'soul_state', jsonb_build_object('state', 'PROTECTED'),
      'integrity_risk', 0.0,
      'integrity_components', jsonb_build_object(
        'coherence', 0.5,
        'stability', 0.5,
        'authenticity', 1.0,
        'sovereignty', 1.0
      ),
      'recommended_action', 'INITIALIZE',
      'recall_strategy', '"CONSERVATIVE"'::jsonb,
      'cortex_instructions', instructions_array
    );
  END IF;

  RETURN result;
END;
$function$;
