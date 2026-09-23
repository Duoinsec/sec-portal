'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useAttendanceSummary, useMarks, usePlacements } from '@/lib/hooks';
import { Bot, Send, User, RefreshCw, Zap } from 'lucide-react';
import { ChatMessageContent } from '@/components/chat-message-content';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  visualData?: {
    visual_required?: boolean;
    visual_type?: string | null;
    visual_prompt?: string | null;
    visual_url?: string | null;
    visual_label?: string | null;
    sources?: string[];
  };
}

export default function StudentChat() {
  const { profile } = useAuth();
  const { data: student } = useStudentProfile();
  const { data: attendance } = useAttendanceSummary(student?.id);
  const { data: marks } = useMarks(student?.id);
  const { data: placements } = usePlacements();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your SEC AI Assistant powered by Llama 3.1 (Groq).

I can help you with:
- 🏗️ **System & Campus Architecture** (Visual diagrams & full explanations)
- 📊 **Attendance & Exam Marks** queries
- 💼 **Placement Drives & Interview Workflow**
- 📝 **Leave & OD Applications**
- 🏫 **College Regulations & Department Info**

💡 *Tip: Ask me "Explain the architecture of our College Assistant Chatbot", "Show the architecture", or "Placement drive workflow" to see full diagrams and explanations!*`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    setHasError(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const studentContext = {
      name: student?.full_name || profile?.full_name,
      registerNumber: student?.register_number,
      department: student?.department?.name || 'AI & DS',
      year: student?.year,
      cgpa: student?.cgpa,
      attendance: attendance
        ? {
            percentage: attendance.percentage?.toFixed(1),
            present: attendance.present,
            absent: attendance.absent,
            total: attendance.total,
          }
        : null,
      marks: marks?.slice(0, 5).map((m: any) => ({
        subject: m.subject?.name,
        obtained: m.obtained_marks,
        max: m.max_marks,
        grade: m.grade,
      })),
      activePlacements: placements?.slice(0, 5).map((p: any) => ({
        company: p.company_name,
        role: p.role,
        package: p.package_lpa + ' LPA',
        minCgpa: p.min_cgpa,
      })),
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          studentContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get AI response');

      const answerText = data.answer || data.reply || '';
      const visualData = {
        visual_required: data.visual_required,
        visual_type: data.visual_type,
        visual_prompt: data.visual_prompt,
        visual_url: data.visual_url,
        visual_label: data.visual_label,
        sources: data.sources,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: answerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          visualData,
        },
      ]);
    } catch (err: any) {
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I could not connect to the AI server. Please check your connection and try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 py-3 md:px-8 md:py-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E6EEF7] mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 p-1 shadow-xs shrink-0 overflow-hidden">
            <img src="/images/sec-logo.png" alt="SEC Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#172033]">SEC AI Assistant</h1>
            <p className={`text-xs flex items-center gap-1.5 font-medium ${hasError ? 'text-red-500' : 'text-[#16A34A]'}`}>
              <span className={`h-2 w-2 rounded-full animate-pulse ${hasError ? 'bg-red-500' : 'bg-[#16A34A]'}`} />
              {hasError ? 'Connection error' : 'Online - Powered by Llama 3.1 (Groq)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
            <Zap className="h-3 w-3" />Llama 3.1 (Groq)
          </span>
          <button
            onClick={() => {
              setHasError(false);
              setMessages([{ id: 'r', role: 'assistant', content: 'Chat cleared! How can I help you?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#E6EEF7] bg-white px-2.5 py-1.5 text-xs text-[#6B7280] hover:bg-[#F8FBFF] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />Clear
          </button>
        </div>
      </div>

      {/* Messages area with scrollbar completely hidden */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 mb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold overflow-hidden ${msg.role === 'user' ? 'bg-[#1468D5] text-white' : 'bg-white border border-slate-200 p-0.5 shadow-xs'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <img src="/images/sec-logo.png" alt="SEC" className="h-full w-full object-contain" />}
            </div>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1468D5] text-white rounded-tr-none' : 'bg-white border border-[#E6EEF7] text-[#172033] shadow-sm rounded-tl-none'}`}>
              <ChatMessageContent content={msg.content} isUser={msg.role === 'user'} visualData={msg.visualData} />
              <p className={`text-[10px] mt-1.5 text-right ${msg.role === 'user' ? 'text-white/70' : 'text-[#6B7280]'}`}>{msg.time}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs overflow-hidden">
              <img src="/images/sec-logo.png" alt="SEC" className="h-full w-full object-contain" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white border border-[#E6EEF7] px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1468D5] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#1468D5] animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-[#1468D5] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-1 pb-1 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about marks, attendance, leaves, placements..."
            disabled={isTyping}
            className="flex-1 rounded-xl border border-[#E6EEF7] bg-white px-4 py-3 text-sm outline-none focus:border-[#1468D5] focus:ring-2 focus:ring-[#1468D5]/20 shadow-sm disabled:opacity-60 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1468D5] text-white shadow-sm hover:bg-[#123B73] transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}