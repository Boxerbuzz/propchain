-- Add vault_secret_id column to wallets table
ALTER TABLE wallets ADD COLUMN vault_secret_id UUID;

-- Create migration function to move existing keys to Vault
CREATE OR REPLACE FUNCTION migrate_private_keys_to_vault()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  wallet_record RECORD;
  secret_id UUID;
  migrated_count INTEGER := 0;
  error_count INTEGER := 0;
  vault_secret RECORD;
BEGIN
  -- Process each wallet with a private key
  FOR wallet_record IN
    SELECT id, user_id, hedera_account_id, private_key_encrypted
    FROM wallets
    WHERE private_key_encrypted IS NOT NULL 
      AND vault_secret_id IS NULL
  LOOP
    BEGIN
      -- Store private key in Vault
      INSERT INTO vault.secrets (secret, name, description)
      VALUES (
        wallet_record.private_key_encrypted,
        'hedera_private_key_' || wallet_record.hedera_account_id,
        'Hedera private key for account ' || wallet_record.hedera_account_id
      )
      RETURNING id INTO secret_id;

      -- Update wallet with vault_secret_id
      UPDATE wallets
      SET vault_secret_id = secret_id
      WHERE id = wallet_record.id;

      migrated_count := migrated_count + 1;

      RAISE NOTICE 'Migrated wallet % to vault secret %', wallet_record.id, secret_id;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Failed to migrate wallet %: %', wallet_record.id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'migrated_count', migrated_count,
    'error_count', error_count,
    'message', format('Migrated %s wallets to Vault, %s errors', migrated_count, error_count)
  );
END;
$$;

-- Create helper function to decrypt private keys (for edge functions)
CREATE OR REPLACE FUNCTION get_wallet_private_key(p_wallet_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  v_vault_secret_id UUID;
  v_private_key TEXT;
BEGIN
  -- Get vault_secret_id from wallet
  SELECT vault_secret_id INTO v_vault_secret_id
  FROM wallets
  WHERE id = p_wallet_id;

  IF v_vault_secret_id IS NULL THEN
    RAISE EXCEPTION 'No vault secret found for wallet';
  END IF;

  -- Decrypt secret from Vault
  SELECT decrypted_secret INTO v_private_key
  FROM vault.decrypted_secrets
  WHERE id = v_vault_secret_id;

  RETURN v_private_key;
END;
$$;

-- Comment on the migration function
COMMENT ON FUNCTION migrate_private_keys_to_vault() IS 'One-time migration function to move private keys from wallets.private_key_encrypted to Supabase Vault';
COMMENT ON FUNCTION get_wallet_private_key(UUID) IS 'Helper function to retrieve decrypted private key from Vault for a given wallet ID';