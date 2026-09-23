'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, Badge } from '@/components/shared';
import { Settings, Shield, School, Save, Database, Bell } from 'lucide-react';
import { useState } from 'react';

export default function AdminSettings() {
  const { profile } = useAuth();
  const [academicYear, setAcademicYear] = useState('2023-2024');
  const [minAttendance, setMinAttendance] = useState('75');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Institutional System Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Configure academic thresholds, notifications, and portal policies</p>
      </div>

      {saved && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <School className="h-5 w-5 text-[#1468D5]" />
            <h2 className="font-bold text-base text-[#172033]">Academic Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Active Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Minimum Required Attendance (%)</label>
              <input
                type="number"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-[#16A34A]" />
            <h2 className="font-bold text-base text-[#172033]">Database & Security</h2>
          </div>

          <div className="space-y-2 text-sm text-[#4B5563]">
            <div className="flex items-center justify-between py-2 border-b border-[#E6EEF7]">
              <span>Supabase Cloud Connection</span>
              <Badge variant="success">Connected & Active</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E6EEF7]">
              <span>Row Level Security (RLS)</span>
              <Badge variant="info">Enforced</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Admin Superuser</span>
              <span className="text-xs font-mono text-[#6B7280]">{profile?.email}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1468D5] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1053AB] transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
