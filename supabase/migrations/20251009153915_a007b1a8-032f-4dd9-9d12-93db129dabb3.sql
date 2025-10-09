-- Enable real-time replication for governance_proposals
ALTER TABLE governance_proposals REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE governance_proposals;