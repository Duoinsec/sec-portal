'use client';

import { useAuth } from '@/lib/auth-context';
import { useStudentProfile } from '@/lib/hooks';
import { Card, Badge } from '@/components/shared';
import {
  CalendarCheck, GraduationCap, FileText, Clock, BookOpen, Briefcase,
  Megaphone, Bell, Bot, LogOut, ChevronRight, User, ShieldCheck, Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentMore() {
  const { profile, signOut } = useAuth();
  const { data: student } = useStudentProfile();
  const router = useRouter();

  const menuSections = [
    {
      title: 'Academic & Activities',
      items: [
        { label: 'Attendance Records', icon: CalendarCheck, path: '/student/attendance', color: '#1468D5' },
        { label: 'Marks & Internal Tests', icon: GraduationCap, path: '/student/marks', color: '#16A34A' },
        { label: 'Leave & OD Applications', icon: FileText, path: '/student/leave', color: '#F59E0B' },
        { label: 'Timetable & Class Schedule', icon: Clock, path: '/student/timetable', color: '#8B5CF6' },
        { label: 'Study Materials & Syllabus', icon: BookOpen, path: '/student/materials', color: '#06B6D4' },
      ],
    },
    {
      title: 'Campus & Career',
      items: [
        { label: 'System Architecture', icon: Layers, path: '/student/architecture', color: '#8B5CF6' },
        { label: 'Campus Placements', icon: Briefcase, path: '/student/placements', color: '#EC4899' },
        { label: 'Announcements & Events', icon: Megaphone, path: '/student/announcements', color: '#F97316' },
        { label: 'Notifications Inbox', icon: Bell, path: '/student/notifications', color: '#6366F1' },
        { label: 'AI Campus Assistant', icon: Bot, path: '/student/chat', color: '#1468D5' },
      ],
    },
  ];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto animate-fade-in pb-32 md:pb-16 select-none">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">More Options</h1>
        <p className="text-sm text-[#6B7280] mt-1">Quick navigation and profile overview</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50/60 to-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1468D5] text-white text-xl font-bold">
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#172033] truncate">
              {student?.full_name || profile?.full_name}
            </h2>
            <p className="text-xs text-[#6B7280] truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info">{student?.register_number || '23AD001'}</Badge>
              <Badge>{student?.department?.code || 'AI & DS'}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Menu Groups */}
      <div className="space-y-6 mb-6">
        {menuSections.map((sec) => (
          <div key={sec.title}>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2 px-1">
              {sec.title}
            </h3>
            <Card className="p-0 divide-y divide-[#E6EEF7] overflow-hidden">
              {sec.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#F8FBFF] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <item.icon className="h-4.5 w-4.5" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-[#172033]">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* College Identity Card */}
      <div className="mb-6 flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-[#E6EEF7] shadow-xs text-center">
        <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm mb-3 flex items-center justify-center overflow-hidden">
          <img src="/images/sec-logo.png" alt="Sengunthar Engineering College Logo" className="h-full w-full object-contain" />
        </div>
        <h3 className="font-bold text-[#1a3c7a] text-sm tracking-wide">SENGUNTHAR ENGINEERING COLLEGE</h3>
        <p className="text-[11px] text-amber-700 font-semibold tracking-wider mt-0.5">EDUCATION &nbsp;·&nbsp; EDIFICATION &nbsp;·&nbsp; ELEVATION</p>
        <p className="text-[11px] text-slate-500 mt-1">Tiruchengode, Namakkal Dt., Tamil Nadu &nbsp;·&nbsp; Estd. 2001</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Autonomous &nbsp;·&nbsp; Affiliated to Anna University &nbsp;·&nbsp; NAAC 'A' Grade</p>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut().then(() => router.push('/login'))}
        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-red-200 bg-red-50/50 p-3.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out of Account
      </button>
    </div>
  );
}
