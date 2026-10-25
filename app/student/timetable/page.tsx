'use client';

import { useState, useMemo } from 'react';
import { useStudentProfile, useTimetable, useExamSchedules } from '@/lib/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import {
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  Sparkles,
  Layers,
  GraduationCap,
  CalendarCheck,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
];

export default function StudentTimetable() {
  const { data: student } = useStudentProfile();
  const { data: timetable, loading: ttLoading } = useTimetable(
    student?.department_id || undefined,
    student?.year
  );
  const { data: exams, loading: examLoading } = useExamSchedules(
    student?.department_id || undefined,
    student?.year
  );

  // Current day calculation
  const currentDayOfWeek = new Date().getDay();
  const defaultDay = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 ? currentDayOfWeek : 1;
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);

  // Day entries sorted by start_time
  const dayEntries = useMemo(() => {
    return timetable
      .filter((entry) => entry.day_of_week === selectedDay)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [timetable, selectedDay]);

  // Counts per day for day tab badges
  const dayCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    DAYS.forEach((d) => {
      counts[d.id] = timetable.filter((entry) => entry.day_of_week === d.id).length;
    });
    return counts;
  }, [timetable]);

  // Today's total and next upcoming
  const todayCount = dayEntries.length;
  const totalWeeklySlots = timetable.length;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6 animate-fade-in pb-32 md:pb-16 select-none">

      {/* ─────────────── HEADER BANNER ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#2563eb] p-6 text-white shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-36 h-36 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Academic Timetable · SEC Campus</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Class Schedule & Timetable Matrix
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl font-medium">
              {student?.department?.name || 'Department of Computer Science & Engineering'} &nbsp;·&nbsp;
              Year {student?.year || 2} &nbsp;·&nbsp; Semester {student?.semester || 3}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                Active Cycle
              </span>
              <span className="text-xl md:text-2xl font-black text-white leading-tight">
                Regular Day Order
              </span>
              <span className="text-[10px] text-blue-200 block font-semibold mt-0.5">
                8:45 AM – 4:30 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── 4-CARD QUICK METRICS DECK ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Selected Day Classes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between">
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
              {todayCount}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Periods Scheduled</p>
          </div>
        </div>

        {/* Weekly Load */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              5 Working Days
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {totalWeeklySlots}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Weekly Course Hours</p>
          </div>
        </div>

        {/* Exam Count */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Announced
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {exams.length}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Scheduled Examinations</p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-violet-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
              Full Day
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-none truncate">
              7 Periods
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Daily Period System</p>
          </div>
        </div>

      </div>

      {/* ─────────────── DAY SELECTOR TABS (SEAMLESS & ALIGNED) ─────────────── */}
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

      {/* ─────────────── SCHEDULE TIMELINE FOR SELECTED DAY ─────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>
              {DAYS.find((d) => d.id === selectedDay)?.name}&rsquo;s Class Schedule
            </span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {dayEntries.length} Period Slots
          </span>
        </div>

        {ttLoading ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <LoadingState message="Fetching timetable schedule..." />
          </div>
        ) : dayEntries.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
            <EmptyState
              title={`No Classes on ${DAYS.find((d) => d.id === selectedDay)?.name}`}
              message="No timetable slots are scheduled for this day. Enjoy your study break!"
              icon={BookOpen}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {dayEntries.map((slot, index) => {
              const periodNumber = index + 1;
              const isLab = (slot.subject?.name || '').toLowerCase().includes('lab') || (slot.room || '').toLowerCase().includes('lab');

              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Period Badge & Time */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">
                        Period
                      </span>
                      <span className="text-lg font-black text-blue-700 leading-tight">
                        {periodNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                          {slot.subject?.code || 'CS3001'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isLab
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLab ? 'Practical / Lab' : 'Theory Session'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug truncate" title={slot.subject?.name || 'Class Subject'}>
                        {slot.subject?.name || 'Class Subject'}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                        {slot.room && (
                          <span className="flex items-center gap-1 text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {slot.room.toLowerCase().includes('hall') || slot.room.toLowerCase().includes('room') || slot.room.toLowerCase().includes('lab')
                              ? slot.room
                              : `Hall ${slot.room}`}
                          </span>
                        )}
                        <span>SEC Main Academic Block</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Slot Badge */}
                  <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-block">
                      50 Minutes Duration
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────── UPCOMING EXAMINATIONS SECTION (SYMMETRICAL GRID) ─────────────── */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span>Upcoming Examination Schedules</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {exams.length} Scheduled
          </span>
        </div>

        {examLoading ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <LoadingState message="Loading exam schedule..." />
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center">
            <p className="text-sm font-semibold text-slate-600">
              No Upcoming Exam Schedules Announced
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Test timetables will automatically appear here once published by the Controller of Examinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {exams.map((exam) => {
              const examDate = new Date(exam.exam_date);
              const daysLeft = differenceInDays(examDate, new Date());
              const daysLeftText =
                daysLeft === 0
                  ? 'Today'
                  : daysLeft === 1
                  ? 'Tomorrow'
                  : daysLeft > 1
                  ? `In ${daysLeft} Days`
                  : 'Completed';

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between border-l-4 border-l-amber-500"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          {exam.exam_type || 'Internal Test'}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {exam.subject?.code || 'CS3001'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          daysLeft <= 2
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {daysLeftText}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug truncate" title={exam.subject?.name || 'Subject Exam'}>
                      {exam.subject?.name || 'Subject Exam'}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {format(examDate, 'EEE, MMM d, yyyy')}
                    </span>
                    <span className="font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {exam.start_time} – {exam.end_time}
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
