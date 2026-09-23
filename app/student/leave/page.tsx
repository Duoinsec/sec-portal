'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStudentProfile, useLeaveRequests } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { FileText, Plus, CheckCircle, Clock, XCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentLeave() {
  const { profile } = useAuth();
  const { data: student } = useStudentProfile();
  const { data: leaves, loading, createLeave } = useLeaveRequests(student?.id);

  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    const res = await createLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim(),
    });
    setSubmitting(false);
    if (res?.error) {
      setErrorMsg(typeof res.error === 'string' ? res.error : 'Failed to submit leave request');
    } else {
      setSuccessMsg('Leave request submitted successfully!');
      setShowForm(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Leave & OD Requests</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Apply for medical leave, casual leave, or On-Duty permissions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1053AB] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Apply Leave'}
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#172033]">{pendingCount}</p>
            <p className="text-xs text-[#6B7280]">Pending</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#172033]">{approvedCount}</p>
            <p className="text-xs text-[#6B7280]">Approved</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#172033]">{rejectedCount}</p>
            <p className="text-xs text-[#6B7280]">Rejected</p>
          </div>
        </Card>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <Card className="mb-6 border-[#1468D5]/30 shadow-md">
          <h2 className="text-lg font-semibold text-[#172033] mb-4">New Leave Application</h2>
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-[#E6EEF7] bg-white px-3 py-2.5 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none"
                >
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="OD">On-Duty (OD)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E6EEF7] bg-white px-3 py-2 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E6EEF7] bg-white px-3 py-2 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Reason for Leave</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason clearly (e.g. Attending Hackathon at IIT Madras / Medical treatment)..."
                rows={3}
                className="w-full rounded-xl border border-[#E6EEF7] bg-white px-3 py-2 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#E6EEF7] px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F8FBFF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1468D5] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1053AB] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* History */}
      <h2 className="text-lg font-semibold text-[#172033] mb-3">Leave History</h2>
      {loading ? (
        <LoadingState message="Loading your leave history..." />
      ) : leaves.length === 0 ? (
        <EmptyState
          title="No Leave Requests"
          message="You have not submitted any leave or OD requests yet."
          icon={FileText}
        />
      ) : (
        <div className="space-y-3">
          {leaves.map((item) => {
            const statusVariant =
              item.status === 'APPROVED'
                ? 'success'
                : item.status === 'REJECTED'
                ? 'error'
                : 'warning';

            return (
              <Card key={item.id} className="hover:border-[#1468D5]/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E6EEF7]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#172033]">
                      {item.leave_type === 'OD' ? 'On-Duty (OD)' : `${item.leave_type} Leave`}
                    </span>
                    <Badge variant={statusVariant}>{item.status}</Badge>
                  </div>
                  <span className="text-xs text-[#6B7280]">
                    Submitted: {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[#172033]">
                  <p className="text-xs text-[#6B7280] mb-1 font-medium">
                    Duration: {format(new Date(item.start_date), 'MMM d, yyyy')} &rarr;{' '}
                    {format(new Date(item.end_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-[#374151] mt-1 bg-[#F8FBFF] p-2.5 rounded-lg border border-[#E6EEF7]">
                    "{item.reason}"
                  </p>
                  {item.comments && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      Note from Staff: {item.comments}
                    </p>
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
