'use client';

import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useAttendanceSummary, useAnnouncements, usePlacements, useEvents, useNotifications } from '@/lib/hooks';
import { Card, StatCard, AttendanceRing, LoadingState, Badge } from '@/components/shared';
import { CalendarCheck, GraduationCap, FileText, Clock, BookOpen, Briefcase, Bot, Bell, CalendarDays, TrendingUp, ChevronRight, Pin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function StudentHome() {
  const { profile } = useAuth();
  const router = useRouter();
  const { data: student, loading: studentLoading } = useStudentProfile();
  const { data: attendance, loading: attLoading } = useAttendanceSummary(student?.id);
  const { data: announcements, loading: annLoading } = useAnnouncements();
  const { data: placements, loading: placeLoading } = usePlacements();
  const { data: events, loading: eventLoading } = useEvents();
  const { data: notifications } = useNotifications();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (studentLoading) return <LoadingState message="Loading your dashboard..." />;

  const quickAccess = [
    { label: 'Attendance', icon: CalendarCheck, path: '/student/attendance', color: '#1468D5' },
    { label: 'Marks', icon: GraduationCap, path: '/student/marks', color: '#16A34A' },
    { label: 'Leave', icon: FileText, path: '/student/leave', color: '#F59E0B' },
    { label: 'Timetable', icon: Clock, path: '/student/timetable', color: '#8B5CF6' },
    { label: 'Materials', icon: BookOpen, path: '/student/materials', color: '#06B6D4' },
    { label: 'Placements', icon: Briefcase, path: '/student/placements', color: '#EC4899' },
    { label: 'Events', icon: CalendarDays, path: '/student/announcements', color: '#F97316' },
    { label: 'Chatbot', icon: Bot, path: '/student/chat', color: '#1468D5' },
  ];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-[#6B7280]">{greeting},</p>
          <h1 className="text-2xl font-bold text-[#172033]">{student?.full_name || profile?.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{student?.register_number || 'N/A'}</Badge>
            <Badge>{student?.department?.name || 'N/A'}</Badge>
            <Badge>Year {student?.year || 'N/A'}</Badge>
          </div>
        </div>
        <button
          onClick={() => router.push('/student/notifications')}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#E6EEF7] shadow-sm hover:bg-[#F8FBFF] transition-colors"
        >
          <Bell className="h-5 w-5 text-[#6B7280]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-6">
          {attLoading ? <LoadingState message="..." /> : (
            <>
              <AttendanceRing percentage={attendance.percentage} size={130} />
              <div className="grid grid-cols-3 gap-3 mt-4 w-full">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{attendance.present}</p>
                  <p className="text-[10px] text-[#6B7280]">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-500">{attendance.absent}</p>
                  <p className="text-[10px] text-[#6B7280]">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500">{attendance.leave}</p>
                  <p className="text-[10px] text-[#6B7280]">Leave</p>
                </div>
              </div>
            </>
          )}
        </Card>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard label="CGPA" value={student?.cgpa?.toFixed(2) || 'N/A'} icon={TrendingUp} color="#16A34A" />
          <StatCard label="Backlogs" value={student?.backlogs ?? 0} icon={GraduationCap} color="#F59E0B" />
          <StatCard label="Placements" value={placements.length} icon={Briefcase} color="#EC4899" />
          <StatCard label="Events" value={events.length} icon={CalendarDays} color="#8B5CF6" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#172033] mb-3">Quick Access</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
        {quickAccess.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-[#E6EEF7] bg-white p-3 shadow-sm hover:shadow-md hover:border-[#1468D5] transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </div>
            <span className="text-[10px] font-medium text-[#172033] text-center">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#172033]">Latest Announcements</h3>
            <button onClick={() => router.push('/student/announcements')} className="text-xs text-[#1468D5] hover:underline">
              View all
            </button>
          </div>
          {annLoading ? <LoadingState message="..." /> : announcements.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-4 text-center">No new announcements. You're all caught up.</p>
          ) : (
            <div className="space-y-2">
              {announcements.slice(0, 3).map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => router.push('/student/announcements')}
                  className="flex items-start gap-2 w-full text-left rounded-lg p-2 hover:bg-[#F8FBFF] transition-colors"
                >
                  {ann.is_pinned && <Pin className="h-3.5 w-3.5 text-[#1468D5] mt-0.5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#172033] truncate">{ann.title}</p>
                    <p className="text-xs text-[#6B7280] truncate">{format(new Date(ann.publish_at), 'MMM d, yyyy')}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6B7280] shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#172033]">Upcoming Events</h3>
            <button onClick={() => router.push('/student/announcements')} className="text-xs text-[#1468D5] hover:underline">
              View all
            </button>
          </div>
          {eventLoading ? <LoadingState message="..." /> : events.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-4 text-center">No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-[#F8FBFF] transition-colors">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#1468D5]/10 shrink-0">
                    <span className="text-xs font-bold text-[#1468D5]">{format(new Date(event.event_date), 'MMM')}</span>
                    <span className="text-sm font-bold text-[#1468D5]">{format(new Date(event.event_date), 'd')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#172033] truncate">{event.title}</p>
                    <p className="text-xs text-[#6B7280] truncate">{event.venue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-[#1468D5] to-[#123B73] text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">AI Assistant</p>
              <p className="text-sm text-white/70">Ask about attendance, marks, placements, and more</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/student/chat')}
            className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2.5 text-sm font-medium hover:bg-white/25 transition-colors"
          >
            Chat Now
          </button>
        </div>
      </Card>
    </div>
  );
}
