'use client';

import React, { useState } from 'react';
import {
  Layers, Users, Smartphone, ShieldCheck, Server, Cpu, Database,
  Sparkles, FileText, ArrowDown, ArrowRight, Play, CheckCircle2,
  ExternalLink, Download, Image as ImageIcon, Zap, BookOpen, HardDrive
} from 'lucide-react';
import { Card, Badge } from '@/components/shared';

export default function SystemArchitecturePage() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimStep, setCurrentSimStep] = useState<number>(-1);

  const layers = [
    {
      step: 1,
      title: '1. Student Layer',
      subtitle: 'Web & Mobile Client Interface',
      badge: 'Client',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Users,
      color: '#3b82f6',
      tech: 'Browser / PWA / Mobile Responsive',
      description: 'Students submit queries via the Gemini/ChatGPT-styled chat interface. Supports queries regarding attendance, marks, syllabus, placement drives, leave/OD, and system architecture.',
      inputs: 'Natural language text query (English / Tanglish)',
      outputs: 'HTTPS POST Request payload with authentication JWT',
    },
    {
      step: 2,
      title: '2. Frontend Layer',
      subtitle: 'Next.js 13 & React Application Shell',
      badge: 'Presentation',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Smartphone,
      color: '#6366f1',
      tech: 'Next.js 13, React 18, Tailwind CSS, Lucide Icons',
      description: 'Renders the responsive college portal, interactive message cards with AI Generated Visuals, lightbox zoom modals, and source attribution badges with zero screen jitter.',
      inputs: 'User keystrokes & state events',
      outputs: 'Structured JSON request to /api/chat',
    },
    {
      step: 3,
      title: '3. Authentication Layer',
      subtitle: 'Role-Based Access Control (RBAC)',
      badge: 'Security',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      color: '#10b981',
      tech: 'Supabase Auth, JWT Tokens, Bearer Header',
      description: 'Validates student and staff identity, verifies active session tokens, and restricts sensitive student records (CGPA, marks, attendance) via PostgreSQL Row Level Security (RLS).',
      inputs: 'Supabase session token',
      outputs: 'Verified user ID & role (STUDENT, STAFF, ADMIN)',
    },
    {
      step: 4,
      title: '4. Backend / API Layer',
      subtitle: 'Secure API Gateway & Request Validator',
      badge: 'Middleware',
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
      icon: Server,
      color: '#8b5cf6',
      tech: 'Next.js API Route, In-Memory Rate Limiter, Express/Node.js',
      description: 'Validates incoming payloads, protects against script injection, and enforces IP-based rate limiting (40 req/min) with standard Retry-After headers.',
      inputs: 'Raw HTTP POST payload',
      outputs: 'Sanitized query & student profile context',
    },
    {
      step: 5,
      title: '5. NLP & Query Processing Layer',
      subtitle: 'Query Understanding & Intent Detection',
      badge: 'NLP Engine',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Cpu,
      color: '#a855f7',
      tech: 'Groq NLP Parser, Intent Classifier, Visual Classifier',
      description: 'Extracts student intent (Academic, Attendance, Placements, Campus Infrastructure, or Architecture) and determines if visual explanation (educational_diagram, system_architecture, workflow) is required.',
      inputs: 'Sanitized text string',
      outputs: 'Classified Intent & Visual Requirement Flag',
    },
    {
      step: 6,
      title: '6. Knowledge Retrieval Layer',
      subtitle: 'RAG Knowledge Base & Context Injector',
      badge: 'RAG / Context',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: BookOpen,
      color: '#ec4899',
      tech: 'PDF, DOCX, XLSX Parsers, College Regulations 2021',
      description: 'Retrieves relevant institutional guidelines, departmental handbooks, syllabus regulations, and placement history uploaded by college staff.',
      inputs: 'Classified intent & department code',
      outputs: 'Grounded institutional context chunks',
    },
    {
      step: 7,
      title: '7. Groq AI Layer',
      subtitle: 'High-Speed LLM Inference Engine',
      badge: 'AI Core',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Zap,
      color: '#f97316',
      tech: 'Groq Cloud LPU, Llama 3.1 / GPT-OSS Models, JSON Mode',
      description: 'Processes prompt with student context and returns structured JSON containing answer text, visual requirement flag, visual type, and generation prompt.',
      inputs: 'System prompt + Student Context + Query History',
      outputs: 'Validated structured JSON object',
    },
    {
      step: 8,
      title: '8. Image & Visual Generation Layer',
      subtitle: 'Academic Visual Synthesis & Diagram Routing',
      badge: 'Visual Engine',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: ImageIcon,
      color: '#06b6d4',
      tech: 'Academic SVG Generator, IMAGE_API_KEY, Neural Synthesizer',
      description: 'If visual_required is true, generates high-resolution academic system architecture diagrams, placement flowcharts, or calls neural image synthesis pipeline.',
      inputs: 'visual_type, visual_prompt, userQuery',
      outputs: 'Verified visual URL & source label',
    },
    {
      step: 9,
      title: '9. Supabase Database & Storage Layer',
      subtitle: 'Cloud Relational Database & Bucket Storage',
      badge: 'Data Tier',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: HardDrive,
      color: '#059669',
      tech: 'PostgreSQL, Supabase Storage, Row Level Security (RLS)',
      description: 'Stores department records, student profiles, attendance sessions, exam marks, notifications, audit logs, and faculty uploaded PDFs/DOCXs/XLSXs.',
      inputs: 'SQL Queries, Document Upload streams',
      outputs: 'Relational data records & static asset URLs',
    },
    {
      step: 10,
      title: '10. Response Layer',
      subtitle: 'Multimodal Academic Delivery',
      badge: 'Delivery',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Sparkles,
      color: '#2563eb',
      tech: 'JSON Payload, Gemini Card UI, Lightbox Modal',
      description: 'Assembles the complete response containing the structured textual answer, AI Generated Visual card with expand/zoom options, and college source citations.',
      inputs: 'Answer + Visual URL + Sources Array',
      outputs: 'Delivered to Student Chat Interface',
    },
  ];

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentSimStep(1);

    let step = 1;
    const interval = setInterval(() => {
      step += 1;
      if (step > 10) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setCurrentSimStep(-1);
        }, 1200);
      } else {
        setCurrentSimStep(step);
        setActiveLayer(step);
      }
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-700 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-md shrink-0 hidden sm:flex items-center justify-center overflow-hidden">
              <img src="/images/sec-logo.png" alt="Sengunthar Engineering College Logo" className="h-full w-full object-contain" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                  Academic Project Architecture
                </span>
                <span className="text-xs text-amber-300 font-medium">Sengunthar Engineering College (Estd. 2001)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                AI-Powered College Assistant Chatbot using NLP
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Complete end-to-end system architecture detailing student query execution, visual requirement decision, Groq AI LPU reasoning, and faculty document ingestion pipeline.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2 rounded-xl bg-[#1468D5] hover:bg-[#123B73] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {isSimulating ? `Processing Layer ${currentSimStep}/10...` : 'Simulate Query Flow'}
            </button>
            <a
              href="/diagrams/college-chatbot-architecture.svg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Open Full SVG
            </a>
          </div>
        </div>
      </div>

      {/* Primary SVG Diagram Preview Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <span className="font-bold text-white">Interactive System Architecture Diagram</span>
            <span className="text-slate-400 hidden sm:inline">· 10 Query Layers + Staff Knowledge Ingestion</span>
          </div>
          <a
            href="/diagrams/college-chatbot-architecture.svg"
            download="sec-chatbot-architecture.svg"
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Download SVG
          </a>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2">
          <img
            src="/diagrams/college-chatbot-architecture.svg"
            alt="AI-Powered College Assistant Chatbot using NLP Architecture"
            className="w-full max-h-[580px] object-contain"
          />
        </div>
      </div>

      {/* Staff Ingestion Pipeline Showcase Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm">
          <FileText className="h-4 w-4 text-amber-600" />
          <span>Staff Document Ingestion &amp; Knowledge Base Pipeline</span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Faculty upload official college documents in multiple formats to ground the AI with exact institutional knowledge:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
            <span className="font-bold text-amber-700 block">1. Faculty</span>
            <span className="text-[10px] text-slate-500">Staff Portal</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
            <span className="font-bold text-amber-700 block">2. Upload</span>
            <span className="text-[10px] text-slate-500">Document Upload</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
            <span className="font-bold text-rose-600 block">3. File Formats</span>
            <span className="text-[10px] text-slate-500">PDF, DOCX, XLSX</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
            <span className="font-bold text-purple-700 block">4. Processing</span>
            <span className="text-[10px] text-slate-500">Text &amp; Chunking</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
            <span className="font-bold text-pink-700 block">5. Knowledge</span>
            <span className="text-[10px] text-slate-500">Knowledge Base</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
            <span className="font-bold text-emerald-700 block">6. Supabase</span>
            <span className="text-[10px] text-slate-500">Storage &amp; Tables</span>
          </div>
        </div>
      </div>

      {/* 10 Layer Step-by-Step Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-[#172033]">10-Layer Architecture Technical Specifications</h2>
          <span className="text-xs text-slate-500 font-medium">Click any layer to inspect interfaces</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isHighlighted = activeLayer === layer.step || currentSimStep === layer.step;

            return (
              <div
                key={layer.step}
                onClick={() => setActiveLayer(activeLayer === layer.step ? null : layer.step)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  isHighlighted
                    ? 'border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: layer.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#172033]">{layer.title}</h3>
                      <p className="text-[11px] text-slate-500">{layer.subtitle}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${layer.badgeColor}`}>
                    {layer.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {layer.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium truncate max-w-[200px]">
                    <span className="font-semibold text-slate-700">Tech:</span> {layer.tech}
                  </span>
                  <span className="font-semibold text-blue-600 hover:underline">
                    {activeLayer === layer.step ? 'Hide details' : 'Inspect inputs/outputs'}
                  </span>
                </div>

                {activeLayer === layer.step && (
                  <div className="mt-3 pt-3 border-t border-blue-200 bg-white/80 p-2.5 rounded-xl space-y-1.5 text-[11px] animate-fade-in">
                    <div>
                      <span className="font-bold text-slate-700">Inputs:</span>{' '}
                      <code className="text-blue-700 font-mono text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {layer.inputs}
                      </code>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Outputs:</span>{' '}
                      <code className="text-emerald-700 font-mono text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {layer.outputs}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
