import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
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

    const { action, bucket, fileName, fileType, propertyId } = await req.json()

    console.log(`[FILE UPLOAD] ${action} - Bucket: ${bucket}, File: ${fileName}`)

    let result

    switch (action) {
      case 'generate_upload_url':
        result = await generateUploadUrl(supabaseUrl, supabaseHeaders, authHeader, bucket, fileName, fileType)
        break
      case 'upload_file':
        result = await uploadFile(supabaseUrl, supabaseHeaders, authHeader, bucket, fileName, fileType)
        break
      case 'list_files':
        result = await listFiles(supabaseUrl, supabaseHeaders, authHeader, bucket, propertyId)
        break
      case 'delete_file':
        result = await deleteFile(supabaseUrl, supabaseHeaders, authHeader, bucket, fileName)
        break
      default:
        throw new Error(`Acción no válida: ${action}`)
    }

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[FILE UPLOAD] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateUploadUrl(supabaseUrl: string, headers: any, authHeader: string, bucket: string, fileName: string, fileType: string) {
  // Validate inputs
  if (!bucket || !fileName || !fileType) {
    throw new Error('Bucket, fileName y fileType son requeridos')
  }

  // Generate unique file path
  const timestamp = Date.now()
  const fileExtension = fileName.split('.').pop()
  const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`

  // Generate signed upload URL using correct Supabase API
  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expiresIn: 3600, // 1 hour
      upsert: false,
      paths: [uniqueFileName] // Required paths parameter
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al generar URL de subida: ${error}`)
  }

  const uploadData = await response.json()
  
  console.log(`[FILE UPLOAD] URL generada para: ${uniqueFileName}`)
  
  return {
    uploadUrl: uploadData.signedURL,
    filePath: uniqueFileName,
    fileName: uniqueFileName,
    expiresIn: 3600,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueFileName}`
  }
}

async function uploadFile(supabaseUrl: string, headers: any, authHeader: string, bucket: string, fileName: string, fileType: string) {
  // Get user info
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'Authorization': authHeader }
  })

  if (!userResponse.ok) {
    throw new Error('Usuario no autenticado')
  }

  const user = await userResponse.json()

  // Generate upload URL first
  const uploadUrlData = await generateUploadUrl(supabaseUrl, headers, authHeader, bucket, fileName, fileType)
  
  console.log(`[FILE UPLOAD] Preparado para subir: ${uploadUrlData.filePath}`)
  
  return {
    ...uploadUrlData,
    uploadedBy: user.id,
    uploadedAt: new Date().toISOString()
  }
}

async function listFiles(supabaseUrl: string, headers: any, authHeader: string, bucket: string, propertyId?: string) {
  if (!bucket) {
    throw new Error('Bucket es requerido')
  }

  // Build query
  let query = `${supabaseUrl}/storage/v1/object/list/${bucket}`
  
  const queryParams = new URLSearchParams()
  if (propertyId) {
    queryParams.append('prefix', `${propertyId}/`)
  }
  queryParams.append('limit', '100')
  
  if (queryParams.toString()) {
    query += `?${queryParams.toString()}`
  }

  const response = await fetch(query, {
    headers: {
      ...headers,
      'Authorization': authHeader
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al listar archivos: ${error}`)
  }

  const files = await response.json()
  
  console.log(`[FILE UPLOAD] Archivos listados en ${bucket}: ${files.length} archivos`)
  
  return files.map((file: any) => ({
    name: file.name,
    id: file.id,
    bucket: bucket,
    path: file.name,
    size: file.metadata?.size || 0,
    contentType: file.metadata?.mimetype || 'unknown',
    createdAt: file.created_at,
    updatedAt: file.updated_at,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${file.name}`
  }))
}

async function deleteFile(supabaseUrl: string, headers: any, authHeader: string, bucket: string, filePath: string) {
  if (!bucket || !filePath) {
    throw new Error('Bucket y filePath son requeridos')
  }

  // Delete file from storage
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
    method: 'DELETE',
    headers: {
      ...headers,
      'Authorization': authHeader
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al eliminar archivo: ${error}`)
  }

  console.log(`[FILE UPLOAD] Archivo eliminado: ${bucket}/${filePath}`)
  
  return {
    success: true,
    filePath: filePath,
    bucket: bucket,
    deletedAt: new Date().toISOString()
  }
}
