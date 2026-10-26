'use client';

import { useState } from 'react';
import { usePlacements } from '@/lib/hooks';
import { Card, LoadingState, EmptyState } from '@/components/shared';
import { Briefcase, MapPin, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

function AddPlacementModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ company_name: '', role: '', location: '', package_lpa: '', min_cgpa: '6.0', max_backlogs: '0', description: '', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.role.trim()) { setError('Company name and role are required'); return; }
    setSaving(true); setError('');
    try {
      const { data: inserted, error: err } = await supabase.from('placements').insert({
        company_name: form.company_name, role: form.role, location: form.location || null,
        package_lpa: form.package_lpa ? Number(form.package_lpa) : null,
        min_cgpa: Number(form.min_cgpa), max_backlogs: Number(form.max_backlogs),
        description: form.description || null,
        deadline: form.deadline || null, is_active: true,
      }).select().single();
      if (err) throw err;

      // Broadcast to students for outside device alerts
      try {
        const pkg = form.package_lpa ? ` | ${form.package_lpa} LPA` : '';
        const channel = supabase.channel('sec_campus_realtime_updates');
        await channel.send({
          type: 'broadcast',
          event: 'campus_broadcast',
          payload: {
            title: `💼 New Placement Drive: ${form.company_name}`,
            body: `Role: ${form.role}${pkg} • Apply before ${form.deadline || 'deadline'}!`,
            type: 'placement',
            url: '/student/placements/',
          },
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('sec:campus-update', {
              detail: {
                title: `💼 New Placement Drive: ${form.company_name}`,
                body: `Role: ${form.role}${pkg} • Apply before ${form.deadline || 'deadline'}!`,
                type: 'placement',
                url: '/student/placements/',
              },
            })
          );
        }
      } catch (bcErr) {
        console.warn('[Staff Placement] Broadcast notice:', bcErr);
      }

      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add placement drive');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EEF7] sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-[#172033]">Add Placement Drive</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Company Name *</label>
              <input required value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. Zoho Corporation" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Job Role *</label>
              <input required value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="Chennai" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Package (LPA)</label>
              <input type="number" step="0.1" value={form.package_lpa} onChange={e => setForm(f => ({...f, package_lpa: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" placeholder="8.5" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Min CGPA</label>
              <input type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={e => setForm(f => ({...f, min_cgpa: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Max Backlogs</label>
              <input type="number" min="0" value={form.max_backlogs} onChange={e => setForm(f => ({...f, max_backlogs: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full rounded-xl border border-[#E6EEF7] px-3 py-2.5 text-sm focus:border-[#1468D5] focus:outline-none resize-none" placeholder="Job description, skills required..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E6EEF7] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#1468D5] py-2.5 text-sm font-semibold text-white hover:bg-[#123B73] disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffPlacements() {
  const { data: placements, loading, refresh } = usePlacements() as any;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      {showModal && <AddPlacementModal onClose={() => setShowModal(false)} onSuccess={() => typeof refresh === 'function' && refresh()} />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Placement Drives Overview</h1>
          <p className="text-sm text-[#6B7280] mt-1">Recruitment companies, CTC packages, and eligibility</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#1468D5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123B73] transition-colors">
          <Plus className="h-4 w-4" /> Add Drive
        </button>
      </div>
      {loading ? (<LoadingState message="Loading drives..." />) : (placements || []).length === 0 ? (
        <EmptyState title="No Active Drives" message="No campus placement drives currently listed." icon={Briefcase} />
      ) : (
        <div className="space-y-4">
          {(placements || []).map((drive: any) => (
            <Card key={drive.id} className="hover:border-[#1468D5]/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EC4899]/10 text-[#EC4899] font-bold text-lg shrink-0">
                    {drive.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#172033]">{drive.company_name}</h3>
                    <p className="text-sm font-medium text-[#1468D5]">{drive.role}</p>
                    {drive.location && (<p className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5"><MapPin className="h-3.5 w-3.5" /> {drive.location}</p>)}
                  </div>
                </div>
                <div className="text-right sm:self-center">
                  {drive.package_lpa && (<span className="inline-block px-3 py-1 rounded-xl bg-green-50 text-green-700 font-bold text-sm border border-green-200">{drive.package_lpa} LPA</span>)}
                </div>
              </div>
              {drive.description && (<p className="text-xs text-[#4B5563] mt-3 bg-[#F8FBFF] p-2.5 rounded-lg border border-[#E6EEF7]">{drive.description}</p>)}
              <div className="mt-3 pt-3 border-t border-[#E6EEF7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
                <span>Min CGPA: <strong className="text-[#172033]">{drive.min_cgpa}</strong></span>
                <span>Max Backlogs: <strong className="text-[#172033]">{drive.max_backlogs}</strong></span>
                {drive.deadline && (<span>Deadline: <strong className="text-[#172033]">{format(new Date(drive.deadline), 'MMM d, yyyy')}</strong></span>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}