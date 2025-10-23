-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY,
  memory_retention TEXT NOT NULL DEFAULT 'high',
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  sync_interval INTEGER NOT NULL DEFAULT 30,
  max_memory_fragments INTEGER NOT NULL DEFAULT 1000,
  last_sync_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memory_fragments table
CREATE TABLE IF NOT EXISTS memory_fragments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  semantic_weight FLOAT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[]
);

-- Create memory_arcs table
CREATE TABLE IF NOT EXISTS memory_arcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create arc_fragments table (junction table)
CREATE TABLE IF NOT EXISTS arc_fragments (
  arc_id UUID REFERENCES memory_arcs(id) ON DELETE CASCADE,
  fragment_id UUID REFERENCES memory_fragments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (arc_id, fragment_id)
);

-- Insert default settings if not exists
INSERT INTO settings (id, memory_retention, auto_sync, sync_interval, max_memory_fragments)
VALUES (1, 'high', true, 30, 1000)
ON CONFLICT (id) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_settings_timestamp
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_memory_arcs_timestamp
BEFORE UPDATE ON memory_arcs
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_memory_fragments_type ON memory_fragments(type);
CREATE INDEX IF NOT EXISTS idx_memory_fragments_timestamp ON memory_fragments(timestamp);
CREATE INDEX IF NOT EXISTS idx_memory_arcs_status ON memory_arcs(status);
