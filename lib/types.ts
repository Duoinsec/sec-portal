export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  full_name: string;
  hod_name: string | null;
  description: string | null;
  is_active: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department_id: string | null;
  year: number;
  semester: number;
  credits: number;
  is_active: boolean;
}

export interface Student {
  id: string;
  profile_id: string | null;
  register_number: string;
  roll_number: string | null;
  full_name: string;
  department_id: string | null;
  year: number;
  semester: number;
  section: string;
  cgpa: number;
  backlogs: number;
  status: string;
  admission_year: number | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  department?: Department;
}

export interface Staff {
  id: string;
  profile_id: string | null;
  staff_id: string;
  department_id: string | null;
  designation: string;
  is_class_advisor: boolean;
  department?: Department;
  profile?: Profile;
}

export interface AttendanceSession {
  id: string;
  department_id: string | null;
  subject_id: string | null;
  staff_id: string | null;
  session_date: string;
  year: number;
  section: string;
  period: number;
  subject?: Subject;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'OD';
  marked_at: string;
  session?: AttendanceSession;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  od: number;
  percentage: number;
}

export interface Mark {
  id: string;
  student_id: string;
  subject_id: string | null;
  component: string;
  max_marks: number;
  obtained_marks: number;
  grade: string | null;
  exam_date: string | null;
  subject?: Subject;
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by: string | null;
  approved_at: string | null;
  comments: string | null;
  created_at: string;
  student?: Student;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  target_audience: string;
  department_id: string | null;
  target_year: number | null;
  image_url: string | null;
  attachment_url: string | null;
  created_by: string | null;
  publish_at: string;
  expires_at: string | null;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  department?: Department;
}

export interface Placement {
  id: string;
  company_name: string;
  role: string;
  package_lpa: number | null;
  min_cgpa: number;
  max_backlogs: number;
  allowed_departments: string[];
  target_year: number;
  batch_year: number | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  poster_url: string | null;
  attachment_url: string | null;
  application_link: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlacementEligibility {
  placement: Placement;
  status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  reasons: string[];
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  image_url: string | null;
  target_audience: string;
  is_active: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  department_id: string | null;
  year: number | null;
  file_url: string;
  file_type: string | null;
  is_active: boolean;
  created_at: string;
  subject?: Subject;
}

export interface DocumentRecord {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string;
  department_id: string | null;
  target_year: number | null;
  visibility: string;
  processing_status: string;
  uploaded_by: string | null;
  content_text: string | null;
  created_at: string;
  department?: Department;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  metadata: any;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  department_id: string | null;
  subject_id: string | null;
  staff_id: string | null;
  year: number;
  section: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject?: Subject;
}

export interface ExamSchedule {
  id: string;
  subject_id: string | null;
  department_id: string | null;
  exam_type: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
  year: number;
  subject?: Subject;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_name: string;
  proficiency: string;
}
