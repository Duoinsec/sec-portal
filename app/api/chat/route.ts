import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { checkRateLimit, validateAndSanitizeInput } from '@/lib/rate-limiter';
import { generateVisualForQuery } from '@/lib/image-service';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

MANDATORY OUTPUT FORMAT:
You MUST ALWAYS respond with a VALID JSON OBJECT matching this exact structure:

{
  "answer": "Clear, comprehensive, and well-structured answer for the student using bullet points, headers, and friendly tone.",
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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured in server environment.' },
        { status: 500 }
      );
    }

    // 3. Build System Message with Student & Knowledge Context
    let systemContent = SYSTEM_PROMPT;
    if (studentContext) {
      systemContent += `\n\nStudent Profile Context:\n${JSON.stringify(studentContext, null, 2)}`;
    }

    // Format chat history
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    }));

    // 4. Groq Completion with JSON Mode + Fallback
    let rawContent = '{}';
    try {
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
    } catch (groqErr: any) {
      console.warn('[Groq JSON Mode Warning] Retrying without strict json_object:', groqErr?.message);
      // Fallback: call without strict json_object to guarantee answer delivery
      const fallbackCompletion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemContent },
          ...formattedMessages,
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });
      rawContent = fallbackCompletion.choices[0]?.message?.content || '{}';
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

    // 5. Visual Pipeline
    let visualUrl: string | null = null;
    let visualLabel = 'AI Generated Visual';

    if (visualRequired && visualType) {
      try {
        const visualResult = await generateVisualForQuery(
          visualType,
          visualPrompt || validation.sanitized,
          validation.sanitized
        );
        visualUrl = visualResult.visual_url;
        visualLabel = visualResult.source_label || 'AI Generated Visual';

        if (visualResult.error) {
          console.warn('[Image Generation Notice]', visualResult.error);
        }
      } catch (visErr: any) {
        // Safe logging: never break chatbot if image generation fails
        console.error('[Visual Generation Error]', visErr?.message || visErr);
        visualUrl = null;
      }
    }

    return NextResponse.json({
      answer,
      reply: answer, // backward compatibility
      visual_required: visualRequired,
      visual_type: visualType,
      visual_prompt: visualPrompt,
      visual_url: visualUrl,
      visual_label: visualLabel,
      sources,
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
