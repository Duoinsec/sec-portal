'use client';

import { useAuth } from '@/lib/auth-context';
import { useAdminDashboard, useAllStudents, useAllStaff, useAnnouncements } from '@/lib/hooks';
import { Card, StatCard, LoadingState, Badge } from '@/components/shared';
import { Users, GraduationCap, Building2, Megaphone, Briefcase, FolderOpen, Shield, CheckCircle } from 'lucide-react';

export default function AdminHome() {
  const { profile } = useAuth();
  const { data: stats, loading: statsLoading } = useAdminDashboard();
  const { data: students, loading: studentsLoading } = useAllStudents();
  const { data: staffList, loading: staffLoading } = useAllStaff();
  const { data: announcements } = useAnnouncements();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-[#6B7280]">Institution Overview</p>
          <h1 className="text-2xl font-bold text-[#172033]">Admin Control Center</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">Super Administrator</Badge>
            <Badge>Saveetha Engineering College</Badge>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={students.length} icon={GraduationCap} color="#1468D5" />
        <StatCard label="Teaching Staff" value={staffList.length} icon={Users} color="#16A34A" />
        <StatCard label="Announcements" value={announcements.length} icon={Megaphone} color="#EC4899" />
        <StatCard label="Placements Active" value={stats.totalPlacements || 3} icon={Briefcase} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Students */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E6EEF7] flex items-center justify-between">
            <h3 className="font-bold text-[#172033] flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#1468D5]" />
              Enrolled Students ({students.length})
            </h3>
          </div>
          {studentsLoading ? (
            <LoadingState message="Loading students..." />
          ) : (
            <div className="divide-y divide-[#E6EEF7] max-h-80 overflow-y-auto">
              {students.map((std) => (
                <div key={std.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF]">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">{std.full_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {std.register_number} · {std.department?.code || 'AI & DS'} · Yr {std.year}
                    </p>
                  </div>
                  <Badge variant="success">CGPA {std.cgpa?.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Faculty List */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E6EEF7] flex items-center justify-between">
            <h3 className="font-bold text-[#172033] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#16A34A]" />
              Faculty Members ({staffList.length})
            </h3>
          </div>
          {staffLoading ? (
            <LoadingState message="Loading staff..." />
          ) : (
            <div className="divide-y divide-[#E6EEF7] max-h-80 overflow-y-auto">
              {staffList.map((st) => (
                <div key={st.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF]">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">{st.profile?.full_name || st.staff_id}</p>
                    <p className="text-xs text-[#6B7280]">
                      {st.designation} · {st.department?.code || 'AI & DS'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#6B7280]">{st.staff_id}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
