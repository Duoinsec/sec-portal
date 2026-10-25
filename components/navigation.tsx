'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  NavHomeIcon,
  NavChatIcon,
  NavAttendanceIcon,
  NavMarksIcon,
  NavStudentsIcon,
  NavStaffIcon,
  NavDashboardIcon,
  NavDepartmentsIcon,
  NavAnnouncementsIcon,
  NavPlacementsIcon,
  NavDocumentsIcon,
  NavNotificationsIcon,
  NavAnalyticsIcon,
  NavAuditLogsIcon,
  NavSettingsIcon,
  NavLeavesIcon,
  NavTimetableIcon,
  NavMaterialsIcon,
  NavMenuIcon,
  NavCloseIcon,
  NavLogoutIcon,
} from './nav-icons';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

/* ─────────────── STATIC NAV ICON (NO ANIMATIONS) ─────────────── */

export function NavIcon({
  icon: Icon,
  className = '',
  size = 20,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isActive?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon className={cn('w-full h-full', className)} style={{ width: size, height: size }} />
    </span>
  );
}

export const GlitchNavIcon = NavIcon;

/* ─────────────── NAV ITEM DEFINITIONS ─────────────── */

const studentBottomNav = [
  { label: 'Home',       icon: NavHomeIcon,       path: '/student' },
  { label: 'Chat',       icon: NavChatIcon,       path: '/student/chat' },
  { label: 'Attendance', icon: NavAttendanceIcon, path: '/student/attendance' },
  { label: 'Marks',      icon: NavMarksIcon,      path: '/student/marks' },
];

const staffBottomNav = [
  { label: 'Home',       icon: NavHomeIcon,       path: '/staff' },
  { label: 'Students',   icon: NavStudentsIcon,   path: '/staff/students' },
  { label: 'Attendance', icon: NavAttendanceIcon, path: '/staff/attendance' },
];

const adminBottomNav = [
  { label: 'Home',     icon: NavHomeIcon,     path: '/admin' },
  { label: 'Students', icon: NavStudentsIcon, path: '/admin/students' },
  { label: 'Staff',    icon: NavStaffIcon,    path: '/admin/staff' },
];

const adminSidebarItems = [
  { label: 'Dashboard',          icon: NavDashboardIcon,     path: '/admin' },
  { label: 'Student Management', icon: NavStudentsIcon,      path: '/admin/students' },
  { label: 'Staff Management',   icon: NavStaffIcon,         path: '/admin/staff' },
  { label: 'Departments',        icon: NavDepartmentsIcon,   path: '/admin/departments' },
  { label: 'Announcements',      icon: NavAnnouncementsIcon, path: '/admin/announcements' },
  { label: 'Placements',         icon: NavPlacementsIcon,    path: '/admin/placements' },
  { label: 'Documents',          icon: NavDocumentsIcon,     path: '/admin/documents' },
  { label: 'Notifications',      icon: NavNotificationsIcon, path: '/admin/notifications' },
  { label: 'Analytics',          icon: NavAnalyticsIcon,     path: '/admin/analytics' },
  { label: 'Audit Logs',         icon: NavAuditLogsIcon,     path: '/admin/audit-logs' },
  { label: 'Settings',           icon: NavSettingsIcon,      path: '/admin/settings' },
];

const staffSidebarItems = [
  { label: 'Dashboard',      icon: NavDashboardIcon,     path: '/staff' },
  { label: 'Students',       icon: NavStudentsIcon,      path: '/staff/students' },
  { label: 'Attendance',     icon: NavAttendanceIcon,    path: '/staff/attendance' },
  { label: 'Marks',          icon: NavMarksIcon,         path: '/staff/marks' },

  { label: 'Announcements',  icon: NavAnnouncementsIcon, path: '/staff/announcements' },
  { label: 'Placements',     icon: NavPlacementsIcon,    path: '/staff/placements' },
  { label: 'Documents',      icon: NavDocumentsIcon,     path: '/staff/documents' },
  { label: 'Timetable',      icon: NavTimetableIcon,     path: '/staff/timetable' },
];

