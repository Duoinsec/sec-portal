'use client';

import { useState } from 'react';
import { useStaffProfile, useDepartmentStudents } from '@/lib/hooks';
import { Card, LoadingState, Badge } from '@/components/shared';
import { CalendarCheck, Users, CheckCircle, Clock, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

function MarkAttendanceModal({ students, departmentId, onClose }: { students: any[]; departmentId: string; onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState('1');
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(students.map(s => [s.id, 'PRESENT' as AttendanceStatus]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggle = (id: string) => {
    setStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'PRESENT' ? 'ABSENT' : prev[id] === 'ABSENT' ? 'LATE' : 'PRESENT',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setError('Please enter a subject name'); return; }
    setSaving(true); setError('');
    try {
      const records = students.map(s => ({
        student_id: s.id, date, subject_name: subject,
        session_number: Number(session), status: statuses[s.id], department_id: departmentId,
      }));
      const { error: err } = await supabase.from('attendance').insert(records);
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  const counts = Object.values(statuses).reduce((acc: any, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">Mark Attendance</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 border-b border-[#E6EEF7] grid grid-cols-3 gap-3">
            {error && <div className="col-span-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
            {success && <div className="col-span-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">Attendance saved!</div>}
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Subject *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. DBMS" className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Session</label>
              <select value={session} onChange={e => setSession(e.target.value)} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm focus:border-[#1468D5] focus:outline-none">
                {['1','2','3','4','5','6'].map(n => <option key={n}>Period {n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4 px-6 py-2 border-b border-[#E6EEF7] text-xs font-semibold">
            <span className="text-green-600">Present: {counts['PRESENT'] || 0}</span>
            <span className="text-red-500">Absent: {counts['ABSENT'] || 0}</span>
            <span className="text-amber-500">Late: {counts['LATE'] || 0}</span>
            <button type="button" onClick={() => setStatuses(Object.fromEntries(students.map(s => [s.id, 'PRESENT' as AttendanceStatus])))} className="ml-auto text-[#1468D5] hover:underline">Mark All Present</button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#E6EEF7]">
            {students.map(std => (
              <div key={std.id} className="flex items-center justify-between px-6 py-3 hover:bg-[#F8FBFF]">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                  <p className="text-xs text-[#6B7280]">{std.register_number} - Yr {std.year}</p>
                </div>
                <button type="button" onClick={() => toggle(std.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${statuses[std.id] === 'PRESENT' ? 'bg-green-100 text-green-700' : statuses[std.id] === 'ABSENT' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                  {statuses[std.id]}
                </button>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#E6EEF7] flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffAttendance() {
  const { data: staff } = useStaffProfile();
  const { data: students, loading } = useDepartmentStudents(staff?.department_id || undefined);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      {showModal && (
        <MarkAttendanceModal students={students} departmentId={staff?.department_id || ''} onClose={() => setShowModal(false)} />
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Attendance Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">{staff?.department?.name || 'Department'} - Mark and view student attendance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> Mark Attendance
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1468D5]"><Users className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">{students.length}</p><p className="text-xs text-[#6B7280]">Total Students</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600"><CheckCircle className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">92%</p><p className="text-xs text-[#6B7280]">Avg Attendance</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><Clock className="h-6 w-6" /></div>
          <div><p className="text-2xl font-bold text-[#172033]">Today</p><p className="text-xs text-[#6B7280]">Active Session</p></div>
        </Card>
      </div>
      <h2 className="text-lg font-semibold text-[#172033] mb-3">Department Roll Call</h2>
      {loading ? (<LoadingState message="Loading student list..." />) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[#E6EEF7]">
            {students.map((std) => (
              <div key={std.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF]">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                  <p className="text-xs text-[#6B7280]">{std.register_number} - Year {std.year}</p>
                </div>
                <Badge variant="success">Present</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}