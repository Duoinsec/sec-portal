-- ============================================================
-- SEC Portal – Complete SQL Setup & Seed Data
-- Sengunthar Engineering College, Tiruchengode
-- Database: Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABLE: departments
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  full_name   TEXT,
  hod_name    TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Ensure full_name column allows null or matches if already present
ALTER TABLE departments ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE departments ALTER COLUMN full_name DROP NOT NULL;

-- Seed: departments (safe upsert with code, name, full_name, and hod_name)
INSERT INTO departments (code, name, full_name, hod_name) VALUES
  ('AI&DS', 'Artificial Intelligence and Data Science', 'Artificial Intelligence and Data Science', 'Dr. R. Prabhakaran'),
  ('CSE',   'Computer Science and Engineering',         'Computer Science and Engineering',         'Dr. S. Kavitha'),
  ('ECE',   'Electronics and Communication Engineering','Electronics and Communication Engineering','Dr. M. Sundaram'),
  ('EEE',   'Electrical and Electronics Engineering',  'Electrical and Electronics Engineering',  'Dr. P. Muthukumar'),
  ('MECH',  'Mechanical Engineering',                  'Mechanical Engineering',                  'Dr. V. Rajendran'),
  ('CIVIL', 'Civil Engineering',                       'Civil Engineering',                       'Dr. A. Selvaraj')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    hod_name = EXCLUDED.hod_name;

-- ─────────────────────────────────────────────────────────────
-- 2. TABLE: profiles  (mirrors auth.users metadata)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'STUDENT')),
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. TABLE: staff
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  staff_id      TEXT UNIQUE NOT NULL,
  designation   TEXT,
  joining_date  DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. TABLE: students
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id    UUID REFERENCES departments(id),
  register_number  TEXT UNIQUE NOT NULL,
  full_name        TEXT,
  year             INT NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester         INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  section          TEXT DEFAULT 'A',
  cgpa             NUMERIC(4,2),
  backlogs         INT DEFAULT 0,
  admission_year   INT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Make full_name non-blocking on existing tables
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE students ALTER COLUMN full_name DROP NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 5. TABLE: attendance
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES departments(id),
  date            DATE NOT NULL,
  subject_name    TEXT NOT NULL,
  session_number  INT DEFAULT 1,
  status          TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'OD')),
  marked_by       UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was previously created with alternative schema
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS subject_name TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS session_number INT DEFAULT 1;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS marked_by UUID REFERENCES profiles(id);

-- ─────────────────────────────────────────────────────────────
-- 6. TABLE: marks
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_name    TEXT NOT NULL,
  exam_type       TEXT NOT NULL CHECK (exam_type IN ('INTERNAL_1','INTERNAL_2','MODEL','SEMESTER')),
  obtained_marks  NUMERIC(5,2) NOT NULL,
  max_marks       NUMERIC(5,2) NOT NULL DEFAULT 100,
  grade           TEXT,
  entered_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was previously created with alternative schema
ALTER TABLE marks ADD COLUMN IF NOT EXISTS subject_name TEXT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS exam_type TEXT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS entered_by UUID REFERENCES profiles(id);

-- ─────────────────────────────────────────────────────────────
-- 7. TABLE: announcements
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_pinned     BOOLEAN DEFAULT false,
  publish_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 8. TABLE: placements
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS placements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT NOT NULL,
  role          TEXT NOT NULL,
  location      TEXT,
  package_lpa   NUMERIC(5,2),
  min_cgpa      NUMERIC(4,2) DEFAULT 6.0,
  max_backlogs  INT DEFAULT 0,
  description   TEXT,
  deadline      DATE,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 9. TABLE: documents
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  file_name     TEXT,
  file_url      TEXT,
  category      TEXT DEFAULT 'SYLLABUS' CHECK (category IN ('SYLLABUS','NOTES','CIRCULAR','FORM','REPORT')),
  department_id UUID REFERENCES departments(id),
  uploaded_by   UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 10. TABLE: timetable
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timetable (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id),
  day_of_week   INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  subject_name  TEXT,
  room          TEXT,
  year          INT DEFAULT 1,
  semester      INT DEFAULT 1,
  staff_id      UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 11. TABLE: notifications
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 12. TABLE: leave_requests
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leave_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('SICK', 'OD', 'CASUAL', 'EMERGENCY')),
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL,
  reason      TEXT,
  status      TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED DATA (Safe to run multiple times)
-- ============================================================

-- Seed: announcements
INSERT INTO announcements (title, content, is_pinned, publish_at) VALUES
  (
    'Internal Assessment 1 - Timetable Released',
    'Internal Assessment 1 will be conducted from 15-Oct to 20-Oct 2025. Students are advised to collect hall tickets from the department office by 13-Oct.',
    true, now()
  ),
  (
    'National Conference on Generative AI - Call for Papers',
    'Sengunthar Engineering College is organizing a National Conference on Generative AI on 5-Nov 2025. Faculty and students are invited to submit papers before 25-Oct 2025.',
    false, now()
  ),
  (
    'Campus Placement Drive - Zoho Corporation',
    'Zoho Corporation will visit campus on 10-Nov 2025 for recruitment. Eligible students (CGPA >= 7.0, No active backlogs) must register via the Placements portal before 1-Nov 2025.',
    true, now()
  );

