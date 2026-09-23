/*
# SEC AI Assistant - RLS Policies Part 1

Adds RLS policies for: departments, profiles, subjects, staff, students, attendance_sessions, attendance, marks
*/

-- DEPARTMENTS
DROP POLICY IF EXISTS "select_departments" ON departments;
CREATE POLICY "select_departments" ON departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_departments_admin" ON departments;
CREATE POLICY "insert_departments_admin" ON departments FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "update_departments_admin" ON departments;
CREATE POLICY "update_departments_admin" ON departments FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "delete_departments_admin" ON departments;
CREATE POLICY "delete_departments_admin" ON departments FOR DELETE TO authenticated USING (is_admin());

-- PROFILES
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id OR is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_profiles_admin" ON profiles;
CREATE POLICY "update_profiles_admin" ON profiles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "insert_profiles" ON profiles;
CREATE POLICY "insert_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (is_admin() OR auth.uid() = id);

-- SUBJECTS
DROP POLICY IF EXISTS "select_subjects" ON subjects;
CREATE POLICY "select_subjects" ON subjects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_subjects_staff_admin" ON subjects;
CREATE POLICY "insert_subjects_staff_admin" ON subjects FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_subjects_staff_admin" ON subjects;
CREATE POLICY "update_subjects_staff_admin" ON subjects FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());

-- STAFF
DROP POLICY IF EXISTS "select_staff" ON staff;
CREATE POLICY "select_staff" ON staff FOR SELECT TO authenticated USING (profile_id = auth.uid() OR is_admin() OR (is_staff() AND department_id = my_department_id()));
DROP POLICY IF EXISTS "insert_staff_admin" ON staff;
CREATE POLICY "insert_staff_admin" ON staff FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "update_staff_admin" ON staff;
CREATE POLICY "update_staff_admin" ON staff FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "delete_staff_admin" ON staff;
CREATE POLICY "delete_staff_admin" ON staff FOR DELETE TO authenticated USING (is_admin());

-- STUDENTS
DROP POLICY IF EXISTS "select_students" ON students;
CREATE POLICY "select_students" ON students FOR SELECT TO authenticated USING (profile_id = auth.uid() OR is_admin() OR (is_staff() AND department_id = my_department_id()));
DROP POLICY IF EXISTS "insert_students_staff_admin" ON students;
CREATE POLICY "insert_students_staff_admin" ON students FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_students_staff_admin" ON students;
CREATE POLICY "update_students_staff_admin" ON students FOR UPDATE TO authenticated USING (profile_id = auth.uid() OR is_admin() OR (is_staff() AND department_id = my_department_id())) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_students_admin" ON students;
CREATE POLICY "delete_students_admin" ON students FOR DELETE TO authenticated USING (is_admin());

-- ATTENDANCE SESSIONS
DROP POLICY IF EXISTS "select_attendance_sessions" ON attendance_sessions;
CREATE POLICY "select_attendance_sessions" ON attendance_sessions FOR SELECT TO authenticated USING (is_admin() OR is_staff() OR (is_student() AND department_id = my_department_id() AND year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)));
DROP POLICY IF EXISTS "insert_attendance_sessions" ON attendance_sessions;
CREATE POLICY "insert_attendance_sessions" ON attendance_sessions FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_attendance_sessions" ON attendance_sessions;
CREATE POLICY "update_attendance_sessions" ON attendance_sessions FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());

-- ATTENDANCE
DROP POLICY IF EXISTS "select_attendance" ON attendance;
CREATE POLICY "select_attendance" ON attendance FOR SELECT TO authenticated USING (is_admin() OR (is_student() AND student_id = my_student_id()) OR (is_staff() AND EXISTS (SELECT 1 FROM students s WHERE s.id = attendance.student_id AND s.department_id = my_department_id())));
DROP POLICY IF EXISTS "insert_attendance" ON attendance;
CREATE POLICY "insert_attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_attendance" ON attendance;
CREATE POLICY "update_attendance" ON attendance FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());

-- MARKS
DROP POLICY IF EXISTS "select_marks" ON marks;
CREATE POLICY "select_marks" ON marks FOR SELECT TO authenticated USING (is_admin() OR (is_student() AND student_id = my_student_id()) OR (is_staff() AND EXISTS (SELECT 1 FROM students s WHERE s.id = marks.student_id AND s.department_id = my_department_id())));
DROP POLICY IF EXISTS "insert_marks" ON marks;
CREATE POLICY "insert_marks" ON marks FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_marks" ON marks;
CREATE POLICY "update_marks" ON marks FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_marks" ON marks;
CREATE POLICY "delete_marks" ON marks FOR DELETE TO authenticated USING (is_admin() OR is_staff());
