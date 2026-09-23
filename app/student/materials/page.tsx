'use client';

import { useState } from 'react';
import { useStudyMaterials } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { BookOpen, Download, Search, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentMaterials() {
  const { data: materials, loading } = useStudyMaterials();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Distinct subjects
  const subjects = Array.from(
    new Set(materials.map((m) => m.subject?.name).filter(Boolean))
  ) as string[];

  const filtered = materials.filter((item) => {
    const matchesSubject = selectedSubject === 'ALL' || item.subject?.name === selectedSubject;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subject?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Study Materials & Notes</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Access lecture notes, question banks, syllabus copies, and reference slides
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search notes, topics, or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6EEF7] bg-white text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-xl border border-[#E6EEF7] bg-white px-3 py-2.5 text-sm text-[#172033] focus:border-[#1468D5] focus:outline-none shadow-sm"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message="Loading study materials..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Materials Found"
          message="No study materials match your search or filter criteria."
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between hover:border-[#1468D5]/30 hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="info">{item.subject?.code || 'NOTES'}</Badge>
                </div>
                <h3 className="font-semibold text-sm text-[#172033] mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B7280] mb-2">{item.subject?.name || 'General'}</p>
                {item.description && (
                  <p className="text-xs text-[#4B5563] line-clamp-2 mb-3 bg-[#F8FBFF] p-2 rounded-lg">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E6EEF7] text-xs text-[#6B7280]">
                <span>{item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : 'Recent'}</span>
                {item.file_url ? (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#1468D5] hover:text-[#1053AB]"
                  >
                    <span>View / Download</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-gray-400">In Library</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
