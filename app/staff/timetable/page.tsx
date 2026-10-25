'use client';

import { useState, useMemo } from 'react';
import { useStaffProfile, useTimetable } from '@/lib/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import {
  Clock,
  MapPin,
  Plus,
  X,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
];

function AddSlotModal({
  departmentId,
  onClose,
  onSuccess,
}: {
  departmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    day_of_week: '1',
    start_time: '09:00',
    end_time: '10:00',
    subject_name: '',
    room: '',
    year: '1',
    semester: '1',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_name.trim()) {
      setError('Subject name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { error: err } = await supabase.from('timetable').insert({
        department_id: departmentId,
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        subject_name: form.subject_name.trim(),
        room: form.room.trim() || null,
        year: Number(form.year),
        semester: Number(form.semester),
      });
      if (err) throw err;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add timetable slot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Schedule New Slot</h2>
              <p className="text-xs text-blue-100 font-medium">Add class period to department schedule</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Course / Subject Title *
            </label>
            <input
              required
              value={form.subject_name}
              onChange={(e) => setForm((f) => ({ ...f, subject_name: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="e.g. CS3401 Algorithms & Complexity"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Day of Week</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Room / Lab Hall</label>
              <input
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="e.g. LH-302 or Turing Lab"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">End Time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-white"
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
              {saving ? 'Saving...' : 'Confirm & Save'}
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

  // Filter day slots sorted by time
  const daySlots = useMemo(() => {
    return (timetable || [])
      .filter((t: any) => t.day_of_week === selectedDay)
      .sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [timetable, selectedDay]);

  // Counts per day
  const dayCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    DAYS.forEach((d) => {
      counts[d.id] = (timetable || []).filter((entry: any) => entry.day_of_week === d.id).length;
    });
    return counts;
  }, [timetable]);

  const totalWeeklySlots = (timetable || []).length;
  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6 animate-fade-in pb-32 md:pb-16 select-none">
      {showModal && staff?.department_id && (
        <AddSlotModal
          departmentId={staff.department_id}
          onClose={() => setShowModal(false)}
          onSuccess={() => typeof refresh === 'function' && refresh()}
        />
      )}

      {/* ─────────────── HEADER BANNER ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-6 text-white shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-36 h-36 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Department Schedule & Faculty Workload</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Department Timetable
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl font-medium">
              Manage period allocations, lecture schedules, and classroom assignments.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Timetable Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────── 3-CARD OVERVIEW DECK ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {DAYS.find((d) => d.id === selectedDay)?.short}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {daySlots.length}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Lectures on {DAYS.find((d) => d.id === selectedDay)?.name}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              5 Day Week
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {totalWeeklySlots}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Active Weekly Slots</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
              Department
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-none truncate">
              Year 2 Schedule
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active Batch Filter</p>
          </div>
        </div>
      </div>

      {/* ─────────────── DAY SELECTOR TABS ─────────────── */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {DAYS.map((day) => {
          const isActive = selectedDay === day.id;
          const isToday = currentDayOfWeek === day.id;
          const count = dayCounts[day.id] || 0;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{day.name}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
              {isToday && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-amber-300' : 'bg-blue-600'
                  }`}
                  title="Today"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────── TIMETABLE SLOTS TIMELINE ─────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{DAYS.find((d) => d.id === selectedDay)?.name}&rsquo;s Class Schedule</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {daySlots.length} Slots Allocated
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <LoadingState message="Loading timetable slots..." />
          </div>
        ) : daySlots.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
            <EmptyState
              title={`No Lectures on ${DAYS.find((d) => d.id === selectedDay)?.name}`}
              message="No timetable slots are scheduled for this day yet. Click 'Add Slot' above to create one."
              icon={BookOpen}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {daySlots.map((slot: any, idx: number) => {
              const isLab =
                (slot.subject?.name || slot.subject_name || '').toLowerCase().includes('lab') ||
                (slot.room || '').toLowerCase().includes('lab');

              return (
                <div
                  key={slot.id || idx}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">
                        Slot
                      </span>
                      <span className="text-lg font-black text-blue-700 leading-tight">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                          Year {slot.year || 2} · Sem {slot.semester || 4}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isLab
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLab ? 'Lab / Practical' : 'Lecture'}
                        </span>
                      </div>

                      <h3
                        className="text-base font-bold text-slate-900 leading-snug truncate"
                        title={slot.subject?.name || slot.subject_name || 'Class Subject'}
                      >
                        {slot.subject?.name || slot.subject_name || 'Class Subject'}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                        {slot.room && (
                          <span className="flex items-center gap-1 text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {slot.room.toLowerCase().includes('hall') ||
                            slot.room.toLowerCase().includes('room') ||
                            slot.room.toLowerCase().includes('lab')
                              ? slot.room
                              : `Hall ${slot.room}`}
                          </span>
                        )}
                        <span>SEC Campus</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                      </span>
                    </span>
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