const studentSidebarItems = [
  { label: 'Timetable',     icon: NavTimetableIcon,     path: '/student/timetable' },
  { label: 'Announcements', icon: NavAnnouncementsIcon, path: '/student/announcements' },
  { label: 'Placements',    icon: NavPlacementsIcon,    path: '/student/placements' },
  { label: 'Materials',     icon: NavMaterialsIcon,     path: '/student/materials' },
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
    <header className="w-full bg-white shadow-xs shrink-0 z-30 select-none">
      {/* Top accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#1a3c7a] via-[#2563eb] to-[#38bdf8]" />

      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        {/* Hamburger – mobile only */}
        <button
          onClick={onMenuToggle}
          className="group mr-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors md:hidden shrink-0"
          aria-label="Toggle menu"
        >
          <GlitchNavIcon
            icon={sidebarOpen ? NavCloseIcon : NavMenuIcon}
            size={20}
            className="text-slate-600 group-hover:text-[#1468D5]"
          />
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1468D5] to-[#1a3c7a] text-white text-sm font-bold shadow-xs">
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
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                active
                  ? 'bg-gradient-to-r from-[#1468D5] to-[#2563eb] text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-[#1468D5]'
              )}
            >
              <NavIcon
                icon={item.icon}
                isActive={active}
                size={19}
                className={active ? 'text-white' : 'text-slate-500 group-hover:text-[#1468D5]'}
              />
              <span className="flex-1 truncate text-left">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-blue-200 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className="border-t border-slate-100 p-3 space-y-2 shrink-0 bg-white"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-blue-50/80 border border-blue-100/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1468D5] to-[#1a3c7a] text-white text-sm font-bold shrink-0 shadow-xs">
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
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors shadow-xs"
        >
          <GlitchNavIcon icon={NavLogoutIcon} size={18} className="text-red-600" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({
  role,
  onClose,
}: {
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  open?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="hidden md:flex shrink-0 h-[calc(100vh-57px)] sticky top-[57px] self-start">
      <SidebarContent role={role} onClose={onClose} />
    </div>
  );
}

/* ─────────────── BOTTOM NAV (MOBILE) ─────────────── */

export function BottomNav({ role }: { role: 'STUDENT' | 'STAFF' | 'ADMIN' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  const nav =
    role === 'STUDENT' ? studentBottomNav :
      role === 'STAFF' ? staffBottomNav :
        adminBottomNav;

  const currentPath = optimisticPath || pathname;
  const basePath = `/${role.toLowerCase()}`;

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const activeIndex = nav.findIndex((item) =>
    currentPath === item.path ||
    (item.path !== basePath && currentPath.startsWith(item.path))
  );

  const currentIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeItem = nav[currentIndex];

  const handleNav = (path: string) => {
    setOptimisticPath(path);
    router.push(path);
  };

  return (
    <nav className="shrink-0 z-40 md:hidden select-none px-3.5 pb-2 pt-7 bg-transparent">
      {/* Floating White Card */}
      <div
        className="relative bg-white rounded-[28px] shadow-[0_10px_35px_rgba(15,23,42,0.12)] border border-slate-100/90 pt-3 pb-2 px-1"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      >
        {/* Elevated Curved Hill & Bubble for Active Tab (Static, No Sliding Animation) */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
          style={{
            left: `${(currentIndex / nav.length) * 100}%`,
            width: `${100 / nav.length}%`,
          }}
        >
          {/* Smooth SVG curved hill connecting seamlessly to the white bar */}
          <div className="absolute -top-[21px] w-[92px] h-[24px] pointer-events-none flex justify-center">
            <svg
              viewBox="0 0 96 26"
              className="w-[92px] h-[24px] fill-white filter drop-shadow-[0_-3px_4px_rgba(0,0,0,0.04)]"
              preserveAspectRatio="none"
            >
              <path d="M 0 26 C 16 26 23 18 29 10 C 35 2 41 0 48 0 C 55 0 61 2 67 10 C 73 18 80 26 96 26 Z" />
            </svg>
          </div>

          {/* Elevated Circular Badge (As shown in the sample image) */}
          <div className="absolute -top-[28px] flex items-center justify-center">
            <div className="w-[56px] h-[56px] rounded-full bg-white p-[3px] shadow-[0_6px_16px_rgba(79,70,229,0.22)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#5B50E8]">
                {activeItem && (
                  <NavIcon
                    icon={activeItem.icon}
                    isActive={true}
                    size={24}
                    className="text-[#5B50E8]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons Grid */}
        <div className="relative z-10 grid grid-flow-col auto-cols-fr items-center">
          {nav.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="group relative flex flex-col items-center justify-end h-[50px] pb-1 px-1 select-none focus:outline-none"
              >
                {/* Inactive tab: icon at normal level, gray label */}
                {!isActive ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <NavIcon
                      icon={item.icon}
                      isActive={false}
                      size={21}
                      className="text-slate-400 group-hover:text-slate-600"
                    />
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 tracking-tight leading-none mt-1">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  /* Active tab: space for elevated circle above, bold dark label below */
                  <div className="flex flex-col items-center justify-end h-full">
                    <span className="text-[11px] font-bold text-slate-900 tracking-tight leading-none">
                      {item.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Home Indicator Bar Pill (from sample image) */}
        <div className="w-28 h-1 bg-slate-300/80 rounded-full mx-auto mt-2" />
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
    <div className="h-screen h-[100dvh] max-h-screen bg-[#F8FBFF] flex flex-col overflow-hidden relative">
      {/* College header – fixed top, non-moving */}
      <CollegeHeader
        role={role}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* Content row: desktop sidebar + page */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar
          role={role}
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

      {/* Mobile drawer (rendered AFTER BottomNav with z-[60] so it is strictly on top of navigation bar) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-[70] w-64 max-w-[85vw] h-full h-[100dvh] shadow-2xl bg-white flex flex-col">
            <SidebarContent role={role} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
