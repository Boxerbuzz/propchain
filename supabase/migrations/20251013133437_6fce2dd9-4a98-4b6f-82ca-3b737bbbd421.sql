-- Fix migrate_private_keys_to_vault to use Supabase Vault API
-- Safely replace the existing function to avoid direct writes to vault.secrets
CREATE OR REPLACE FUNCTION public.migrate_private_keys_to_vault()
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
BEGIN
  -- Iterate through wallets that still have an encrypted private key stored and no vault secret id
  FOR wallet_record IN
    SELECT id, hedera_account_id, private_key_encrypted
    FROM public.wallets
    WHERE private_key_encrypted IS NOT NULL
      AND vault_secret_id IS NULL
  LOOP
    BEGIN
      -- Store the private key in Supabase Vault using the supported API
      SELECT vault.create_secret(
        wallet_record.private_key_encrypted,
        'hedera_private_key_' || wallet_record.hedera_account_id,
        'Hedera private key for account ' || wallet_record.hedera_account_id
      ) INTO secret_id;

      -- Update the wallet record with the created vault secret id
      UPDATE public.wallets
      SET vault_secret_id = secret_id
      WHERE id = wallet_record.id;

      migrated_count := migrated_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Count and continue on error to process remaining wallets
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