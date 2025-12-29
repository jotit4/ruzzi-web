import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
}

interface PropertyData {
  id?: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  property_type_id: string | null;
  development_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  area_total: number | null;
  area_built: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  status: 'available' | 'reserved' | 'sold' | 'under_construction';
  availability_date: string | null;
  commission_rate: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_by: string | null;
  updated_by: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabaseHeaders = {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    }

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorización requerido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, data } = await req.json()

    console.log(`[PROPERTIES CRUD] ${action} - User: ${authHeader.substring(0, 20)}...`)

    let result

    switch (action) {
      case 'create':
        result = await createProperty(supabaseUrl, supabaseHeaders, authHeader, data as PropertyData)
        break
      case 'update':
        result = await updateProperty(supabaseUrl, supabaseHeaders, authHeader, data as PropertyData)
        break
      case 'delete':
        result = await deleteProperty(supabaseUrl, supabaseHeaders, authHeader, data.id)
        break
      case 'list':
        result = await listProperties(supabaseUrl, supabaseHeaders, authHeader, data?.filters)
        break
      case 'get':
        result = await getProperty(supabaseUrl, supabaseHeaders, authHeader, data.id)
        break
      default:
        throw new Error(`Acción no válida: ${action}`)
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[PROPERTIES CRUD] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createProperty(supabaseUrl: string, headers: any, authHeader: string, data: PropertyData) {
  // Validate data
  validatePropertyData(data)

  // Get user info first
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': authHeader }
  })

  if (!userResponse.ok) {
    throw new Error('Usuario no autenticado')
  }

  const user = await userResponse.json()

  // Prepare property data
  const propertyData = {
    ...data,
    created_by: user.id,
    updated_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Insert property
  const response = await fetch(`${supabaseUrl}/rest/v1/properties`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(propertyData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al crear propiedad: ${error}`)
  }

  const property = await response.json()
  console.log(`[PROPERTIES CRUD] Propiedad creada: ${property[0]?.id}`)

  return property[0]
}

async function updateProperty(supabaseUrl: string, headers: any, authHeader: string, data: PropertyData) {
  if (!data.id) {
    throw new Error('ID de propiedad requerido para actualización')
  }

  validatePropertyData(data)

  // Get user info
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': authHeader }
  })

  if (!userResponse.ok) {
    throw new Error('Usuario no autenticado')
  }

  const user = await userResponse.json()

  // Prepare update data
  const updateData = {
    ...data,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }

  // Update property
  const response = await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${data.id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updateData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al actualizar propiedad: ${error}`)
  }

  const property = await response.json()
  console.log(`[PROPERTIES CRUD] Propiedad actualizada: ${data.id}`)

  return property[0]
}

async function deleteProperty(supabaseUrl: string, headers: any, authHeader: string, propertyId: string) {
  if (!propertyId) {
    throw new Error('ID de propiedad requerido para eliminación')
  }

  // Delete property
  const response = await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}`, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al eliminar propiedad: ${error}`)
  }

  console.log(`[PROPERTIES CRUD] Propiedad eliminada: ${propertyId}`)
  return { success: true, id: propertyId }
}

async function listProperties(supabaseUrl: string, headers: any, authHeader: string, filters?: any) {
  // Simplified query without joins for immediate functionality
  let query = `${supabaseUrl}/rest/v1/properties?select=*`

  // Apply filters
  if (filters) {
    if (filters.status) {
      query += `&status=eq.${filters.status}`
    }
    if (filters.property_type_id) {
      query += `&property_type_id=eq.${filters.property_type_id}`
    }
    if (filters.price_min) {
      query += `&price=gte.${filters.price_min}`
    }
    if (filters.price_max) {
      query += `&price=lte.${filters.price_max}`
    }
    if (filters.city) {
      query += `&address=ilike.*${filters.city}*`
    }
    if (filters.search) {
      query += `&or=(title.ilike.*${filters.search}*,description.ilike.*${filters.search}*)`
    }
  }

  // Order by creation date
  query += '&order=created_at.desc'

  // Apply limit
  if (filters?.limit) {
    query += `&limit=${filters.limit}`
  } else {
    query += '&limit=50'
  }

  const response = await fetch(query, {
    headers: {
      ...headers,
      'Authorization': authHeader
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al obtener propiedades: ${error}`)
  }

  const properties = await response.json()
  console.log(`[PROPERTIES CRUD] Lista obtenida: ${properties.length} propiedades`)

  return properties || []
}

async function getProperty(supabaseUrl: string, headers: any, authHeader: string, propertyId: string) {
  if (!propertyId) {
    throw new Error('ID de propiedad requerido')
  }

  const query = `${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}&select=*`

  const response = await fetch(query, {
    headers: {
      ...headers,
      'Authorization': authHeader
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al obtener propiedad: ${error}`)
  }

  const properties = await response.json()
  
  if (properties.length === 0) {
    throw new Error('Propiedad no encontrada')
  }

  console.log(`[PROPERTIES CRUD] Propiedad obtenida: ${propertyId}`)
  return properties[0]
}

function validatePropertyData(data: PropertyData) {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres')
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres')
  }

  if (!data.price || data.price <= 0) {
    errors.push('El precio debe ser mayor a 0')
  }

  if (!['available', 'reserved', 'sold', 'under_construction'].includes(data.status)) {
    errors.push('Estado de propiedad inválido')
  }

  if (errors.length > 0) {
    throw new Error(`Datos inválidos: ${errors.join(', ')}`)
  }
}
