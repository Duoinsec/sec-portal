'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type {
  Student, Staff, Department, Subject, AttendanceRecord, AttendanceSession,
  Mark, LeaveRequest, Announcement, Placement, CollegeEvent, StudyMaterial,
  DocumentRecord, ChatSession, ChatMessage, Notification, AuditLog,
  TimetableEntry, ExamSchedule, StudentSkill, AttendanceSummary
} from '@/lib/types';

export function useStudentProfile() {
  const { profile } = useAuth();
  const [data, setData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: student, error: err } = await supabase
        .from('students')
        .select('*, department:departments(*)')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (!active) return;
      if (err) setError(err.message);
      else setData(student as Student | null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  return { data, loading, error };
}

export function useAttendanceSummary(studentId?: string) {
  const [data, setData] = useState<AttendanceSummary>({ total: 0, present: 0, absent: 0, leave: 0, od: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    (async () => {
      const { data: records } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);
      if (!active) return;
      if (records) {
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const leave = records.filter(r => r.status === 'LEAVE').length;
        const od = records.filter(r => r.status === 'OD').length;
        const total = records.length;
        const percentage = total > 0 ? (present / total) * 100 : 0;
        setData({ total, present, absent, leave, od, percentage });
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [studentId]);

  return { data, loading };
}

export function useAttendanceRecords(studentId?: string) {
  const [data, setData] = useState<(AttendanceRecord & { session?: AttendanceSession })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    (async () => {
      const { data: records } = await supabase
        .from('attendance')
        .select('*, session:attendance_sessions(*, subject:subjects(*))')
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false });
      if (!active) return;
      setData(records as any || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [studentId]);

  return { data, loading };
}

export function useMarks(studentId?: string) {
  const [data, setData] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    (async () => {
      const { data: marks } = await supabase
        .from('marks')
        .select('*, subject:subjects(*)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(marks as Mark[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [studentId]);

  return { data, loading };
}

export function useLeaveRequests(studentId?: string) {
  const { profile } = useAuth();
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    const { data: leaves, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setData(leaves as LeaveRequest[] || []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createLeave = async (leave: { leave_type: string; start_date: string; end_date: string; reason: string }) => {
    if (!studentId) return { error: 'No student' };
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ ...leave, student_id: studentId })
      .select()
      .single();
    if (!error) fetch();
    return { data, error };
  };

  return { data, loading, error, createLeave, refetch: fetch };
}

export function useAnnouncements() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: anns } = await supabase
        .from('announcements')
        .select('*, department:departments(*)')
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('publish_at', { ascending: false });
      if (!active) return;
      setData(anns as Announcement[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function usePlacements() {
  const [data, setData] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: placements } = await supabase
        .from('placements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(placements as Placement[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useEvents() {
  const [data, setData] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });
      if (!active) return;
      setData(events as CollegeEvent[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useNotifications() {
  const { profile } = useAuth();
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(notifs as Notification[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setData(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setData(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return { data, loading, markRead, markAllRead };
}

export function useTimetable(departmentId?: string, year?: number) {
  const [data, setData] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId || !year) return;
    let active = true;
    (async () => {
      const { data: entries } = await supabase
        .from('timetable')
        .select('*, subject:subjects(*)')
        .eq('department_id', departmentId)
        .eq('year', year)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      if (!active) return;
      setData(entries as TimetableEntry[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [departmentId, year]);

  return { data, loading };
}

export function useExamSchedules(departmentId?: string, year?: number) {
  const [data, setData] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId || !year) return;
    let active = true;
    (async () => {
      const { data: exams } = await supabase
        .from('exam_schedules')
        .select('*, subject:subjects(*)')
        .eq('department_id', departmentId)
        .eq('year', year)
        .order('exam_date', { ascending: true });
      if (!active) return;
      setData(exams as ExamSchedule[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [departmentId, year]);

  return { data, loading };
}

export function useStudyMaterials() {
  const [data, setData] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: materials } = await supabase
        .from('study_materials')
        .select('*, subject:subjects(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(materials as StudyMaterial[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useStudentSkills(studentId?: string) {
  const [data, setData] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    (async () => {
      const { data: skills } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId);
      if (!active) return;
      setData(skills as StudentSkill[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [studentId]);

  return { data, loading };
}

export function useDepartments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (!active) return;
      setData(depts as Department[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useStaffProfile() {
  const { profile } = useAuth();
  const [data, setData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const { data: staff } = await supabase
        .from('staff')
        .select('*, department:departments(*)')
        .eq('profile_id', profile.id)
        .maybeSingle();
      if (!active) return;
      setData(staff as Staff | null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  return { data, loading };
}

export function useDepartmentStudents(departmentId?: string) {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;
    let active = true;
    (async () => {
      const { data: students } = await supabase
        .from('students')
        .select('*, department:departments(*)')
        .eq('department_id', departmentId)
        .order('register_number', { ascending: true });
      if (!active) return;
      setData(students as Student[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [departmentId]);

  return { data, loading };
}

export function useAllStudents() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: students } = await supabase
        .from('students')
        .select('*, department:departments(*)')
        .order('register_number', { ascending: true });
      if (!active) return;
      setData(students as Student[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useAllStaff() {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: staff } = await supabase
        .from('staff')
        .select('*, department:departments(*), profile:profiles(*)')
        .order('staff_id', { ascending: true });
      if (!active) return;
      setData(staff as Staff[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useDocuments() {
  const [data, setData] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: docs } = await supabase
        .from('documents')
        .select('*, department:departments(*)')
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(docs as DocumentRecord[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useChatSessions() {
  const { profile } = useAuth();
  const [data, setData] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false });
      if (!active) return;
      setData(sessions as ChatSession[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  return { data, loading };
}

export function useChatMessages(sessionId?: string) {
  const [data, setData] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    (async () => {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (!active) return;
      setData(messages as ChatMessage[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sessionId]);

  return { data, loading };
}

export function useAuditLogs() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!active) return;
      setData(logs as AuditLog[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useDepartmentLeaveRequests(departmentId?: string) {
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;
    let active = true;
    (async () => {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('department_id', departmentId);
      if (!active) return;
      const studentIds = (students || []).map(s => s.id);
      if (studentIds.length === 0) { setData([]); setLoading(false); return; }
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*, student:students(*)')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });
      if (!active) return;
      setData(leaves as LeaveRequest[] || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [departmentId]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED', comments?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('leave_requests')
      .update({ status, approved_by: userData.user?.id, approved_at: new Date().toISOString(), comments })
      .eq('id', id);
    if (!error) {
      setData(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    }
    return { error };
  };

  return { data, loading, updateStatus };
}

export function useAdminDashboard() {
  const [data, setData] = useState({
    totalStudents: 0, totalStaff: 0, totalDepartments: 0, todayAttendance: 0,
    totalAnnouncements: 0, totalPlacements: 0, totalDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [students, staff, depts, anns, placements, docs] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('placements').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
      ]);
      if (!active) return;
      setData({
        totalStudents: students.count || 0,
        totalStaff: staff.count || 0,
        totalDepartments: depts.count || 0,
        todayAttendance: 0,
        totalAnnouncements: anns.count || 0,
        totalPlacements: placements.count || 0,
        totalDocuments: docs.count || 0,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { data, loading };
}

export function useStaffDashboard(departmentId?: string) {
  const [data, setData] = useState({ totalStudents: 0, pendingLeaves: 0, todayAttendance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;
    let active = true;
    (async () => {
      const [students, leaves] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('department_id', departmentId),
        supabase.from('leave_requests').select('id, student:students!inner(department_id)', { count: 'exact', head: true }).eq('status', 'PENDING'),
      ]);
      if (!active) return;
      setData({
        totalStudents: students.count || 0,
        pendingLeaves: 0,
        todayAttendance: 0,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [departmentId]);

  return { data, loading };
}
