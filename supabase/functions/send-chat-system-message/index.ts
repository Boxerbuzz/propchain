import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { room_id, message_text, message_type = 'system', metadata = {} } = await req.json();

    if (!room_id || !message_text) {
      return new Response(
        JSON.stringify({ error: 'room_id and message_text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[SYSTEM-MESSAGE] Sending message to room ${room_id}`);

    // Verify room exists
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      console.error('[SYSTEM-MESSAGE] Room not found:', roomError);
      return new Response(
        JSON.stringify({ error: 'Chat room not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert system message (sender_id is NULL for system messages)
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        room_id,
        sender_id: null, // System message has no sender
        message_text,
        message_type,
        metadata: {
          is_system: true,
          ...metadata
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('[SYSTEM-MESSAGE] Failed to insert message:', messageError);
      return new Response(
        JSON.stringify({ error: messageError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SYSTEM-MESSAGE] Message sent successfully: ${message.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'System message sent successfully',
        data: message
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SYSTEM-MESSAGE] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
