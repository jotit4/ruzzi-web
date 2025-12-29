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
      minPrice, 
      maxPrice, 
      propertyType, 
      bedrooms, 
      bathrooms, 
      status,
      city,
      featured,
      limit = 20,
      offset = 0 
    } = await req.json();

    let url = `${supabaseUrl}/rest/v1/properties?select=*&is_published=eq.true`;

    if (minPrice) url += `&price=gte.${minPrice}`;
    if (maxPrice) url += `&price=lte.${maxPrice}`;
    if (propertyType) url += `&property_type_id=eq.${propertyType}`;
    if (bedrooms) url += `&bedrooms=gte.${bedrooms}`;
    if (bathrooms) url += `&bathrooms=gte.${bathrooms}`;
    if (status) url += `&status=eq.${status}`;
    if (city) url += `&address=ilike.*${city}*`;
    if (featured !== undefined) url += `&is_featured=eq.${featured}`;

    url += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

    const res = await fetch(url, {
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });

    const properties = await res.json();
    const totalCount = res.headers.get('content-range')?.split('/')[1] || '0';

    // Fetch images and features separately if we have properties
    if (Array.isArray(properties) && properties.length > 0) {
      const propIds = properties.map((p: { id: string }) => p.id);
      
      const [imagesRes, featuresRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/property_images?property_id=in.(${propIds.join(',')})`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/property_features?property_id=in.(${propIds.join(',')})`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
      ]);

      const images = await imagesRes.json();
      const features = await featuresRes.json();

      // Attach to properties
      properties.forEach((p: { id: string; images?: unknown[]; features?: unknown[] }) => {
        p.images = Array.isArray(images) ? images.filter((img: { property_id: string }) => img.property_id === p.id) : [];
        p.features = Array.isArray(features) ? features.filter((f: { property_id: string }) => f.property_id === p.id) : [];
      });
    }

    return new Response(JSON.stringify({ 
      data: properties, 
      total: parseInt(totalCount),
      limit,
      offset 
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
