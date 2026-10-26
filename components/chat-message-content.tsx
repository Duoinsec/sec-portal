'use client';

import React, { useState } from 'react';
import { Maximize2, X, Download, Copy, Check, ExternalLink, Image as ImageIcon, Sparkles, BookOpen, Layers, Info, ChevronDown } from 'lucide-react';

export interface PixabayImage {
  id: number;
  tags: string;
  preview_url: string;
  web_format_url: string;
  large_image_url?: string;
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

export interface VisualMetadata {
  visual_required?: boolean;
  visual_type?: string | null;
  visual_prompt?: string | null;
  visual_url?: string | null;
  visual_label?: string | null;
  real_images?: PixabayImage[];
  topic_sections?: TopicSection[];
  pixabay_error?: string | null;
  sources?: string[];
}

interface ChatMessageContentProps {
  content: string;
  isUser: boolean;
  visualData?: VisualMetadata;
}

function resolveTopicSections(
  content: string,
  visualData?: VisualMetadata
): { intro: string; sections: TopicSection[] } {
  // 1. If visualData already provides structured topic_sections with images
  if (visualData?.topic_sections && visualData.topic_sections.length > 0) {
    return {
      intro: '',
      sections: visualData.topic_sections,
    };
  }

  // 2. Fallback: Parse numbered headers like "1. 📱 ...", "2. ▶️ ...", "### 1. ..."
  const headerRegex = /(?:^|\n)(?:###?\s*)?(\d+[\.\)]\s+[^\n]+)/g;
  const matches: { title: string; index: number }[] = [];
  let m;
  while ((m = headerRegex.exec(content)) !== null) {
    matches.push({ title: m[1].trim(), index: m.index });
  }

  if (matches.length >= 2) {
    const intro = content.substring(0, matches[0].index).trim();
    const allImages = visualData?.real_images || [];
    const imagesPerSection = Math.max(1, Math.floor(allImages.length / matches.length)) || 3;

    const sections: TopicSection[] = [];
    for (let i = 0; i < matches.length; i++) {
      const cur = matches[i];
      const nxt = matches[i + 1];
      const rawChunk = content.slice(cur.index, nxt ? nxt.index : undefined);
      const lines = rawChunk.trim().split('\n');
      const title = lines[0].replace(/^###?\s*/, '').trim();
      const body = lines.slice(1).join('\n').trim();

      const secImages = allImages.slice(i * imagesPerSection, (i + 1) * imagesPerSection);

      sections.push({
        topic_title: title,
        content: body,
        images: secImages.length > 0 ? secImages : undefined,
      });
    }

    return { intro, sections };
  }

  return { intro: content, sections: [] };
}

export function ChatMessageContent({ content, isUser, visualData }: ChatMessageContentProps) {
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
    creator?: string;
    pageUrl?: string;
    isReal?: boolean;
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showPromptDetails, setShowPromptDetails] = useState<boolean>(false);

  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper for inline markdown: bold, italic, code
  const renderInlineMarkdown = (str: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = str;
    let key = 0;

    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/;

    while (remaining) {
      const match = remaining.match(inlineRegex);
      if (!match) {
        parts.push(remaining);
        break;
      }

      const matchIdx = match.index || 0;
      if (matchIdx > 0) {
        parts.push(remaining.substring(0, matchIdx));
      }

      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={key++} className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-xs font-mono text-blue-700">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={key++} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={key++} className="italic text-slate-700">
            {token.slice(1, -1)}
          </em>
        );
      }

      remaining = remaining.substring(matchIdx + token.length);
    }

    return parts;
  };

