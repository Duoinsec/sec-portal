'use client';

import { useAuditLogs } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditLogs() {
  const { data: logs, loading } = useAuditLogs();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Security & System Audit Logs</h1>
        <p className="text-sm text-[#6B7280] mt-1">Audit trail of critical user actions, authentication events, and data changes</p>
      </div>

      {loading ? (
        <LoadingState message="Loading audit trail..." />
      ) : logs.length === 0 ? (
        <EmptyState title="No Audit Records" message="System events and logs will appear here." icon={Shield} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[#E6EEF7]">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F8FBFF]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1468D5]">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">{log.action}</p>
                    <p className="text-xs text-[#6B7280]">
                      Resource: {log.resource || 'System'} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="info">User Action</Badge>
                  <p className="text-[11px] text-[#6B7280] mt-1">{format(new Date(log.created_at), 'MMM d, h:mm:ss a')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
