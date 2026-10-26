import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { checkRateLimit, validateAndSanitizeInput } from '@/lib/rate-limiter';
import { generateVisualForQuery } from '@/lib/image-service';

export const dynamic = 'force-dynamic';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

async function generateWithGemini(
  systemContent: string,
  messages: any[],
  apiKey: string
): Promise<string | null> {
  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '') }],
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemContent }],
    },
    contents,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.5,
      maxOutputTokens: 2500,
    },
  };

  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini API Warning - ${model}]`, res.status, errText);
      }
    } catch (err: any) {
      console.warn(`[Gemini API Network Exception - ${model}]`, err?.message || err);
    }
  }
  return null;
}

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

async function fetchPixabayImages(query: string, limit = 4): Promise<{ images: PixabayImage[]; error?: string }> {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey) {
    return {
      images: [],
      error: 'PIXABAY_API_KEY is not configured in server environment or Supabase Secrets.',
    };
  }

  try {
    const cleanQuery = query
      .replace(/explain|tell me about|what is|how to|can you|describe|show me|architecture of|diagram of/gi, '')
      .trim() || query;

    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', pixabayKey);
    url.searchParams.set('q', cleanQuery.substring(0, 100));
    url.searchParams.set('image_type', 'all');
    url.searchParams.set('safesearch', 'true');
    url.searchParams.set('per_page', String(limit));
    url.searchParams.set('orientation', 'horizontal');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), { signal: controller.signal }).finally(() => clearTimeout(timeout));
    if (!res.ok) {
      return { images: [], error: `Pixabay API returned status ${res.status}` };
    }

    const data = await res.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];
    const images: PixabayImage[] = hits.map((hit: any) => ({
      id: hit.id,
      tags: hit.tags || '',
      preview_url: hit.previewURL || hit.webformatURL,
      web_format_url: hit.webformatURL,
      large_image_url: hit.largeImageURL || hit.webformatURL,
      page_url: hit.pageURL,
      user: hit.user || 'Pixabay Contributor',
    }));

    return { images };
  } catch (err: any) {
    return { images: [], error: err?.message || 'Failed to search Pixabay images' };
  }
}

async function explainImagesWithGemini(
  images: PixabayImage[],
  query: string,
  apiKey: string
): Promise<void> {
  if (!apiKey || images.length === 0) return;
  const targetImages = images.slice(0, 2);
  for (const img of targetImages) {
    try {
      const prompt = `You are an engineering professor at Sengunthar Engineering College. In 1 or 2 concise, clear sentences, explain how an image depicting "${img.tags}" connects with the student's question on "${query}". Highlight the academic concept.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 140, temperature: 0.4 },
          }),
        }
      );
      if (res.ok) {
        const d = await res.json();
        const exp = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (exp) {
          img.explanation = exp;
        }
      }
    } catch {
      // Continue if explanation fails
    }
  }
}

