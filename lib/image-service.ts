/**
 * Image and Academic Visual Generation Service
 * Handles AI visual synthesis, system architecture mapping, and fallback handling.
 */

export interface VisualResult {
  visual_url: string | null;
  visual_type: string;
  visual_prompt: string;
  source_label: string;
  provider: 'system_architecture' | 'ai_generated' | 'failed' | 'provider_not_configured';
  error?: string;
}

/**
 * Resolves or synthesizes a visual for the student query
 */
export async function generateVisualForQuery(
  visualType: string,
  visualPrompt: string,
  userQuery: string
): Promise<VisualResult> {
  const queryLower = (userQuery || '').toLowerCase();
  const typeLower = (visualType || '').toLowerCase();

  // 0. OFFICIAL COLLEGE EMBLEM / LOGO
  if (
    queryLower.includes('logo') ||
    queryLower.includes('emblem') ||
    queryLower.includes('crest') ||
    queryLower.includes('seal') ||
    queryLower.includes('motto')
  ) {
    return {
      visual_url: '/images/sec-logo.png',
      visual_type: 'college_emblem',
      visual_prompt: 'Official Emblem of Sengunthar Engineering College, Tiruchengode',
      source_label: 'Sengunthar Engineering College Official Emblem (Estd. 2001)',
      provider: 'system_architecture',
    };
  }

  // 1. SYSTEM ARCHITECTURE & COLLEGE ASSISTANT WORKFLOW VISUALS
  // If the query asks for chatbot / portal / campus / placement architecture:
  if (
    typeLower === 'system_architecture' ||
    typeLower === 'architecture' ||
    queryLower.includes('architecture') ||
    queryLower.includes('chatbot') ||
    queryLower.includes('flowchart') ||
    queryLower.includes('workflow')
  ) {
    // Priority 1: College Assistant Chatbot System Architecture
    if (
      queryLower.includes('chatbot') ||
      queryLower.includes('college assistant') ||
      queryLower.includes('assistant architecture') ||
      queryLower.includes('system architecture') ||
      queryLower.includes('show the architecture') ||
      queryLower.includes('our architecture') ||
      queryLower.includes('10 layer') ||
      (!queryLower.includes('campus') && !queryLower.includes('placement') && !queryLower.includes('building') && !queryLower.includes('machine learning'))
    ) {
      return {
        visual_url: '/diagrams/college-chatbot-architecture.svg',
        visual_type: 'system_architecture',
        visual_prompt: visualPrompt,
        source_label: 'AI-Powered College Assistant Chatbot using NLP Architecture',
        provider: 'system_architecture',
      };
    }

    // Priority 2: Campus & Department Layout
    if (queryLower.includes('campus') || queryLower.includes('building') || queryLower.includes('ground')) {
      return {
        visual_url: '/diagrams/sec-campus-architecture.svg',
        visual_type: 'system_architecture',
        visual_prompt: visualPrompt,
        source_label: 'Sengunthar Engineering College Campus Layout',
        provider: 'system_architecture',
      };
    }

    // Priority 3: Placements & Interview Workflow
    if (queryLower.includes('placement') || queryLower.includes('interview') || queryLower.includes('recruitment')) {
      return {
        visual_url: '/diagrams/placement-workflow-architecture.svg',
        visual_type: 'workflow',
        visual_prompt: visualPrompt,
        source_label: 'SEC Placement Cell Recruitment Workflow',
        provider: 'system_architecture',
      };
    }

    // Priority 4: AI & Data Science Machine Learning Pipeline
    if (/\b(ai & ds|data science|machine learning|deep learning|neural network|transformer)\b/i.test(queryLower)) {
      return {
        visual_url: '/diagrams/ai-ds-model-architecture.svg',
        visual_type: 'educational_diagram',
        visual_prompt: visualPrompt,
        source_label: 'AI & Data Science Curriculum Architecture',
        provider: 'system_architecture',
      };
    }

    // Default to the full 14-node College Assistant Chatbot architecture
    return {
      visual_url: '/diagrams/college-chatbot-architecture.svg',
      visual_type: 'system_architecture',
      visual_prompt: visualPrompt,
      source_label: 'AI-Powered College Assistant Chatbot using NLP Architecture',
      provider: 'system_architecture',
    };
  }

  // 2. IMAGE GENERATION API PIPELINE
  // Priority A: Check for explicit IMAGE_API_KEY (OpenAI DALL-E, Stability, etc.)
  const imageApiKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;

  if (imageApiKey && imageApiKey.startsWith('sk-') && !imageApiKey.includes('PASTE')) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${imageApiKey}`,
        },
        body: JSON.stringify({
          prompt: `${visualPrompt}. Academic college educational style, clear technical details, high resolution.`,
          n: 1,
          size: '1024x1024',
          response_format: 'url',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedUrl = data.data?.[0]?.url;
        if (generatedUrl) {
          return {
            visual_url: generatedUrl,
            visual_type: visualType,
            visual_prompt: visualPrompt,
            source_label: 'AI Generated Visual (DALL-E 3)',
            provider: 'ai_generated',
          };
        }
      } else {
        const errText = await response.text();
        console.warn('[Image API Warning] Failed to generate with configured key:', errText);
      }
    } catch (apiErr: any) {
      console.error('[Image API Exception]', apiErr?.message || apiErr);
    }
  }

  // Priority B: Live AI Image Synthesizer via Pollinations AI (free, zero-key, high quality)
  try {
    const sanitizedPrompt = encodeURIComponent(
      `${visualPrompt}, highly detailed academic educational visual, photorealistic or clean diagram, 8k resolution`
    );
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?width=800&height=500&nologo=true&seed=${seed}`;

    // Verify the URL responds with an image header
    const checkRes = await fetch(pollinationsUrl, { method: 'HEAD' });
    if (checkRes.ok || checkRes.status === 200) {
      return {
        visual_url: pollinationsUrl,
        visual_type: visualType,
        visual_prompt: visualPrompt,
        source_label: 'AI Generated Visual (Neural Synthesizer)',
        provider: 'ai_generated',
      };
    }
  } catch (pollErr: any) {
    console.warn('[Pollinations Image Fallback Warning]', pollErr?.message);
  }

  // Priority C: Missing / Failed Image Provider Handling
  // Clearly handle provider without breaking chatbot or using mock placeholders
  return {
    visual_url: null,
    visual_type: visualType,
    visual_prompt: visualPrompt,
    source_label: 'Visual Prompt Generated (IMAGE_API_KEY required for custom synthesis)',
    provider: 'provider_not_configured',
    error: 'Image generation provider not configured or rate limited.',
  };
}
