/**
 * Test script for KYC Webhook Edge Function
 * This demonstrates how to trigger the webhook for testing
 */

// Example payload that would be sent by Supabase webhook
const testPayload = {
  type: 'INSERT',
  record: {
    id: '123e4567-e89b-12d3-a456-426614174000', // KYC verification ID
    user_id: 'f85724d7-84a8-471b-9e5b-63ce7bca9ae0', // User ID
    status: 'pending',
    first_name: 'John',
    last_name: 'Doe',
    id_document_front_url: 'https://example.com/id-front.jpg',
    selfie_url: 'https://example.com/selfie.jpg',
  }
};

// Function to test the webhook locally
async function testKYCWebhook() {
  const webhookUrl = 'http://localhost:54321/functions/v1/kyc-webhook';
  
  try {
    console.log('🧪 Testing KYC Webhook...');
    console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testPayload),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook test successful:', result);
    } else {
      console.error('❌ Webhook test failed:', result);
    }
  } catch (error) {
    console.error('💥 Webhook test error:', error);
  }
}

// Export for use in other scripts
export { testKYCWebhook, testPayload };

// Uncomment to run test
// testKYCWebhook();
