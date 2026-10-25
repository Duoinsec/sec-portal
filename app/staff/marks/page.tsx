'use client';

import { useState } from 'react';
import { useStaffProfile, useDepartmentStudents } from '@/lib/hooks';
import { Card, LoadingState, Badge } from '@/components/shared';
import { GraduationCap, Award, BookOpen, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function AddMarksModal({ students, onClose }: { students: any[]; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('INTERNAL_1');
  const [maxMarks, setMaxMarks] = useState('100');
  const [marks, setMarks] = useState<Record<string, string>>(Object.fromEntries(students.map(s => [s.id, ''])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const gradeFor = (obt: number, max: number) => {
    const pct = (obt / max) * 100;
    if (pct >= 90) return 'O'; if (pct >= 80) return 'A+'; if (pct >= 70) return 'A';
    if (pct >= 60) return 'B+'; if (pct >= 50) return 'B'; return 'RA';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setError('Please enter a subject name'); return; }
    setSaving(true); setError('');
    try {
      const records = students
        .filter(s => marks[s.id] !== '' && marks[s.id] !== undefined)
        .map(s => ({
          student_id: s.id, subject_name: subject, exam_type: examType,
          obtained_marks: Number(marks[s.id]), max_marks: Number(maxMarks),
          grade: gradeFor(Number(marks[s.id]), Number(maxMarks)),
        }));
      if (records.length === 0) { setError('Enter at least one student mark'); setSaving(false); return; }
      const { error: err } = await supabase.from('marks').insert(records);
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save marks');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">Enter Marks</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 border-b border-[#E6EEF7] grid grid-cols-3 gap-3">
            {error && <div className="col-span-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
            {success && <div className="col-span-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">Marks saved successfully!</div>}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Subject *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Exam Type</label>
              <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none">
                <option value="INTERNAL_1">Internal 1</option>
                <option value="INTERNAL_2">Internal 2</option>
                <option value="MODEL">Model Exam</option>
                <option value="SEMESTER">Semester Exam</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Max Marks</label>
              <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#E6EEF7]">
            <div className="flex items-center justify-between px-6 py-2 bg-slate-50 text-xs font-semibold text-[#6B7280]">
              <span>Student</span><span>Marks (out of {maxMarks})</span>
            </div>
            {students.map(std => (
              <div key={std.id} className="flex items-center justify-between px-6 py-3 hover:bg-[#F8FBFF]">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                  <p className="text-xs text-[#6B7280]">{std.register_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max={maxMarks} value={marks[std.id] || ''} onChange={e => setMarks(prev => ({...prev, [std.id]: e.target.value}))}
                    className="w-20 rounded-xl border border-[#E6EEF7] px-3 py-1.5 text-sm text-center focus:border-[#1468D5] focus:outline-none" placeholder="--" />
                  {marks[std.id] && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(marks[std.id]) >= (Number(maxMarks)*0.5) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {gradeFor(Number(marks[std.id]), Number(maxMarks))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#E6EEF7] flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffMarks() {
  const { data: staff } = useStaffProfile();
  const { data: students, loading } = useDepartmentStudents(staff?.department_id || undefined);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in pb-32 md:pb-16 select-none">
      {showModal && <AddMarksModal students={students} onClose={() => setShowModal(false)} />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Marks & Grade Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">{staff?.department?.name || 'Department'} - Student internal assessments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> Enter Marks
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600"><Award className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">8.45</p><p className="text-xs text-[#6B7280]">Dept Avg CGPA</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1468D5]"><GraduationCap className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">100%</p><p className="text-xs text-[#6B7280]">Pass Percentage</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><BookOpen className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">5</p><p className="text-xs text-[#6B7280]">Core Subjects</p></div>
        </Card>
      </div>
      <h2 className="text-lg font-semibold text-[#172033] mb-3">Student Performance Summary</h2>
      {loading ? (<LoadingState message="Loading grades..." />) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[#E6EEF7]">
            {students.map((std) => (
              <div key={std.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF]">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                  <p className="text-xs text-[#6B7280]">{std.register_number} - Year {std.year}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">CGPA: {std.cgpa?.toFixed(2)}</p>
                    <p className="text-[11px] text-[#6B7280]">Backlogs: {std.backlogs ?? 0}</p>
                  </div>
                  <Badge variant={std.cgpa && std.cgpa >= 8.5 ? 'success' : 'info'}>
                    {std.cgpa && std.cgpa >= 8.5 ? 'Distinction' : 'First Class'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}