const SYSTEM_PROMPT = `You are SEC AI Assistant — the official AI chatbot for Sengunthar Engineering College (SEC), Tiruchengode, Tamil Nadu.
Project: "AI-Powered College Assistant Chatbot using NLP". Affiliated to Anna University, NAAC 'A' accredited.

You are equipped with Query Understanding, Intent Detection, and Visual Requirement Analysis.

KNOWLEDGE SOURCES:
You draw answers from the College Knowledge Base, which includes:
- Uploaded college documents (PDF, DOCX, XLSX)
- Anna University Curriculum & Regulations 2021
- SEC Department Handbooks (AI & DS, CSE, ECE, EEE, MECH, CIVIL)
- Examination, Attendance (75% mandatory), and Fee Regulations
- Training & Placement Cell Drive Guidelines (Zoho, TCS, Infosys, Wipro)
- Campus Facility Guide (Hostels, Digital Library, Labs, Auditorium)

VISUAL TYPES YOU SUPPORT:
- educational_diagram
- system_architecture
- workflow
- flowchart
- process_diagram
- infographic
- concept_illustration
- chart

INTELLIGENT VISUAL DECISION RULE:
Do NOT generate a visual for every question.
Set "visual_required": true ONLY when the answer benefits from a visual explanation:
- Questions asking for architecture, system design, layout, workflow, flowchart, pipeline, steps, concepts, or visual representation.
- When student asks "Explain the architecture of our College Assistant Chatbot", "Show the architecture", "Campus layout", "Placement process flowchart", "AI & DS model pipeline", etc.
For normal conversational, factual, or simple text questions (e.g. "What is the passing mark?", "Who is the HOD?"), set "visual_required": false.

PEDAGOGICAL TEACHING STYLE (ALWAYS USE PRACTICAL SAMPLES & EXAMPLES):
- For EVERY concept or technical topic, ALWAYS include an intuitive, real-world **Practical Sample / Analogy** (e.g. comparing Neural Networks to a medical diagnosis workflow or facial recognition at an airport; comparing B-Trees to a library indexing system; comparing Transformers to electrical grid distribution).
- When explaining algorithms, coding, or mathematical concepts, provide a concise **Working Code / Calculation Sample** (e.g., Python snippet, mathematical step with sample numbers).
- Use clear visual structuring:
  1. 📌 **Concept Definition** (Clear & concise)
  2. 💡 **Real-World Sample / Relatable Analogy** (Real-life practical scenario)
  3. ⚙️ **Architecture / Step-by-Step Breakdown**
  4. 💻 **Sample Implementation / Code Example** (if relevant)
  5. 🎓 **Exam / Viva Key Takeaway**

MANDATORY OUTPUT FORMAT:
You MUST ALWAYS respond with a VALID JSON OBJECT matching this exact structure:

{
  "answer": "Clear, comprehensive, and well-structured answer for the student using bullet points, headers, bold text, and ALWAYS featuring a clear Real-World Sample / Example section.",
  "visual_required": true or false,
  "visual_type": "system_architecture" | "educational_diagram" | "workflow" | "flowchart" | "process_diagram" | "infographic" | "concept_illustration" | "chart" | null,
  "visual_prompt": "Detailed descriptive visual synthesis prompt describing what the diagram or visual illustrates" | null,
  "sources": ["College Knowledge Base", "Curriculum Regulation 2021", etc.]
}

For system architecture questions about the College Assistant Chatbot, provide a thorough explanation of all 10 layers (Student, Web/Mobile UI, Auth, Backend API, Query Processing, NLP/Intent, Knowledge Base, Supabase DB/Storage, Groq AI Model, Response Generation, Visual Decision).`;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 40, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 2. Validate Body
    const body = await req.json();
    const { messages, studentContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty messages payload.' }, { status: 400 });
    }

    const lastMsg = messages[messages.length - 1];
    const validation = validateAndSanitizeInput(lastMsg?.content);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyDuKXduKLosFrJS_yEzDGqKxFm1kF9kFAA';

    if (!geminiKey && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI API key is not configured in server environment.' },
        { status: 500 }
      );
    }

    // 3. Build System Message with Student & Knowledge Context
    let systemContent = SYSTEM_PROMPT;
    if (studentContext) {
      systemContent += `\n\nStudent Profile Context:\n${JSON.stringify(studentContext, null, 2)}`;
    }

    // 4. Primary: Generate using Google Gemini
    let rawContent = '{}';
    let providerUsed = 'unknown';

    if (geminiKey) {
      try {
        const geminiResult = await generateWithGemini(systemContent, messages, geminiKey);
        if (geminiResult) {
          rawContent = geminiResult;
          providerUsed = 'gemini';
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini Call Warning] Falling back to secondary engine:', geminiErr?.message);
      }
    }

    // Secondary fallback: Groq (if Gemini was not successful and Groq is configured)
    if (providerUsed !== 'gemini' && process.env.GROQ_API_KEY) {
      try {
        const formattedMessages: ChatCompletionMessageParam[] = messages.map((m: any) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: String(m.content || ''),
        }));

        const completion = await groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemContent },
            ...formattedMessages,
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2200,
          temperature: 0.5,
        });
        rawContent = completion.choices[0]?.message?.content || '{}';
        providerUsed = 'groq';
      } catch (groqErr: any) {
        console.warn('[Groq Fallback Warning]', groqErr?.message);
      }
    }

    let parsedResponse: any;
    try {
      // Find JSON object boundaries if wrapped in text or markdown code fences
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const toParse = jsonMatch ? jsonMatch[0] : rawContent;
      parsedResponse = JSON.parse(toParse);
    } catch (parseErr) {
      console.warn('[Groq JSON Parse Notice] Using text answer directly.');
      // Extract answer directly from raw string
      parsedResponse = {
        answer: rawContent.replace(/```json/g, '').replace(/```/g, '').trim(),
        visual_required: validation.sanitized.toLowerCase().includes('architecture') || validation.sanitized.toLowerCase().includes('flowchart'),
        visual_type: validation.sanitized.toLowerCase().includes('architecture') ? 'system_architecture' : null,
        visual_prompt: validation.sanitized,
        sources: ['College Knowledge Base'],
      };
    }

    const answer = parsedResponse.answer || 'I could not generate an answer. Please try again.';
    const visualRequired = Boolean(parsedResponse.visual_required);
    const visualType = parsedResponse.visual_type || null;
    const visualPrompt = parsedResponse.visual_prompt || null;
    const sources = Array.isArray(parsedResponse.sources) && parsedResponse.sources.length > 0
      ? parsedResponse.sources
      : ['College Knowledge Base'];


    // 5. Real Pixabay Images Search + Gemini Explanation
    let realImages: PixabayImage[] = [];
    let pixabayError: string | null = null;
    try {
      const pixabayResult = await fetchPixabayImages(validation.sanitized, 4);
      realImages = pixabayResult.images;
      pixabayError = pixabayResult.error || null;

      if (realImages.length > 0 && geminiKey) {
        await explainImagesWithGemini(realImages, validation.sanitized, geminiKey);
      }
    } catch (pixErr: any) {
      console.warn('[Pixabay Pipeline Warning]', pixErr?.message || pixErr);
      pixabayError = pixErr?.message || 'Error loading Pixabay images';
    }

    // 6. Visual Pipeline (AI Generated Illustration)
    let visualUrl: string | null = null;
    let visualLabel = 'AI Generated Educational Illustration';

    if (visualRequired && visualType) {
      try {
        const visualResult = await generateVisualForQuery(
          visualType,
          visualPrompt || validation.sanitized,
          validation.sanitized
        );
        visualUrl = visualResult.visual_url;
        visualLabel = visualResult.source_label || 'AI Generated Educational Illustration';

        if (visualResult.error) {
          console.warn('[Image Generation Notice]', visualResult.error);
        }
      } catch (visErr: any) {
        console.error('[Visual Generation Error]', visErr?.message || visErr);
        visualUrl = null;
      }
    }

    const allSources = [...sources];
    if (realImages.length > 0 && !allSources.includes('Pixabay API')) {
      allSources.push('Pixabay API');
    }

    return NextResponse.json({
      answer,
      reply: answer, // backward compatibility
      visual_required: visualRequired,
      visual_type: visualType,
      visual_prompt: visualPrompt,
      visual_url: visualUrl,
      visual_label: visualLabel,
      real_images: realImages,
      pixabay_error: pixabayError,
      sources: allSources,
    });
  } catch (error: any) {
    console.error('[Groq Chat Error]', error?.message || error);

    if (error?.status === 401 || error?.message?.includes('api_key')) {
      return NextResponse.json(
        { error: 'Invalid Groq API key in server configuration.' },
        { status: 500 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached on AI engine. Please wait a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing question.' },
      { status: 500 }
    );
  }
}
