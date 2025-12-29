import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
}

interface BookingData {
  id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  property_id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
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

    // Get user from JWT (optional for public bookings)
    const authHeader = req.headers.get('Authorization')
    let user = null
    
    if (authHeader) {
      try {
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: { 'Authorization': authHeader }
        })
        if (userResponse.ok) {
          user = await userResponse.json()
        }
      } catch (e) {
        // Continue without user authentication for public bookings
      }
    }

    const { action, data } = await req.json()

    console.log(`[BOOKINGS CRUD] ${action} - User: ${user?.id || 'anonymous'}`)

    let result

    switch (action) {
      case 'create':
        result = await createBooking(supabaseUrl, supabaseHeaders, user, data as BookingData)
        break
      case 'update':
        result = await updateBooking(supabaseUrl, supabaseHeaders, user, data as BookingData)
        break
      case 'delete':
        result = await deleteBooking(supabaseUrl, supabaseHeaders, user, data.id)
        break
      case 'list':
        result = await listBookings(supabaseUrl, supabaseHeaders, user, data?.filters)
        break
      case 'get':
        result = await getBooking(supabaseUrl, supabaseHeaders, user, data.id)
        break
      default:
        throw new Error(`Acción no válida: ${action}`)
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[BOOKINGS CRUD] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createBooking(supabaseUrl: string, headers: any, user: any, data: Partial<BookingData>) {
  // Set default values for missing fields
  const bookingData = {
    status: 'pending' as const, // Default status
    ...data
  }

  // Validate data
  validateBookingData(bookingData)

  // Insert booking
  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      first_name: bookingData.client_name.split(' ')[0] || bookingData.client_name,
      last_name: bookingData.client_name.split(' ').slice(1).join(' ') || '',
      email: bookingData.client_email,
      phone: bookingData.client_phone,
      interested_property_id: bookingData.property_id,
      status: 'new', // Always use 'new' for initial leads from web forms
      notes: bookingData.notes,
      priority: 'medium',
      lead_source_id: '2a462bdb-e226-416b-ac32-3c4e870395f5', // Valid UUID for web forms
      created_by: user?.id || null
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al crear reserva: ${error}`)
  }

  const booking = await response.json()
  console.log(`[BOOKINGS CRUD] Reserva creada: ${booking[0]?.id}`)

  return booking[0]
}

async function updateBooking(supabaseUrl: string, headers: any, user: any, data: Partial<BookingData>) {
  if (!data.id) {
    throw new Error('ID de reserva requerido para actualización')
  }

  // Validate data (status is optional for updates)
  validateBookingData(data)

  // Prepare update data
  const updateData = {
    ...data,
    updated_by: user?.id || null,
    updated_at: new Date().toISOString()
  }

  // Update booking
  const response = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${data.id}`, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      first_name: data.client_name.split(' ')[0] || data.client_name,
      last_name: data.client_name.split(' ').slice(1).join(' ') || '',
      email: data.client_email,
      phone: data.client_phone,
      interested_property_id: data.property_id,
      status: data.status === 'confirmed' ? 'interested' : 'new',
      notes: data.notes,
      updated_by: user?.id || null,
      updated_at: new Date().toISOString()
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al actualizar reserva: ${error}`)
  }

  const booking = await response.json()
  console.log(`[BOOKINGS CRUD] Reserva actualizada: ${data.id}`)

  return booking[0]
}

async function deleteBooking(supabaseUrl: string, headers: any, user: any, bookingId: string) {
  if (!bookingId) {
    throw new Error('ID de reserva requerido para eliminación')
  }

  // Delete booking
  const response = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${bookingId}`, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al eliminar reserva: ${error}`)
  }

  console.log(`[BOOKINGS CRUD] Reserva eliminada: ${bookingId}`)
  return { success: true, id: bookingId }
}

async function listBookings(supabaseUrl: string, headers: any, user: any, filters?: any) {
  // Simplified query without joins for immediate functionality
  let query = `${supabaseUrl}/rest/v1/leads?select=*`

  // Apply filters
  if (filters) {
    if (filters.status) {
      query += `&status=eq.${filters.status}`
    }
    if (filters.property_id) {
      query += `&interested_property_id=eq.${filters.property_id}`
    }
    if (filters.client_email) {
      query += `&email=ilike.*${filters.client_email}*`
    }
    if (filters.date_from) {
      query += `&created_at=gte.${filters.date_from}`
    }
    if (filters.date_to) {
      query += `&created_at=lte.${filters.date_to}`
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
      'Authorization': user ? `Bearer ${headers.Authorization.split(' ')[1]}` : headers.apikey
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al obtener reservas: ${error}`)
  }

  const bookings = await response.json()
  console.log(`[BOOKINGS CRUD] Lista obtenida: ${bookings.length} reservas`)

  return bookings || []
}

async function getBooking(supabaseUrl: string, headers: any, user: any, bookingId: string) {
  if (!bookingId) {
    throw new Error('ID de reserva requerido')
  }

  const query = `${supabaseUrl}/rest/v1/leads?id=eq.${bookingId}&select=*,properties(title,price),profiles!leads_created_by_fkey(full_name,email)`

  const response = await fetch(query, {
    headers: {
      ...headers,
      'Authorization': user ? `Bearer ${headers.Authorization.split(' ')[1]}` : headers.apikey
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al obtener reserva: ${error}`)
  }

  const bookings = await response.json()
  
  if (bookings.length === 0) {
    throw new Error('Reserva no encontrada')
  }

  console.log(`[BOOKINGS CRUD] Reserva obtenida: ${bookingId}`)
  return bookings[0]
}

function validateBookingData(data: Partial<BookingData>) {
  const errors: string[] = []

  if (!data.client_name || data.client_name.trim().length < 2) {
    errors.push('El nombre del cliente es requerido')
  }

  if (!data.client_email || !isValidEmail(data.client_email)) {
    errors.push('Email del cliente válido es requerido')
  }

  if (!data.client_phone || data.client_phone.trim().length < 7) {
    errors.push('Teléfono del cliente es requerido')
  }

  if (!data.property_id) {
    errors.push('ID de propiedad es requerido')
  }

  // Validate status only if provided
  if (data.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(data.status)) {
    errors.push('Estado de reserva inválido')
  }

  if (errors.length > 0) {
    throw new Error(`Datos inválidos: ${errors.join(', ')}`)
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
