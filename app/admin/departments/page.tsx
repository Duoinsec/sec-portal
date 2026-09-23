'use client';

import { useDepartments } from '@/lib/hooks';
import { Card, LoadingState, Badge } from '@/components/shared';
import { Building2, BookOpen } from 'lucide-react';

export default function AdminDepartments() {
  const { data: depts, loading } = useDepartments();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Academic Departments</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Active undergraduate and postgraduate engineering branches
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depts.map((d) => (
            <Card key={d.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1468D5]/10 text-[#1468D5] shrink-0 font-bold">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#172033]">{d.name}</h3>
                    <p className="text-xs text-[#6B7280]">Code: {d.code}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              {d.description && (
                <p className="text-xs text-[#4B5563] mt-3 bg-[#F8FBFF] p-2.5 rounded-lg border border-[#E6EEF7]">
                  {d.description}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
