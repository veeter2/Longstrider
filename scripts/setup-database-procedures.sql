-- Create stored procedures for database setup

-- Create settings table procedure
CREATE OR REPLACE FUNCTION create_settings_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    autoSync BOOLEAN DEFAULT true,
    syncInterval INTEGER DEFAULT 30,
    maxMemoryFragments INTEGER DEFAULT 1000,
    memoryRetention TEXT DEFAULT 'medium',
    lastSyncTime TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create memory_fragments table procedure
CREATE OR REPLACE FUNCTION create_memory_fragments_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS memory_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    importance FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  CREATE INDEX IF NOT EXISTS idx_memory_fragments_type ON memory_fragments(type);
  CREATE INDEX IF NOT EXISTS idx_memory_fragments_importance ON memory_fragments(importance);
  CREATE INDEX IF NOT EXISTS idx_memory_fragments_created_at ON memory_fragments(created_at);
END;
$$ LANGUAGE plpgsql;

-- Create memory_arcs table procedure
CREATE OR REPLACE FUNCTION create_memory_arcs_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS memory_arcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  CREATE INDEX IF NOT EXISTS idx_memory_arcs_status ON memory_arcs(status);
  CREATE INDEX IF NOT EXISTS idx_memory_arcs_created_at ON memory_arcs(created_at);
END;
$$ LANGUAGE plpgsql;

-- Create arc_fragments table procedure
CREATE OR REPLACE FUNCTION create_arc_fragments_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS arc_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arc_id UUID NOT NULL REFERENCES memory_arcs(id) ON DELETE CASCADE,
    fragment_id UUID NOT NULL REFERENCES memory_fragments(id) ON DELETE CASCADE,
    relevance FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(arc_id, fragment_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_arc_fragments_arc_id ON arc_fragments(arc_id);
  CREATE INDEX IF NOT EXISTS idx_arc_fragments_fragment_id ON arc_fragments(fragment_id);
  CREATE INDEX IF NOT EXISTS idx_arc_fragments_relevance ON arc_fragments(relevance);
END;
$$ LANGUAGE plpgsql;
