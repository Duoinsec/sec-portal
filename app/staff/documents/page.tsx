'use client';

import { useState, useEffect, useRef } from 'react';
import { useDocuments } from '@/lib/hooks';
import { Card, LoadingState, EmptyState } from '@/components/shared';
import {
  FolderOpen, FileText, ExternalLink, Plus, X,
  Building2, Calendar, UploadCloud, FileCheck2, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Department { id: string; name: string; code: string; }

const YEARS = [1, 2, 3, 4];
const BUCKET = 'documents'; // Supabase Storage bucket name

function AddDocumentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [targetYear, setTargetYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('departments').select('id, name, code').eq('is_active', true).order('name')
      .then(({ data }) => setDepartments((data as Department[]) || []));
  }, []);

  const handleFileChange = (picked: File | null) => {
    if (!picked) return;
    // Accept PDF and images only
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(picked.type)) {
      setError('Only PDF, JPG, PNG, or WEBP files are allowed.');
      return;
    }
    setError('');
    setFile(picked);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Document title is required'); return; }
    if (!file) { setError('Please choose a file to upload'); return; }
    setSaving(true); setError('');

    try {
      // 1. Upload file to Supabase Storage
      setProgress('Uploading file...');
      const ext = file.name.split('.').pop();
      const filePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) throw uploadErr;

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl || '';

      // 3. Insert document record
      setProgress('Saving document...');
      const { data: docData, error: dbErr } = await supabase
        .from('documents')
        .insert({
          title: title.trim(),
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          department_id: departmentId || null,
          target_year: targetYear ? Number(targetYear) : null,
        })
        .select('id')
        .single();
      if (dbErr) throw dbErr;

      // 4. Notify matching students
      setProgress('Sending notifications...');
      let studentQuery = supabase
        .from('students')
        .select('profile_id')
        .not('profile_id', 'is', null);
      if (departmentId) studentQuery = studentQuery.eq('department_id', departmentId);
      if (targetYear) studentQuery = studentQuery.eq('year', Number(targetYear));
      const { data: students } = await studentQuery;

      const deptName = departmentId
        ? departments.find(d => d.id === departmentId)?.name || 'your department'
        : 'all departments';
      const yearLabel = targetYear ? ` · Year ${targetYear}` : '';

      if (students && students.length > 0) {
        const notifications = students.map((s: any) => ({
          user_id: s.profile_id,
          title: '📄 New Document Available',
          body: `"${title.trim()}" has been uploaded for ${deptName}${yearLabel}. Tap to view.`,
          type: 'DOCUMENT',
          related_id: docData?.id || null,
          related_type: 'document',
          is_read: false,
        }));
        await supabase.from('notifications').insert(notifications);
      }

      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally { setSaving(false); setProgress(''); }
  };

  const isPdf = file?.type === 'application/pdf';
  const isImage = file?.type.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7] sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-[#172033]">Upload Document</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Document Title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              placeholder="e.g. AI & DS Syllabus Regulation 2021"
            />
          </div>

          {/* File Picker — tap to open files/gallery or drag-drop */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">
              File (PDF / Image) *
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={e => handleFileChange(e.target.files?.[0] || null)}
            />

            {/* Drop zone / picker button */}
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 px-4 cursor-pointer transition-all select-none ${
                  dragOver
                    ? 'border-[#1468D5] bg-[#1468D5]/5'
                    : 'border-[#E6EEF7] hover:border-[#1468D5]/50 hover:bg-[#F8FBFF]'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1468D5]/10 text-[#1468D5]">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#172033]">Tap to choose file</p>
                <p className="text-xs text-[#6B7280] text-center">
                  Pick from your <strong>Files</strong> or <strong>Gallery</strong><br />
                  PDF, JPG, PNG supported
                </p>
              </div>
            ) : (
              /* File preview after selection */
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPdf ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {isPdf ? <FileText className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#172033] truncate">{file.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {(file.size / 1024).toFixed(0)} KB · {file.type.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="rounded-lg p-1 hover:bg-green-100 transition-colors"
                >
                  <X className="h-4 w-4 text-green-700" />
                </button>
              </div>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> Department
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Target Year
            </label>
            <select
              value={targetYear}
              onChange={e => setTargetYear(e.target.value)}
              className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          {/* Progress indicator */}
          {progress && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 font-medium">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              {progress}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {progress || 'Uploading...'}
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload & Notify
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  SYLLABUS: 'Syllabus', NOTES: 'Notes', CIRCULAR: 'Circular', FORM: 'Form', REPORT: 'Report',
};

export default function StaffDocuments() {
  const { data: documents, loading, refresh } = useDocuments() as any;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in pb-32 md:pb-16 min-h-full flex flex-col">
      {showModal && (
        <AddDocumentModal
          onClose={() => setShowModal(false)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Documents</h1>
          <p className="text-sm text-[#6B7280] mt-1">Institutional records, syllabus documents, and templates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors"
        >
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading documents..." />
      ) : (documents || []).length === 0 ? (
        <EmptyState title="No Documents Found" message="Institutional documents will appear here." icon={FolderOpen} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(documents || []).map((doc: any) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:border-[#1468D5]/30 transition-all">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-[#172033] truncate">{doc.title}</h3>
                    <p className="text-xs text-[#6B7280] truncate">{doc.file_name}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {doc.category && (
                    <span className="rounded-full bg-[#1468D5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1468D5]">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                  )}
                  {doc.department?.name && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                      <Building2 className="h-2.5 w-2.5" />{doc.department.name}
                    </span>
                  )}
                  {doc.target_year && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />Year {doc.target_year}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E6EEF7] text-xs text-[#6B7280]">
                <span>{doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'Recent'}</span>
                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1468D5] hover:underline">
                    <span>Open</span><ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>Secured Archive</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}