-- ========================================================
-- APPLY THIS FIX IN YOUR SUPABASE DASHBOARD SQL EDITOR
-- This fixes the "malformed array literal" error
-- ========================================================

-- Step 1: Drop the existing broken function
DROP FUNCTION IF EXISTS public.get_cortex(text, text);

-- Step 2: Create the fixed version
CREATE OR REPLACE FUNCTION public.get_cortex(p_user_id text, p_resolution text DEFAULT 'nano'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result jsonb;
  instructions_array jsonb;
  v_array double precision[];
  v_value jsonb;
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

  -- Get the v value from cortex_vector_state
  SELECT v INTO v_value
  FROM cortex_vector_state
  WHERE user_id::text = p_user_id
    AND (resolution = p_resolution OR p_resolution IS NULL)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Convert v to array based on its type
  IF v_value IS NOT NULL THEN
    -- Check if it's already a JSONB array
    IF jsonb_typeof(v_value) = 'array' THEN
      -- Extract values from JSONB array
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(v_value)::double precision
      ) INTO v_array;
    ELSE
      -- Try to parse as text representation
      BEGIN
        -- Remove brackets and whitespace, split by comma
        SELECT string_to_array(
          regexp_replace(
            regexp_replace(
              regexp_replace(v_value::text, '^\[|\]$|"', '', 'g'),
              '\s+', '', 'g'
            ),
            '\\', '', 'g'
          ),
          ','
        )::double precision[] INTO v_array;
      EXCEPTION WHEN OTHERS THEN
        -- If parsing fails, use default
        v_array := ARRAY[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]::double precision[];
      END;
    END IF;
  ELSE
    -- Default array if no value found
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

-- Step 3: Test the function (replace with your actual user_id)
-- SELECT get_cortex('your-user-id-here', 'nano');

-- ========================================================
-- SUCCESS! Your getCortex function is now fixed.
-- The array formatting error should be resolved.
-- ========================================================
