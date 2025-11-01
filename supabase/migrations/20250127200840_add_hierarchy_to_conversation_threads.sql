-- Add hierarchy and goal tracking columns to conversation_threads
-- Enables Project > Parent > Child > Grandchild structure

-- Add missing columns
ALTER TABLE public.conversation_threads
  ADD COLUMN IF NOT EXISTS conversation_name text,
  ADD COLUMN IF NOT EXISTS parent_thread_id uuid REFERENCES public.conversation_threads(thread_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS child_thread_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS goal_progress numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hierarchy_level integer DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_threads_user_conversation 
  ON public.conversation_threads(user_id, conversation_name);

CREATE INDEX IF NOT EXISTS idx_conversation_threads_user_parent 
  ON public.conversation_threads(user_id, parent_thread_id) 
  WHERE parent_thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_threads_parent 
  ON public.conversation_threads(parent_thread_id) 
  WHERE parent_thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_threads_hierarchy_level 
  ON public.conversation_threads(user_id, hierarchy_level);

-- Comment columns for documentation
COMMENT ON COLUMN public.conversation_threads.conversation_name IS 'Display name for the conversation/thread';
COMMENT ON COLUMN public.conversation_threads.parent_thread_id IS 'References parent thread (null = root/Project level)';
COMMENT ON COLUMN public.conversation_threads.child_thread_ids IS 'Array of child thread UUIDs';
COMMENT ON COLUMN public.conversation_threads.goals IS 'JSONB array of goal objects with progress tracking';
COMMENT ON COLUMN public.conversation_threads.goal_progress IS 'Aggregate progress (0-1) across all goals';
COMMENT ON COLUMN public.conversation_threads.hierarchy_level IS '0=Project (root), 1=Parent, 2=Child, 3=Grandchild';

