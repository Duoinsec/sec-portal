import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { checkRateLimit, validateAndSanitizeInput } from '@/lib/rate-limiter';
import { generateVisualForQuery } from '@/lib/image-service';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

async function generateWithOpenAI(
  systemContent: string,
  messages: any[],
  apiKey: string
): Promise<string | null> {
  const formattedMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    })),
  ];

  const models = ['gpt-4o-mini', 'gpt-4o'];
  for (const model of models) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 2500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return text;
        }
      } else {
        const errText = await res.text();
        console.warn(`[OpenAI ChatGPT Warning - ${model}]`, res.status, errText);
      }
    } catch (err: any) {
      console.warn(`[OpenAI ChatGPT Network Exception - ${model}]`, err?.message || err);
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

export interface TopicSection {
  topic_title: string;
  search_query?: string;
  images?: PixabayImage[];
  content: string;
}

function cleanSearchQuery(q: string): string {
  return q
    .replace(/[0-9]+\.|\d+\)/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\b(explain|tell|me|about|what|is|how|to|can|you|describe|show|architecture|diagram|of|in|and|the|a|an|for|with|use|technology|important|example)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

function extractSectionsFromMarkdown(text: string): { title: string; content: string }[] {
  const headerRegex = /(?:^|\n)(?:###?\s*)?(\d+[\.\)]\s+[^\n]+)/g;
  const matches: { title: string; index: number }[] = [];
  let match;
  while ((match = headerRegex.exec(text)) !== null) {
    matches.push({ title: match[1].trim(), index: match.index });
  }
  if (matches.length >= 2) {
    const sections: { title: string; content: string }[] = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const rawChunk = text.slice(current.index, next ? next.index : undefined);
      const lines = rawChunk.trim().split('\n');
      const title = lines[0].replace(/^###?\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      sections.push({ title, content });
    }
    return sections;
  }
  return [];
}

async function fetchPixabayImages(query: string, limit = 4): Promise<{ images: PixabayImage[]; error?: string }> {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey) {
    return {
      images: [],
    };
  }

  try {
    const cleanQuery = cleanSearchQuery(query) || query;

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

You are equipped with Query Understanding, Intent Detection, Visual Requirement Analysis, and Topic-Wise Image Selection.

KNOWLEDGE SOURCES:
You draw answers from the College Knowledge Base, which includes:
- Uploaded college documents (PDF, DOCX, XLSX)
- Anna University Curriculum & Regulations 2021
- SEC Department Handbooks (AI & DS, CSE, ECE, EEE, MECH, CIVIL)
- Examination, Attendance (75% mandatory), and Fee Regulations
- Training & Placement Cell Drive Guidelines (Zoho, TCS, Infosys, Wipro)
- Campus Facility Guide (Hostels, Digital Library, Labs, Auditorium)

TOPIC-WISE STRUCTURE & SUITABLE IMAGE SELECTION:
When explaining multi-part topics, everyday AI applications, technical concepts, engineering domains, architectures, or practical examples:
Break down your answer into structured "topic_sections" (typically 2 to 4 distinct topics).
For each topic section:
- "topic_title": Numbered topic header with an emoji (e.g. "1. 📱 AI in Face Recognition & Smartphones", "2. ▶️ AI on YouTube, Instagram and Netflix", "3. 🗺️ AI in Google Maps & Navigation", "4. 🏥 AI in Healthcare & Diagnostics").
- "search_query": 2 to 4 clean English keywords describing concrete real-world objects, devices, apps, or technologies suitable for finding stock photos (e.g. "smartphone facial recognition", "youtube netflix smartphone", "google maps navigation traffic", "doctor hospital medical scanner").
- "content": Detailed pedagogical explanation for that specific topic:
  - "How do we use it?" with clear bullet points
  - "Example:" Relatable real-world scenario
  - "AI technology:" Core algorithms, recommendation systems, or engineering models
  - "Important:" Key practical takeaway

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
Set "visual_required": true ONLY when the answer requires an overall architecture flowchart or system diagram (e.g. "Show college assistant chatbot architecture", "Placement workflow flowchart").
For topics with real-world examples and concepts, provide rich "topic_sections".

MANDATORY OUTPUT FORMAT:
You MUST ALWAYS respond with a VALID JSON OBJECT matching this exact structure:

{
  "answer": "Clear introductory summary answering the student's question...",
  "topic_sections": [
    {
      "topic_title": "1. 📱 AI in Smartphones & Facial Recognition",
      "search_query": "smartphone facial recognition biometric",
      "content": "How do we use it?\n- Unlocks smartphone screens using facial geometry.\n- Categorizes photos automatically in photo galleries.\n\nExample: Apple FaceID or Android Smart Lock.\nAI technology: Computer vision, Convolutional Neural Networks (CNNs).\nImportant: Biometric data is stored securely in hardware enclaves."
    },
    {
      "topic_title": "2. ▶️ AI on YouTube, Instagram and Netflix",
      "search_query": "youtube instagram netflix smartphone",
      "content": "How do we use it?\n- YouTube recommends videos based on viewing history.\n- Instagram suggests Reels and explores posts tailored to your tastes.\n- Netflix recommends movies and shows matching user ratings.\n\nExample: Watching technology tutorials leads to more programming recommendations.\nAI technology: Collaborative filtering, Deep Recommender Systems, user-behavior analysis.\nImportant: Recommendations adapt continuously as watch history evolves."
    },
    {
      "topic_title": "3. 🗺️ AI in Google Maps",
      "search_query": "google maps navigation gps traffic",
      "content": "How do we use it?\n- Real-time traffic analysis and optimal route recalculation.\n- Live transit arrival predictions.\n\nExample: Automatically rerouting around highway bottlenecks.\nAI technology: Graph neural networks, predictive traffic models, GPS telemetry.\nImportant: Estimates are dynamic based on live road sensor data."
    }
  ],
  "visual_required": false,
  "visual_type": null,
  "visual_prompt": null,
  "sources": ["College Knowledge Base", "Anna University Curriculum"]
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

    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (!openaiKey && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured in server environment.' },
        { status: 500 }
      );
    }

    // 3. Build System Message with Student & Knowledge Context
    let systemContent = SYSTEM_PROMPT;
    if (studentContext) {
      systemContent += `\n\nStudent Profile Context:\n${JSON.stringify(studentContext, null, 2)}`;
    }

    // 4. Primary: Generate using OpenAI ChatGPT
    let rawContent = '{}';
    let providerUsed = 'unknown';

    if (openaiKey) {
      try {
        const openaiResult = await generateWithOpenAI(systemContent, messages, openaiKey);
        if (openaiResult) {
          rawContent = openaiResult;
          providerUsed = 'openai';
        }
      } catch (openaiErr: any) {
        console.warn('[OpenAI Call Warning] Falling back to secondary engine:', openaiErr?.message);
      }
    }

    // Secondary fallback: Groq (if OpenAI was not successful and Groq is configured)
    if (providerUsed !== 'openai' && process.env.GROQ_API_KEY) {
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


    // 5. Topic-Wise Real Images Search (Pixabay)
    let finalTopicSections: TopicSection[] = [];
    let realImages: PixabayImage[] = [];
    let pixabayError: string | null = null;

    // Check if AI provided topic_sections
    let rawSections: any[] = Array.isArray(parsedResponse.topic_sections) ? parsedResponse.topic_sections : [];

    // Fallback: If not provided as array, try parsing markdown sections from the answer
    if (rawSections.length === 0) {
      const parsedMarkdownSections = extractSectionsFromMarkdown(answer);
      if (parsedMarkdownSections.length > 0) {
        rawSections = parsedMarkdownSections.map((s) => ({
          topic_title: s.title,
          search_query: cleanSearchQuery(s.title),
          content: s.content,
        }));
      }
    }

    if (rawSections.length > 0) {
      // Concurrently fetch 3 images for each topic section (up to 4 sections)
      try {
        finalTopicSections = await Promise.all(
          rawSections.slice(0, 4).map(async (sec: any) => {
            const topicTitle = String(sec.topic_title || '').trim();
            const rawQuery = sec.search_query || topicTitle;
            const cleanQ = cleanSearchQuery(rawQuery) || cleanSearchQuery(topicTitle) || validation.sanitized;
            const { images, error } = await fetchPixabayImages(cleanQ, 3);
            if (error && !pixabayError) pixabayError = error;
            return {
              topic_title: topicTitle,
              search_query: cleanQ,
              content: String(sec.content || ''),
              images: Array.isArray(images) ? images : [],
            };
          })
        );

        // Collect all images for backward compatibility
        finalTopicSections.forEach((sec) => {
          if (sec.images) {
            realImages.push(...sec.images);
          }
        });
      } catch (topicErr: any) {
        console.warn('[Topic Sections Fetch Warning]', topicErr?.message || topicErr);
      }
    }

    // Fallback if no topic sections or images fetched
    if (finalTopicSections.length === 0 || realImages.length === 0) {
      try {
        const pixabayResult = await fetchPixabayImages(validation.sanitized, 3);
        if (pixabayResult.images.length > 0) {
          realImages = pixabayResult.images;
          if (finalTopicSections.length === 0) {
            finalTopicSections = [
              {
                topic_title: validation.sanitized,
                search_query: validation.sanitized,
                content: answer,
                images: realImages,
              },
            ];
          }
        }
        if (pixabayResult.error && !pixabayError) {
          pixabayError = pixabayResult.error;
        }

        // Optional image handling
      } catch (pixErr: any) {
        console.warn('[Image Pipeline Notice]', pixErr?.message || pixErr);
      }
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
      topic_sections: finalTopicSections,
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
