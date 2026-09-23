'use client';

import { useState } from 'react';
import { useAllStaff } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Users, Search, Mail } from 'lucide-react';

export default function AdminStaff() {
  const { data: staffList, loading } = useAllStaff();
  const [search, setSearch] = useState('');

  const filtered = staffList.filter(
    (s) =>
      (s.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Staff & Faculty Directory</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Total {staffList.length} faculty and administrative members registered
        </p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="Search faculty by name, employee ID, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6EEF7] bg-white text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading staff directory..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Staff Found" message="Try searching with a different keyword." icon={Users} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((st) => (
            <Card key={st.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#172033]">{st.profile?.full_name || st.staff_id}</h3>
                  <p className="text-xs text-[#1468D5] font-semibold">{st.designation}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{st.department?.name || 'Academic Dept'}</p>
                </div>
                <Badge variant="info">{st.staff_id}</Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6EEF7] flex items-center justify-between text-xs text-[#6B7280]">
                <span>Role: Faculty</span>
                <span className="text-[#1468D5] font-mono">{st.profile?.email || 'sec.edu.in'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
