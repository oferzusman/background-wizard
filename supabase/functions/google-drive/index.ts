import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3/files'
const GOOGLE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl, fileName } = await req.json()
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Google credentials from Supabase secrets
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

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
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://www.googleapis.com/auth/drive.file',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const { access_token } = await tokenResponse.json()

    // Create file metadata
    const metadata = {
      name: fileName || `processed_image_${new Date().toISOString()}.png`,
      mimeType: 'image/png',
    }

    // Upload to Google Drive
    const uploadResponse = await fetch(`${GOOGLE_UPLOAD_API}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'multipart/related; boundary=boundary',
      },
      body: `--boundary
Content-Type: application/json

${JSON.stringify(metadata)}

--boundary
Content-Type: image/png

${imageBlob}
--boundary--`,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Google Drive')
    }

    const uploadResult = await uploadResponse.json()

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