'use client';

import { useState } from 'react';
import { useAnnouncements } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Megaphone, Pin, Calendar, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

function AddAnnouncementModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return; }
    setSaving(true); setError('');
    try {
      const { error: err } = await supabase.from('announcements').insert({
        title: form.title, content: form.content,
        is_pinned: form.is_pinned, publish_at: new Date().toISOString(),
      });
      if (err) throw err;
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">New Announcement</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. Important: Exam Schedule Released" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Content *</label>
            <textarea required rows={5} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none resize-none" placeholder="Enter announcement details..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({...f, is_pinned: e.target.checked}))} className="rounded" />
            <span className="text-sm text-[#172033]">Pin this announcement to top</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffAnnouncements() {
  const { data: announcements, loading, refresh } = useAnnouncements() as any;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      {showModal && <AddAnnouncementModal onClose={() => setShowModal(false)} onSuccess={() => typeof refresh === 'function' && refresh()} />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Campus Announcements</h1>
          <p className="text-sm text-[#6B7280] mt-1">Official circulars and academic notices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>
      {loading ? (<LoadingState message="Loading circulars..." />) : (announcements || []).length === 0 ? (
        <EmptyState title="No Announcements" message="There are no active circulars." icon={Megaphone} />
      ) : (
        <div className="space-y-4">
          {(announcements || []).map((ann: any) => (
            <Card key={ann.id} className={`hover:border-[#1468D5]/30 transition-all ${ann.is_pinned ? 'border-[#1468D5]/40 bg-blue-50/20' : ''}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {ann.is_pinned && (<span className="inline-flex items-center gap-1 rounded-md bg-[#1468D5]/10 px-2 py-0.5 text-xs font-semibold text-[#1468D5]"><Pin className="h-3 w-3" /> Pinned</span>)}
                  <span className="text-xs text-[#6B7280]">{ann.department?.name || 'College-wide'}</span>
                </div>
                <span className="text-xs text-[#6B7280]">{format(new Date(ann.publish_at), 'MMM d, yyyy')}</span>
              </div>
              <h3 className="text-base font-bold text-[#172033] mb-2">{ann.title}</h3>
              <p className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed">{ann.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}