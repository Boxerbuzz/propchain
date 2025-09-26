-- Enable the http extension for making HTTP requests from triggers
create extension if not exists http with schema extensions;

-- Function to create HCS topic when property is approved
CREATE OR REPLACE FUNCTION create_property_hcs_topic()
RETURNS TRIGGER AS $$
DECLARE
  response jsonb;
  edge_function_url text;
BEGIN
  -- Only process when approval_status changes from non-approved to approved
  -- and hcs_topic_id is null
  IF NEW.approval_status = 'approved' 
     AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved')
     AND NEW.hcs_topic_id IS NULL 
  THEN
    -- Get the edge function URL from system environment
    edge_function_url := 'https://zjtqptljuggbymcoovey.supabase.co/functions/v1/create-hcs-topic';
    
    -- Call the edge function to create HCS topic
    SELECT 
      (extensions.http(
        'POST',
        edge_function_url,
        ARRAY[
          extensions.http_header('Content-Type', 'application/json'),
          extensions.http_header('Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true))
        ],
        'application/json',
        json_build_object(
          'memo', 'PropChain Property: ' || NEW.title
        )::text
      )).content::jsonb INTO response;
    
    -- If successful, update the property with the HCS topic ID
    IF response->>'success' = 'true' THEN
      UPDATE properties 
      SET hcs_topic_id = response->'data'->>'topicId'
      WHERE id = NEW.id;
      
      -- Log the successful HCS topic creation
      INSERT INTO activity_logs (
        user_id,
        property_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        NEW.owner_id,
        NEW.id,
        'property_hcs_topic_created',
        'HCS topic created for property: ' || NEW.title,
        json_build_object(
          'hcs_topic_id', response->'data'->>'topicId',
          'transaction_id', response->'data'->>'transactionId'
        ),
        NOW()
      );
    ELSE
      -- Log the failure
      INSERT INTO activity_logs (
        user_id,
        property_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        NEW.owner_id,
        NEW.id,
        'property_hcs_topic_failed',
        'Failed to create HCS topic for property: ' || NEW.title,
        json_build_object('error', response->>'error'),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property approval
CREATE TRIGGER property_hcs_topic_trigger
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION create_property_hcs_topic();