-- Execute no Supabase SQL Editor
-- Adiciona tabela de compromissos

CREATE TABLE IF NOT EXISTS compromissos (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  data         DATE NOT NULL,
  hora         TIME,
  local        TEXT,
  tipo         TEXT DEFAULT 'audiencia',
  obs          TEXT,
  cliente_id   BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  processo_id  BIGINT REFERENCES processos(id) ON DELETE SET NULL,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE compromissos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_compromissos" ON compromissos
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_compromissos_user ON compromissos(user_id);
CREATE INDEX IF NOT EXISTS idx_compromissos_data ON compromissos(data);
