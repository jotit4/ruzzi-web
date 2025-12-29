import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
}

interface SearchFilters {
  query?: string;
  status?: string;
  property_type_id?: string;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  province?: string;
  is_featured?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'created_desc' | 'created_asc';
  limit?: number;
  offset?: number;
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

    // Get user from JWT (optional for public search)
    const authHeader = req.headers.get('Authorization')
    
    const { filters } = await req.json()

    console.log(`[SEARCH ENGINE] Search query: ${filters?.query || 'no query'}`)

    const results = await performSearch(supabaseUrl, supabaseHeaders, authHeader, filters as SearchFilters)

    return new Response(
      JSON.stringify({ data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[SEARCH ENGINE] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performSearch(supabaseUrl: string, headers: any, authHeader: string | null, filters: SearchFilters) {
  // Build base query
  let query = `${supabaseUrl}/rest/v1/properties?select=*,property_types(name,display_name),developments(name,location,city,province)`

  // Only show published properties for public search
  query += '&is_published=eq.true'

  // Apply filters
  const conditions = []

  // Text search
  if (filters.query && filters.query.trim()) {
    const searchTerm = filters.query.trim()
    conditions.push(`or=(title.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*,address.ilike.*${searchTerm}*,developments.name.ilike.*${searchTerm}*,developments.location.ilike.*${searchTerm}*)`)
  }

  // Status filter
  if (filters.status) {
    conditions.push(`status=eq.${filters.status}`)
  }

  // Property type filter
  if (filters.property_type_id) {
    conditions.push(`property_type_id=eq.${filters.property_type_id}`)
  }

  // Price range
  if (filters.price_min) {
    conditions.push(`price=gte.${filters.price_min}`)
  }
  if (filters.price_max) {
    conditions.push(`price=lte.${filters.price_max}`)
  }

  // Area range
  if (filters.area_min) {
    conditions.push(`area_total=gte.${filters.area_min}`)
  }
  if (filters.area_max) {
    conditions.push(`area_total=lte.${filters.area_max}`)
  }

  // Bedrooms
  if (filters.bedrooms) {
    conditions.push(`bedrooms=eq.${filters.bedrooms}`)
  }

  // Bathrooms
  if (filters.bathrooms) {
    conditions.push(`bathrooms=eq.${filters.bathrooms}`)
  }

  // Location filters
  if (filters.city) {
    conditions.push(`developments.city.ilike.*${filters.city}*`)
  }
  if (filters.province) {
    conditions.push(`developments.province.ilike.*${filters.province}*`)
  }

  // Featured properties
  if (filters.is_featured) {
    conditions.push(`is_featured=eq.true`)
  }

  // Add conditions to query
  if (conditions.length > 0) {
    query += '&' + conditions.join('&')
  }

  // Sorting
  let orderBy = 'created_at.desc' // default
  switch (filters.sort_by) {
    case 'price_asc':
      orderBy = 'price.asc'
      break
    case 'price_desc':
      orderBy = 'price.desc'
      break
    case 'created_asc':
      orderBy = 'created_at.asc'
      break
    case 'created_desc':
      orderBy = 'created_at.desc'
      break
  }
  query += `&order=${orderBy}`

  // Pagination
  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query += `&limit=${limit}&offset=${offset}`

  console.log(`[SEARCH ENGINE] Query: ${query}`)

  // Execute search
  const response = await fetch(query, {
    headers: {
      ...headers,
      'Authorization': authHeader || headers.apikey
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error en búsqueda: ${error}`)
  }

  const properties = await response.json()

  // Get total count for pagination
  let totalCount = properties.length
  if (properties.length === limit) {
    // Try to get actual count
    try {
      let countQuery = `${supabaseUrl}/rest/v1/properties?select=count`
      countQuery += '&is_published=eq.true'
      if (conditions.length > 0) {
        countQuery += '&' + conditions.join('&')
      }

      const countResponse = await fetch(countQuery, {
        headers: {
          'Prefer': 'count=exact',
          ...headers,
          'Authorization': authHeader || headers.apikey
        }
      })

      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('Content-Range')
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)$/)
          if (match) {
            totalCount = parseInt(match[1])
          }
        }
      }
    } catch (e) {
      // Fallback to actual results length
    }
  }

  // Enhance results with additional data
  const enhancedResults = properties.map((property: any) => ({
    ...property,
    // Calculate price per square meter
    price_per_m2: property.area_total && property.area_total > 0 
      ? Math.round(property.price / property.area_total) 
      : null,
    // Add location summary
    location_summary: property.developments 
      ? `${property.developments.city}, ${property.developments.province}`
      : property.address || 'Ubicación no especificada',
    // Add type display name
    type_display: property.property_types?.display_name || 'No especificado'
  }))

  // Calculate search facets for UI
  const facets = await calculateSearchFacets(supabaseUrl, headers, authHeader, conditions)

  console.log(`[SEARCH ENGINE] Search completed: ${properties.length} results, ${totalCount} total`)

  return {
    properties: enhancedResults,
    pagination: {
      total: totalCount,
      limit: limit,
      offset: offset,
      hasMore: (offset + properties.length) < totalCount
    },
    facets: facets,
    applied_filters: filters
  }
}

async function calculateSearchFacets(supabaseUrl: string, headers: any, authHeader: string | null, conditions: string[]) {
  // This would typically be done with database aggregations
  // For now, we'll return basic facet information
  
  const baseQuery = `${supabaseUrl}/rest/v1/properties?select=status,property_types(name,display_name),developments(province)`
  const facetQuery = baseQuery + (conditions.length > 0 ? '&' + conditions.join('&') : '')

  try {
    const response = await fetch(facetQuery, {
      headers: {
        ...headers,
        'Authorization': authHeader || headers.apikey
      }
    })

    if (response.ok) {
      const properties = await response.json()
      
      // Calculate facets
      const statusFacet = properties.reduce((acc: any, prop: any) => {
        acc[prop.status] = (acc[prop.status] || 0) + 1
        return acc
      }, {})

      const typeFacet = properties.reduce((acc: any, prop: any) => {
        if (prop.property_types) {
          const typeName = prop.property_types.display_name
          acc[typeName] = (acc[typeName] || 0) + 1
        }
        return acc
      }, {})

      const provinceFacet = properties.reduce((acc: any, prop: any) => {
        if (prop.developments?.province) {
          acc[prop.developments.province] = (acc[prop.developments.province] || 0) + 1
        }
        return acc
      }, {})

      return {
        status: statusFacet,
        property_types: typeFacet,
        provinces: provinceFacet
      }
    }
  } catch (e) {
    console.log('[SEARCH ENGINE] Could not calculate facets')
  }

  return {
    status: {},
    property_types: {},
    provinces: {}
  }
}
