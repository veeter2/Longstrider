-- Option 1: Delete old cortex_vector_state entries (DESTRUCTIVE - removes history)
-- Uncomment to use:
-- DELETE FROM cortex_vector_state WHERE created_at < '2025-10-21';

-- Option 2: Update old entries to use proper JSONB format (SAFER)
-- This converts text arrays to JSONB arrays
UPDATE cortex_vector_state
SET v = 
  CASE 
    WHEN v::text LIKE '[%]' THEN 
      -- Convert text array to JSONB array
      to_jsonb(string_to_array(
        regexp_replace(
          regexp_replace(v::text, '^\[|\]$', '', 'g'),
          '\s+', '', 'g'
        ),
        ','
      )::double precision[])
    ELSE 
      v  -- Keep as is if already in correct format
  END
WHERE v IS NOT NULL 
  AND jsonb_typeof(v) != 'array';  -- Only update non-array entries

-- Option 3: Set all old entries to default vector (SAFEST)
-- UPDATE cortex_vector_state
-- SET v = '[1.0, 0.0, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.3, 0.5]'::jsonb
-- WHERE created_at < '2025-10-21' OR jsonb_typeof(v) != 'array';

-- Verify the fix worked
SELECT 
  user_id,
  created_at,
  jsonb_typeof(v) as v_type,
  v::text as v_value
FROM cortex_vector_state
ORDER BY created_at DESC
LIMIT 5;
