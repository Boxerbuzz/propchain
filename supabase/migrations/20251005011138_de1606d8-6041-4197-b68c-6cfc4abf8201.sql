-- Create property_maintenance table for tracking maintenance and repairs
CREATE TABLE property_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_event_id UUID REFERENCES property_events(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Maintenance details
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'emergency', 'preventive', 'corrective', 'repair', 'upgrade')),
  maintenance_date TIMESTAMP NOT NULL,
  completion_date TIMESTAMP,
  
  -- Issue details
  issue_category TEXT, -- 'electrical', 'plumbing', 'structural', 'hvac', 'landscaping', 'security', 'other'
  issue_severity TEXT CHECK (issue_severity IN ('low', 'medium', 'high', 'critical')),
  issue_description TEXT NOT NULL,
  
  -- Service provider
  contractor_name TEXT,
  contractor_company TEXT,
  contractor_phone TEXT,
  contractor_license TEXT,
  
  -- Financial
  estimated_cost_ngn DECIMAL,
  actual_cost_ngn DECIMAL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  payment_method TEXT,
  
  -- Work details
  work_performed TEXT,
  parts_replaced JSONB, -- [{part: 'pipe', quantity: 2, cost: 5000}]
  before_photos JSONB,
  after_photos JSONB,
  
  -- Documentation
  invoice_url TEXT,
  warranty_info TEXT,
  warranty_expiry_date DATE,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Status
  maintenance_status TEXT DEFAULT 'scheduled' CHECK (maintenance_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Blockchain
  hcs_transaction_id TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE property_maintenance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_maintenance
CREATE POLICY "Property owners can view maintenance"
ON property_maintenance FOR SELECT
USING (
  property_id IN (
    SELECT id FROM properties WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Property owners can manage maintenance"
ON property_maintenance FOR ALL
USING (
  property_id IN (
    SELECT id FROM properties WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage maintenance"
ON property_maintenance FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role');

-- Create indexes
CREATE INDEX idx_property_maintenance_property_id ON property_maintenance(property_id);
CREATE INDEX idx_property_maintenance_date ON property_maintenance(maintenance_date);
CREATE INDEX idx_property_maintenance_status ON property_maintenance(maintenance_status);