-- Seed: placements
INSERT INTO placements (company_name, role, location, package_lpa, min_cgpa, max_backlogs, description, deadline, is_active) VALUES
  (
    'Zoho Corporation', 'Software Developer', 'Chennai',
    8.50, 7.0, 0,
    'Zoho is hiring for its product engineering team. Skills required: Java/Python, Data Structures, Problem Solving. 3 rounds: Written, Technical, HR.',
    '2025-11-01', true
  ),
  (
    'TCS', 'System Engineer', 'Pan India',
    7.00, 6.0, 2,
    'TCS National Qualifier Test (TCS NQT) + Technical Interview. Open to all departments.',
    '2025-12-15', true
  ),
  (
    'Infosys', 'Systems Engineer', 'Bangalore',
    6.50, 6.0, 2,
    'InfyTQ platform registration mandatory. Aptitude + Logical Reasoning + Coding rounds.',
    '2025-12-20', true
  );

-- Seed: documents
INSERT INTO documents (title, file_name, file_url, category) VALUES
  (
    'Academic Calendar 2025-26',
    'academic_calendar_2025_26.pdf',
    'https://drive.google.com/file/d/example-cal',
    'CIRCULAR'
  ),
  (
    'Leave Application Form',
    'leave_application_form.pdf',
    'https://drive.google.com/file/d/example-leave',
    'FORM'
  );

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff          ENABLE ROW LEVEL SECURITY;
ALTER TABLE students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplicate policy errors
DROP POLICY IF EXISTS "staff_read_students" ON students;
DROP POLICY IF EXISTS "staff_manage_attendance" ON attendance;
DROP POLICY IF EXISTS "staff_manage_marks" ON marks;
DROP POLICY IF EXISTS "staff_manage_announcements" ON announcements;
DROP POLICY IF EXISTS "staff_manage_placements" ON placements;
DROP POLICY IF EXISTS "staff_manage_documents" ON documents;
DROP POLICY IF EXISTS "staff_manage_timetable" ON timetable;
DROP POLICY IF EXISTS "student_read_own" ON students;
DROP POLICY IF EXISTS "student_read_attendance" ON attendance;
DROP POLICY IF EXISTS "student_read_marks" ON marks;
DROP POLICY IF EXISTS "auth_read_announcements" ON announcements;
DROP POLICY IF EXISTS "auth_read_placements" ON placements;
DROP POLICY IF EXISTS "auth_read_documents" ON documents;
DROP POLICY IF EXISTS "auth_read_timetable" ON timetable;

-- STAFF can read students in their department
CREATE POLICY "staff_read_students" ON students
  FOR SELECT TO authenticated
  USING (
    department_id = (
      SELECT department_id FROM staff WHERE profile_id = auth.uid() LIMIT 1
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- STAFF can manage attendance
CREATE POLICY "staff_manage_attendance" ON attendance
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STAFF can manage marks
CREATE POLICY "staff_manage_marks" ON marks
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STAFF can post announcements
CREATE POLICY "staff_manage_announcements" ON announcements
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STAFF can manage placements
CREATE POLICY "staff_manage_placements" ON placements
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STAFF can manage documents
CREATE POLICY "staff_manage_documents" ON documents
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STAFF can manage timetable
CREATE POLICY "staff_manage_timetable" ON timetable
  FOR ALL TO authenticated
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('STAFF', 'ADMIN'));

-- STUDENTS read-only their own profile
CREATE POLICY "student_read_own" ON students
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- STUDENTS read their own attendance
CREATE POLICY "student_read_attendance" ON attendance
  FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM students WHERE profile_id = auth.uid() LIMIT 1));

-- STUDENTS read their own marks
CREATE POLICY "student_read_marks" ON marks
  FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM students WHERE profile_id = auth.uid() LIMIT 1));

-- Everyone (authenticated) can read announcements, placements, documents, timetable
CREATE POLICY "auth_read_announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_placements"    ON placements    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_documents"     ON documents     FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_timetable"     ON timetable     FOR SELECT TO authenticated USING (true);


-- ============================================================
-- REFERENCE QUERIES & SNIPPETS (For Manual Use - Do Not Run Directly)
-- ============================================================

/*
-- HOW TO ADD A STUDENT MANUALLY:
-- Step 1: In Supabase Auth -> Users -> Add User (email + password)
-- Step 2: Copy the user's UUID from Supabase Auth and replace <AUTH_USER_UUID> below:

INSERT INTO profiles (id, full_name, email, role)
VALUES ('<AUTH_USER_UUID>', 'Priya Dharshini', 'priya.dharshini@sec.edu.in', 'STUDENT');

INSERT INTO students (profile_id, full_name, department_id, register_number, year, semester, section, cgpa, backlogs, admission_year)
VALUES (
  '<AUTH_USER_UUID>',
  'Priya Dharshini',
  (SELECT id FROM departments WHERE code = 'AI&DS'),
  '23AD009', 2, 3, 'A', 8.92, 0, 2023
);

-- HOW TO MARK ATTENDANCE:
INSERT INTO attendance (student_id, department_id, date, subject_name, session_number, status)
VALUES (
  (SELECT id FROM students WHERE register_number = '23AD009'),
  (SELECT id FROM departments WHERE code = 'AI&DS'),
  CURRENT_DATE, 'Data Structures', 1, 'PRESENT'
);

-- HOW TO ENTER MARKS:
INSERT INTO marks (student_id, subject_name, exam_type, obtained_marks, max_marks, grade)
VALUES (
  (SELECT id FROM students WHERE register_number = '23AD009'),
  'Data Structures and Algorithms', 'INTERNAL_1', 87, 100, 'A+'
);
*/
