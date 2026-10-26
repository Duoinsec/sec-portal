import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface PixabayImage {
  id: number;
  tags: string;
  preview_url: string;
  web_format_url: string;
  large_image_url: string;
  page_url: string;
  user: string;
  explanation?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.q || '').trim();
    const perPage = Math.min(Math.max(Number(body.per_page) || 6, 1), 20);
    const explain = body.explain !== false;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Query must be at least 2 characters long.', images: [] },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.substring(0, 100);

    // 1. Try invoking Supabase Edge Function first if configured/deployed
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('search-images', {
        body: { query: sanitizedQuery, per_page: perPage, explain },
      });

      if (!edgeError && edgeData && Array.isArray(edgeData.images)) {
        return NextResponse.json(edgeData);
      }
    } catch {
      // Fall through to local server-side implementation
    }

    // 2. Server-side Pixabay execution
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (!pixabayKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIXABAY_API_KEY is not configured in environment variables or Supabase Edge Function Secrets.',
          images: [],
        },
        { status: 503 }
      );
    }

    const pixabayUrl = new URL('https://pixabay.com/api/');
    pixabayUrl.searchParams.set('key', pixabayKey);
    pixabayUrl.searchParams.set('q', sanitizedQuery);
    pixabayUrl.searchParams.set('image_type', 'all');
    pixabayUrl.searchParams.set('safesearch', 'true');
    pixabayUrl.searchParams.set('per_page', String(perPage));
    pixabayUrl.searchParams.set('orientation', 'horizontal');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const pixabayRes = await fetch(pixabayUrl.toString(), {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!pixabayRes.ok) {
      if (pixabayRes.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Pixabay rate limit reached. Please wait a moment.', images: [] },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Pixabay API returned status ${pixabayRes.status}`, images: [] },
        { status: pixabayRes.status }
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

    // 3. Optional Gemini Explanation for top image
    const geminiKey = process.env.GEMINI_API_KEY;
    if (explain && geminiKey && images.length > 0) {
      try {
        const topImage = images[0];
        const geminiPrompt = `In 1 or 2 concise, academic sentences, explain how an image depicting "${topImage.tags}" illustrates the engineering/academic concept of "${sanitizedQuery}".`;

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
      } catch (err) {
        console.warn('[Gemini Vision Notice] Image explanation skipped:', err);
      }
    }

    return NextResponse.json({
      success: true,
      query: sanitizedQuery,
      total: pixabayData.totalHits || images.length,
      images,
      source: 'Pixabay Official API',
    });
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    return NextResponse.json(
      { success: false, error: isTimeout ? 'Pixabay request timed out.' : 'Failed to search images.', images: [] },
      { status: 500 }
    );
  }
}