  // Render formatted lines with special section labels
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 my-1 text-[13.5px] leading-relaxed text-[#1e293b]">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Sub-topic Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={lIdx} className="font-bold text-[#0f172a] text-sm pt-2 pb-0.5 border-b border-slate-100 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1468D5]" />
                {renderInlineMarkdown(trimmed.replace('### ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={lIdx} className="font-extrabold text-[#0f172a] text-[15px] pt-2 pb-1 border-b border-slate-200">
                {renderInlineMarkdown(trimmed.replace('## ', ''))}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={lIdx} className="font-extrabold text-[#0f172a] text-base pt-2 pb-1">
                {renderInlineMarkdown(trimmed.replace('# ', ''))}
              </h1>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] mt-2 shrink-0" />
                <span className="flex-1">{renderInlineMarkdown(bulletText)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-2">
                <span className="font-bold text-[#1468D5] text-xs mt-0.5 shrink-0 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                  {numMatch[1]}
                </span>
                <span className="flex-1">{renderInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          // Styled sub-labels
          if (/^How do we use it\??/i.test(trimmed) || /^Key Concept:?/i.test(trimmed)) {
            return (
              <p key={lIdx} className="font-bold text-[#0f172a] text-sm pt-1.5 pb-0.5">
                {renderInlineMarkdown(trimmed)}
              </p>
            );
          }

          if (/^Example:\s*/i.test(trimmed)) {
            const expBody = trimmed.replace(/^Example:\s*/i, '');
            return (
              <p key={lIdx} className="my-1 text-slate-800">
                <strong className="font-semibold text-slate-900">Example: </strong>
                {renderInlineMarkdown(expBody)}
              </p>
            );
          }

          if (/^(?:AI\s+)?technology:\s*/i.test(trimmed)) {
            const techBody = trimmed.replace(/^(?:AI\s+)?technology:\s*/i, '');
            return (
              <p key={lIdx} className="my-1 text-slate-800">
                <strong className="font-semibold text-slate-900">AI technology: </strong>
                {renderInlineMarkdown(techBody)}
              </p>
            );
          }

          if (/^Important:\s*/i.test(trimmed)) {
            const impBody = trimmed.replace(/^Important:\s*/i, '');
            return (
              <p key={lIdx} className="my-1 text-slate-800">
                <strong className="font-semibold text-slate-900">Important: </strong>
                {renderInlineMarkdown(impBody)}
              </p>
            );
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={lIdx} className="my-2 border-slate-200" />;
          }

          // Blank line
          if (!trimmed) {
            return <div key={lIdx} className="h-1" />;
          }

          // Regular paragraph
          return <p key={lIdx}>{renderInlineMarkdown(line)}</p>;
        })}
      </div>
    );
  };

  // Check if content already contains inline markdown images
  const inlineImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const inlineImgMatch = content.match(inlineImageRegex);
  const effectiveImageUrl = visualData?.visual_url || (inlineImgMatch ? inlineImgMatch[2] : null);
  const effectiveVisualType = visualData?.visual_type || (content.toLowerCase().includes('architecture') ? 'system_architecture' : null);
  const effectiveVisualPrompt = visualData?.visual_prompt || null;
  const effectiveSources = visualData?.sources && visualData.sources.length > 0
    ? visualData.sources
    : ['College Knowledge Base'];

  const cleanedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();

  // Resolve Topic-Wise Sections
  const { intro: topicIntro, sections: topicSections } = resolveTopicSections(cleanedContent, visualData);
  const hasTopicSections = topicSections.length > 0;

  const allImagesCount = (visualData?.real_images?.length || 0) + (topicSections.reduce((acc, s) => acc + (s.images?.length || 0), 0));
  const hasRealImages = allImagesCount > 0;
  const hasIllustration = Boolean(effectiveImageUrl || visualData?.visual_required);
  const mediaSectionId = `media-${content.slice(0, 10).replace(/\W/g, '') || 'block'}`;

