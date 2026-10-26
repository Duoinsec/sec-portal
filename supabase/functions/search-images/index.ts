// Supabase Edge Function: search-images
// Searches Pixabay for real educational/academic images and uses Gemini for vision explanation

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface PixabayImage {
  id: number;
  tags: string;
  preview_url: string;
  web_format_url: string;
  large_image_url: string;
  page_url: string;
  user: string;
  explanation?: string | null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const pixabayKey = Deno.env.get('PIXABAY_API_KEY');
    if (!pixabayKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'PIXABAY_API_KEY is not configured in Supabase Edge Function Secrets. Please set it in your Supabase Dashboard.',
          images: [],
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let query = '';
    let perPage = 6;
    let explainWithGemini = true;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        query = (body.query || body.q || '').trim();
        if (body.per_page) perPage = Math.min(Math.max(Number(body.per_page), 1), 20);
        if (body.explain !== undefined) explainWithGemini = Boolean(body.explain);
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid JSON request body.', images: [] }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const url = new URL(req.url);
      query = (url.searchParams.get('q') || url.searchParams.get('query') || '').trim();
      const p = url.searchParams.get('per_page');
      if (p) perPage = Math.min(Math.max(Number(p), 1), 20);
    }

    // Input validation
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Search query must be at least 2 characters long.',
          images: [],
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (query.length > 100) {
      query = query.substring(0, 100);
    }

    // Prepare Pixabay search URL
    const pixabayUrl = new URL('https://pixabay.com/api/');
    pixabayUrl.searchParams.set('key', pixabayKey);
    pixabayUrl.searchParams.set('q', query);
    pixabayUrl.searchParams.set('image_type', 'all');
    pixabayUrl.searchParams.set('safesearch', 'true');
    pixabayUrl.searchParams.set('per_page', String(perPage));
    pixabayUrl.searchParams.set('orientation', 'horizontal');

    // Call Pixabay with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const pixabayRes = await fetch(pixabayUrl.toString(), {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!pixabayRes.ok) {
      if (pixabayRes.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Pixabay rate limit reached. Please try again shortly.',
            images: [],
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Pixabay API returned status ${pixabayRes.status}.`,
          images: [],
        }),
        { status: pixabayRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pixabayData = await pixabayRes.json();
    const hits = Array.isArray(pixabayData.hits) ? pixabayData.hits : [];

    const images: PixabayImage[] = hits.map((hit: any) => ({
      id: hit.id,
      tags: hit.tags || '',
      preview_url: hit.previewURL || hit.webformatURL,
      web_format_url: hit.webformatURL,
      large_image_url: hit.largeImageURL || hit.webformatURL,
      page_url: hit.pageURL,
      user: hit.user || 'Pixabay Contributor',
    }));

    // Optional Gemini academic explanation for top image
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (explainWithGemini && geminiKey && images.length > 0) {
      try {
        const topImage = images[0];
        const geminiPrompt = `You are SEC AI Assistant. In 1 or 2 concise, academic sentences, explain how an image depicting "${topImage.tags}" relates to the student concept of "${query}". Focus on key engineering or scientific concepts.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
              generationConfig: { maxOutputTokens: 120, temperature: 0.4 },
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const expText = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (expText) {
            topImage.explanation = expText;
          }
        }
      } catch {
        // Silently continue if Gemini explanation times out
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        query,
        total: pixabayData.totalHits || images.length,
        images,
        source: 'Pixabay Official API',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout ? 'Pixabay API request timed out.' : 'Failed to search images.',
        images: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
