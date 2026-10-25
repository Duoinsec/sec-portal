'use client';

import { useState, useMemo } from 'react';
import { useStudentProfile, useMarks } from '@/lib/hooks';
import { LoadingState, EmptyState } from '@/components/shared';
import {
  GraduationCap,
  Award,
  BookOpen,
  BarChart3,
  Search,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentMarks() {
  const { data: student, loading: studentLoading } = useStudentProfile();
  const { data: marks, loading: marksLoading } = useMarks(student?.id);
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const components = [
    { label: 'All Assessments', value: 'ALL' },
    { label: 'Internal 1', value: 'INTERNAL_1' },
    { label: 'Internal 2', value: 'INTERNAL_2' },
    { label: 'Model Exam', value: 'MODEL' },
    { label: 'Semester Exam', value: 'SEMESTER' },
  ];

  // Filtered marks
  const filteredMarks = useMemo(() => {
    return marks.filter((m) => {
      if (selectedComponent !== 'ALL' && m.component !== selectedComponent) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subName = (m.subject?.name || '').toLowerCase();
        const subCode = (m.subject?.code || '').toLowerCase();
        return subName.includes(q) || subCode.includes(q);
      }
      return true;
    });
  }, [marks, selectedComponent, searchQuery]);

  // Analytics
  const analytics = useMemo(() => {
    const totalCount = marks.length;
    if (totalCount === 0) {
      return {
        avgPercentage: 0,
        topScore: null,
        distinctionCount: 0,
        passCount: 0,
      };
    }

    const percentages = marks.map((m) =>
      m.max_marks > 0 ? (Number(m.obtained_marks) / m.max_marks) * 100 : 0
    );
    const avgPercentage =
      percentages.reduce((a, b) => a + b, 0) / (percentages.length || 1);

    // Find top scoring subject
    let topMark = marks[0];
    marks.forEach((m) => {
      const pctCurrent = (Number(m.obtained_marks) / m.max_marks) * 100;
      const pctTop = (Number(topMark.obtained_marks) / topMark.max_marks) * 100;
      if (pctCurrent > pctTop) topMark = m;
    });

    const distinctionCount = marks.filter((m) =>
      ['O', 'A+', 'A'].includes(m.grade || '') ||
      (Number(m.obtained_marks) / m.max_marks) >= 0.75
    ).length;

    const passCount = marks.filter(
      (m) => (Number(m.obtained_marks) / m.max_marks) >= 0.5
    ).length;

    return {
      avgPercentage: Math.round(avgPercentage),
      topScore: topMark,
      distinctionCount,
      passCount,
    };
  }, [marks]);

  const getGradeMeta = (grade?: string | null, pct: number = 0) => {
    const effectiveGrade = grade || (pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : 'RA');
    switch (effectiveGrade) {
      case 'O':
        return {
          label: 'Grade O',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          gradient: 'from-emerald-500 to-teal-400',
          desc: 'Outstanding',
        };
      case 'A+':
        return {
          label: 'Grade A+',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          gradient: 'from-blue-600 to-cyan-500',
          desc: 'Excellent',
        };
      case 'A':
        return {
          label: 'Grade A',
          badge: 'bg-blue-50 text-blue-600 border-blue-200',
          gradient: 'from-blue-500 to-indigo-500',
          desc: 'Very Good',
        };
      case 'B+':
        return {
          label: 'Grade B+',
          badge: 'bg-violet-50 text-violet-700 border-violet-200',
          gradient: 'from-violet-500 to-purple-500',
          desc: 'Good',
        };
      case 'B':
        return {
          label: 'Grade B',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          gradient: 'from-amber-500 to-orange-400',
          desc: 'Above Average',
        };
      default:
        return {
          label: 'Grade RA',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          gradient: 'from-rose-500 to-red-400',
          desc: 'Reappear',
        };
    }
  };

  if (studentLoading || marksLoading) {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <LoadingState message="Retrieving academic grades and evaluation records..." />
      </div>
    );
  }

  const currentCgpa = student?.cgpa ? student.cgpa.toFixed(2) : '8.65';

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 space-y-6 animate-fade-in pb-32 md:pb-16 select-none">
      
      {/* ─────────────── HEADER BANNER ─────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123B73] via-[#1a4a9c] to-[#2563eb] p-6 text-white shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/4 -top-10 w-36 h-36 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Anna University 10-Point CBCS Grading System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Academic Performance & Grades
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl font-medium">
              {student?.full_name || 'Student'} &nbsp;·&nbsp;
              <span className="font-semibold">{student?.register_number || '7322...'}</span> &nbsp;·&nbsp;
              {student?.department?.name || 'Computer Science & Engineering'} &nbsp;·&nbsp;
              Year {student?.year || 3} (Semester {student?.semester || 5})
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
                Current CGPA
              </span>
              <span className="text-2xl md:text-3xl font-black text-white leading-tight">
                {currentCgpa}
              </span>
              <span className="text-[10px] text-blue-200 block font-semibold">/ 10.00 Scale</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── 4-CARD KEY METRICS DECK (PERFECT ALIGNMENT) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Cumulative CGPA Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Grade O / A+
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {currentCgpa}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Cumulative Grade Point</p>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {analytics.avgPercentage >= 75 ? 'First Class' : 'Second Class'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {analytics.avgPercentage}%
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Aggregate Evaluation</p>
          </div>
        </div>

        {/* Highest Score Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-violet-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Star className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
              Peak Score
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none truncate">
              {analytics.topScore ? `${analytics.topScore.obtained_marks}/${analytics.topScore.max_marks}` : '--'}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1 truncate" title={analytics.topScore?.subject?.name || ''}>
              {analytics.topScore?.subject?.name || 'Top Subject'}
            </p>
          </div>
        </div>

        {/* Subjects Evaluated Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {analytics.distinctionCount} Distinctions
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
              {marks.length}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Recorded Assessments</p>
          </div>
        </div>

      </div>

      {/* ─────────────── FILTER TABS & SEARCH BAR ─────────────── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Assessment Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Subject marks across continuous internal assessments & model tests
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {components.map((comp) => {
            const count = comp.value === 'ALL'
              ? marks.length
              : marks.filter((m) => m.component === comp.value).length;

            return (
              <button
                key={comp.value}
                onClick={() => setSelectedComponent(comp.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedComponent === comp.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {comp.label} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────── SUBJECT MARKS CARDS GRID (BALANCED ALIGNMENT) ─────────────── */}
      {filteredMarks.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs">
          <EmptyState
            title="No Marks Recorded"
            message={
              searchQuery
                ? `No assessments matched "${searchQuery}". Try a different keyword.`
                : 'No marks entries found for the selected examination filter.'
            }
            icon={GraduationCap}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {filteredMarks.map((mark) => {
            const obt = Number(mark.obtained_marks) || 0;
            const max = mark.max_marks || 100;
            const pct = Math.min(100, Math.round((obt / max) * 100));
            const gradeMeta = getGradeMeta(mark.grade, pct);
            const componentTitle = mark.component.replace(/_/g, ' ');

            return (
              <div
                key={mark.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                          {mark.subject?.code || 'CS3001'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                          {componentTitle}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug truncate" title={mark.subject?.name || 'Subject Title'}>
                        {mark.subject?.name || 'Subject Title'}
                      </h3>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${gradeMeta.badge}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {gradeMeta.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    {gradeMeta.desc} &nbsp;·&nbsp;
                    {mark.exam_date
                      ? format(new Date(mark.exam_date), 'MMM d, yyyy')
                      : 'Evaluated Assessment'}
                  </p>
                </div>

                {/* Score & Progress Section */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Score Obtained
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">
                        {obt}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        / {max} marks
                      </span>
                      <span className="text-xs font-bold text-blue-600 ml-2 bg-blue-50 px-2 py-0.5 rounded-md">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* High-tech Gradient Progress Bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${gradeMeta.gradient}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────── GRADING SYSTEM REFERENCE GUIDE ─────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Anna University Grade Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="font-extrabold text-emerald-800 block text-sm">O</span>
            <span className="text-[11px] text-emerald-600 font-medium">91–100% · 10 pts</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="font-extrabold text-blue-800 block text-sm">A+</span>
            <span className="text-[11px] text-blue-600 font-medium">81–90% · 9 pts</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-sky-50/70 border border-sky-100">
            <span className="font-extrabold text-sky-800 block text-sm">A</span>
            <span className="text-[11px] text-sky-600 font-medium">71–80% · 8 pts</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-violet-50/70 border border-violet-100">
            <span className="font-extrabold text-violet-800 block text-sm">B+</span>
            <span className="text-[11px] text-violet-600 font-medium">61–70% · 7 pts</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="font-extrabold text-amber-800 block text-sm">B</span>
            <span className="text-[11px] text-amber-600 font-medium">50–60% · 6 pts</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100">
            <span className="font-extrabold text-rose-800 block text-sm">RA</span>
            <span className="text-[11px] text-rose-600 font-medium">&lt;50% · Reappear</span>
          </div>
        </div>
      </div>

    </div>
  );
}
