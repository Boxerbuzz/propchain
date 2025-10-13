import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';

export const VaultMigrationButton = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-wallets-to-vault');

      if (error) throw error;

      if (data.success) {
        toast.success(`Migration completed! ${data.migrated_count} wallets migrated to secure Vault storage.`, {
          description: data.error_count > 0 ? `${data.error_count} errors occurred during migration.` : 'All wallets migrated successfully.',
        });
      } else {
        toast.error('Migration failed', {
          description: data.message || 'Please try again or contact support.',
        });
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate wallets', {
        description: error.message || 'Please try again or contact support.',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button
      onClick={handleMigration}
      disabled={isMigrating}
      variant="outline"
      className="gap-2"
    >
      {isMigrating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Migrating to Vault...
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          Migrate to Secure Vault
        </>
      )}
    </Button>
  );
};
