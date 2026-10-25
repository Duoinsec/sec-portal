'use client';

import { useState } from 'react';
import { useStaffProfile, useDepartmentStudents } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Users, Search, GraduationCap, Plus, X, Pencil, Trash2, AlertTriangle, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function AddStudentModal({ departmentId, onClose, onSuccess }: { departmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    register_number: '',
    year: '1',
    semester: '1',
    section: 'A',
    cgpa: '',
    admission_year: new Date().getFullYear().toString(),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const profileId = crypto.randomUUID();
      const { error: profErr } = await supabase.from('profiles').insert({
        id: profileId,
        full_name: form.full_name,
        email: form.email,
        role: 'STUDENT',
        ...(form.password ? { password: form.password } : {}),
      });
      if (profErr) throw profErr;

      const { error: stdErr } = await supabase.from('students').insert({
        profile_id: profileId,
        full_name: form.full_name,
        department_id: departmentId,
        register_number: form.register_number,
        password: form.password || null,
        year: Number(form.year),
        semester: Number(form.semester),
        section: form.section,
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        admission_year: Number(form.admission_year),
        backlogs: 0,
      });
      if (stdErr) throw stdErr;

      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7] shrink-0">
          <h2 className="text-lg font-bold text-[#172033]">Add New Student</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Full Name *</label>
              <input
                required
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
                placeholder="e.g. Priya Dharshini"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
                placeholder="student@sec.edu.in"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none pr-10"
                  placeholder="e.g. SEC@2024"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Register Number *</label>
              <input
                required
                value={form.register_number}
                onChange={e => setForm(f => ({ ...f, register_number: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
                placeholder="23AD001"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Section</label>
              <select
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['A', 'B', 'C', 'D'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Year</label>
              <select
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['1', '2', '3', '4'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Semester</label>
              <select
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Initial CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
                placeholder="8.50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Admission Year</label>
              <input
                value={form.admission_year}
                onChange={e => setForm(f => ({ ...f, admission_year: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
                placeholder="2023"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
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
              className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] transition-colors disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStudentModal({ student, onClose, onSuccess }: { student: any; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    full_name: student.full_name || '',
    register_number: student.register_number || '',
    password: student.password || '',
    section: student.section || 'A',
    year: student.year?.toString() || '1',
    semester: student.semester?.toString() || '1',
    cgpa: student.cgpa != null ? student.cgpa.toString() : '',
    backlogs: (student.backlogs ?? 0).toString(),
    admission_year: (student.admission_year || new Date().getFullYear()).toString(),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      // 1. Update students table
      const { error: stdErr } = await supabase.from('students').update({
        full_name: form.full_name,
        register_number: form.register_number,
        password: form.password || null,
        section: form.section,
        year: Number(form.year),
        semester: Number(form.semester),
        cgpa: form.cgpa ? Number(form.cgpa) : null,
        backlogs: Number(form.backlogs || 0),
        admission_year: Number(form.admission_year),
      }).eq('id', student.id);

      if (stdErr) throw stdErr;

      // 2. Also update profiles table if profile_id exists
      if (student.profile_id) {
        await supabase.from('profiles').update({
          full_name: form.full_name,
          ...(form.password ? { password: form.password } : {}),
        }).eq('id', student.profile_id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7] shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#1468D5] flex items-center justify-center">
              <Pencil className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-[#172033]">Edit Student Details</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Full Name *</label>
              <input
                required
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Register Number *</label>
              <input
                required
                value={form.register_number}
                onChange={e => setForm(f => ({ ...f, register_number: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Student Login</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none pr-10"
                  placeholder="Enter student password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Section</label>
              <select
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['A', 'B', 'C', 'D'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Year</label>
              <select
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['1', '2', '3', '4'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Semester</label>
              <select
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none bg-white"
              >
                {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Backlogs</label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.backlogs}
                onChange={e => setForm(f => ({ ...f, backlogs: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Admission Year</label>
              <input
                value={form.admission_year}
                onChange={e => setForm(f => ({ ...f, admission_year: e.target.value }))}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
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
              className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteStudentModal({ student, onClose, onSuccess }: { student: any; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      // Delete student record
      const { error: stdErr } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (stdErr) throw stdErr;

      // Delete associated profile record if present
      if (student.profile_id) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', student.profile_id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-[#172033]">Delete Student?</h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Are you sure you want to remove <strong className="text-[#172033] font-semibold">{student.full_name}</strong> ({student.register_number})?
          </p>
          <p className="mt-1 text-xs text-red-500">
            This action cannot be undone. All marks and attendance linked will also be affected.
          </p>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 text-left">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffStudents() {
  const { data: staff } = useStaffProfile();
  const { data: students, loading, refresh } = useDepartmentStudents(staff?.department_id || undefined) as any;
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);

  const filtered = (students || []).filter(
    (s: any) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full px-2.5 sm:px-4 md:px-6 py-4 md:py-6 animate-fade-in min-h-full flex flex-col pb-32 md:pb-8">
      {/* Add Modal */}
      {showAddModal && staff?.department_id && (
        <AddStudentModal
          departmentId={staff.department_id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <DeleteStudentModal
          student={deletingStudent}
          onClose={() => setDeletingStudent(null)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      {/* Header */}
      <div className="mb-6 w-full">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#172033] leading-tight">Department Students</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mt-1.5">
          {staff?.department?.name || 'Department'} · Total: {(students || []).length} students enrolled
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="Search by student name or register number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6EEF7] bg-white text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
        />
      </div>

      {/* Student Cards List */}
      <div className="flex-1 w-full">
        {loading ? (
          <LoadingState message="Loading department students..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No Students Found" message="No student records match your query." icon={Users} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((std: any) => (
              <Card key={std.id} className="hover:border-[#1468D5]/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-[#172033] truncate">{std.full_name}</h3>
                      <p className="text-xs text-[#1468D5] font-semibold">{std.register_number}</p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Year {std.year} · Sem {std.semester} · Section {std.section}
                      </p>

                      {/* Password pill */}
                      {std.password && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1 text-xs text-slate-600">
                          <Lock className="h-3 w-3 text-[#1468D5]" />
                          <span>Password: <span className="font-mono font-semibold text-slate-800">{std.password}</span></span>
                        </div>
                      )}
                    </div>
                    <Badge variant={std.cgpa && std.cgpa >= 8.0 ? 'success' : 'info'}>
                      CGPA {std.cgpa?.toFixed(2) ?? 'N/A'}
                    </Badge>
                  </div>
                </div>

                {/* Footer with Details & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#E6EEF7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
                  <div className="flex items-center gap-2">
                    <span>Backlogs: <strong className={std.backlogs ? 'text-red-500' : 'text-green-600'}>{std.backlogs ?? 0}</strong></span>
                    <span>•</span>
                    <span>Batch: {std.admission_year || '2023'}</span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => setEditingStudent(std)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#1468D5] hover:bg-blue-50 border border-slate-200 transition-colors"
                      title="Edit student"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#1468D5]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingStudent(std)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                      title="Delete student"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
