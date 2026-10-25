'use client';

import { useDocuments } from '@/lib/hooks';
import { Card, LoadingState, EmptyState } from '@/components/shared';
import { FolderOpen, FileText, ExternalLink, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_LABELS: Record<string, string> = {
  SYLLABUS: 'Syllabus', NOTES: 'Notes', CIRCULAR: 'Circular', FORM: 'Form', REPORT: 'Report',
};

export default function AdminDocuments() {
  const { data: documents, loading } = useDocuments();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto animate-fade-in min-h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#172033]">Central Document Repository</h1>
        <p className="text-sm text-[#6B7280] mt-1">Official regulations, accreditation certificates, and syllabus files</p>
      </div>

      {loading ? (
        <LoadingState message="Loading documents..." />
      ) : documents.length === 0 ? (
        <EmptyState title="No Documents" message="No institutional documents in archive." icon={FolderOpen} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between hover:border-[#1468D5]/30 transition-all">
              {/* Top */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-[#172033] truncate">{doc.title}</h3>
                    <p className="text-xs text-[#6B7280] truncate">{doc.file_name}</p>
                  </div>
                </div>

                {/* Badges: category, department, year */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {doc.category && (
                    <span className="rounded-full bg-[#1468D5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1468D5]">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                  )}
                  {doc.department?.name && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                      <Building2 className="h-2.5 w-2.5" />{doc.department.name}
                    </span>
                  )}
                  {doc.target_year && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />Year {doc.target_year}
                    </span>
                  )}
                </div>

                {/* File URL preview */}
                {doc.file_url && (
                  <p className="text-[10px] text-[#6B7280] truncate mb-2 px-1">{doc.file_url}</p>
                )}
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E6EEF7] text-xs text-[#6B7280]">
                <span>{doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'Recent'}</span>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noreferrer"
                    className="font-semibold text-[#1468D5] inline-flex items-center gap-1 hover:underline">
                    <span>Open</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
