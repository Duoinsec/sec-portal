'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Home, CalendarCheck, GraduationCap, FileText, Bell, Bot, BookOpen,
  Briefcase, Clock, LayoutDashboard, Users, Building2, Megaphone,
  FolderOpen, BarChart3, Shield, Settings, MoreHorizontal, LogOut,
  ChevronRight, Menu, X, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

/* ─────────────── NAV ITEM DEFINITIONS ─────────────── */

const studentBottomNav = [
  { label: 'Home',       icon: Home,          path: '/student' },
  { label: 'Chat',       icon: Bot,           path: '/student/chat' },
  { label: 'Attendance', icon: CalendarCheck, path: '/student/attendance' },
  { label: 'Marks',      icon: GraduationCap, path: '/student/marks' },
  { label: 'More',       icon: MoreHorizontal,path: '/student/more' },
];

const staffBottomNav = [
  { label: 'Home',       icon: Home,          path: '/staff' },
  { label: 'Students',   icon: Users,         path: '/staff/students' },
  { label: 'Attendance', icon: CalendarCheck, path: '/staff/attendance' },
  { label: 'More',       icon: MoreHorizontal,path: '/staff/more' },
];

const adminBottomNav = [
  { label: 'Home',     icon: Home,          path: '/admin' },
  { label: 'Students', icon: GraduationCap, path: '/admin/students' },
  { label: 'Staff',    icon: Users,         path: '/admin/staff' },
  { label: 'More',     icon: MoreHorizontal,path: '/admin/more' },
];

const adminSidebarItems = [
  { label: 'Dashboard',           icon: LayoutDashboard, path: '/admin' },
  { label: 'Student Management',  icon: GraduationCap,   path: '/admin/students' },
  { label: 'Staff Management',    icon: Users,           path: '/admin/staff' },
  { label: 'Departments',         icon: Building2,       path: '/admin/departments' },
  { label: 'Announcements',       icon: Megaphone,       path: '/admin/announcements' },
  { label: 'Placements',          icon: Briefcase,       path: '/admin/placements' },
  { label: 'Documents',           icon: FolderOpen,      path: '/admin/documents' },
  { label: 'Notifications',       icon: Bell,            path: '/admin/notifications' },
  { label: 'Analytics',           icon: BarChart3,       path: '/admin/analytics' },
  { label: 'Audit Logs',          icon: Shield,          path: '/admin/audit-logs' },
  { label: 'Settings',            icon: Settings,        path: '/admin/settings' },
];

const staffSidebarItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, path: '/staff' },
  { label: 'Students',       icon: Users,           path: '/staff/students' },
  { label: 'Attendance',     icon: CalendarCheck,   path: '/staff/attendance' },
  { label: 'Marks',          icon: GraduationCap,   path: '/staff/marks' },
  { label: 'Leave Requests', icon: FileText,        path: '/staff/leaves' },
  { label: 'Announcements',  icon: Megaphone,       path: '/staff/announcements' },
  { label: 'Placements',     icon: Briefcase,       path: '/staff/placements' },
  { label: 'Documents',      icon: FolderOpen,      path: '/staff/documents' },
  { label: 'Timetable',      icon: Clock,           path: '/staff/timetable' },
];

const studentSidebarItems = [
  { label: 'Home',          icon: Home,          path: '/student' },
  { label: 'AI Chat',       icon: Bot,           path: '/student/chat' },
  { label: 'Architecture',  icon: Layers,        path: '/student/architecture' },
  { label: 'Attendance',    icon: CalendarCheck, path: '/student/attendance' },
  { label: 'Marks',         icon: GraduationCap, path: '/student/marks' },
  { label: 'Leave',         icon: FileText,      path: '/student/leave' },
  { label: 'Timetable',     icon: Clock,         path: '/student/timetable' },
  { label: 'Announcements', icon: Megaphone,     path: '/student/announcements' },
  { label: 'Placements',    icon: Briefcase,     path: '/student/placements' },
  { label: 'Materials',     icon: BookOpen,      path: '/student/materials' },
  { label: 'Notifications', icon: Bell,          path: '/student/notifications' },
];

/* ─────────────── COLLEGE HEADER ─────────────── */

