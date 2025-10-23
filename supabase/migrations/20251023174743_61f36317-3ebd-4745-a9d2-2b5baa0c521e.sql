-- Create a database function to securely store secrets in Vault
-- This wraps the vault.create_secret function so it can be called from edge functions

CREATE OR REPLACE FUNCTION public.create_vault_secret(
  p_secret TEXT,
  p_name TEXT,
  p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_id UUID;
BEGIN
  -- Call vault.create_secret and return the secret ID
  SELECT vault.create_secret(
    p_secret,
    p_name,
    p_description
  ) INTO v_secret_id;
  
  RETURN v_secret_id;
END;
$$;