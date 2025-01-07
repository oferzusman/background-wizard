import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl, fileName } = await req.json()
    console.log('Received request to upload:', { imageUrl, fileName })
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Google credentials
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!clientId || !clientSecret) {
      throw new Error('Google credentials not configured')
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }
    const imageBlob = await imageResponse.blob()

    // Get access token using client credentials
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken || '',
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token response error:', error)
      throw new Error('Failed to get access token')
    }

    const { access_token } = await tokenResponse.json()

    // Create file metadata
    const metadata = {
      name: fileName || `processed_image_${new Date().toISOString()}.png`,
      mimeType: 'image/png',
    }

    // Create multipart request
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: image/png\r\n\r\n';

    // Convert image blob to array buffer
    const imageArrayBuffer = await imageBlob.arrayBuffer()

    // Combine metadata and image data
    const requestBody = new Uint8Array([
      ...new TextEncoder().encode(multipartRequestBody),
      ...new Uint8Array(imageArrayBuffer),
      ...new TextEncoder().encode(close_delim)
    ])

    // Upload to Google Drive
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': requestBody.length.toString(),
        },
        body: requestBody,
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('Upload response error:', error)
      throw new Error('Failed to upload to Google Drive')
    }

    const uploadResult = await uploadResponse.json()
    console.log('Successfully uploaded file:', uploadResult)

    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadResult.id,
        webViewLink: uploadResult.webViewLink,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})