'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStudyMaterials, useStudentProfile } from '@/lib/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import { DEPARTMENTS, CURATED_MATERIALS, DepartmentInfo } from '@/lib/data/study-materials';
import { StudyMaterial } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
  BookOpen,
  Search,
  FileText,
  ExternalLink,
  Download,
  Filter,
  Layers,
  GraduationCap,
  Sparkles,
  Plus,
  X,
  Share2,
  Check,
  Calendar,
  Building2,
  User,
  FileType,
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'ALL', label: 'All Resources' },
  { id: 'NOTES', label: 'Lecture Notes' },
  { id: 'QB', label: 'Question Banks & 2M' },
  { id: 'LAB', label: 'Lab Manuals' },
  { id: 'SYLLABUS', label: 'Syllabus & Curriculum' },
  { id: 'SLIDES', label: 'Slides & PPT' },
];

const YEARS = [
  { id: 'ALL', label: 'All Years' },
  { id: '1', label: 'Year 1' },
  { id: '2', label: 'Year 2' },
  { id: '3', label: 'Year 3' },
  { id: '4', label: 'Year 4' },
];

function UploadMaterialModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (newMaterial: StudyMaterial) => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    department_code: 'AIDS',
    subject_code: '',
    subject_name: '',
    year: '2',
    semester: '3',
    category: 'NOTES',
    file_type: 'PDF',
    file_size: '2.5 MB',
    author_name: profile?.full_name || 'Department Faculty',
    file_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');

    const targetDept = DEPARTMENTS.find((d) => d.code === form.department_code);
    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim() || 'Uploaded study resource.',
      department_id: form.department_code.toLowerCase(),
      subject_id: form.subject_code ? form.subject_code.toLowerCase() : null,
      year: Number(form.year),
      semester: Number(form.semester),
      category: form.category,
      file_type: form.file_type,
      file_size: form.file_size,
      author_name: form.author_name.trim(),
      file_url: form.file_url.trim() || 'https://drive.google.com/drive/my-drive',
      is_active: true,
      created_at: new Date().toISOString(),
      subject: {
        id: `sub-${Date.now()}`,
        code: form.subject_code.toUpperCase() || 'CS3001',
        name: form.subject_name.trim() || 'Core Subject Module',
        department_id: form.department_code.toLowerCase(),
        year: Number(form.year),
        semester: Number(form.semester),
        credits: 3,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      department: targetDept
        ? {
            id: targetDept.code.toLowerCase(),
            code: targetDept.code,
            name: targetDept.name,
            full_name: targetDept.fullName,
            hod_name: null,
            description: null,
            is_active: true,
            created_at: new Date().toISOString(),
          }
        : undefined,
    };

    try {
      // Attempt supabase insert
      await supabase.from('study_materials').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        file_url: form.file_url.trim() || 'https://drive.google.com',
        year: Number(form.year),
        file_type: form.file_type,
        is_active: true,
      });

      // Broadcast to students for outside device alerts
      try {
        const channel = supabase.channel('sec_campus_realtime_updates');
        await channel.send({
          type: 'broadcast',
          event: 'campus_broadcast',
          payload: {
            title: `📚 New Study Material: ${form.title.trim()}`,
            body: `[${form.department_code} • ${form.subject_code || 'Notes'}] New academic resource uploaded!`,
            type: 'material',
            url: '/student/materials/',
          },
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('sec:campus-update', {
              detail: {
                title: `📚 New Study Material: ${form.title.trim()}`,
                body: `[${form.department_code} • ${form.subject_code || 'Notes'}] New academic resource uploaded!`,
                type: 'material',
                url: '/student/materials/',
              },
            })
          );
        }
      } catch (bcErr) {
        console.warn('[Material Upload] Broadcast notice:', bcErr);
      }
    } catch {
      // proceed with local state append
    }

    onSuccess(newMaterial);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Upload Notes & Materials</h2>
              <p className="text-xs text-blue-100 font-medium">Contribute to the SEC Central Library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Material Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="e.g. Unit 1 to 5 Complete Lecture Notes with 2M Q&A"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Target Department *
              </label>
              <select
                value={form.department_code}
                onChange={(e) => setForm((f) => ({ ...f, department_code: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} – {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Resource Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                <option value="NOTES">Lecture Notes</option>
                <option value="QB">Question Bank & 2M</option>
                <option value="LAB">Lab Manual</option>
                <option value="SYLLABUS">Syllabus Copy</option>
                <option value="SLIDES">Slides & PPT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Course / Subject Code</label>
              <input
                value={form.subject_code}
                onChange={(e) => setForm((f) => ({ ...f, subject_code: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="e.g. CS3401 or AD3301"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Subject Name</label>
              <input
                value={form.subject_name}
                onChange={(e) => setForm((f) => ({ ...f, subject_name: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="e.g. Design & Analysis of Algorithms"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Academic Year</label>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                {['1', '2', '3', '4'].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Semester</label>
              <select
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Google Drive / Download URL
            </label>
            <input
              type="url"
              value={form.file_url}
              onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="https://drive.google.com/file/d/.../view"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Brief Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="Notes topics covered, question keys, or lab software requirements..."
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all"
            >
              {saving ? 'Publishing...' : 'Publish Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentMaterials() {
  const { data: student } = useStudentProfile();
  const { data: liveMaterials, loading } = useStudyMaterials();
  const [localMaterials, setLocalMaterials] = useState<StudyMaterial[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge curated materials + live supabase materials + locally uploaded materials
  const allMaterials = useMemo(() => {
    const combined: StudyMaterial[] = [...localMaterials];
    const seenIds = new Set<string>();

    // Add locally uploaded
    localMaterials.forEach((m) => seenIds.add(m.id));

    // Add live materials
    (liveMaterials || []).forEach((m) => {
      if (!seenIds.has(m.id)) {
        combined.push(m);
        seenIds.add(m.id);
      }
    });

    // Add curated items
    CURATED_MATERIALS.forEach((m) => {
      if (!seenIds.has(m.id)) {
        combined.push(m);
        seenIds.add(m.id);
      }
    });

    return combined;
  }, [liveMaterials, localMaterials]);

  // Counts per department for pill badges
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allMaterials.length };
    DEPARTMENTS.forEach((d) => {
      counts[d.code] = allMaterials.filter((m) => {
        const dCode = m.department?.code?.toUpperCase() || m.department_id?.toUpperCase() || '';
        return (
          dCode === d.code.toUpperCase() ||
          (d.code === 'AIDS' && dCode.includes('AI')) ||
          (d.code === 'SH' && (dCode.includes('S&H') || dCode.includes('SH') || m.year === 1))
        );
      }).length;
    });
    return counts;
  }, [allMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return allMaterials.filter((item) => {
      // 1. Department match
      if (selectedDept !== 'ALL') {
        const itemDeptCode = item.department?.code?.toUpperCase() || item.department_id?.toUpperCase() || '';
        const isMatch =
          itemDeptCode === selectedDept ||
          (selectedDept === 'AIDS' && (itemDeptCode.includes('AI') || itemDeptCode === 'AIDS')) ||
          (selectedDept === 'SH' && (itemDeptCode.includes('SH') || itemDeptCode.includes('S&H') || item.year === 1));
        if (!isMatch) return false;
      }

      // 2. Year match
      if (selectedYear !== 'ALL') {
        if (item.year !== Number(selectedYear)) return false;
      }

      // 3. Category match
      if (selectedCategory !== 'ALL') {
        const itemCat = item.category?.toUpperCase() || 'NOTES';
        if (itemCat !== selectedCategory) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const subMatch = (item.subject?.name || '').toLowerCase().includes(q);
        const codeMatch = (item.subject?.code || '').toLowerCase().includes(q);
        const deptMatch = (item.department?.name || item.department?.full_name || '').toLowerCase().includes(q);
        const authorMatch = (item.author_name || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);

        if (!titleMatch && !subMatch && !codeMatch && !deptMatch && !authorMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allMaterials, selectedDept, selectedYear, selectedCategory, searchQuery]);

  const handleCopyLink = (item: StudyMaterial) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.file_url || window.location.href);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownload = (item: StudyMaterial) => {
    if (item.file_url && item.file_url.startsWith('http')) {
      window.open(item.file_url, '_blank');
    } else {
      // fallback download simulation
      const blob = new Blob(
        [
          `SENGUNTHAR ENGINEERING COLLEGE (AUTONOMOUS)\nCourse: ${item.subject?.code || 'CS'} - ${item.subject?.name || item.title}\n\nTitle: ${item.title}\n\n${item.description || 'Official academic notes.'}`,
        ],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.subject?.code || 'SEC'}_${item.title.slice(0, 20)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6 animate-fade-in pb-32 md:pb-16 select-none">
      {showUploadModal && (
        <UploadMaterialModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={(newMat) => setLocalMaterials((prev) => [newMat, ...prev])}
        />
      )}

      {/* ─────────────── HEADER BANNER ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0284c7] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-40 h-40 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-sky-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SEC Central Academic Digital Library · Open to All Departments</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Study Materials, Notes & Syllabus
            </h1>
            <p className="text-sky-100 text-sm mt-1 max-w-2xl font-medium">
              Browse handwritten lecture notes, Anna University Regulation 2021 question banks, lab manuals, and syllabus copies across all college departments.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-white text-sky-900 px-5 py-3 text-sm font-bold shadow-lg shadow-sky-950/20 hover:bg-sky-50 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Contribute Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────── 4-CARD OVERVIEW DECK ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
              Total Books
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {allMaterials.length}+
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Curated Resources</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              All Branches
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {DEPARTMENTS.length}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active Departments</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Curriculum
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-none truncate">
              Reg 2021
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Anna Univ Standard</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Direct
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-none truncate">
              100% Free
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">No Login Required</p>
          </div>
        </div>
      </div>

      {/* ─────────────── DEPARTMENT SELECTOR TABS (DEPARTMENT-WISE FILTER) ─────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Select Department (All Branches Viewable by Everyone)</span>
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {departmentCounts[selectedDept] || filteredMaterials.length} Items Found
          </span>
        </div>

        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {/* ALL DEPARTMENTS TAB */}
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`min-w-[120px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              selectedDept === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>All Departments</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedDept === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {departmentCounts['ALL']}
            </span>
          </button>

          {/* INDIVIDUAL DEPARTMENT TABS */}
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept.code;
            const count = departmentCounts[dept.code] || 0;

            return (
              <button
                key={dept.code}
                onClick={() => setSelectedDept(dept.code)}
                className={`min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={isSelected ? { backgroundColor: dept.color } : {}}
              >
                <span>{dept.name}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────── SEARCH & SECONDARY FILTERS ─────────────── */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, course code (e.g. CS3401, AD3301), title, or faculty..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:border-blue-500 focus:outline-none transition-all"
          >
            {YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:border-blue-500 focus:outline-none transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─────────────── MATERIALS GRID ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Available Study Materials</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {filteredMaterials.length} Results
            </span>
          </div>

          {(selectedDept !== 'ALL' || selectedYear !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedYear('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <LoadingState message="Fetching department study materials..." />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
            <EmptyState
              title="No Materials Match Your Criteria"
              message="Try changing the department filter, year level, or clearing your search query."
              icon={BookOpen}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {filteredMaterials.map((item) => {
              const deptCode = item.department?.code?.toUpperCase() || item.department_id?.toUpperCase() || 'GEN';
              const deptMeta = DEPARTMENTS.find((d) => d.code === deptCode) || {
                color: '#2563eb',
                bgLight: 'bg-blue-50',
                borderLight: 'border-blue-200',
              };

              const categoryBadge =
                item.category === 'QB'
                  ? { label: 'Question Bank', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
                  : item.category === 'LAB'
                  ? { label: 'Lab Manual', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
                  : item.category === 'SYLLABUS'
                  ? { label: 'Curriculum', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                  : item.category === 'SLIDES'
                  ? { label: 'Lecture Slides', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
                  : { label: 'Lecture Notes', bg: 'bg-blue-50 text-blue-700 border-blue-200' };

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top Chips Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Department Chip */}
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shadow-2xs"
                          style={{ backgroundColor: deptMeta.color }}
                        >
                          {deptCode}
                        </span>

                        {/* Subject Code */}
                        <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {item.subject?.code || 'CS3001'}
                        </span>
                      </div>

                      {/* Resource Format */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryBadge.bg}`}
                      >
                        {categoryBadge.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Subject Full Name */}
                    <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">
                      {item.subject?.name || 'General Coursework'}
                    </p>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}

                    {/* Author & Academic Info */}
                    <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.author_name || 'Department Faculty'}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                      <span>Year {item.year || 2} · Sem {item.semester || 4}</span>
                      <span>•</span>
                      <span>{item.file_type || 'PDF'} ({item.file_size || '3.5 MB'})</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Share link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Download</span>
                      </button>

                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Open in Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
