'use client';

import { useState } from 'react';
import { useStudentProfile, useTimetable, useExamSchedules } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Clock, Calendar, BookOpen, MapPin, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
];

export default function StudentTimetable() {
  const { data: student } = useStudentProfile();
  const { data: timetable, loading: ttLoading } = useTimetable(student?.department_id || undefined, student?.year);
  const { data: exams, loading: examLoading } = useExamSchedules(student?.department_id || undefined, student?.year);

  // Default to today's day of week (1=Mon ... 5=Fri), fallback to Mon (1)
  const currentDay = new Date().getDay();
  const initialDay = currentDay >= 1 && currentDay <= 5 ? currentDay : 1;
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  const dayEntries = timetable.filter((entry) => entry.day_of_week === selectedDay);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Timetable & Schedule</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {student?.department?.name || 'Department'} · Year {student?.year || 2} · Semester {student?.semester || 3}
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#E6EEF7] shadow-sm mb-6 overflow-x-auto">
        {DAYS.map((day) => {
          const isActive = selectedDay === day.id;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1468D5] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#172033] hover:bg-[#F8FBFF]'
              }`}
            >
              <span className="hidden sm:inline">{day.name}</span>
              <span className="sm:hidden">{day.short}</span>
            </button>
          );
        })}
      </div>

      {/* Class Schedule for Selected Day */}
      <h2 className="text-lg font-semibold text-[#172033] mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#1468D5]" />
        Classes for {DAYS.find((d) => d.id === selectedDay)?.name}
      </h2>

      {ttLoading ? (
        <LoadingState message="Loading timetable..." />
      ) : dayEntries.length === 0 ? (
        <Card className="py-8 text-center mb-8">
          <BookOpen className="h-10 w-10 text-[#6B7280] mx-auto mb-2 opacity-50" />
          <p className="font-medium text-[#172033]">No Scheduled Classes</p>
          <p className="text-xs text-[#6B7280] mt-1">There are no classes scheduled for this day.</p>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {dayEntries.map((slot) => (
            <Card key={slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1468D5]/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5] shrink-0">
                  <span className="text-xs font-bold">{slot.start_time.slice(0, 5)}</span>
                  <span className="text-[10px] opacity-75">{slot.end_time.slice(0, 5)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-[#172033]">
                      {slot.subject?.name || 'Subject'}
                    </h3>
                    {slot.subject?.code && <Badge variant="info">{slot.subject.code}</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-[#6B7280]">
                    {slot.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#1468D5]" /> Room {slot.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-xs font-medium text-[#1468D5] bg-[#1468D5]/10 px-2.5 py-1 rounded-lg">
                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Exam Schedules */}
      <h2 className="text-lg font-semibold text-[#172033] mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-amber-500" />
        Upcoming Examinations & Tests
      </h2>

      {examLoading ? (
        <LoadingState message="Loading exam schedule..." />
      ) : exams.length === 0 ? (
        <Card className="py-6 text-center">
          <p className="text-sm text-[#6B7280]">No exam schedules announced at this time.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="warning">{exam.exam_type || 'Internal Test'}</Badge>
                  <h4 className="font-semibold text-sm text-[#172033] mt-2">
                    {exam.subject?.name || 'Subject Exam'}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{exam.subject?.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-600">
                    {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">{exam.start_time} - {exam.end_time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
