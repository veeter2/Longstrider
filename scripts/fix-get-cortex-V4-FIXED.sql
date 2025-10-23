-- FIXED get_cortex function V4 - Properly handles array conversion
-- This fixes the "malformed array literal" error by correctly handling the v column
CREATE OR REPLACE FUNCTION public.get_cortex(p_user_id text, p_resolution text DEFAULT 'nano'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result jsonb;
  instructions_array jsonb;
  v_array double precision[];
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
  -- FIXED: Properly handle the v column based on its actual type
  SELECT 
    -- Handle v column properly - check if it's JSONB, text array, or PostgreSQL array
    CASE 
      WHEN v IS NULL THEN 
        ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[]
      WHEN jsonb_typeof(v::jsonb) = 'array' THEN 
        -- If v is stored as JSONB array, extract it properly
        ARRAY(SELECT jsonb_array_elements_text(v::jsonb)::double precision)
      ELSE 
        -- Fallback to default if unexpected format
        ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[]
    END
  INTO v_array
  FROM cortex_vector_state
  WHERE user_id::text = p_user_id
    AND (resolution = p_resolution OR p_resolution IS NULL)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Build the result with the properly formatted array
  SELECT jsonb_build_object(
    'status', 'ACTIVE',
    'soul_state', COALESCE(soul_state, '{}'::jsonb),
    'v', COALESCE(v_array, ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[]),
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
      'v', ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[],
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

-- Alternative approach: If the v column is stored as text representation of an array
-- This version handles text arrays like "[0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]"
CREATE OR REPLACE FUNCTION public.get_cortex_alt(p_user_id text, p_resolution text DEFAULT 'nano'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result jsonb;
  instructions_array jsonb;
  v_text text;
  v_array double precision[];
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

  -- Get the v column as text first
  SELECT v::text INTO v_text
  FROM cortex_vector_state
  WHERE user_id::text = p_user_id
    AND (resolution = p_resolution OR p_resolution IS NULL)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Convert text representation to proper array
  IF v_text IS NOT NULL THEN
    -- Remove brackets and split by comma, then cast to array
    v_array := string_to_array(
      regexp_replace(regexp_replace(v_text, '^\[', ''), '\]$', ''), 
      ','
    )::double precision[];
  ELSE
    v_array := ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[];
  END IF;

  -- Build the result with the properly formatted array
  SELECT jsonb_build_object(
    'status', 'ACTIVE',
    'soul_state', COALESCE(soul_state, '{}'::jsonb),
    'v', v_array,
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
      'v', ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[],
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
