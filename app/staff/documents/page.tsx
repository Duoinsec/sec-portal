'use client';

import { useState } from 'react';
import { useDocuments } from '@/lib/hooks';
import { Card, LoadingState, EmptyState } from '@/components/shared';
import { FolderOpen, FileText, ExternalLink, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

function AddDocumentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: '', file_name: '', file_url: '', category: 'SYLLABUS' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const { error: err } = await supabase.from('documents').insert({
        title: form.title, file_name: form.file_name || form.title,
        file_url: form.file_url || null, category: form.category,
      });
      if (err) throw err;
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add document');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">Upload Document</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Document Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. AI & DS Syllabus Regulation 2021" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">File Name</label>
            <input value={form.file_name} onChange={e => setForm(f => ({...f, file_name: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="syllabus_r2021.pdf" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">File URL (Google Drive / Link)</label>
            <input type="url" value={form.file_url} onChange={e => setForm(f => ({...f, file_url: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none">
              <option value="SYLLABUS">Syllabus</option>
              <option value="NOTES">Lecture Notes</option>
              <option value="CIRCULAR">Circular</option>
              <option value="FORM">Form / Template</option>
              <option value="REPORT">Report</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Uploading...' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffDocuments() {
  const { data: documents, loading, refresh } = useDocuments() as any;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      {showModal && <AddDocumentModal onClose={() => setShowModal(false)} onSuccess={() => typeof refresh === 'function' && refresh()} />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Documents</h1>
          <p className="text-sm text-[#6B7280] mt-1">Institutional records, syllabus documents, and templates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>
      {loading ? (<LoadingState message="Loading documents..." />) : (documents || []).length === 0 ? (
        <EmptyState title="No Documents Found" message="Institutional documents will appear here." icon={FolderOpen} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(documents || []).map((doc: any) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:border-[#1468D5]/30 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5]"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-[#172033] truncate">{doc.title}</h3>
                    <p className="text-xs text-[#6B7280] truncate">{doc.file_name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E6EEF7] text-xs text-[#6B7280]">
                <span>{doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'Recent'}</span>
                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1468D5] hover:underline">
                    <span>Download</span><ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (<span>Secured Archive</span>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}