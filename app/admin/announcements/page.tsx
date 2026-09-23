'use client';

import { useAnnouncements } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Megaphone, Pin, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAnnouncements() {
  const { data: announcements, loading } = useAnnouncements();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Campus Circulars & Notices</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage institutional circulars broadcast across departments</p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading circulars..." />
      ) : announcements.length === 0 ? (
        <EmptyState title="No Circulars" message="No campus announcements posted." icon={Megaphone} />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {ann.is_pinned && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#1468D5]/10 px-2 py-0.5 text-xs font-semibold text-[#1468D5]">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <Badge>{ann.department?.name || 'All College'}</Badge>
                </div>
                <span className="text-xs text-[#6B7280]">{format(new Date(ann.publish_at), 'MMM d, yyyy')}</span>
              </div>
              <h3 className="text-base font-bold text-[#172033] mb-2">{ann.title}</h3>
              <p className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed">{ann.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
