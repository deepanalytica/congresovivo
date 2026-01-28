-- ============================================
-- 8. COMMITTEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS committees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- "COM-123"
  
  nombre TEXT NOT NULL,
  nombre_corto TEXT,
  tipo TEXT NOT NULL, -- 'permanente', 'especial', 'mixta'
  camara TEXT NOT NULL CHECK (camara IN ('camara', 'senado', 'mixta')),
  
  descripcion TEXT,
  email TEXT,
  telefono TEXT,
  
  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_committees_camara ON committees(camara);
CREATE INDEX idx_committees_tipo ON committees(tipo);

-- ============================================
-- 9. COMMITTEE MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
  
  rol TEXT NOT NULL DEFAULT 'integrante', -- 'presidente', 'integrante', 'suplente'
  fecha_inicio DATE,
  fecha_fin DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(committee_id, parliamentarian_id)
);

CREATE INDEX idx_comm_members_committee_id ON committee_members(committee_id);
CREATE INDEX idx_comm_members_parl_id ON committee_members(parliamentarian_id);

-- ============================================
-- 10. ENABLE RLS
-- ============================================
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON committees FOR SELECT USING (true);
CREATE POLICY "Public read access" ON committee_members FOR SELECT USING (true);