  return (
    <>
      <div className="chat-message-body space-y-3">
        {/* TOPIC-WISE RENDERING (EXACTLY AS SCREENSHOT) */}
        {hasTopicSections ? (
          <div className="space-y-4">
            {topicIntro && renderFormattedText(topicIntro)}

            {topicSections.map((section, sIdx) => (
              <div key={sIdx} className="topic-block space-y-2">
                {/* 1. Topic Title Heading */}
                <h3 className="font-extrabold text-[#0f172a] text-sm sm:text-base pt-1 pb-0.5 tracking-tight flex items-center gap-2">
                  {renderInlineMarkdown(section.topic_title)}
                </h3>

                {/* 2. Topic Image Gallery (3 Photos Side by Side) */}
                {section.images && section.images.length > 0 && (
                  <div className="my-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {section.images.slice(0, 3).map((img, imgIdx) => (
                        <div
                          key={img.id || imgIdx}
                          onClick={() =>
                            setModalImage({
                              src: img.large_image_url || img.web_format_url,
                              alt: img.tags || section.topic_title,
                              creator: img.user,
                              pageUrl: img.page_url,
                              isReal: true,
                            })
                          }
                          className="group relative h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center"
                        >
                          <img
                            src={img.web_format_url}
                            alt={img.tags || section.topic_title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== img.preview_url) {
                                target.src = img.preview_url;
                              }
                            }}
                          />
                          {/* Hover overlay with creator and zoom icon */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                            <span className="text-[11px] text-white font-medium truncate drop-shadow-sm">
                              Photo by {img.user || 'Pixabay'}
                            </span>
                            <Maximize2 className="h-3.5 w-3.5 text-white shrink-0 ml-1" />
                          </div>

                          {/* Rightmost image count badge like the user's screenshot */}
                          {imgIdx === Math.min(2, (section.images?.length || 1) - 1) && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10.5px] font-semibold flex items-center gap-1 border border-white/20 shadow-xs pointer-events-none group-hover:opacity-0 transition-opacity">
                              <ImageIcon className="h-3 w-3 text-white/90" />
                              <span>{section.images?.length}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Topic Content Breakdown */}
                {renderFormattedText(section.content)}
              </div>
            ))}
          </div>
        ) : (
          /* Single Topic / Regular Answer */
          renderFormattedText(cleanedContent)
        )}

        {/* 2. Single Topic / Fallback Real Images Grid */}
        {!hasTopicSections && hasRealImages && visualData?.real_images && visualData.real_images.length > 0 && (
          <div id={mediaSectionId} className="my-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md">
            {/* Header with Verified Media Badge */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-900/50 text-white">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-emerald-400 border border-emerald-400/30 uppercase">
                  <ImageIcon className="h-3 w-3 text-emerald-400" />
                  REAL WEB MEDIA (PIXABAY)
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  · {visualData?.real_images?.length} verified photos
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono border border-emerald-700/50">
                Official API
              </span>
            </div>

            {/* Images Grid */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70">
              {visualData.real_images.map((img) => (
                <div
                  key={img.id}
                  className="group flex flex-col bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="relative h-44 w-full bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                    onClick={() =>
                      setModalImage({
                        src: img.large_image_url || img.web_format_url,
                        alt: img.tags,
                        creator: img.user,
                        pageUrl: img.page_url,
                        isReal: true,
                      })
                    }
                  >
                    <img
                      src={img.web_format_url}
                      alt={img.tags}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== img.preview_url) {
                          target.src = img.preview_url;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <span className="text-[11px] text-white font-medium truncate drop-shadow-sm">
                        Click to enlarge
                      </span>
                      <Maximize2 className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>

                  {/* Card Content & Attribution */}
                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <a
                        href={img.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-emerald-700 transition-colors truncate max-w-[170px]"
                        title={`View on Pixabay: Photo by ${img.user}`}
                      >
                        Photo by <span className="font-semibold">{img.user}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                      </a>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-500">
                        Pixabay
                      </span>
                    </div>

                    {/* Tags */}
                    {img.tags && (
                      <div className="flex flex-wrap gap-1">
                        {img.tags.split(',').slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100/80 truncate max-w-[110px]"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Gemini Vision Breakdown */}
                    {img.explanation && (
                      <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-[11.5px] text-emerald-900 leading-snug">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                          <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                          AI Visual Breakdown
                        </div>
                        {img.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pixabay Configuration Warning Banner if error present and no images */}
        {visualData?.pixabay_error && (!visualData?.real_images || visualData.real_images.length === 0) && (
          <div className="my-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[12px] text-amber-800 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-900">Pixabay Real Image Search: </span>
              {visualData.pixabay_error}
              <span className="block text-[11px] text-amber-700/80 mt-0.5 font-medium">
                Configure <code>PIXABAY_API_KEY</code> in Supabase Edge Function Secrets or <code>.env</code> to display live real photography.
              </span>
            </div>
          </div>
        )}

        {/* 3. AI GENERATED EDUCATIONAL ILLUSTRATION CARD */}
        {(effectiveImageUrl || visualData?.visual_required) && (
          <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-md transition-all hover:shadow-lg">
            {/* Header with Visual Badge */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-blue-400 border border-blue-400/30 uppercase">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  AI GENERATED ILLUSTRATION
                </span>
                {effectiveVisualType && (
                  <span className="hidden sm:inline-flex text-[11px] text-slate-400 font-medium">
                    · {effectiveVisualType.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {effectiveVisualPrompt && (
                  <button
                    type="button"
                    onClick={() => setShowPromptDetails((prev: boolean) => !prev)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    title="View Visual Generation Prompt"
                  >
                    <Info className="h-3 w-3" />
                    <span className="hidden sm:inline">Prompt</span>
                  </button>
                )}
                {effectiveImageUrl && (
                  <button
                    type="button"
                    onClick={() => setModalImage({ src: effectiveImageUrl, alt: visualData?.visual_label || 'Architecture Visual', isReal: false })}
                    className="flex items-center gap-1 rounded-md bg-slate-700 hover:bg-slate-600 px-2 py-0.5 text-[11px] font-medium text-white transition-colors"
                  >
                    <Maximize2 className="h-3 w-3" /> Expand
                  </button>
                )}
              </div>
            </div>

            {/* Prompt Inspector Drawer */}
            {showPromptDetails && effectiveVisualPrompt && (
              <div className="px-3.5 py-2 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-300 space-y-1 animate-fade-in">
                <p className="font-semibold text-blue-300 text-[11px]">Visual Synthesis Prompt (Gemini / NLP):</p>
                <p className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded-md border border-slate-800">
                  {effectiveVisualPrompt}
                </p>
              </div>
            )}

            {/* Visual Display */}
            {effectiveImageUrl ? (
              <div
                className="relative cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950 p-1 group"
                onClick={() => setModalImage({ src: effectiveImageUrl, alt: visualData?.visual_label || 'Architecture Visual', isReal: false })}
              >
                <img
                  src={effectiveImageUrl}
                  alt={visualData?.visual_label || 'Architecture Visual'}
                  className="w-full max-h-[420px] object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/diagrams/college-chatbot-architecture.svg';
                  }}
                />
              </div>
            ) : (
              <div className="p-4 bg-slate-950 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Layers className="h-5 w-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Visual Requirement Detected: <code className="text-blue-400">{effectiveVisualType}</code></p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">{effectiveVisualPrompt || 'Educational visual representation synthesized from curriculum knowledge.'}</p>
                <p className="text-[10px] text-slate-500">Educational illustration synthesized for concept visualization.</p>
              </div>
            )}

            {/* Visual Label Banner */}
            <div className="px-3.5 py-1.5 bg-slate-800/90 text-[11px] text-slate-300 border-t border-slate-700/80 flex items-center justify-between">
              <span className="font-medium truncate">{visualData?.visual_label || 'Architecture & Knowledge Flow'}</span>
              <span className="text-[10px] text-slate-400">Click image to zoom</span>
            </div>
          </div>
        )}

        {/* 4. SOURCES ATTRIBUTION */}
        {effectiveSources.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
            <BookOpen className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-600">Source:</span>
            <span className="truncate">{effectiveSources.join(' · ')}</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Fullscreen Architecture & Image Zoom */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 text-white">
              <div className="flex items-center gap-2 truncate pr-4">
                {modalImage.isReal ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    PIXABAY PHOTO
                  </span>
                ) : (
                  <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                )}
                <span className="font-bold text-sm truncate">{modalImage.alt || 'Academic Visual'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {modalImage.pageUrl && (
                  <a
                    href={modalImage.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800 transition-colors"
                  >
                    <span>View on Pixabay</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <a
                  href={modalImage.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setModalImage(null)}
                  className="rounded-lg p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="overflow-auto p-3 bg-slate-950 flex items-center justify-center max-h-[76vh]">
              <img
                src={modalImage.src}
                alt={modalImage.alt}
                className="max-h-[72vh] w-auto object-contain rounded-lg shadow-inner"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-800 text-xs text-slate-300 text-center border-t border-slate-700 flex items-center justify-between">
              {modalImage.creator ? (
                <span>Photo by <strong className="text-white">{modalImage.creator}</strong> on Pixabay</span>
              ) : (
                <span>AI-Powered College Assistant Chatbot</span>
              )}
              <span className="text-[11px] text-slate-400">Sengunthar Engineering College</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
