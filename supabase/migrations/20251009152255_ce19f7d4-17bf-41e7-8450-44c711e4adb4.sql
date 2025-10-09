-- Add proposal_id to property_maintenance table
ALTER TABLE property_maintenance 
ADD COLUMN proposal_id UUID REFERENCES governance_proposals(id);

-- Create index for better query performance
CREATE INDEX idx_property_maintenance_proposal 
ON property_maintenance(proposal_id);

-- Add comment for documentation
COMMENT ON COLUMN property_maintenance.proposal_id IS 'Links maintenance to governance proposal that requires token holder voting';