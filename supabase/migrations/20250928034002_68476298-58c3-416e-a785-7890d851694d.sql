-- Enable HTTP extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS http;

-- Create trigger function to handle tokenization approval
CREATE OR REPLACE FUNCTION public.handle_tokenization_approval()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Construct the webhook URL for the tokenization-approved edge function
    webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/tokenization-approved';
    
    -- Log the attempt
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
      'tokenization_webhook_triggered',
      'Tokenization approval webhook triggered',
      NEW.id,
      NEW.property_id,
      json_build_object(
        'tokenization_id', NEW.id,
        'webhook_url', webhook_url
      ),
      NOW()
    );

    -- Make HTTP request to the edge function
    BEGIN
      SELECT status, content INTO response_status, response_body
      FROM http((
        'POST',
        webhook_url,
        ARRAY[
          http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object('tokenizationId', NEW.id)::text
      ));

      -- Log success
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
        'tokenization_webhook_success',
        'Tokenization approval webhook completed successfully',
        NEW.id,
        NEW.property_id,
        json_build_object(
          'tokenization_id', NEW.id,
          'response_status', response_status,
          'response_body', response_body
        ),
        NOW()
      );

    EXCEPTION WHEN OTHERS THEN
      -- Log error
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
        'tokenization_webhook_error',
        'Tokenization approval webhook failed: ' || SQLERRM,
        NEW.id,
        NEW.property_id,
        json_build_object(
          'tokenization_id', NEW.id,
          'error', SQLERRM
        ),
        NOW()
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create trigger on tokenizations table
DROP TRIGGER IF EXISTS tokenization_approval_webhook_trigger ON tokenizations;
CREATE TRIGGER tokenization_approval_webhook_trigger
  AFTER UPDATE ON tokenizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_tokenization_approval();

-- Create system settings for webhook configuration
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES 
  ('supabase_url', '"https://zjtqptljuggbymcoovey.supabase.co"', 'system', 'Supabase project URL for webhooks', false),
  ('service_role_key', '"{{SUPABASE_SERVICE_ROLE_KEY}}"', 'system', 'Service role key for internal API calls', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();