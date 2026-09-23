/*
# SEC AI Assistant - All Tables (no policies yet)

Creates all core tables. RLS enabled but policies added in next migration.
*/

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  hod_name text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'STAFF', 'STUDENT')),
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  year int NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester int NOT NULL CHECK (semester BETWEEN 1 AND 8),
  credits int DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_year ON subjects(year);

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id text UNIQUE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation text DEFAULT 'Assistant Professor',
  is_class_advisor boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_profile ON staff(profile_id);

-- STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  register_number text UNIQUE NOT NULL,
  roll_number text,
  full_name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  year int NOT NULL CHECK (year BETWEEN 1 AND 4) DEFAULT 1,
  semester int NOT NULL CHECK (semester BETWEEN 1 AND 8) DEFAULT 1,
  section text DEFAULT 'A',
  cgpa numeric(3,2) DEFAULT 0.00,
  backlogs int DEFAULT 0,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED')),
  admission_year int,
  parent_name text,
  parent_phone text,
  address text,
  date_of_birth date,
  gender text,
  blood_group text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_students_register ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_profile ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);

-- ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  year int NOT NULL,
  section text DEFAULT 'A',
  period int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_att_sessions_dept ON attendance_sessions(department_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_date ON attendance_sessions(session_date);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LEAVE', 'OD')),
  marked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);

-- MARKS
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  component text NOT NULL CHECK (component IN ('INTERNAL_1', 'INTERNAL_2', 'MODEL', 'ASSIGNMENT', 'PRACTICAL', 'SEMESTER')),
  max_marks int NOT NULL DEFAULT 100,
  obtained_marks numeric(5,2) NOT NULL DEFAULT 0,
  grade text,
  exam_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id, component)
);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON marks(subject_id);

-- LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'EMERGENCY', 'OD', 'OTHER')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

-- TIMETABLE
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  year int NOT NULL,
  section text DEFAULT 'A',
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timetable_dept ON timetable(department_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day_of_week);

-- EXAM SCHEDULES
CREATE TABLE IF NOT EXISTS exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('INTERNAL_1', 'INTERNAL_2', 'MODEL', 'SEMESTER', 'PRACTICAL')),
  exam_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  year int NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exam_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_dept ON exam_schedules(department_id);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'EXAM', 'EVENT', 'PLACEMENT', 'HOLIDAY', 'URGENT', 'DEPARTMENT')),
  target_audience text NOT NULL DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'DEPARTMENT', 'YEAR', 'DEPARTMENT_YEAR')),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  target_year int,
  image_url text,
  attachment_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  publish_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_pinned boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_dept ON announcements(department_id);
CREATE INDEX IF NOT EXISTS idx_announcements_publish ON announcements(publish_at);

-- PLACEMENTS
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  role text NOT NULL,
  package_lpa numeric(5,2),
  min_cgpa numeric(3,2) DEFAULT 6.00,
  max_backlogs int DEFAULT 0,
  allowed_departments text[] DEFAULT '{}',
  target_year int DEFAULT 4,
  batch_year int,
  location text,
  deadline timestamptz,
  description text,
  poster_url text,
  attachment_url text,
  application_link text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_placements_active ON placements(is_active);
CREATE INDEX IF NOT EXISTS idx_placements_deadline ON placements(deadline);

-- STUDY MATERIALS
CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  year int,
  file_url text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_materials_dept ON study_materials(department_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON study_materials(subject_id);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  category text DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'POLICY', 'CIRCULAR', 'NOTICE', 'STUDY_MATERIAL', 'PLACEMENT', 'OTHER')),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  target_year int,
  visibility text DEFAULT 'ALL' CHECK (visibility IN ('ALL', 'DEPARTMENT', 'DEPARTMENT_YEAR')),
  processing_status text DEFAULT 'UPLOADED' CHECK (processing_status IN ('UPLOADED', 'PROCESSING', 'EXTRACTING', 'INDEXING', 'READY', 'NEEDS_REVIEW', 'FAILED')),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_dept ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);

-- CHAT SESSIONS
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
  content text NOT NULL,
  message_type text DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'CARD', 'TABLE', 'ATTENDANCE', 'MARKS', 'PLACEMENT', 'ANNOUNCEMENT')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'GENERAL' CHECK (type IN ('GENERAL', 'ATTENDANCE', 'MARKS', 'LEAVE', 'ANNOUNCEMENT', 'PLACEMENT', 'EXAM', 'DEPARTMENT')),
  related_id uuid,
  related_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  venue text,
  image_url text,
  target_audience text DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'DEPARTMENT', 'YEAR')),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  target_year int,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency text DEFAULT 'BEGINNER' CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if current user is staff
CREATE OR REPLACE FUNCTION is_staff() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'STAFF');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if current user is student
CREATE OR REPLACE FUNCTION is_student() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'STUDENT');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to get current user's department (via staff or student)
CREATE OR REPLACE FUNCTION my_department_id() RETURNS uuid AS $$
  SELECT department_id FROM staff WHERE profile_id = auth.uid()
  UNION
  SELECT department_id FROM students WHERE profile_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper to get current student id
CREATE OR REPLACE FUNCTION my_student_id() RETURNS uuid AS $$
  SELECT id FROM students WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
