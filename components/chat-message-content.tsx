'use client';

import React, { useState } from 'react';
import { Maximize2, X, Download, Copy, Check, ExternalLink, Image as ImageIcon, Sparkles, BookOpen, Layers, Info } from 'lucide-react';

export interface VisualMetadata {
  visual_required?: boolean;
  visual_type?: string | null;
  visual_prompt?: string | null;
  visual_url?: string | null;
  visual_label?: string | null;
  sources?: string[];
}

interface ChatMessageContentProps {
  content: string;
  isUser: boolean;
  visualData?: VisualMetadata;
}

export function ChatMessageContent({ content, isUser, visualData }: ChatMessageContentProps) {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

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

  // Render formatted lines
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 my-1 text-[13.5px] leading-relaxed text-[#1e293b]">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Heading 3 / 2 / 1
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

  // Clean text by stripping inline markdown image syntax if it will be displayed in the card
  const cleanedContent = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();

  return (
    <>
      <div className="chat-message-body space-y-2">
        {/* 1. Main Text Answer */}
        {renderFormattedText(cleanedContent)}

        {/* 2. AI GENERATED VISUAL CARD (Gemini / ChatGPT Style) */}
        {(effectiveImageUrl || visualData?.visual_required) && (
          <div className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-md transition-all hover:shadow-lg">
            {/* Header with Visual Badge */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-blue-400 border border-blue-400/30 uppercase">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  AI GENERATED VISUAL
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
                    onClick={() => setShowPromptDetails((prev) => !prev)}
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
                    onClick={() => setModalImage({ src: effectiveImageUrl, alt: visualData?.visual_label || 'Architecture Visual' })}
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
                <p className="font-semibold text-blue-300 text-[11px]">Visual Synthesis Prompt (Groq NLP):</p>
                <p className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded-md border border-slate-800">
                  {effectiveVisualPrompt}
                </p>
              </div>
            )}

            {/* Visual Display */}
            {effectiveImageUrl ? (
              <div
                className="relative cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950 p-1 group"
                onClick={() => setModalImage({ src: effectiveImageUrl, alt: visualData?.visual_label || 'Architecture Visual' })}
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
                <p className="text-[10px] text-slate-500">Provide IMAGE_API_KEY in .env to connect dedicated neural synthesis provider.</p>
              </div>
            )}

            {/* Visual Label Banner */}
            <div className="px-3.5 py-1.5 bg-slate-800/90 text-[11px] text-slate-300 border-t border-slate-700/80 flex items-center justify-between">
              <span className="font-medium truncate">{visualData?.visual_label || 'Architecture & Knowledge Flow'}</span>
              <span className="text-[10px] text-slate-400">Click image to zoom</span>
            </div>
          </div>
        )}

        {/* 3. SOURCES ATTRIBUTION (Gemini / ChatGPT Style) */}
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
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="font-bold text-sm truncate">{modalImage.alt || 'Academic Visual'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
              <span>AI-Powered College Assistant Chatbot using NLP</span>
              <span className="text-[11px] text-slate-400">Sengunthar Engineering College</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
