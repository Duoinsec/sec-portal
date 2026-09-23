'use client';

import { useState } from 'react';
import { useAllStudents } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { GraduationCap, Search } from 'lucide-react';

export default function AdminStudents() {
  const { data: students, loading } = useAllStudents();
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number.toLowerCase().includes(search.toLowerCase()) ||
      (s.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">All College Students</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Institution-wide student database ({students.length} total enrolled)
        </p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
        <input
          type="text"
          placeholder="Search by name, register number, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6EEF7] bg-white text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading students..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Students Found" message="Try searching with a different keyword." icon={GraduationCap} />
      ) : (
        <div className="space-y-3">
          {filtered.map((std) => (
            <Card key={std.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#1468D5]/30 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#172033]">{std.full_name}</h3>
                  <Badge variant="info">{std.register_number}</Badge>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {std.department?.name} · Year {std.year} · Section {std.section}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-green-600">
                  CGPA: {std.cgpa?.toFixed(2) ?? 'N/A'}
                </span>
                <span className="text-xs text-[#6B7280]">
                  Backlogs: {std.backlogs ?? 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