export function CollegeHeader({
  role,
  onMenuToggle,
  sidebarOpen,
}: {
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}) {
  const { profile } = useAuth();

  const roleLabel =
    role === 'ADMIN' ? 'Admin Portal' :
    role === 'STAFF' ? 'Staff Portal' :
    'Student Portal';

  const roleBadgeClass =
    role === 'ADMIN' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
    role === 'STAFF' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
    'bg-blue-100 text-blue-700 border border-blue-200';

  return (
    <header className="w-full bg-white shadow-sm shrink-0 z-30 select-none">
      {/* Top accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#1a3c7a] via-[#2563eb] to-[#38bdf8]" />

      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        {/* Hamburger – mobile only */}
        <button
          onClick={onMenuToggle}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors md:hidden shrink-0"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Official College Emblem */}
        <div className="relative shrink-0">
          <div className="h-11 w-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src="/images/sec-logo.png"
              alt="Sengunthar Engineering College Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
        </div>

        {/* College Name */}
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-extrabold leading-tight text-[#1a3c7a] truncate">
            Sengunthar Engineering College
          </h1>
          <p className="text-[11px] font-medium text-slate-500 truncate">
            Tiruchengode &nbsp;·&nbsp; Affiliated to Anna University &nbsp;·&nbsp; NAAC&nbsp;'A'
          </p>
        </div>

        {/* Role badge + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
            roleBadgeClass
          )}>
            {roleLabel}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1468D5] to-[#1a3c7a] text-white text-sm font-bold shadow">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── SIDEBAR ─────────────── */

function SidebarContent({
  role,
  onClose,
}: {
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const menuItems =
    role === 'ADMIN' ? adminSidebarItems :
    role === 'STAFF' ? staffSidebarItems :
    studentSidebarItems;

  const basePath = `/${role.toLowerCase()}`;

  const isActive = (path: string) =>
    pathname === path ||
    (path !== basePath && path !== '/admin' && pathname.startsWith(path));

  const handleNav = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-slate-100">
      {/* Sidebar brand header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#1a3c7a] to-[#2563eb]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm shrink-0 overflow-hidden">
          <img src="/images/sec-logo.png" alt="SEC Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-bold text-white text-sm truncate">SEC Portal</span>
          <span className="text-[10px] text-blue-200 truncate">
            {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-gradient-to-r from-[#1468D5] to-[#2563eb] text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-[#1468D5]'
              )}
            >
              <item.icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110',
                  active ? 'text-white' : 'text-slate-400 group-hover:text-[#1468D5]'
                )}
                style={{ width: 18, height: 18 }}
              />
              <span className="flex-1 truncate text-left">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-blue-200 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-blue-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1468D5] to-[#1a3c7a] text-white text-sm font-bold shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-[#172033] truncate">
              {profile?.full_name || 'User'}
            </span>
            <span className="text-[10px] text-slate-500 truncate">{profile?.email}</span>
          </div>
        </div>
        <button
          onClick={() => signOut().then(() => router.push('/login'))}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0 h-[calc(100vh-57px)] sticky top-[57px] self-start">
        <SidebarContent role={role} onClose={onClose} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="absolute left-0 top-0 bottom-0 z-50 w-64 shadow-2xl">
            <SidebarContent role={role} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────── BOTTOM NAV (mobile) ─────────────── */

export function BottomNav({ role }: { role: 'STUDENT' | 'STAFF' | 'ADMIN' }) {
  const router = useRouter();
  const pathname = usePathname();
  const nav =
    role === 'STUDENT' ? studentBottomNav :
    role === 'STAFF'   ? staffBottomNav   :
    adminBottomNav;

  return (
    <nav className="shrink-0 z-40 border-t border-slate-200 bg-white md:hidden select-none">
      <div
        className="flex items-center justify-around px-2 py-1.5"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {nav.map((item) => {
          const active =
            pathname === item.path ||
            (item.path !== `/${role.toLowerCase()}` && pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all min-w-[60px]',
                active ? 'text-[#1468D5]' : 'text-slate-400'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────── APP SHELL ─────────────── */

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-[#F8FBFF] flex flex-col overflow-hidden">
      {/* College header – fixed top, non-moving */}
      <CollegeHeader
        role={role}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* Content row: sidebar + page */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar
          role={role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main 
          className="flex-1 min-w-0 overflow-y-auto scrollbar-hide h-full flex flex-col"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation – fixed at bottom */}
      <BottomNav role={role} />
    </div>
  );
}
