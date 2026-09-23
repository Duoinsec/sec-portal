'use client';

import { usePlacements } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Briefcase, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPlacements() {
  const { data: placements, loading } = usePlacements();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Placement Drives Management</h1>
        <p className="text-sm text-[#6B7280] mt-1">Configure campus recruitment drives, company criteria, and eligibility</p>
      </div>

      {loading ? (
        <LoadingState message="Loading drives..." />
      ) : placements.length === 0 ? (
        <EmptyState title="No Drives Found" message="Configure recruitment drives here." icon={Briefcase} />
      ) : (
        <div className="space-y-4">
          {placements.map((drive) => (
            <Card key={drive.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EC4899]/10 text-[#EC4899] font-bold text-lg shrink-0">
                    {drive.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#172033]">{drive.company_name}</h3>
                    <p className="text-sm font-medium text-[#1468D5]">{drive.role}</p>
                    {drive.location && (
                      <p className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {drive.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  {drive.package_lpa && (
                    <span className="inline-block px-3 py-1 rounded-xl bg-green-50 text-green-700 font-bold text-sm border border-green-200">
                      {drive.package_lpa} LPA
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E6EEF7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
                <span>Min CGPA: <strong className="text-[#172033]">{drive.min_cgpa}</strong></span>
                <span>Max Backlogs: <strong className="text-[#172033]">{drive.max_backlogs}</strong></span>
                {drive.deadline && (
                  <span>Deadline: <strong className="text-[#172033]">{format(new Date(drive.deadline), 'MMM d, yyyy')}</strong></span>
                )}
                <Badge variant="success">Active Drive</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
