# KYC Webhook Edge Function

This Supabase Edge Function simulates ID validation and automatically updates user KYC status based on webhook triggers.

## Overview

The webhook function:
1. **Receives** KYC submission data via webhook
2. **Simulates** ID validation process (85% approval rate)
3. **Updates** both `kyc_verifications` and `users` tables
4. **Sends** notifications to users about their verification status

## Setup

### 1. Deploy the Function

```bash
# Deploy to Supabase
supabase functions deploy kyc-webhook

# Or test locally
supabase functions serve kyc-webhook
```

### 2. Set Up Database Webhook

Create a webhook trigger in your Supabase database:

```sql
-- Create webhook function
CREATE OR REPLACE FUNCTION trigger_kyc_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for new KYC submissions with pending status
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    PERFORM
      net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/kyc-webhook',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
        body := json_build_object(
          'type', TG_OP,
          'record', row_to_json(NEW)
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER kyc_webhook_trigger
  AFTER INSERT OR UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_kyc_webhook();
```

### 3. Environment Variables

Make sure these are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Usage

### Automatic Triggering

The webhook is automatically triggered when:
- A new KYC verification is inserted with `status = 'pending'`
- An existing KYC verification is updated to `status = 'pending'`

### Manual Testing

You can test the webhook manually:

```typescript
import { testKYCWebhook } from './test';

// Test the webhook
await testKYCWebhook();
```

Or use curl:

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/kyc-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "INSERT",
    "record": {
      "id": "kyc-id",
      "user_id": "user-id",
      "status": "pending",
      "first_name": "John",
      "last_name": "Doe",
      "id_document_front_url": "https://example.com/id.jpg",
      "selfie_url": "https://example.com/selfie.jpg"
    }
  }'
```

## Function Behavior

### Validation Process

The function simulates ID validation with:
- **85% approval rate** (configurable)
- **Random KYC level assignment** (tier_1, tier_2, tier_3)
- **Investment limit calculation** based on KYC level
- **Compliance checks** (PEP, sanctions, adverse media)

### Approval Flow

When approved:
1. Updates `kyc_verifications.status` to `'approved'`
2. Sets `kyc_level` and `investment_limit_ngn`
3. Updates `users.kyc_status` to `'verified'`
4. Sets `expires_at` to 1 year from now
5. Creates success notification

### Rejection Flow

When rejected:
1. Updates `kyc_verifications.status` to `'rejected'`
2. Sets `rejection_reason` with specific feedback
3. Updates `users.kyc_status` to `'rejected'`
4. Creates rejection notification

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "KYC webhook processed successfully",
  "kycId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "f85724d7-84a8-471b-9e5b-63ce7bca9ae0",
  "status": "approved"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to update KYC verification: ..."
}
```

## Integration with Frontend

The webhook works seamlessly with the existing KYC flow:

1. **User submits KYC** → `kycService.submitKYCVerification()`
2. **Database trigger fires** → Webhook is called automatically
3. **Webhook processes** → Updates tables and sends notifications
4. **User sees notification** → Dashboard updates with new status

## Customization

### Modify Approval Rate

Change the approval rate in the `simulateIDValidation` function:

```typescript
// Current: 85% approval rate
const isValid = Math.random() > 0.15;

// Change to 90% approval rate
const isValid = Math.random() > 0.1;
```

### Add Real Validation

Replace the mock validation with real ID verification services:

```typescript
async function simulateIDValidation(record) {
  // Replace with actual API calls to:
  // - Smile Identity
  // - YouVerify
  // - Verified Africa
  // - etc.
}
```

### Custom Rejection Reasons

Modify the `rejectionReasons` array to include your specific validation criteria.

## Monitoring

The function logs all activities:
- Webhook reception
- Validation results
- Database updates
- Notification creation
- Errors and exceptions

Check Supabase logs for debugging and monitoring.
