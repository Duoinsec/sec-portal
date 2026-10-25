'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useAttendanceSummary, useMarks, usePlacements } from '@/lib/hooks';
import { Bot, Send, User, Zap, Plus, Image as ImageIcon, FileText, X } from 'lucide-react';
import { ChatMessageContent } from '@/components/chat-message-content';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  attachments?: FileAttachment[];
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);

  const MAX_IMAGES = 4;
  const MAX_DOC_BYTES = 50 * 1024 * 1024; // 50 MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError(null);

    const currentImages = selectedFiles.filter((f) => f.type.startsWith('image/')).length;
    let imageCount = currentImages;
    const newFiles: FileAttachment[] = [];

    for (const file of files) {
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        if (imageCount >= MAX_IMAGES) {
          setUploadError(`Maximum ${MAX_IMAGES} images allowed per chat.`);
          continue;
        }
        imageCount++;
      } else {
        // Document size check (30 to 50 MB max limit)
        if (file.size > MAX_DOC_BYTES) {
          setUploadError(`Document "${file.name}" exceeds the 50 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
          continue;
        }
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedFiles((prev) => {
            // Re-check image count before adding
            const existingImages = prev.filter((p) => p.type.startsWith('image/')).length;
            if (existingImages >= MAX_IMAGES) return prev;
            return [
              ...prev,
              {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                url: event.target?.result as string,
              },
            ];
          });
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: null,
        });
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
    setUploadError(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if ((!query && selectedFiles.length === 0) || isTyping) return;

    setHasError(false);
    setUploadError(null);

    const attachmentsList = selectedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      url: f.url,
    }));

    const uploadedSummary = selectedFiles.length > 0
      ? `[Attached: ${selectedFiles.map((f) => f.name).join(', ')}]`
      : '';

    const promptText = query ? (uploadedSummary ? `${query}\n${uploadedSummary}` : query) : uploadedSummary;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      {/* Centered Transparent Branding (Visible only before chat starts) */}
      {messages.length === 0 && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center select-none pointer-events-none text-center px-4 transition-all duration-300">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/70 border border-slate-200/60 p-2 shadow-xs mb-3.5 opacity-60">
            <img src="/images/sec-logo.png" alt="SEC Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033]/60 tracking-tight">
            SEC AI Assistant
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#16A34A]/70 flex items-center gap-1.5 justify-center">
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            Online - Powered by Llama 3.1 (Groq)
          </p>
        </div>
      )}

      {/* Messages area with scrollbar completely hidden */}
      {messages.length > 0 && (
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
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {/* Images Grid (Up to 4 images) */}
                    {msg.attachments.some((a) => a.type.startsWith('image/')) && (
                      <div className={`grid gap-1.5 ${
                        msg.attachments.filter((a) => a.type.startsWith('image/')).length === 1
                          ? 'grid-cols-1'
                          : 'grid-cols-2'
                      }`}>
                        {msg.attachments
                          .filter((a) => a.type.startsWith('image/'))
                          .map((img) => (
                            <div key={img.id} className="relative rounded-xl overflow-hidden border border-white/25 bg-black/20">
                              {img.url ? (
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="h-28 sm:h-32 w-full object-cover rounded-xl"
                                />
                              ) : (
                                <div className="h-24 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-white/80" />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Documents List */}
                    {msg.attachments
                      .filter((a) => !a.type.startsWith('image/'))
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2 rounded-xl bg-white/15 border border-white/20 flex items-center gap-2 max-w-full"
                        >
                          <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate text-white">{doc.name}</p>
                            <p className="text-[10px] text-white/80">
                              {doc.size > 1024 * 1024
                                ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB`
                                : `${(doc.size / 1024).toFixed(0)} KB`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
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
      )}

      {/* Input area */}
      <div className="pt-1 pb-1 shrink-0">
        {/* Upload Error Banner */}
        {uploadError && (
          <div className="mb-2 flex items-center justify-between gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-0.5 hover:bg-amber-200/60 rounded-md text-amber-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Selected Files Preview Chips */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5 max-h-32 overflow-y-auto px-1 py-1">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full shadow-xs text-xs animate-fade-in"
              >
                {file.type.startsWith('image/') ? (
                  file.url ? (
                    <img src={file.url} alt={file.name} className="h-4 w-4 rounded-full object-cover shrink-0" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5 text-[#1468D5] shrink-0" />
                  )
                ) : (
                  <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-700 truncate max-w-[120px] sm:max-w-[160px]">
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {file.size > 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${(file.size / 1024).toFixed(0)} KB`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200/80 hover:bg-red-100 hover:text-red-600 text-slate-600 transition-colors"
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Images counter badge (Max 4 images) */}
            <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">
              {selectedFiles.filter((f) => f.type.startsWith('image/')).length}/4 images
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          {/* Hidden File Input for images and documents */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            multiple
            className="hidden"
          />

          {/* Add Button for Image & Document Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload images (max 4) or document (max 50 MB)"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#E6EEF7] text-slate-600 hover:text-[#1468D5] hover:border-blue-300 hover:bg-blue-50/50 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Oval Shape Typing Box */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about marks, attendance, leaves, placements..."
            disabled={isTyping}
            className="flex-1 rounded-full border border-[#E6EEF7] bg-white px-5 py-3 text-sm outline-none focus:border-[#1468D5] focus:ring-2 focus:ring-[#1468D5]/20 shadow-sm disabled:opacity-60 transition-all placeholder:text-slate-400"
          />

          {/* Unique Circular Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && selectedFiles.length === 0) || isTyping}
            title="Send message"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#1468D5] via-[#2563eb] to-[#38bdf8] text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none shrink-0"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}