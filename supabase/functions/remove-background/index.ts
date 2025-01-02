import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

    const { imageUrl } = await req.json();
    console.log('Processing image:', imageUrl);

    // Fetch the image and convert it to a blob
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Create form data
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('output_format', 'png');

    // Call Stability AI API
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
      throw new Error(`Stability AI API error: ${stabilityResponse.status} - ${errorText}`);
    }

    // Get the processed image as array buffer
    const processedImageBuffer = await stabilityResponse.arrayBuffer();
    
    // Return the processed image with appropriate headers
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