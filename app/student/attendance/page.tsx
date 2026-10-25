'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useAttendanceSummary, useAttendanceRecords } from '@/lib/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import {
  CalendarCheck,
  Check,
  X,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentAttendance() {
  const { profile } = useAuth();
  const { data: student } = useStudentProfile();
  const { data: summary, loading: sumLoading } = useAttendanceSummary(student?.id);
  const { data: records, loading: recLoading } = useAttendanceRecords(student?.id);

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LEAVE_OD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { present = 0, absent = 0, leave = 0, od = 0, total = 0, percentage = 0 } = summary || {};

  // Anna University 75% Threshold Margin Calculator
  const marginInfo = useMemo(() => {
    if (total === 0) return { canMiss: 0, needToAttend: 0, isEligible: true };
    const effectivePresent = present + od;
    if (percentage >= 75) {
      const canMiss = Math.max(0, Math.floor((effectivePresent - 0.75 * total) / 0.75));
      return { canMiss, needToAttend: 0, isEligible: true };
    } else {
      const needToAttend = Math.max(1, Math.ceil((0.75 * total - effectivePresent) / 0.25));
      return { canMiss: 0, needToAttend, isEligible: false };
    }
  }, [present, od, total, percentage]);

  // Subject-wise Breakdown
  const subjectStats = useMemo(() => {
    const map: Record<string, { id: string; name: string; code?: string; total: number; present: number; absent: number; leave: number; od: number }> = {};

    records.forEach((rec) => {
      const sub = rec.session?.subject;
      const key = sub?.name || 'General Academic';
      if (!map[key]) {
        map[key] = {
          id: sub?.id || key,
          name: key,
          code: (sub as any)?.code || (sub as any)?.subject_code,
          total: 0,
          present: 0,
          absent: 0,
          leave: 0,
          od: 0,
        };
      }
      map[key].total += 1;
      if (rec.status === 'PRESENT') map[key].present += 1;
      else if (rec.status === 'ABSENT') map[key].absent += 1;
      else if (rec.status === 'LEAVE') map[key].leave += 1;
      else if (rec.status === 'OD') map[key].od += 1;
    });

    return Object.values(map).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round(((s.present + s.od) / s.total) * 100) : 0,
    }));
  }, [records]);

  // Filtered session records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (selectedFilter === 'PRESENT' && rec.status !== 'PRESENT') return false;
      if (selectedFilter === 'ABSENT' && rec.status !== 'ABSENT') return false;
      if (selectedFilter === 'LEAVE_OD' && rec.status !== 'LEAVE' && rec.status !== 'OD') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subName = (rec.session?.subject?.name || '').toLowerCase();
        const dateStr = rec.session?.session_date || '';
        return subName.includes(q) || dateStr.includes(q);
      }
      return true;
    });
  }, [records, selectedFilter, searchQuery]);

  // SVG Gauge calculations
  const ringSize = 150;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const gaugeColor = percentage >= 75 ? '#10B981' : percentage >= 65 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6 animate-fade-in pb-32 md:pb-16 select-none">
      
      {/* ─────────────── HEADER BANNER ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3c7a] via-[#1e40af] to-[#2563eb] p-6 text-white shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-36 h-36 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Year 2024–2025 · Semester {student?.semester || 5}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Attendance Intelligence
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl font-medium">
              {student?.full_name || profile?.full_name || 'Student'} &nbsp;·&nbsp;
              <span className="font-semibold">{student?.register_number || '7322...'}</span> &nbsp;·&nbsp;
              {student?.department?.name || 'Computer Science & Engineering'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">Required Target</span>
              <span className="text-xl font-black text-white">75.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── COMPLIANCE & MARGIN STATUS BANNER ─────────────── */}
      <div
        className={`rounded-2xl border p-4.5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          percentage >= 75
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : percentage >= 65
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-rose-50/80 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              percentage >= 75
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : percentage >= 65
                ? 'bg-amber-500 text-white shadow-amber-200'
                : 'bg-rose-500 text-white shadow-rose-200'
            }`}
          >
            {percentage >= 75 ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">
                {percentage >= 75
                  ? 'Anna University Exam Eligibility: SECURED'
                  : percentage >= 65
                  ? 'Medical Condonation Range: CAUTION'
                  : 'Attendance Shortage: ACTION REQUIRED'}
              </h3>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {percentage >= 75
                ? `Current aggregate is ${percentage.toFixed(1)}%. You are officially eligible to appear for semester end examinations.`
                : percentage >= 65
                ? `Current aggregate is ${percentage.toFixed(1)}%. Attendance is between 65% - 74% requiring formal condonation approval.`
                : `Current aggregate is ${percentage.toFixed(1)}%, which is below the mandatory 65% minimum condonation threshold.`}
            </p>
          </div>
        </div>

        {/* Dynamic Margin Pill */}
        <div className="shrink-0 self-start sm:self-center">
          <div
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 border ${
              percentage >= 75
                ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                : 'bg-rose-100/90 text-rose-800 border-rose-300'
            }`}
          >
            {percentage >= 75 ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Buffer: Safe to miss {marginInfo.canMiss} session{marginInfo.canMiss === 1 ? '' : 's'}</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Target: Attend next {marginInfo.needToAttend} session{marginInfo.needToAttend === 1 ? '' : 's'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────── HERO METRICS GRID (BALANCED & ALIGNED) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Ring Gauge Hero Card (Left 5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Aggregate</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                percentage >= 75
                  ? 'bg-emerald-100 text-emerald-700'
                  : percentage >= 65
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {percentage >= 75 ? 'Optimal' : percentage >= 65 ? 'Borderline' : 'Critical'}
            </span>
          </div>

          {sumLoading ? (
            <LoadingState message="Calculating aggregate..." />
          ) : (
            <div className="relative my-3 flex items-center justify-center">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={strokeWidth}
                />
                {/* Dynamic Colored Ring Value */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inside Gauge Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5">
                  {present + od} of {total} Classes
                </span>
              </div>
            </div>
          )}

          {/* Sub-bar Distribution */}
          <div className="w-full pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Attendance Distribution</span>
              <span className="text-slate-400">{total} Hours Recorded</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div
                style={{ width: `${total ? (present / total) * 100 : 0}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Present: ${present}`}
              />
              <div
                style={{ width: `${total ? (od / total) * 100 : 0}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`OD: ${od}`}
              />
              <div
                style={{ width: `${total ? (leave / total) * 100 : 0}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Leave: ${leave}`}
              />
              <div
                style={{ width: `${total ? (absent / total) * 100 : 0}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Absent: ${absent}`}
              />
            </div>
          </div>
        </div>

        {/* 2x2 Precision Metric Cards (Right 7 Columns) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          
          {/* Present Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {total ? Math.round((present / total) * 100) : 0}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 leading-none">{present}</div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Sessions Present</p>
            </div>
          </div>

          {/* Absent Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-rose-200 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <X className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                {total ? Math.round((absent / total) * 100) : 0}%
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 leading-none">{absent}</div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Sessions Absent</p>
            </div>
          </div>

          {/* Approved Leaves Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Permitted
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 leading-none">{leave}</div>
              <p className="text-xs font-semibold text-slate-500 mt-1">Approved Leaves</p>
            </div>
          </div>

          {/* On-Duty (OD) Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Credited
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 leading-none">{od}</div>
              <p className="text-xs font-semibold text-slate-500 mt-1">On-Duty / OD</p>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────── SUBJECT-WISE ATTENDANCE BREAKDOWN ─────────────── */}
      {subjectStats.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Subject-Wise Performance</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {subjectStats.length} Registered Courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectStats.map((sub) => {
              const subPct = sub.percentage;
              const subColor = subPct >= 75 ? 'bg-emerald-500' : subPct >= 65 ? 'bg-amber-500' : 'bg-rose-500';
              const badgeBg = subPct >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : subPct >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                          {sub.code || 'CORE'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate" title={sub.name}>
                          {sub.name}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${badgeBg}`}>
                        {subPct}%
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span>Attendance Ratio</span>
                        <span className="font-bold text-slate-800">
                          {sub.present + sub.od} / {sub.total} Classes
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${subColor}`}
                          style={{ width: `${Math.min(subPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Missed: <strong className="text-slate-700">{sub.absent}</strong></span>
                    <span>Leaves: <strong className="text-slate-700">{sub.leave}</strong></span>
                    <span>Status: <strong className={subPct >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{subPct >= 75 ? 'Eligible' : 'Risk'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────── SESSION ATTENDANCE LOG & FILTERS ─────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <span>Detailed Attendance Ledger</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Verified timetable session records and time logs
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Logs ({records.length})
          </button>
          <button
            onClick={() => setSelectedFilter('PRESENT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Present ({present})
          </button>
          <button
            onClick={() => setSelectedFilter('ABSENT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Absent ({absent})
          </button>
          <button
            onClick={() => setSelectedFilter('LEAVE_OD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'LEAVE_OD'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Leave / OD ({leave + od})
          </button>
        </div>

        {/* Records Table / Card List */}
        {recLoading ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs flex items-center justify-center">
            <LoadingState message="Fetching timetable logs..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
            <EmptyState
              title="No Attendance Records Found"
              message={
                searchQuery
                  ? `No sessions matched "${searchQuery}". Try a different search term.`
                  : 'There are no session records matching this filter.'
              }
              icon={CalendarCheck}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredRecords.slice(0, 50).map((rec) => {
                const isPresent = rec.status === 'PRESENT';
                const isAbsent = rec.status === 'ABSENT';
                const isLeave = rec.status === 'LEAVE';
                const isOD = rec.status === 'OD';

                const badgeStyle = isPresent
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isAbsent
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isLeave
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

                const statusLabel = isPresent ? 'Present' : isAbsent ? 'Absent' : isLeave ? 'Leave' : 'On-Duty (OD)';

                const sessionNumber = (rec.session as any)?.session_number || (rec as any)?.session_number || 1;

                return (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Status indicator dot / avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : isAbsent
                            ? 'bg-rose-50 text-rose-500 border-rose-100'
                            : isLeave
                            ? 'bg-amber-50 text-amber-500 border-amber-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        {isPresent ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : isAbsent ? (
                          <X className="w-4 h-4 stroke-[2.5]" />
                        ) : isLeave ? (
                          <Clock3 className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Award className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {rec.session?.subject?.name || 'Class Session'}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                            Period {sessionNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {rec.session?.session_date
                            ? format(new Date(rec.session.session_date), 'EEE, MMM d, yyyy')
                            : (rec as any)?.date
                            ? format(new Date((rec as any).date), 'EEE, MMM d, yyyy')
                            : 'Logged Session'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeStyle}`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPresent
                              ? 'bg-emerald-500'
                              : isAbsent
                              ? 'bg-rose-500'
                              : isLeave
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRecords.length > 50 && (
              <div className="px-5 py-3 bg-slate-50/50 text-center text-xs font-semibold text-slate-500 border-t border-slate-100">
                Showing latest 50 records of {filteredRecords.length}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
