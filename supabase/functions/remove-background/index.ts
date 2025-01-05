import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');
    if (!STABILITY_API_KEY) {
      throw new Error('Missing Stability API key');
    }

    // Get the request body
    const body = await req.json();
    const imageUrl = body.imageUrl;

    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    console.log('Fetching image from URL:', imageUrl);

    // Fetch the image ourselves to avoid CORS issues
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from URL');
    }

    const imageBlob = await imageResponse.blob();
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');

    console.log('Sending image to Stability AI...');
    const stabilityResponse = await fetch(
      'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'image/*',
        },
        body: formData,
      }
    );

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      console.error('Stability AI API error:', stabilityResponse.status, errorText);
      throw new Error(`Stability AI API error: ${stabilityResponse.status} - ${errorText}`);
    }

    console.log('Successfully processed image with Stability AI');
    const processedImageBuffer = await stabilityResponse.arrayBuffer();
    
    // Convert ArrayBuffer to base64
    const uint8Array = new Uint8Array(processedImageBuffer);
    const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    const base64 = btoa(binary);

    return new Response(
      JSON.stringify({ data: base64 }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in remove-background function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});