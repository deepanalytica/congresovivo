-- =====================================================
-- OpenData Legislative Database Schema Extension
-- =====================================================
-- This extends the existing schema with tables for:
-- - Committees and their sessions
-- - Bills (proyectos de ley)
-- - Votes and vote records (registro nominal)
-- - Reference data (distritos, regiones, ministerios, etc.)
-- =====================================================

-- =====================================================
-- REFERENCE DATA TABLES
-- =====================================================

-- Generic reference data table for ministerios, comunas, provincias, etc.
CREATE TABLE IF NOT EXISTS reference_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL, -- 'ministerio', 'comuna', 'provincia', 'tipo_sesion', etc.
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_code TEXT, -- For hierarchical data (e.g., comuna -> provincia -> region)
    metadata JSONB, -- Additional fields specific to each category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, code)
);

CREATE INDEX IF NOT EXISTS idx_reference_data_category ON reference_data(category);
CREATE INDEX IF NOT EXISTS idx_reference_data_code ON reference_data(code);
CREATE INDEX IF NOT EXISTS idx_reference_data_parent ON reference_data(parent_code);

-- =====================================================
-- MATTERS (Materias legislativas)
-- =====================================================

CREATE TABLE IF NOT EXISTS matters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matters_external_id ON matters(external_id);

-- =====================================================
-- COMMITTEES (Comisiones)
-- =====================================================

CREATE TABLE IF NOT EXISTS committees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    chamber TEXT CHECK (chamber IN ('camara', 'senado', 'mixta')),
    committee_type TEXT, -- 'permanente', 'especial', 'investigadora'
    is_active BOOLEAN DEFAULT true,
    period_start DATE,
    period_end DATE,
    metadata JSONB, -- Additional info like email, phone, website
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_committees_external_id ON committees(external_id);
CREATE INDEX IF NOT EXISTS idx_committees_chamber ON committees(chamber);
CREATE INDEX IF NOT EXISTS idx_committees_active ON committees(is_active);

-- Committee membership (many-to-many with parliamentarians)
CREATE TABLE IF NOT EXISTS committee_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
    role TEXT, -- 'presidente', 'vicepresidente', 'secretario', 'miembro'
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(committee_id, parliamentarian_id, start_date)
);

CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members(committee_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_parl ON committee_members(parliamentarian_id);

-- =====================================================
-- COMMITTEE SESSIONS (Sesiones de Comisión)
-- =====================================================

CREATE TABLE IF NOT EXISTS committee_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
    external_id TEXT UNIQUE,
    session_number INTEGER,
    session_date DATE NOT NULL,
    session_type TEXT, -- 'ordinaria', 'extraordinaria', 'especial'
    status TEXT, -- 'convocada', 'realizada', 'suspendida', 'cancelada'
    title TEXT,
    description TEXT,
    location TEXT,
    start_time TIME,
    end_time TIME,
    attendance_count INTEGER,
    minutes_url TEXT, -- Link to acta
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_committee ON committee_sessions(committee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON committee_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON committee_sessions(status);

-- =====================================================
-- SESSION ATTENDANCE (Asistencia a Sesiones)
-- =====================================================

CREATE TABLE IF NOT EXISTS session_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES committee_sessions(id) ON DELETE CASCADE,
    parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
    attendance_type TEXT NOT NULL, -- 'presente', 'ausente', 'justificado', 'licencia'
    justification TEXT,
    arrival_time TIME,
    departure_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, parliamentarian_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_parl ON session_attendance(parliamentarian_id);

-- =====================================================
-- BILLS (Proyectos de Ley, Acuerdos, Resoluciones)
-- =====================================================

CREATE TABLE IF NOT EXISTS bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bulletin_number TEXT UNIQUE NOT NULL, -- e.g., "12345-07"
    title TEXT NOT NULL,
    summary TEXT,
    bill_type TEXT, -- 'proyecto_ley', 'proyecto_reforma', 'acuerdo', 'resolucion'
    chamber_origin TEXT CHECK (chamber_origin IN ('camara', 'senado', 'ejecutivo')),
    initiative_type TEXT, -- 'mensaje', 'mocion', 'indicacion'
    status TEXT, -- 'en_tramite', 'aprobado', 'rechazado', 'archivado', 'retirado'
    current_stage TEXT, -- 'primer_tramite', 'segundo_tramite', 'tercer_tramite', 'promulgado'
    current_sub_stage TEXT,
    entry_date DATE,
    urgency TEXT, -- 'simple', 'suma', 'discusion_inmediata', null
    publication_date DATE,
    law_number TEXT,
    matter_ids JSONB, -- Array of matter IDs
    related_bills JSONB, -- Array of related bulletin numbers
    document_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_bulletin ON bills(bulletin_number);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_stage ON bills(current_stage);
CREATE INDEX IF NOT EXISTS idx_bills_entry_date ON bills(entry_date DESC);

-- Bill authors (many-to-many)
CREATE TABLE IF NOT EXISTS bill_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
    is_main_author BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bill_id, parliamentarian_id)
);

