'use client';

import { useStaffProfile, useDepartmentLeaveRequests } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { FileText, Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function StaffLeaves() {
  const { data: staff } = useStaffProfile();
  const { data: leaves, loading, updateStatus } = useDepartmentLeaveRequests(staff?.department_id || undefined);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Student Leave Approvals</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Review, approve, or reject medical leaves, casual leaves, and OD permissions
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading leave applications..." />
      ) : leaves.length === 0 ? (
        <EmptyState title="No Leave Requests" message="No leave or OD applications in your department." icon={FileText} />
      ) : (
        <div className="space-y-4">
          {leaves.map((l) => {
            const isPending = l.status === 'PENDING';
            const statusVariant =
              l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'error' : 'warning';

            return (
              <Card key={l.id} className="hover:border-[#1468D5]/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#172033]">
                        {(l as any).student?.full_name || 'Student'} ({(l as any).student?.register_number})
                      </span>
                      <Badge variant={statusVariant}>{l.status}</Badge>
                      <Badge variant="info">{l.leave_type}</Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {format(new Date(l.start_date), 'MMM d, yyyy')} &rarr; {format(new Date(l.end_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-[#374151] mt-2 bg-[#F8FBFF] p-2.5 rounded-lg border border-[#E6EEF7]">
                      "{l.reason}"
                    </p>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => updateStatus(l.id, 'APPROVED')}
                        className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(l.id, 'REJECTED')}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
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
