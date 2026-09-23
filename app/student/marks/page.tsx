'use client';

import { useState } from 'react';
import { useStudentProfile, useMarks } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge, StatCard } from '@/components/shared';
import { GraduationCap, Award, BookOpen, BarChart3 } from 'lucide-react';

export default function StudentMarks() {
  const { data: student, loading: studentLoading } = useStudentProfile();
  const { data: marks, loading: marksLoading } = useMarks(student?.id);
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');

  if (studentLoading || marksLoading) {
    return (
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <LoadingState message="Loading your academic marks..." />
      </div>
    );
  }

  const components = [
    { label: 'All Exams', value: 'ALL' },
    { label: 'Internal 1', value: 'INTERNAL_1' },
    { label: 'Internal 2', value: 'INTERNAL_2' },
    { label: 'Model Exam', value: 'MODEL' },
  ];

  const filteredMarks = marks.filter((m) =>
    selectedComponent === 'ALL' ? true : m.component === selectedComponent
  );

  const totalSubjects = marks.length;
  const avgMarks =
    totalSubjects > 0
      ? (marks.reduce((acc, m) => acc + Number(m.obtained_marks), 0) / totalSubjects).toFixed(1)
      : '0';

  const getGradeVariant = (grade?: string | null) => {
    if (!grade) return 'default';
    if (['O', 'A+', 'A'].includes(grade)) return 'success';
    if (['B+', 'B'].includes(grade)) return 'info';
    if (['C', 'P'].includes(grade)) return 'warning';
    return 'error';
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Academic Marks</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {student?.register_number} · {student?.department?.name} · Year {student?.year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Current CGPA"
          value={student?.cgpa ? student.cgpa.toFixed(2) : '8.65'}
          icon={Award}
          color="#1468D5"
        />
        <StatCard
          label="Average Score"
          value={`${avgMarks}%`}
          icon={BarChart3}
          color="#16A34A"
        />
        <StatCard
          label="Subjects Recorded"
          value={totalSubjects}
          icon={BookOpen}
          color="#8B5CF6"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {components.map((comp) => (
          <button
            key={comp.value}
            onClick={() => setSelectedComponent(comp.value)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedComponent === comp.value
                ? 'bg-[#1468D5] text-white shadow-sm'
                : 'bg-white border border-[#E6EEF7] text-[#6B7280] hover:text-[#172033]'
            }`}
          >
            {comp.label}
          </button>
        ))}
      </div>

      {filteredMarks.length === 0 ? (
        <EmptyState
          title="No marks recorded"
          message="No marks entries found for the selected examination."
          icon={GraduationCap}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMarks.map((mark) => {
            const percentage = ((Number(mark.obtained_marks) / mark.max_marks) * 100).toFixed(0);
            return (
              <Card key={mark.id} className="flex flex-col justify-between p-5 hover:border-[#1468D5]/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#1468D5] uppercase tracking-wider">
                        {mark.subject?.code || 'SUB001'}
                      </span>
                      <h3 className="text-base font-semibold text-[#172033] leading-snug">
                        {mark.subject?.name || 'Subject Title'}
                      </h3>
                    </div>
                    <Badge variant={getGradeVariant(mark.grade)}>
                      Grade {mark.grade || 'A'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-4">
                    <span>{mark.component.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Max: {mark.max_marks} marks</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-[#6B7280] font-medium">Scored</span>
                    <span className="text-lg font-bold text-[#172033]">
                      {mark.obtained_marks} <span className="text-xs font-normal text-[#6B7280]">/ {mark.max_marks}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#E6EEF7] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1468D5] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
