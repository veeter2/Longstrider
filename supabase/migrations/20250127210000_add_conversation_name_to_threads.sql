-- Add conversation_name column to conversation_threads if it doesn't exist
ALTER TABLE conversation_threads 
ADD COLUMN IF NOT EXISTS conversation_name text;

-- Update existing rows to use thread_title as conversation_name if conversation_name is null
UPDATE conversation_threads 
SET conversation_name = thread_title 
WHERE conversation_name IS NULL AND thread_title IS NOT NULL;

