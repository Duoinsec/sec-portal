'use client';

import { useState } from 'react';
import { useAnnouncements, useEvents } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Megaphone, CalendarDays, Pin, Clock, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentAnnouncements() {
  const { data: announcements, loading: annLoading } = useAnnouncements();
  const { data: events, loading: evLoading } = useEvents();
  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'EVENTS'>('ANNOUNCEMENTS');

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Announcements & Events</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Stay informed on official campus circulars, academic notices, and upcoming college events
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl border border-[#E6EEF7] shadow-sm mb-6 max-w-xs">
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-[#1468D5] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#172033]'
          }`}
        >
          Circulars ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'EVENTS'
              ? 'bg-[#1468D5] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#172033]'
          }`}
        >
          Events ({events.length})
        </button>
      </div>

      {activeTab === 'ANNOUNCEMENTS' ? (
        annLoading ? (
          <LoadingState message="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No Announcements"
            message="There are no active circulars or announcements at this time."
            icon={Megaphone}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card
                key={ann.id}
                className={`transition-all hover:shadow-md ${
                  ann.is_pinned ? 'border-[#1468D5]/40 bg-gradient-to-r from-blue-50/30 to-white' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {ann.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#1468D5]/10 px-2 py-0.5 text-xs font-semibold text-[#1468D5]">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <span className="text-xs text-[#6B7280]">
                      {ann.department?.name || 'All Departments'}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B7280]">
                    {format(new Date(ann.publish_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#172033] mb-2">{ann.title}</h3>
                <p className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </Card>
            ))}
          </div>
        )
      ) : evLoading ? (
        <LoadingState message="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Found"
          message="No college events are scheduled right now."
          icon={CalendarDays}
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col sm:flex-row gap-4 items-start hover:shadow-md transition-all">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-2xl bg-[#1468D5]/10 text-[#1468D5] shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {format(new Date(event.event_date), 'MMM')}
                </span>
                <span className="text-2xl font-black">
                  {format(new Date(event.event_date), 'd')}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {format(new Date(event.event_date), 'EEE')}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="info">{event.target_audience || 'College Event'}</Badge>
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-1">{event.title}</h3>
                {event.description && (
                  <p className="text-xs text-[#4B5563] mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
                  {event.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#1468D5]" /> {event.venue}
                    </span>
                  )}
                  {event.start_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-500" /> {event.start_time}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
