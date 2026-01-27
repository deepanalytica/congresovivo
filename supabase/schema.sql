-- Supabase/PostgreSQL Schema for Congreso Vivo
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. PARLIAMENTARIANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS parliamentarians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- "S-1234" or "D-5678"
  
  -- Personal Info
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  
  -- Political Affiliation
  partido TEXT NOT NULL,
  ideologia TEXT NOT NULL, -- 'left', 'centerLeft', 'center', 'centerRight', 'right', 'independent'
  coalicion TEXT,
  
  -- Chamber Info
  camara TEXT NOT NULL CHECK (camara IN ('camara', 'senado')),
  region TEXT NOT NULL,
  circunscripcion TEXT,
  distrito TEXT,
  
  -- Contact
  email TEXT,
  telefono TEXT,
  curriculum_url TEXT,
  
  -- Status
  vigente BOOLEAN DEFAULT true,
  periodo_inicio DATE,
  periodo_fin DATE,
  
  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parliamentarians_camara ON parliamentarians(camara);
CREATE INDEX idx_parliamentarians_partido ON parliamentarians(partido);
CREATE INDEX idx_parliamentarians_vigente ON parliamentarians(vigente);
CREATE INDEX idx_parliamentarians_external_id ON parliamentarians(external_id);

-- ============================================
-- 2. BILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  
  -- Basic Info
  boletin TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  resumen TEXT,
  
  -- Status
  estado TEXT NOT NULL, -- 'ingreso', 'comision', 'sala', etc.
  etapa_actual TEXT,
  urgencia TEXT NOT NULL DEFAULT 'sin', -- 'sin', 'simple', 'suma', 'inmediata'
  
  -- Origin
  camara_origen TEXT NOT NULL CHECK (camara_origen IN ('camara', 'senado')),
  iniciativa TEXT NOT NULL, -- 'ejecutivo', 'parlamentaria', 'mixta'
  tipo TEXT, -- 'mocion', 'mensaje', 'mensaje_mocion'
  
  -- Dates
  fecha_ingreso DATE NOT NULL,
  fecha_ultima_modificacion DATE,
  
  -- Legal Reference
  ley TEXT, -- Número de ley si fue aprobado
  tramitacion_link TEXT,
  
  -- Materias (stored as JSONB array)
  materias JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bills_boletin ON bills(boletin);
CREATE INDEX idx_bills_estado ON bills(estado);
CREATE INDEX idx_bills_urgencia ON bills(urgencia);
CREATE INDEX idx_bills_camara_origen ON bills(camara_origen);
CREATE INDEX idx_bills_fecha_ingreso ON bills(fecha_ingreso DESC);
CREATE INDEX idx_bills_materias ON bills USING GIN (materias);

-- ============================================
-- 3. BILL EVENTS TABLE (Tramitación)
-- ============================================
CREATE TABLE IF NOT EXISTS bill_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL, -- 'ingreso', 'comision', 'sala', 'votacion', 'indicacion', 'informe', 'oficio', 'otro'
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  camara TEXT NOT NULL CHECK (camara IN ('camara', 'senado')),
  
  -- Optional metadata
  sesion TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bill_events_bill_id ON bill_events(bill_id);
CREATE INDEX idx_bill_events_fecha ON bill_events(fecha DESC);
CREATE INDEX idx_bill_events_tipo ON bill_events(tipo);

-- ============================================
-- 4. VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  
  boletin TEXT NOT NULL,
  fecha DATE NOT NULL,
  camara TEXT NOT NULL CHECK (camara IN ('camara', 'senado')),
  sesion TEXT,
  tipo TEXT NOT NULL, -- 'sala', 'comision'
  materia TEXT NOT NULL,
  resultado TEXT NOT NULL, -- 'aprobado', 'rechazado', 'empate'
  quorum TEXT,
  
  -- Results
  a_favor INTEGER DEFAULT 0,
  contra INTEGER DEFAULT 0,
  abstenciones INTEGER DEFAULT 0,
  ausentes INTEGER DEFAULT 0,
  pareos INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_votes_bill_id ON votes(bill_id);
CREATE INDEX idx_votes_fecha ON votes(fecha DESC);
CREATE INDEX idx_votes_camara ON votes(camara);

-- ============================================
-- 5. VOTE ROLL CALL TABLE (Detalle de votos)
-- ============================================
CREATE TABLE IF NOT EXISTS vote_roll_call (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
  parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
  
  voto TEXT NOT NULL, -- 'a_favor', 'contra', 'abstencion', 'ausente', 'pareo'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vote_roll_call_vote_id ON vote_roll_call(vote_id);
CREATE INDEX idx_vote_roll_call_parl_id ON vote_roll_call(parliamentarian_id);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
-- For public read access (Congreso Vivo is public data)

ALTER TABLE parliamentarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_roll_call ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Public read access" ON parliamentarians FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bills FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bill_events FOR SELECT USING (true);
CREATE POLICY "Public read access" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON vote_roll_call FOR SELECT USING (true);

-- ============================================
-- 7. HELPER VIEWS
-- ============================================

-- View: Recent legislative activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  be.id,
  be.tipo,
  be.fecha,
  be.descripcion,
  b.boletin,
  b.titulo,
  be.camara
FROM bill_events be
JOIN bills b ON be.bill_id = b.id
ORDER BY be.fecha DESC
LIMIT 50;

-- View: Active bills with momentum
CREATE OR REPLACE VIEW active_bills AS
SELECT 
  b.*,
  EXTRACT(DAY FROM (NOW() - b.fecha_ultima_modificacion)) as days_since_update,
  CASE 
    WHEN EXTRACT(DAY FROM (NOW() - b.fecha_ultima_modificacion)) = 0 THEN 100
    WHEN EXTRACT(DAY FROM (NOW() - b.fecha_ultima_modificacion)) <= 7 THEN 80
    WHEN EXTRACT(DAY FROM (NOW() - b.fecha_ultima_modificacion)) <= 30 THEN 50
    WHEN EXTRACT(DAY FROM (NOW() - b.fecha_ultima_modificacion)) <= 90 THEN 20
    ELSE 0
  END as momentum
FROM bills b
WHERE b.estado NOT IN ('promulgado', 'rechazado', 'archivado')
ORDER BY momentum DESC, b.fecha_ultima_modificacion DESC;
