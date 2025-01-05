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

    // Get the form data from the request
    const formData = await req.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !(imageFile instanceof File)) {
      throw new Error('No image file provided');
    }

    console.log('Received image, sending to Stability AI...');

    // Forward the image to Stability AI
    const stabilityResponse = await fetch(
      'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'image/png',
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

    return new Response(processedImageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
      },
    });
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