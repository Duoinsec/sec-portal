'use client';

import { useAuth } from '@/lib/auth-context';
import { useStaffProfile, useDepartmentStudents, useDepartmentLeaveRequests, useAnnouncements } from '@/lib/hooks';
import { Card, StatCard, LoadingState, Badge } from '@/components/shared';
import { Users, CalendarCheck, FileText, GraduationCap, Megaphone, Check, X, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function StaffHome() {
  const { profile } = useAuth();
  const router = useRouter();
  const { data: staff, loading: staffLoading } = useStaffProfile();
  const { data: students, loading: studentsLoading } = useDepartmentStudents(staff?.department_id || undefined);
  const { data: leaves, loading: leavesLoading, updateStatus } = useDepartmentLeaveRequests(staff?.department_id || undefined);
  const { data: announcements } = useAnnouncements();

  if (staffLoading) return <LoadingState message="Loading staff portal..." />;

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in pb-32 md:pb-16 select-none">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-[#6B7280]">Welcome back,</p>
          <h1 className="text-2xl font-bold text-[#172033]">{profile?.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{staff?.designation || 'Staff'}</Badge>
            <Badge>{staff?.department?.name || 'Department'}</Badge>
            <Badge>{staff?.staff_id || 'SEC-STAFF'}</Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={students.length} icon={Users} color="#1468D5" />
        <StatCard label="Pending Leaves" value={pendingLeaves.length} icon={FileText} color="#F59E0B" />
        <StatCard label="Announcements" value={announcements.length} icon={Megaphone} color="#EC4899" />
        <StatCard label="Department" value={staff?.department?.code || 'AI & DS'} icon={GraduationCap} color="#16A34A" />
      </div>

      {/* Pending Leave Requests */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#172033] flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Pending Student Leave Approvals ({pendingLeaves.length})
          </h2>
        </div>

        {leavesLoading ? (
          <LoadingState message="Checking leaves..." />
        ) : pendingLeaves.length === 0 ? (
          <Card className="py-6 text-center text-sm text-[#6B7280]">
            No pending leave requests in your department. All requests handled.
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map((l) => (
              <Card key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#172033]">
                      {(l as any).student?.full_name || 'Student'} ({(l as any).student?.register_number})
                    </span>
                    <Badge variant="warning">{l.leave_type}</Badge>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {format(new Date(l.start_date), 'MMM d')} - {format(new Date(l.end_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-[#374151] mt-1 bg-[#F8FBFF] p-2 rounded-lg border border-[#E6EEF7]">
                    "{l.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <button
                    onClick={() => updateStatus(l.id, 'APPROVED')}
                    className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(l.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Department Students List */}
      <div>
        <h2 className="text-lg font-semibold text-[#172033] mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#1468D5]" />
          Department Students ({students.length})
        </h2>

        {studentsLoading ? (
          <LoadingState message="Loading students..." />
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-[#E6EEF7]">
              {students.map((std) => (
                <div key={std.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF] transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {std.register_number} · Year {std.year} · Sem {std.semester} · Section {std.section}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-green-600">
                      CGPA: {std.cgpa?.toFixed(2) ?? 'N/A'}
                    </span>
                    <p className="text-[10px] text-[#6B7280]">Backlogs: {std.backlogs ?? 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
