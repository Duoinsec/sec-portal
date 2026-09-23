'use client';

import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useAttendanceSummary, useAttendanceRecords } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, AttendanceRing, Badge } from '@/components/shared';
import { CalendarCheck, Check, X, Clock3 } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentAttendance() {
  const { profile } = useAuth();
  const { data: student } = useStudentProfile();
  const { data: summary, loading: sumLoading } = useAttendanceSummary(student?.id);
  const { data: records, loading: recLoading } = useAttendanceRecords(student?.id);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Attendance</h1>
        <p className="text-sm text-[#6B7280] mt-1">{student?.register_number} · {student?.department?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex flex-col items-center py-6">
          {sumLoading ? <LoadingState message="..." /> : (
            <>
              <AttendanceRing percentage={summary.percentage} size={140} />
              <p className="mt-3 text-sm text-[#6B7280]">Overall Attendance</p>
            </>
          )}
        </Card>
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172033]">{summary.present}</p>
              <p className="text-sm text-[#6B7280]">Present</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172033]">{summary.absent}</p>
              <p className="text-sm text-[#6B7280]">Absent</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172033]">{summary.leave}</p>
              <p className="text-sm text-[#6B7280]">Leave</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <CalendarCheck className="h-6 w-6 text-[#1468D5]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172033]">{summary.total}</p>
              <p className="text-sm text-[#6B7280]">Total Sessions</p>
            </div>
          </Card>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#172033] mb-3">Recent Records</h2>
      {recLoading ? <LoadingState /> : records.length === 0 ? (
        <EmptyState title="No attendance records" message="Your attendance records will appear here." icon={CalendarCheck} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[#E6EEF7]">
            {records.slice(0, 50).map((rec) => {
              const statusColors: Record<string, any> = {
                PRESENT: { bg: 'bg-green-50', text: 'text-green-700', label: 'Present' },
                ABSENT: { bg: 'bg-red-50', text: 'text-red-600', label: 'Absent' },
                LEAVE: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Leave' },
                OD: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'OD' },
              };
              const sc = statusColors[rec.status] || statusColors.PRESENT;
              return (
                <div key={rec.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#172033] truncate">
                      {rec.session?.subject?.name || 'Unknown Subject'}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {rec.session ? format(new Date(rec.session.session_date), 'EEE, MMM d, yyyy') : ''}
                    </p>
                  </div>
                  <Badge variant={rec.status === 'PRESENT' ? 'success' : rec.status === 'ABSENT' ? 'error' : 'warning'}>
                    {sc.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
