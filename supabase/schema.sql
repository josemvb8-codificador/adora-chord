-- ============================================================
-- Adora — Supabase Schema
-- Ejecuta esto en el SQL Editor de tu proyecto en supabase.com
-- ============================================================

-- Tabla de canciones
CREATE TABLE IF NOT EXISTS songs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  artist       TEXT DEFAULT '',
  key          TEXT DEFAULT 'G',
  mode         TEXT DEFAULT 'major',
  capo         INTEGER DEFAULT 0,
  tempo        INTEGER DEFAULT 75,
  time_signature TEXT DEFAULT '4/4',
  tuning       TEXT DEFAULT 'standard',
  sections     JSONB DEFAULT '[]'::jsonb,
  is_shared    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security — cada usuario solo ve sus propias canciones
-- y las que otros marcaron como compartidas
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_songs" ON songs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "shared_songs_read" ON songs
  FOR SELECT USING (is_shared = true);

-- Índices
CREATE INDEX songs_user_id_idx ON songs(user_id);
CREATE INDEX songs_shared_idx ON songs(is_shared) WHERE is_shared = true;
