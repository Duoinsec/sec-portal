'use client';

import { useState } from 'react';
import { useStaffProfile, useTimetable } from '@/lib/hooks';
import { Card, LoadingState } from '@/components/shared';
import { Clock, MapPin, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DAYS = [{ id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }, { id: 3, name: 'Wednesday' }, { id: 4, name: 'Thursday' }, { id: 5, name: 'Friday' }];

function AddSlotModal({ departmentId, onClose, onSuccess }: { departmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ day_of_week: '1', start_time: '09:00', end_time: '10:00', subject_name: '', room: '', year: '1', semester: '1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_name.trim()) { setError('Subject name is required'); return; }
    setSaving(true); setError('');
    try {
      const { error: err } = await supabase.from('timetable').insert({
        department_id: departmentId, day_of_week: Number(form.day_of_week),
        start_time: form.start_time, end_time: form.end_time,
        subject_name: form.subject_name, room: form.room || null,
        year: Number(form.year), semester: Number(form.semester),
      });
      if (err) throw err;
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add timetable slot');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7]">
          <h2 className="text-lg font-bold text-[#172033]">Add Timetable Slot</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Subject / Course *</label>
              <input required value={form.subject_name} onChange={e => setForm(f => ({...f, subject_name: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. Data Structures & Algorithms" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Day</label>
              <select value={form.day_of_week} onChange={e => setForm(f => ({...f, day_of_week: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none">
                {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Room</label>
              <input value={form.room} onChange={e => setForm(f => ({...f, room: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. LH-203" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" />
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
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffTimetable() {
  const { data: staff } = useStaffProfile();
  const { data: timetable, loading, refresh } = useTimetable(staff?.department_id || undefined, 2) as any;
  const [selectedDay, setSelectedDay] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const daySlots = (timetable || []).filter((t: any) => t.day_of_week === selectedDay);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      {showModal && staff?.department_id && (
        <AddSlotModal departmentId={staff.department_id} onClose={() => setShowModal(false)} onSuccess={() => typeof refresh === 'function' && refresh()} />
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Department Timetable</h1>
          <p className="text-sm text-[#6B7280] mt-1">Class schedule and lecture assignments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> Add Slot
        </button>
      </div>
      <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#E6EEF7] shadow-sm mb-6">
        {DAYS.map((d) => (
          <button key={d.id} onClick={() => setSelectedDay(d.id)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${selectedDay === d.id ? 'bg-[#1468D5] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F8FBFF]'}`}>
            {d.name}
          </button>
        ))}
      </div>
      {loading ? (<LoadingState message="Loading timetable..." />) : daySlots.length === 0 ? (
        <Card className="py-8 text-center text-sm text-[#6B7280]">No lecture slots scheduled for this day.</Card>
      ) : (
        <div className="space-y-3">
          {daySlots.map((slot: any) => (
            <Card key={slot.id} className="flex items-center justify-between hover:border-[#1468D5]/30">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5] font-bold text-xs">
                  <span>{slot.start_time?.slice(0, 5)}</span>
                  <span className="text-[10px] opacity-75">{slot.end_time?.slice(0, 5)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#172033]">{slot.subject?.name || slot.subject_name || 'Lecture'}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {slot.room && (<span className="text-xs text-[#6B7280] flex items-center gap-1"><MapPin className="h-3 w-3 text-[#1468D5]" /> Room {slot.room}</span>)}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">Year {slot.year}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}