CREATE INDEX IF NOT EXISTS idx_bill_authors_bill ON bill_authors(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_authors_parl ON bill_authors(parliamentarian_id);

-- =====================================================
-- VOTES (Votaciones)
-- =====================================================

CREATE TABLE IF NOT EXISTS legislative_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT UNIQUE,
    bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
    session_id UUID REFERENCES committee_sessions(id) ON DELETE SET NULL,
    vote_date DATE NOT NULL,
    vote_number INTEGER, -- Number within the session
    description TEXT NOT NULL,
    vote_type TEXT, -- 'nominacion', 'economica', 'simbolica'
    vote_context TEXT, -- 'sala', 'comision'
    quorum_type TEXT, -- 'simple', 'absoluto', 'calificado', '2/3', '3/5'
    result TEXT, -- 'aprobado', 'rechazado', 'empate'
    yes_count INTEGER DEFAULT 0,
    no_count INTEGER DEFAULT 0,
    abstention_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    paired_count INTEGER DEFAULT 0,
    total_votes INTEGER GENERATED ALWAYS AS (yes_count + no_count + abstention_count) STORED,
    document_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legislative_votes_bill ON legislative_votes(bill_id);
CREATE INDEX IF NOT EXISTS idx_legislative_votes_session ON legislative_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_legislative_votes_date ON legislative_votes(vote_date DESC);
CREATE INDEX IF NOT EXISTS idx_legislative_votes_result ON legislative_votes(result);

-- =====================================================
-- VOTE RECORDS (Registro Nominal)
-- =====================================================

CREATE TABLE IF NOT EXISTS legislative_vote_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vote_id UUID REFERENCES legislative_votes(id) ON DELETE CASCADE,
    parliamentarian_id UUID REFERENCES parliamentarians(id) ON DELETE CASCADE,
    vote_option TEXT NOT NULL, -- 'si', 'no', 'abstencion', 'ausente', 'pareo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vote_id, parliamentarian_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_records_vote ON legislative_vote_records(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_parl ON legislative_vote_records(parliamentarian_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_option ON legislative_vote_records(vote_option);

-- =====================================================
-- SYNC STATUS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS sync_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type TEXT NOT NULL, -- 'committees', 'bills', 'votes', 'reference_data'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    status TEXT, -- 'running', 'completed', 'failed'
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB, -- Additional info like sync parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sync_type)
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislative_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislative_vote_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Public read access)
-- =====================================================

-- Reference Data
CREATE POLICY "Public read access for reference_data" ON reference_data FOR SELECT USING (true);

-- Matters
CREATE POLICY "Public read access for matters" ON matters FOR SELECT USING (true);

-- Committees
CREATE POLICY "Public read access for committees" ON committees FOR SELECT USING (true);
CREATE POLICY "Public read access for committee_members" ON committee_members FOR SELECT USING (true);

-- Sessions
CREATE POLICY "Public read access for committee_sessions" ON committee_sessions FOR SELECT USING (true);
CREATE POLICY "Public read access for session_attendance" ON session_attendance FOR SELECT USING (true);

-- Bills
CREATE POLICY "Public read access for bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Public read access for bill_authors" ON bill_authors FOR SELECT USING (true);

-- Votes
CREATE POLICY "Public read access for legislative_votes" ON legislative_votes FOR SELECT USING (true);
CREATE POLICY "Public read access for legislative_vote_records" ON legislative_vote_records FOR SELECT USING (true);

-- Sync Status (read-only for public)
CREATE POLICY "Public read access for sync_status" ON sync_status FOR SELECT USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE reference_data IS 'Generic reference data for ministerios, comunas, provincias, tipos de sesión, etc.';
COMMENT ON TABLE committees IS 'Legislative committees (comisiones permanentes, especiales, investigadoras)';
COMMENT ON TABLE committee_sessions IS 'Sessions held by committees';
COMMENT ON TABLE session_attendance IS 'Attendance records for committee sessions';
COMMENT ON TABLE bills IS 'Legislative bills, agreements, and resolutions (proyectos de ley, acuerdos, resoluciones)';
COMMENT ON TABLE legislative_votes IS 'Voting sessions in chamber or committees';
COMMENT ON TABLE legislative_vote_records IS 'Individual vote records (registro nominal) for each parliamentarian';
COMMENT ON TABLE sync_status IS 'Tracking table for OpenData sync operations';
