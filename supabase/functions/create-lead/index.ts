Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      message, 
      propertyId,
      source = 'website',
      utmSource,
      utmMedium,
      utmCampaign
    } = await req.json();

    if (!firstName || !lastName) {
      return new Response(JSON.stringify({ error: 'firstName and lastName are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get source ID
    const sourceRes = await fetch(`${supabaseUrl}/rest/v1/lead_sources?name=eq.${source}&limit=1`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const sources = await sourceRes.json();
    const sourceId = sources[0]?.id || null;

    // Create lead
    const createRes = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        notes: message,
        interested_property_id: propertyId || null,
        lead_source_id: sourceId,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        status: 'new',
        priority: 'medium'
      })
    });

    const lead = await createRes.json();

    return new Response(JSON.stringify({ data: lead }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
