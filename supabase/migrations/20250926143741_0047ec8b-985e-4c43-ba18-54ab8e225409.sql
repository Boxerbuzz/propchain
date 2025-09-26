-- Create triggers for MVP auto-approval workflow

-- Function to auto-approve and process properties
CREATE OR REPLACE FUNCTION auto_approve_property()
RETURNS TRIGGER AS $$
DECLARE
  topic_result JSONB;
BEGIN
  -- Auto-approve the property for MVP
  NEW.approval_status := 'approved';
  NEW.listing_status := 'active';
  NEW.approved_at := NOW();
  NEW.approved_by := NEW.owner_id; -- Self-approved for MVP
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to create HCS topic and update property
CREATE OR REPLACE FUNCTION create_property_hcs_topic()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process approved properties
  IF NEW.approval_status = 'approved' AND OLD.hcs_topic_id IS NULL THEN
    -- Call create-hcs-topic edge function (will be handled by frontend)
    INSERT INTO activity_logs (
      user_id,
      activity_type,
      description,
      property_id,
      metadata,
      created_at
    ) VALUES (
      NEW.owner_id,
      'property_hcs_topic_pending',
      'Property approved - HCS topic creation pending',
      NEW.id,
      json_build_object('property_id', NEW.id, 'title', NEW.title),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to auto-approve tokenizations
CREATE OR REPLACE FUNCTION auto_approve_tokenization()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve tokenization for MVP
  NEW.status := 'approved';
  NEW.approved_at := NOW();
  NEW.approved_by := NEW.created_by; -- Self-approved for MVP
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to create Hedera token after tokenization approval
CREATE OR REPLACE FUNCTION create_hedera_token_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process newly approved tokenizations
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Log that token creation is pending (frontend will handle the actual creation)
    INSERT INTO activity_logs (
      user_id,
      activity_type,
      description,
      tokenization_id,
      property_id,
      metadata,
      created_at
    ) VALUES (
      NEW.created_by,
      'tokenization_hedera_token_pending',
      'Tokenization approved - Hedera token creation pending',
      NEW.id,
      NEW.property_id,
      json_build_object(
        'tokenization_id', NEW.id,
        'token_name', NEW.token_name,
        'token_symbol', NEW.token_symbol,
        'total_supply', NEW.total_supply
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create triggers
DROP TRIGGER IF EXISTS auto_approve_property_trigger ON properties;
CREATE TRIGGER auto_approve_property_trigger
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_property();

DROP TRIGGER IF EXISTS create_property_hcs_topic_trigger ON properties;
CREATE TRIGGER create_property_hcs_topic_trigger
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION create_property_hcs_topic();

DROP TRIGGER IF EXISTS auto_approve_tokenization_trigger ON tokenizations;
CREATE TRIGGER auto_approve_tokenization_trigger
  BEFORE INSERT ON tokenizations
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_tokenization();

DROP TRIGGER IF EXISTS create_hedera_token_trigger ON tokenizations;
CREATE TRIGGER create_hedera_token_trigger
  AFTER UPDATE ON tokenizations
  FOR EACH ROW
  EXECUTE FUNCTION create_hedera_token_trigger();