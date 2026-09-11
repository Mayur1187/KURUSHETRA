-- JalSangam AI PostgreSQL / Supabase Schema Definition

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('farmer', 'authority', 'mediator')),
    village TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    farmer_name TEXT NOT NULL,
    land_area NUMERIC NOT NULL,
    land_unit TEXT DEFAULT 'Acres',
    crop_type TEXT NOT NULL,
    crop_stage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_available_water NUMERIC NOT NULL,
    unit TEXT DEFAULT 'Liters',
    canal_capacity NUMERIC NOT NULL, -- Liters per hour
    allocation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    requested_water NUMERIC NOT NULL,
    minimum_water NUMERIC NOT NULL,
    urgency INTEGER CHECK (urgency BETWEEN 1 AND 5),
    preferred_start TIME NOT NULL,
    preferred_end TIME NOT NULL,
    max_delay_hours NUMERIC DEFAULT 4,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS negotiation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    minimum_acceptable_water NUMERIC NOT NULL,
    preferred_start TIME NOT NULL,
    preferred_end TIME NOT NULL,
    maximum_delay NUMERIC DEFAULT 4,
    priority_order INTEGER DEFAULT 1,
    allow_agent_negotiation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fairness_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    requested_water NUMERIC NOT NULL,
    allocated_water NUMERIC NOT NULL,
    satisfaction_ratio NUMERIC NOT NULL,
    sacrifice_amount NUMERIC DEFAULT 0,
    fairness_credit NUMERIC DEFAULT 0,
    allocation_cycle INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflict_type TEXT NOT NULL, -- water_shortage, minimum_requirement_conflict, time_overlap, canal_capacity, priority_conflict
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    affected_farmers JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflict_id UUID REFERENCES conflicts(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress', -- in_progress, agreed, failed
    current_round INTEGER DEFAULT 1,
    mediator_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    proposal_round INTEGER NOT NULL,
    allocation_data JSONB NOT NULL,
    fairness_score NUMERIC DEFAULT 0,
    constraint_score NUMERIC DEFAULT 0,
    agreement_score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected, revised
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    objection_message TEXT NOT NULL,
    extracted_constraint JSONB,
    constraint_priority TEXT DEFAULT 'HIGH',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    final_allocation JSONB NOT NULL,
    final_fairness_score NUMERIC NOT NULL,
    agreement_status TEXT DEFAULT 'FINALIZED',
    accepted_by JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AgriEvidence Engine Table
CREATE TABLE IF NOT EXISTS crop_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    image_url TEXT,
    crop_type TEXT,
    crop_confidence NUMERIC,
    growth_stage TEXT,
    growth_confidence NUMERIC,
    water_stress TEXT,
    stress_confidence NUMERIC,
    crop_criticality NUMERIC,
    evidence_status TEXT DEFAULT 'active', -- active, superseded, challenged
    analysis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

