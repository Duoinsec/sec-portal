'use client';

import { useState } from 'react';
import { useStaffProfile, useDepartmentStudents } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Users, Search, GraduationCap, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function AddStudentModal({ departmentId, onClose, onSuccess }: { departmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ full_name: '', email: '', register_number: '', year: '1', semester: '1', section: 'A', cgpa: '', admission_year: new Date().getFullYear().toString() });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      // Create auth user first
      const { data: authData, error: authErr } = await supabase.auth.admin ? 
        { data: null, error: { message: 'Use service key for auth creation' } } :
        { data: null, error: null };

      // Insert profile + student record directly (for demo – in production use a server action)
      const profileId = crypto.randomUUID();
      const { error: profErr } = await supabase.from('profiles').insert({
        id: profileId, full_name: form.full_name, email: form.email, role: 'STUDENT',
      });
      if (profErr) throw profErr;

      const { error: stdErr } = await supabase.from('students').insert({
        profile_id: profileId, department_id: departmentId,
        register_number: form.register_number, year: Number(form.year),
        semester: Number(form.semester), section: form.section,
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        admission_year: Number(form.admission_year), backlogs: 0,
      });
      if (stdErr) throw stdErr;

      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">Add New Student</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Full Name *</label>
              <input required value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. Priya Dharshini" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="student@sec.edu.in" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Register Number *</label>
              <input required value={form.register_number} onChange={e => setForm(f => ({...f, register_number: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="23AD001" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Section</label>
              <select value={form.section} onChange={e => setForm(f => ({...f, section: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none">
                {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Year</label>
              <select value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none">
                {['1','2','3','4'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Semester</label>
              <select value={form.semester} onChange={e => setForm(f => ({...f, semester: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none">
                {['1','2','3','4','5','6','7','8'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Initial CGPA</label>
              <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm(f => ({...f, cgpa: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="8.50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Admission Year</label>
              <input value={form.admission_year} onChange={e => setForm(f => ({...f, admission_year: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="2023" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] transition-colors disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffStudents() {
  const { data: staff } = useStaffProfile();
  const { data: students, loading, refresh } = useDepartmentStudents(staff?.department_id || undefined) as any;
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = (students || []).filter(
    (s: any) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      {showModal && staff?.department_id && (
        <AddStudentModal
          departmentId={staff.department_id}
          onClose={() => setShowModal(false)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Students</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {staff?.department?.name || 'Department'} · Total: {(students || []).length} students enrolled
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="Search by student name or register number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6EEF7] bg-white text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading department students..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Students Found" message="No student records match your query." icon={Users} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((std) => (
            <Card key={std.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#172033]">{std.full_name}</h3>
                  <p className="text-xs text-[#1468D5] font-semibold">{std.register_number}</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Year {std.year} · Sem {std.semester} · Section {std.section}
                  </p>
                </div>
                <Badge variant={std.cgpa && std.cgpa >= 8.0 ? 'success' : 'info'}>
                  CGPA {std.cgpa?.toFixed(2) ?? 'N/A'}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6EEF7] flex items-center justify-between text-xs text-[#6B7280]">
                <span>Backlogs: <strong className={std.backlogs ? 'text-red-500' : 'text-green-600'}>{std.backlogs ?? 0}</strong></span>
                <span>Batch: {std.admission_year || '2023'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
