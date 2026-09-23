'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, Badge } from '@/components/shared';
import { GraduationCap, Users, Building2, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminMore() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const links = [
    { label: 'Student Directory', icon: GraduationCap, path: '/admin/students', color: '#1468D5' },
    { label: 'Staff Management', icon: Users, path: '/admin/staff', color: '#16A34A' },
    { label: 'Departments', icon: Building2, path: '/admin/departments', color: '#8B5CF6' },
  ];

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Admin Navigation</h1>
        <p className="text-sm text-[#6B7280] mt-1">Institutional system settings and records</p>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-blue-50/60 to-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1468D5] text-white text-xl font-bold">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#172033]">{profile?.full_name}</h2>
            <p className="text-xs text-[#6B7280]">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info">Institution Admin</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 divide-y divide-[#E6EEF7] overflow-hidden mb-6">
        {links.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#F8FBFF] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
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

      <button
        onClick={() => signOut().then(() => router.push('/login'))}
        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-red-200 bg-red-50/50 p-3.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}
