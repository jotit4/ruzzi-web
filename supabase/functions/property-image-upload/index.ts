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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;
    const isPrimary = formData.get('isPrimary') === 'true';
    const displayOrder = parseInt(formData.get('displayOrder') as string || '0');

    if (!file || !propertyId) {
      return new Response(JSON.stringify({ error: 'file and propertyId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF allowed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum 10MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Upload to storage
    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/property-images/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: arrayBuffer
    });

    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      return new Response(JSON.stringify({ error: `Upload failed: ${error}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get public URL
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/property-images/${fileName}`;

    // If isPrimary, set all other images to non-primary
    if (isPrimary) {
      await fetch(`${supabaseUrl}/rest/v1/property_images?property_id=eq.${propertyId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_primary: false })
      });
    }

    // Insert record in property_images
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/property_images`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        property_id: propertyId,
        image_url: imageUrl,
        is_primary: isPrimary,
        display_order: displayOrder,
        alt_text: file.name
      })
    });

    const imageRecord = await insertRes.json();

    return new Response(JSON.stringify({ 
      data: imageRecord,
      url: imageUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
