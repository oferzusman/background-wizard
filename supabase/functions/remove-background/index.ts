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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { imageUrl } = await req.json();
    console.log('Processing image:', imageUrl);

    // Fetch the image with custom headers
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    console.log('Successfully fetched image, size:', imageBlob.size);

    // Create form data for Stability AI
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('output_format', 'png');

    // Call Stability AI API
    console.log('Calling Stability AI API...');
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
    
    // Store the processed image in Supabase Storage
    const fileName = `${crypto.randomUUID()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('processed-images')
      .upload(fileName, processedImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Failed to upload to storage:', uploadError);
      throw new Error('Failed to store processed image');
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('processed-images')
      .getPublicUrl(fileName);

    // Store the reference in the database
    const { error: dbError } = await supabase
      .from('processed_images')
      .insert({
        original_url: imageUrl,
        processed_url: publicUrl,
      });

    if (dbError) {
      console.error('Failed to store in database:', dbError);
      throw new Error('Failed to store image reference');
    }

    return new Response(
      JSON.stringify({ processedUrl: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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