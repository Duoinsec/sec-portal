'use client';

import { useStudentProfile, usePlacements } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Briefcase, IndianRupee, Calendar, CheckCircle2, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentPlacements() {
  const { data: student } = useStudentProfile();
  const { data: placements, loading } = usePlacements();

  const studentCgpa = student?.cgpa ?? 0;
  const studentBacklogs = student?.backlogs ?? 0;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Campus Placements & Drives</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Explore top recruiting companies, on-campus drives, eligibility criteria, and job descriptions
        </p>
      </div>

      {/* Student Profile Eligibility Snapshot */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[#1468D5] uppercase tracking-wide">
              Your Placement Profile
            </span>
            <h3 className="text-base font-bold text-[#172033] mt-0.5">
              {student?.full_name} ({student?.register_number})
            </h3>
            <p className="text-xs text-[#6B7280]">
              Department: {student?.department?.name} · Year: {student?.year}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center bg-white px-3 py-1.5 rounded-xl border border-blue-100">
              <span className="text-xs text-[#6B7280] block">CGPA</span>
              <span className="text-sm font-bold text-green-600">{studentCgpa.toFixed(2)}</span>
            </div>
            <div className="text-center bg-white px-3 py-1.5 rounded-xl border border-blue-100">
              <span className="text-xs text-[#6B7280] block">Active Backlogs</span>
              <span className={`text-sm font-bold ${studentBacklogs > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {studentBacklogs}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* List of Placement Opportunities */}
      <h2 className="text-lg font-semibold text-[#172033] mb-3">Active Recruitment Drives</h2>

      {loading ? (
        <LoadingState message="Loading placement drives..." />
      ) : placements.length === 0 ? (
        <EmptyState
          title="No Active Drives"
          message="There are currently no active placement drives listed. Please check back later."
          icon={Briefcase}
        />
      ) : (
        <div className="space-y-4">
          {placements.map((drive) => {
            const isEligibleCgpa = !drive.min_cgpa || studentCgpa >= drive.min_cgpa;
            const isEligibleBacklogs =
              drive.max_backlogs === null ||
              drive.max_backlogs === undefined ||
              studentBacklogs <= drive.max_backlogs;
            const isEligible = isEligibleCgpa && isEligibleBacklogs;

            return (
              <Card key={drive.id} className="hover:border-[#1468D5]/40 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EC4899]/10 text-[#EC4899] font-bold text-lg shrink-0">
                      {drive.company_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#172033]">{drive.company_name}</h3>
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            <CheckCircle2 className="h-3 w-3" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <AlertTriangle className="h-3 w-3" /> Check Criteria
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#1468D5] mt-0.5">{drive.role}</p>
                      {drive.location && (
                        <p className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {drive.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:self-start">
                    {drive.package_lpa && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-green-50 text-green-700 font-bold text-sm border border-green-200">
                        <span>{drive.package_lpa} LPA</span>
                      </div>
                    )}
                  </div>
                </div>

                {drive.description && (
                  <p className="text-xs text-[#4B5563] mt-3 line-clamp-3 bg-[#F8FBFF] p-3 rounded-xl border border-[#E6EEF7]">
                    {drive.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-[#E6EEF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
                  <div className="flex flex-wrap items-center gap-3">
                    {drive.min_cgpa && (
                      <span>Min CGPA: <strong className="text-[#172033]">{drive.min_cgpa}</strong></span>
                    )}
                    {drive.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#1468D5]" />
                        Deadline: <strong className="text-[#172033]">{format(new Date(drive.deadline), 'MMM d, yyyy')}</strong>
                      </span>
                    )}
                  </div>

                  {drive.application_link && (
                    <a
                      href={drive.application_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1468D5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1053AB] transition-colors"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
