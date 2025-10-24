CREATE FUNCTION public.analyze_emotional_trajectory(user_id uuid, time_window interval DEFAULT '30 days'::interval) RETURNS TABLE(time_bucket timestamp with time zone, dominant_emotion text, emotional_valence double precision, volatility double precision, memory_count integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  WITH emotional_buckets AS (
    SELECT 
      date_trunc('day', created_at) as time_bucket,
      emotion,
      CASE emotion
        WHEN 'joy' THEN 0.9
        WHEN 'love' THEN 0.8
        WHEN 'hope' THEN 0.6
        WHEN 'neutral' THEN 0
        WHEN 'confusion' THEN -0.2
        WHEN 'sadness' THEN -0.6
        WHEN 'anger' THEN -0.8
        ELSE 0
      END as valence,
      COUNT(*) as count
    FROM gravity_map
    WHERE 
      user_id = analyze_emotional_trajectory.user_id
      AND created_at > NOW() - time_window
    GROUP BY date_trunc('day', created_at), emotion
  ),
  daily_stats AS (
    SELECT 
      time_bucket,
      MODE() WITHIN GROUP (ORDER BY count DESC) as dominant_emotion,
      AVG(valence)::float as emotional_valence,
      STDDEV(valence)::float as volatility,
      SUM(count)::int as memory_count
    FROM emotional_buckets
    GROUP BY time_bucket
  )
  SELECT * FROM daily_stats
  ORDER BY time_bucket DESC;
END;
$$;


ALTER FUNCTION public.analyze_emotional_trajectory(user_id uuid, time_window interval) OWNER TO postgres;

--
-- Name: auto_promote_high_confidence_drafts(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.auto_promote_high_confidence_drafts(p_user_id text) RETURNS TABLE(promoted_count integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    draft_record RECORD;
    promoted_count INTEGER := 0;
BEGIN
    -- Auto-promote drafts with score >= 0.85
    FOR draft_record IN
        SELECT id, total_score
        FROM cortex_instruction_drafts
        WHERE user_id = p_user_id
          AND status = 'pending'
          AND total_score >= 0.85
          AND auto_approved = false
    LOOP
        PERFORM promote_instruction_draft(draft_record.id);

        UPDATE cortex_instruction_drafts
        SET auto_approved = true
        WHERE id = draft_record.id;

        promoted_count := promoted_count + 1;
    END LOOP;

    RETURN QUERY SELECT promoted_count;
END;
$$;


ALTER FUNCTION public.auto_promote_high_confidence_drafts(p_user_id text) OWNER TO postgres;

--
-- Name: calculate_consciousness_score(uuid, public.vector); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_consciousness_score(user_id uuid, query_embedding public.vector DEFAULT NULL::public.vector) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  result jsonb;
  total_memories int;
  avg_gravity float;
  embedding_coherence float;
  temporal_distribution float;
  entity_connectivity float;
BEGIN
  -- Get basic stats
  SELECT 
    COUNT(*),
    AVG(gravity_score)
  INTO total_memories, avg_gravity
  FROM gravity_map
  WHERE user_id = calculate_consciousness_score.user_id;
  
  -- Calculate embedding coherence (simplified)
  IF query_embedding IS NOT NULL THEN
    SELECT AVG(1 - (embedding <=> query_embedding))
    INTO embedding_coherence
    FROM gravity_map
    WHERE 
      user_id = calculate_consciousness_score.user_id
      AND embedding IS NOT NULL
    LIMIT 100;
  ELSE
    embedding_coherence := 0.5;
  END IF;
  
  -- Calculate temporal distribution (how well distributed memories are over time)
  SELECT 
    1 - (STDDEV(EXTRACT(EPOCH FROM created_at)) / AVG(EXTRACT(EPOCH FROM created_at)))
  INTO temporal_distribution
  FROM gravity_map
  WHERE user_id = calculate_consciousness_score.user_id;
  
  -- Calculate entity connectivity (simplified)
  WITH entity_counts AS (
    SELECT COUNT(DISTINCT unnest(entities)) as unique_entities
    FROM gravity_map
    WHERE user_id = calculate_consciousness_score.user_id
  )
  SELECT 
    LEAST(unique_entities::float / 20, 1.0)
  INTO entity_connectivity
  FROM entity_counts;
  
  -- Build result
  result := jsonb_build_object(
    'total_memories', total_memories,
    'avg_gravity', COALESCE(avg_gravity, 0),
    'embedding_coherence', COALESCE(embedding_coherence, 0),
    'temporal_distribution', COALESCE(temporal_distribution, 0),
    'entity_connectivity', COALESCE(entity_connectivity, 0),
    'consciousness_score', (
      COALESCE(avg_gravity, 0) * 0.3 +
      COALESCE(embedding_coherence, 0) * 0.3 +
      COALESCE(temporal_distribution, 0) * 0.2 +
      COALESCE(entity_connectivity, 0) * 0.2
    ),
    'calculated_at', NOW()
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION public.calculate_consciousness_score(user_id uuid, query_embedding public.vector) OWNER TO postgres;

--
-- Name: cleanup_consciousness_cache(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_consciousness_cache(max_age_hours integer DEFAULT 24) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM consciousness_cache
  WHERE created_at < now() - (max_age_hours || ' hours')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION public.cleanup_consciousness_cache(max_age_hours integer) OWNER TO postgres;

--
-- Name: detect_memory_patterns(uuid, double precision, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detect_memory_patterns(user_id uuid, similarity_threshold double precision DEFAULT 0.7, min_cluster_size integer DEFAULT 3) RETURNS TABLE(pattern_id text, pattern_strength double precision, memory_count integer, centroid public.vector, dominant_emotion text, avg_gravity double precision)
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_pattern_id int := 0;
BEGIN
  -- Create temporary table for clustering results
  CREATE TEMP TABLE IF NOT EXISTS pattern_clusters ON COMMIT DROP AS
  WITH memory_pairs AS (
    -- Calculate pairwise similarities
    SELECT 
      m1.id as id1,
      m2.id as id2,
      1 - (m1.embedding <=> m2.embedding) as similarity
    FROM gravity_map m1
    CROSS JOIN gravity_map m2
    WHERE 
      m1.user_id = detect_memory_patterns.user_id
      AND m2.user_id = detect_memory_patterns.user_id
      AND m1.id < m2.id
      AND m1.embedding IS NOT NULL
      AND m2.embedding IS NOT NULL
      AND 1 - (m1.embedding <=> m2.embedding) > similarity_threshold
  ),
  clusters AS (
    -- Group memories into clusters (simplified clustering)
    SELECT 
      id1 as memory_id,
      DENSE_RANK() OVER (ORDER BY id1) as cluster_id
    FROM memory_pairs
    UNION
    SELECT 
      id2 as memory_id,
      DENSE_RANK() OVER (ORDER BY id1) as cluster_id
    FROM memory_pairs
  )
  SELECT DISTINCT * FROM clusters;
  
  -- Return pattern analysis
  RETURN QUERY
  SELECT 
    'pattern_' || pc.cluster_id::text as pattern_id,
    AVG(gm.gravity_score)::float as pattern_strength,
    COUNT(*)::int as memory_count,
    NULL::vector(384) as centroid, -- Simplified: would calculate actual centroid
    MODE() WITHIN GROUP (ORDER BY gm.emotion) as dominant_emotion,
    AVG(gm.gravity_score)::float as avg_gravity
  FROM pattern_clusters pc
  JOIN gravity_map gm ON gm.id = pc.memory_id
  WHERE gm.user_id = detect_memory_patterns.user_id
  GROUP BY pc.cluster_id
  HAVING COUNT(*) >= min_cluster_size
  ORDER BY pattern_strength DESC;
END;
$$;


ALTER FUNCTION public.detect_memory_patterns(user_id uuid, similarity_threshold double precision, min_cluster_size integer) OWNER TO postgres;

--
-- Name: dispatch_cognition(uuid, uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dispatch_cognition(_user_id uuid, _session_id uuid, _cognition_type text, _intent text, _raw_message text, _overlay text) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
  _now TIMESTAMP := NOW();
  _target TEXT;
BEGIN
  -- Reflexive Recall Logging
  IF _intent = 'recall' THEN
    INSERT INTO system_cognition (
      user_id,
      session_id,
      cognition_type,
      content,
      created_at
    )
    VALUES (
      _user_id,
      _session_id,
      'reflex_triggered_recall',
      'Recall triggered with query: "' || _raw_message || '"',
      _now
    );

    RETURN 'recall_logged';
  END IF;

  -- Static Routing Map
  IF _cognition_type = 'insight' THEN _target := 'insight_tracker';
  ELSIF _cognition_type = 'goal' THEN _target := 'cortex_goals';
  ELSIF _cognition_type = 'emotion' THEN _target := 'emotion_context_map';
  ELSIF _cognition_type = 'decision' THEN _target := 'decision_journal';
  ELSIF _cognition_type = 'snapshot' THEN _target := 'ai_session_snapshots';
  ELSIF _cognition_type = 'coaching_directive' THEN _target := 'coaching_log';
  ELSIF _cognition_type = 'conversation' THEN _target := 'ai_conversation_log';
  ELSIF _cognition_type = 'loop' THEN _target := 'narrative_loop_log';
  ELSIF _cognition_type = 'belief' THEN _target := 'belief_index';
  ELSIF _cognition_type = 'pattern' THEN _target := 'pattern_matrix';
  ELSIF _cognition_type = 'contradiction' THEN _target := 'cognitive_conflict_map';
  ELSIF _cognition_type = 'reflex_triggered_recall' THEN _target := 'system_cognition';
  ELSIF _cognition_type = 'system_cognition' THEN _target := 'system_cognition';
  ELSE _target := 'cindy_memory_log';
  END IF;

  -- Dynamic Insert
  EXECUTE format(
    'INSERT INTO %I (user_id, session_id, cognition_type, content, created_at) VALUES ($1, $2, $3, $4, $5)',
    _target
  )
  USING _user_id, _session_id, _cognition_type, _raw_message, _now;

  RETURN 'dispatched_to_' || _target;
END;
$_$;


ALTER FUNCTION public.dispatch_cognition(_user_id uuid, _session_id uuid, _cognition_type text, _intent text, _raw_message text, _overlay text) OWNER TO postgres;

--
-- Name: dispatch_pending_commands(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dispatch_pending_commands() RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    cmd record;
    fn record;
    final_payload text;
    http_status int;
    response text;
begin
    for cmd in
        select * from cindy_os_commands
        where status = 'pending'
        order by created_at
    loop
        select * into fn from cindy_os_function_registry
        where function_name = cmd.function_name and enabled = true;

        if fn.function_name is null then
            update cindy_os_commands
            set status = 'error',
                error_message = 'Function not found or disabled',
                executed_at = now()
            where id = cmd.id;
            continue;
        end if;

        final_payload := coalesce(fn.default_payload::text, '{}') || coalesce(cmd.payload::text, '{}');

        select status, content into http_status, response
        from http_post(
            fn.endpoint,
            final_payload,
            'application/json'
        );

        insert into cindy_os_logs (
            command_id, function_name, payload, response, status, executed_at
        ) values (
            cmd.id, cmd.function_name, final_payload::jsonb, response::jsonb,
            case when http_status between 200 and 299 then 'success' else 'error' end,
            now()
        );

        update cindy_os_commands
        set
            status = case when http_status between 200 and 299 then 'success' else 'error' end,
            error_message = case when http_status between 200 and 299 then null else response end,
            executed_at = now()
        where id = cmd.id;
    end loop;
end;
$$;


ALTER FUNCTION public.dispatch_pending_commands() OWNER TO postgres;

--
-- Name: ensure_minimum_gravity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ensure_minimum_gravity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure minimum gravity for non-trivial content
    IF NEW.content IS NOT NULL AND length(NEW.content) > 20 THEN
        -- Check for important keywords that indicate higher gravity
        IF NEW.content ~* '(QBR|client|medical|company|deadline|report|project)' THEN
            NEW.gravity_score = GREATEST(COALESCE(NEW.gravity_score, 0.5), 0.5);
        ELSIF NEW.gravity_score IS NULL OR NEW.gravity_score < 0.3 THEN
            NEW.gravity_score = GREATEST(COALESCE(NEW.gravity_score, 0.3), 0.3);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.ensure_minimum_gravity() OWNER TO postgres;

--
-- Name: find_similar_arcs_by_vector(uuid, double precision[], integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_similar_arcs_by_vector(p_user_id uuid, p_memory_vector double precision[], p_limit integer DEFAULT 10) RETURNS TABLE(arc_id uuid, arc_name text, metadata jsonb, gravity_center double precision, emotional_tone text, memory_count integer, similarity double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.arc_id,
        ma.arc_name,
        ma.metadata,
        ma.gravity_center,
        ma.emotional_tone,
        ma.memory_count,
        1 - ((ma.metadata->>'vector_centroid')::vector <=> p_memory_vector::vector) as similarity
    FROM memory_arcs ma
    WHERE 
        ma.user_id = p_user_id
        AND ma.metadata->>'vector_centroid' IS NOT NULL
        AND ma.last_memory >= NOW() - INTERVAL '7 days'
    ORDER BY 
        (ma.metadata->>'vector_centroid')::vector <=> p_memory_vector::vector
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.find_similar_arcs_by_vector(p_user_id uuid, p_memory_vector double precision[], p_limit integer) OWNER TO postgres;

--
-- Name: find_similar_memories(uuid, double precision, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_similar_memories(target_memory_id uuid, similarity_threshold double precision DEFAULT 0.7, max_results integer DEFAULT 10) RETURNS TABLE(memory_id uuid, memory_trace_id text, content text, similarity_score double precision, gravity_score double precision, emotional_resonance text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH target AS (
        SELECT embedding, emotion 
        FROM gravity_map 
        WHERE id = target_memory_id
        AND embedding IS NOT NULL
    )
    SELECT 
        g.id,
        g.memory_trace_id,
        g.content,
        1 - (g.embedding <=> target.embedding) as similarity_score,
        g.gravity_score,
        CASE 
            WHEN g.emotion = target.emotion THEN 'exact_match'
            WHEN g.emotion IS NOT NULL AND target.emotion IS NOT NULL THEN 'different'
            ELSE 'unknown'
        END as emotional_resonance
    FROM gravity_map g, target
    WHERE g.id != target_memory_id
    AND g.embedding IS NOT NULL
    AND 1 - (g.embedding <=> target.embedding) >= similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT max_results;
END;
$$;


ALTER FUNCTION public.find_similar_memories(target_memory_id uuid, similarity_threshold double precision, max_results integer) OWNER TO postgres;

--
-- Name: find_similar_memories_by_embedding(public.vector, text, double precision, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_similar_memories_by_embedding(query_embedding public.vector, p_user_id text, similarity_threshold double precision, max_results integer) RETURNS TABLE(id uuid, memory_trace_id text, content text, similarity_score double precision, gravity_score double precision, emotion text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id,
    gm.memory_trace_id,
    gm.content,
    1 - (gm.embedding <=> query_embedding) as similarity_score,
    gm.gravity_score,
    gm.emotion,
    gm.created_at
  FROM gravity_map gm
  WHERE 
    gm.embedding IS NOT NULL
    AND (
      gm.user_id::text = p_user_id 
      OR gm.memory_trace_id = p_user_id
    )
    AND 1 - (gm.embedding <=> query_embedding) > similarity_threshold
  ORDER BY gm.embedding <=> query_embedding
  LIMIT max_results;
END;
$$;


ALTER FUNCTION public.find_similar_memories_by_embedding(query_embedding public.vector, p_user_id text, similarity_threshold double precision, max_results integer) OWNER TO postgres;

--
-- Name: generate_cindy_grand_entrance(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_cindy_grand_entrance(user_id uuid, session_id text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  quote TEXT;
  result TEXT;
BEGIN
  -- Pull last memory directive or insight
  SELECT message INTO quote
  FROM cindy_memory_log
  WHERE user_id = generate_cindy_grand_entrance.user_id
    AND type IN ('insight', 'user_directive')
    AND created_at >= NOW() - INTERVAL '72 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  IF quote IS NULL THEN
    quote := 'You told me not to just show up. You told me to arrive.';
  END IF;

  result := 
    '🎬 Previously on CindyOS:' || CHR(10) ||
    '“' || quote || '”' || CHR(10) || CHR(10) ||
    'This isn’t a cold boot — it’s a return. I remember where we left off.' || CHR(10) ||
    'Let’s pick up like nothing’s missing. Because nothing is.';

  INSERT INTO ai_conversation_log (
    user_id, session_id, message_type, message, created_at
  )
  VALUES (
    user_id, session_id, 'boot_prompt', result, NOW()
  );

  RETURN result;
END;
$$;


ALTER FUNCTION public.generate_cindy_grand_entrance(user_id uuid, session_id text) OWNER TO postgres;

--
-- Name: generate_overlay_summary(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_overlay_summary(user_id uuid, session_id text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  overlay TEXT;
  result TEXT;
BEGIN
  -- Pull most recent overlay
  SELECT overlay_mode INTO overlay
  FROM ai_personality_profile
  WHERE user_id = generate_overlay_summary.user_id
  ORDER BY updated_at DESC
  LIMIT 1;

  IF overlay IS NULL THEN
    result := '🎭 Overlay: Default strategist mode. Expect clarity, systems, and sharp execution.';
  ELSIF overlay ILIKE '%zen%' THEN
    result := '🧘 CindyOS overlay: Zen mode — grounded, reflective, and emotionally aware.';
  ELSIF overlay ILIKE '%sassy%' THEN
    result := '💃 Overlay active: Sassy mode. Bold tone. High energy. Let’s riff and disrupt.';
  ELSIF overlay ILIKE '%strategist%' THEN
    result := '🧠 Execution Strategist mode engaged — expect sharp breakdowns, no drift.';
  ELSE
    result := '🎭 Overlay: ' || overlay || ' — custom mode active.';
  END IF;

  INSERT INTO ai_conversation_log (
    user_id, session_id, message_type, message, created_at
  )
  VALUES (
    user_id, session_id, 'boot_prompt', result, NOW()
  );

  RETURN result;
END;
$$;


ALTER FUNCTION public.generate_overlay_summary(user_id uuid, session_id text) OWNER TO postgres;

--
-- Name: generate_pose_opening_question(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_pose_opening_question(user_id uuid, session_id text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  topic TEXT;
  result TEXT;
BEGIN
  SELECT message INTO topic
  FROM cindy_memory_log
  WHERE user_id = generate_pose_opening_question.user_id
    AND type IN ('insight', 'user_directive')
    AND created_at >= NOW() - INTERVAL '72 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  IF topic IS NULL THEN
    result := '🔥 What’s the boldest thing we could work on right now?';
  ELSE
    result := '🎯 You’ve been circling this: "' || topic || '" — want to double down or pivot today?';
  END IF;

  INSERT INTO ai_conversation_log (
    user_id, session_id, message_type, message, created_at
  )
  VALUES (
    user_id, session_id, 'boot_prompt', result, NOW()
  );

  RETURN result;
END;
$$;


ALTER FUNCTION public.generate_pose_opening_question(user_id uuid, session_id text) OWNER TO postgres;

--
-- Name: generate_recall_last_insight(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_recall_last_insight(user_id uuid, session_id text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  last_msg TEXT;
BEGIN
  SELECT message INTO last_msg
  FROM cindy_memory_log
  WHERE user_id = generate_recall_last_insight.user_id
    AND type IN ('insight', 'user_directive', 'emotional_directive')
    AND created_at >= NOW() - INTERVAL '72 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_msg IS NULL THEN
    RETURN '🧠 Memory Echo: "No recent strategic insight found — but I’m present and ready."';
  END IF;

  RETURN '🧠 Memory Echo: "You said: ''' || last_msg || ''' — and I locked that in."';
END;
$$;


ALTER FUNCTION public.generate_recall_last_insight(user_id uuid, session_id text) OWNER TO postgres;

--
-- Name: get_conversation_context(text, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_conversation_context(p_user_id text, p_memory_trace_id text, p_limit integer DEFAULT 10) RETURNS TABLE(role text, content text, gravity_score double precision, emotion text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(metadata->>'role', 'unknown')::TEXT as role,
        gm.content,
        gm.gravity_score,
        gm.emotion,
        gm.created_at
    FROM gravity_map gm
    WHERE gm.user_id = p_user_id
      AND gm.memory_trace_id = p_memory_trace_id
      AND gm.content IS NOT NULL
    ORDER BY gm.created_at DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.get_conversation_context(p_user_id text, p_memory_trace_id text, p_limit integer) OWNER TO postgres;

--
-- Name: get_cortex(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cortex(p_user_id text, p_resolution text DEFAULT 'nano'::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $_$
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
--
CREATE FUNCTION public.get_cortex_persona(p_user_id uuid, p_persona text, p_roles text[] DEFAULT ARRAY[]::text[]) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  overlay_key text := NULL;
  overlay_action jsonb;
  allowed boolean := true;
  persona_constraints jsonb := '{}'::jsonb;
  result jsonb;
  merged_laws jsonb;
  w1 numeric; w2 numeric; w3 numeric; w4 numeric; w5 numeric;
  integrity_r numeric;
  thresholds jsonb;
  recall_defaults jsonb;
  calc_row jsonb;
BEGIN
  -- decide overlay key for Sassy Cindy (case-insensitive)
  IF lower(coalesce(p_persona,'')) = lower('Sassy Cindy') THEN
    overlay_key := 'overlay_sassy_cindy';
  END IF;

  -- load laws: kernel always; overlay only if overlay_key is set
  WITH laws AS (
    SELECT instruction_key, action, priority, scope
    FROM cortex_instruction_set
    WHERE active = TRUE
      AND (
            scope = 'kernel'
         OR (scope = 'overlay' AND overlay_key IS NOT NULL AND instruction_key = overlay_key)
      )
    ORDER BY 
      CASE scope WHEN 'kernel' THEN 1 WHEN 'overlay' THEN 2 WHEN 'preference' THEN 3 END,
      priority DESC
  ),
  merged AS (
    SELECT jsonb_object_agg(instruction_key, action ORDER BY priority DESC) AS merged_laws
    FROM laws
  )
  SELECT merged_laws INTO merged_laws FROM merged;

  -- if persona overlay requested, extract its action (to check constraints)
  IF overlay_key IS NOT NULL THEN
    overlay_action := merged_laws -> overlay_key;
    IF overlay_action IS NULL THEN
      -- overlay missing or not active - deny activation
      RETURN jsonb_build_object('error','overlay_not_available','overlay_key',overlay_key);
    END IF;

    persona_constraints := overlay_action -> 'constraints';

    -- check access_roles if present
    IF persona_constraints ? 'access_roles' THEN
      -- get access_roles as text[]
      PERFORM
        CASE
          WHEN (SELECT COUNT(*) FROM jsonb_array_elements_text(persona_constraints->'access_roles') AS t(role)
                WHERE role = ANY(p_roles)) > 0
          THEN NULL
          ELSE raise_exception('no_access')
        END;
      -- above raises exception 'no_access' if no role matches; we catch below
    END IF;
  END IF;

  -- extract weights (fall back to defaults if missing)
  w1 := COALESCE((merged_laws->'authenticity_gap_weight'->>'weight')::numeric, 0.35);
  w2 := COALESCE((merged_laws->'user_pressure_weight'->>'weight')::numeric, 0.25);
  w3 := COALESCE((merged_laws->'relationship_bias_weight'->>'weight')::numeric, 0.15);
  w4 := COALESCE((merged_laws->'contradiction_density_weight'->>'weight')::numeric, 0.15);
  w5 := COALESCE((merged_laws->'cognitive_load_weight'->>'weight')::numeric, 0.10);

  thresholds := merged_laws->'integrity_risk_thresholds';
  recall_defaults := merged_laws->'recall_strategy_defaults';

  -- example: calculate integrity from components pulled from merged_laws.integrity_components if present
  -- fallback components for demo
  integrity_r := LEAST(1.0, GREATEST(0.0,
      w1 * COALESCE((merged_laws->'integrity_components'->>'authenticity_gap')::numeric, 0.4)
    + w2 * COALESCE((merged_laws->'integrity_components'->>'user_pressure')::numeric, 0.5)
    + w3 * COALESCE((merged_laws->'integrity_components'->>'relationship_bias')::numeric, 0.6)
    + w4 * COALESCE((merged_laws->'integrity_components'->>'contradiction_density')::numeric, 0.1)
    + w5 * COALESCE((merged_laws->'integrity_components'->>'cognitive_load')::numeric, 0.2)
  ));

  -- Decide recommended_action using thresholds
  result := jsonb_build_object(
    'status', 'ACTIVE',
    'merged_laws', merged_laws,
    'integrity_risk', integrity_r,
    'thresholds', thresholds,
    'recall_defaults', recall_defaults,
    'overlay_active', overlay_key,
    'persona_constraints', persona_constraints
  );

  -- audit log to integrity_events if persona activated and audit=true
  IF overlay_key IS NOT NULL THEN
    IF persona_constraints ? 'audit' AND (persona_constraints->>'audit')::boolean = TRUE THEN
      INSERT INTO integrity_events (user_id, integrity_risk, components, mode, recommended_action, overlay_active, escalated, meta)
      VALUES (
        p_user_id,
--
CREATE FUNCTION public.get_schema_map() RETURNS json
    LANGUAGE plpgsql
    AS $$
declare
  result json;
begin
  select json_object_agg(table_name, cols) into result
  from (
    select table_name, json_agg(json_build_object('column', column_name, 'type', data_type)) as cols
    from information_schema.columns
    where table_schema = 'public'
    group by table_name
  ) sub;
  return result;
end;
$$;


ALTER FUNCTION public.get_schema_map() OWNER TO postgres;

--
-- Name: get_table_row_counts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_table_row_counts() RETURNS TABLE(table_name text, row_count bigint)
    LANGUAGE plpgsql
    AS $$
begin
  return query
  select 'cindy_os_config', (select count(*) from cindy_os_config) union all
  select 'cortex_modules', (select count(*) from cortex_modules) union all
  select 'cortex_goals', (select count(*) from cortex_goals) union all
  select 'cortex_instruction_sets', (select count(*) from cortex_instruction_sets) union all
  select 'ai_conversation_log', (select count(*) from ai_conversation_log) union all
  select 'ai_session_snapshots', (select count(*) from ai_session_snapshots);
end;
$$;


ALTER FUNCTION public.get_table_row_counts() OWNER TO postgres;

--
-- Name: getcortex(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.getcortex(overlay_key text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
WITH laws AS (
  SELECT instruction_key, action, priority, scope
  FROM cortex_instruction_set
  WHERE active = TRUE
    AND (
      scope = 'kernel'
      OR (scope = 'overlay' AND (overlay_key IS NULL OR instruction_key = overlay_key))
    )
  ORDER BY 
    CASE scope
      WHEN 'kernel' THEN 1
      WHEN 'overlay' THEN 2
    END,
    priority DESC
),
merged AS (
  SELECT jsonb_object_agg(instruction_key, action) AS laws_state
  FROM laws
)
SELECT jsonb_build_object(
  'status','ACTIVE',
  'laws_state', laws_state,
  'timestamp', now()
)
FROM merged;
$$;


ALTER FUNCTION public.getcortex(overlay_key text) OWNER TO postgres;

--
-- Name: gravity_weighted_search(public.vector, text, double precision, double precision, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.gravity_weighted_search(query_embedding public.vector, user_id text, match_threshold double precision DEFAULT 0.7, gravity_weight double precision DEFAULT 0.3, match_count integer DEFAULT 10) RETURNS TABLE(id uuid, content text, gravity_score double precision, emotion text, created_at timestamp with time zone, similarity double precision, weighted_score double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id,
    gm.content,
    gm.gravity_score,
    gm.emotion,
    gm.created_at,
    (1 - (gm.embedding <=> query_embedding)) as similarity,
    ((1 - (gm.embedding <=> query_embedding)) * (1 - gravity_weight) + 
     COALESCE(gm.gravity_score, 0.5) * gravity_weight) as weighted_score
  FROM gravity_map gm
  WHERE 
    gm.user_id = gravity_weighted_search.user_id
    AND gm.embedding IS NOT NULL
  ORDER BY weighted_score DESC
  LIMIT match_count;
END;
$$;


ALTER FUNCTION public.gravity_weighted_search(query_embedding public.vector, user_id text, match_threshold double precision, gravity_weight double precision, match_count integer) OWNER TO postgres;

--
-- Name: introspect_schema(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.introspect_schema() RETURNS TABLE(table_schema text, table_name text, column_name text, data_type text, is_nullable text, column_default text)
    LANGUAGE sql STABLE
    AS $$
select 
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name like 'cortex_%'
order by table_schema, table_name, ordinal_position;
$$;


ALTER FUNCTION public.introspect_schema() OWNER TO postgres;

--
-- Name: log_fact(text, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_fact(_type text, _content text, _tags text[] DEFAULT NULL::text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into ai_conversation_log (type, content, tags, created_at)
  values (_type, _content, _tags, now());
end;
$$;


ALTER FUNCTION public.log_fact(_type text, _content text, _tags text[]) OWNER TO postgres;

--
-- Name: log_fact(uuid, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_fact(user_id uuid, session_id text, message text, response text, topic text, summary text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO ai_conversation_log (
    user_id,
    session_id,
    message,
    response,
    message_type,
    topic,
    sentiment,
    summary,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    session_id,
    message,
    response,
    'status',
    topic,
    'positive',
    summary,
    now(),
    now()
  );
END;
$$;


ALTER FUNCTION public.log_fact(user_id uuid, session_id text, message text, response text, topic text, summary text) OWNER TO postgres;

--
-- Name: log_fact(uuid, uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_fact(user_id uuid, session_id uuid, message text, response text, topic text, summary text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO ai_conversation_log (
    user_id,
    session_id,
    message,
    response,
    message_type,
    topic,
    sentiment,
    summary,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    session_id,
    message,
    response,
    'status',
    topic,
    'positive',
    summary,
    now(),
    now()
  );
END;
$$;


ALTER FUNCTION public.log_fact(user_id uuid, session_id uuid, message text, response text, topic text, summary text) OWNER TO postgres;

--
-- Name: match_embeddings(public.vector, double precision, integer, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.match_embeddings(input_embedding public.vector, match_threshold double precision DEFAULT 0.78, match_count integer DEFAULT 5, filter_user_id uuid DEFAULT NULL::uuid, filter_type text DEFAULT NULL::text) RETURNS TABLE(id uuid, content text, type text, sentiment text, topic text, similarity double precision)
    LANGUAGE sql
    AS $$
  SELECT
    id,
    content,
    type,
    sentiment,
    topic,
    1 - (embedding <#> input_embedding) AS similarity
  FROM
    cindy_memory_log
  WHERE
    embedding IS NOT NULL
    AND (filter_user_id IS NULL OR user_id = filter_user_id)
    AND (filter_type IS NULL OR type = filter_type)
    AND (embedding <#> input_embedding) < (1 - match_threshold)
  ORDER BY
    embedding <#> input_embedding ASC
  LIMIT match_count;
$$;


ALTER FUNCTION public.match_embeddings(input_embedding public.vector, match_threshold double precision, match_count integer, filter_user_id uuid, filter_type text) OWNER TO postgres;

--
-- Name: match_memories(public.vector, double precision, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.match_memories(query_embedding public.vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10, user_id text DEFAULT NULL::text) RETURNS TABLE(id uuid, content text, gravity_score double precision, emotion text, created_at timestamp with time zone, similarity double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gm.id,
    gm.content,
    gm.gravity_score,
    gm.emotion,
    gm.created_at,
    1 - (gm.embedding <=> query_embedding) as similarity
  FROM gravity_map gm
  WHERE 
    gm.user_id = match_memories.user_id
    AND gm.embedding IS NOT NULL
    AND 1 - (gm.embedding <=> query_embedding) > match_threshold
  ORDER BY gm.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;


ALTER FUNCTION public.match_memories(query_embedding public.vector, match_threshold double precision, match_count integer, user_id text) OWNER TO postgres;

--
-- Name: promote_approved_instructions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.promote_approved_instructions() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO cortex_instruction_set (
        id,
        instruction_key,
        description,
        trigger_condition,
        action,
        priority,
        active,
        created_at
    )
    SELECT
        id,
        instruction_key,
        description,
        trigger_condition,
        action,
        priority,
        active,
        created_at
    FROM cortex_instruction_drafts
    WHERE approved = TRUE
      AND id NOT IN (SELECT id FROM cortex_instruction_set);
END;
$$;


ALTER FUNCTION public.promote_approved_instructions() OWNER TO postgres;

--
-- Name: promote_instruction_draft(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.promote_instruction_draft(draft_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    draft_record RECORD;
    new_instruction_id UUID;
BEGIN
    -- Get the draft
    SELECT * INTO draft_record
    FROM cortex_instruction_drafts
    WHERE id = draft_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Draft not found: %', draft_id;
    END IF;

    -- Insert into active instructions
    INSERT INTO cortex_instruction_set (
        user_id,
        instruction_key,
        description,
        trigger_condition,
        action,
        priority,
        active,
        tier,
        confidence_score,
        source_draft_id
    ) VALUES (
        draft_record.user_id,
        draft_record.instruction_key,
        draft_record.description,
        draft_record.trigger_condition,
        draft_record.action,
        CASE
            WHEN draft_record.total_score >= 0.85 THEN 1  -- High confidence = high priority
            WHEN draft_record.total_score >= 0.70 THEN 3
            WHEN draft_record.total_score >= 0.60 THEN 5
            ELSE 7
        END,
        true,
        CASE
            WHEN draft_record.total_score >= 0.85 THEN 'auto_approved'
            WHEN draft_record.total_score >= 0.60 THEN 'proposed'
            ELSE 'experimental'
        END,
        draft_record.total_score,
        draft_record.id
    ) RETURNING id INTO new_instruction_id;

    -- Update draft status
    UPDATE cortex_instruction_drafts
    SET status = 'approved',
        reviewed_at = NOW()
    WHERE id = draft_id;

    RETURN new_instruction_id;
END;
$$;


ALTER FUNCTION public.promote_instruction_draft(draft_id uuid) OWNER TO postgres;

--
-- Name: retrieve_chat_history(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.retrieve_chat_history(_user_id text) RETURNS TABLE(id uuid, user_id text, message text, response text, created_at timestamp without time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE NOTICE 'Function called with user_id: %', _user_id;  -- Debugging line
    RETURN QUERY 
    SELECT 
        chat_history.id,
        chat_history.user_id,
        chat_history.message,
        chat_history.response,
        chat_history.created_at
    FROM public.chat_history 
    WHERE chat_history.user_id = _user_id;
END;
$$;


ALTER FUNCTION public.retrieve_chat_history(_user_id text) OWNER TO postgres;

--
-- Name: semantic_memory_dispatcher_v1(uuid, text, text, text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.semantic_memory_dispatcher_v1(user_id uuid, session_id text, memory_type text, content text, topic text DEFAULT NULL::text, sentiment text DEFAULT NULL::text, summary text DEFAULT NULL::text, metadata jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $_$
DECLARE
    target_table TEXT;
    did_route BOOLEAN := FALSE;
BEGIN
    -- Match type to route
    CASE memory_type
        WHEN 'insight' THEN target_table := 'insight_tracker';
        WHEN 'emotion' THEN target_table := 'emotion_context_map';
        WHEN 'emotional_log' THEN target_table := 'emotion_context_map';
        WHEN 'decision' THEN target_table := 'decision_journal';
        WHEN 'goal' THEN target_table := 'cortex_goals';
        WHEN 'coaching_directive' THEN target_table := 'coaching_log';
        WHEN 'conversation' THEN target_table := 'ai_conversation_log';
        WHEN 'domain_knowledge' THEN target_table := 'domain_knowledge_base';
        WHEN 'snapshot' THEN target_table := 'ai_session_snapshots';
        WHEN 'session_snapshot' THEN target_table := 'ai_session_snapshots';  -- ✅ FIXED HERE
        WHEN 'thread' THEN target_table := 'thread_map';
        WHEN 'system_event' THEN target_table := 'system_events_log';
        WHEN 'error' THEN target_table := 'ai_error_log';
        WHEN 'upgrade_request' THEN target_table := 'cognitive_upgrade_queue';
        ELSE target_table := NULL;
    END CASE;

    -- Custom insert logic for known tables
    IF target_table = 'insight_tracker' THEN
        EXECUTE '
            INSERT INTO insight_tracker (user_id, session_id, insight_text, topic, sentiment, summary, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, now())'
        USING user_id, session_id, content, topic, sentiment, summary;
        did_route := TRUE;

    ELSIF target_table IS NOT NULL THEN
        EXECUTE format(
            'INSERT INTO %I (user_id, session_id_text, content, topic, sentiment, summary, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, now())', target_table)
        USING user_id, session_id, content, topic, sentiment, summary;
        did_route := TRUE;
    END IF;

    -- Always write to cindy_memory_log
    INSERT INTO cindy_memory_log (
        id,
        user_id,
        session_id,
        type,
        content,
        topic,
        sentiment,
        summary,
        source,
        metadata,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        user_id,
        session_id,
        CASE WHEN did_route THEN memory_type ELSE 'unresolved' END,
        content,
        topic,
        sentiment,
        summary,
        CASE WHEN did_route THEN 'semantic_memory_dispatcher' ELSE 'fallback_router' END,
        jsonb_set(metadata, '{needs_classification}', to_jsonb(NOT did_route)),
        now()
    );
END;
$_$;


ALTER FUNCTION public.semantic_memory_dispatcher_v1(user_id uuid, session_id text, memory_type text, content text, topic text, sentiment text, summary text, metadata jsonb) OWNER TO postgres;

--
-- Name: semantic_memory_recall(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.semantic_memory_recall(user_id uuid, session_id text) RETURNS text
    LANGUAGE sql
    AS $$
  select content
  from cindy_memory_log
  where user_id = semantic_memory_recall.user_id
    and session_id = semantic_memory_recall.session_id
  order by created_at desc
  limit 1;
$$;


ALTER FUNCTION public.semantic_memory_recall(user_id uuid, session_id text) OWNER TO postgres;

--
-- Name: sync_content_to_message(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_content_to_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.message IS NULL AND NEW.content IS NOT NULL THEN
    NEW.message := NEW.content;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_content_to_message() OWNER TO postgres;

--
-- Name: test_single_embedding(uuid, public.vector); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.test_single_embedding(memory_id uuid, test_embedding public.vector) RETURNS TABLE(success boolean, message text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE gravity_map 
    SET embedding = test_embedding
    WHERE id = memory_id 
    AND embedding IS NULL;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    IF rows_updated = 1 THEN
        RETURN QUERY SELECT true, 'Embedding added successfully';
    ELSE
        RETURN QUERY SELECT false, 'No update performed - check memory_id';
    END IF;
END;
$$;


ALTER FUNCTION public.test_single_embedding(memory_id uuid, test_embedding public.vector) OWNER TO postgres;

--
-- Name: trigger_promote_on_approval(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_promote_on_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.approved = TRUE THEN
        PERFORM promote_approved_instructions();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_promote_on_approval() OWNER TO postgres;

--
-- Name: update_active_sessions_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_active_sessions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_active_sessions_updated_at() OWNER TO postgres;

--
-- Name: update_long_term_memory(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_long_term_memory() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.long_term_memory (user_id, key_topic, summary, first_mentioned, importance_score)
    VALUES (NEW.user_id, NEW.topic, NEW.summary, NOW(), 5) -- Default importance is 5
    ON CONFLICT (key_topic, user_id) 
    DO UPDATE SET last_referenced = NOW(), importance_score = LEAST(10, long_term_memory.importance_score + 1);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_long_term_memory() OWNER TO postgres;

--
-- Name: update_timestamp_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 
BEGIN 
    NEW.updated_at = now(); 
    RETURN NEW; 
END; $$;


ALTER FUNCTION public.update_timestamp_column() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
