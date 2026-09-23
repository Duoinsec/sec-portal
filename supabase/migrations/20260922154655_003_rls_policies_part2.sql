/*
# SEC AI Assistant - RLS Policies Part 2

Adds RLS policies for: leave_requests, timetable, exam_schedules, announcements, placements, study_materials, documents, chat_sessions, chat_messages, notifications, audit_logs, events, student_skills
*/

-- LEAVE REQUESTS
DROP POLICY IF EXISTS "select_leave_requests" ON leave_requests;
CREATE POLICY "select_leave_requests" ON leave_requests FOR SELECT TO authenticated USING (is_admin() OR (is_student() AND student_id = my_student_id()) OR (is_staff() AND EXISTS (SELECT 1 FROM students s WHERE s.id = leave_requests.student_id AND s.department_id = my_department_id())));
DROP POLICY IF EXISTS "insert_leave_requests" ON leave_requests;
CREATE POLICY "insert_leave_requests" ON leave_requests FOR INSERT TO authenticated WITH CHECK (is_student() AND student_id = my_student_id());
DROP POLICY IF EXISTS "update_leave_requests" ON leave_requests;
CREATE POLICY "update_leave_requests" ON leave_requests FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());

-- TIMETABLE
DROP POLICY IF EXISTS "select_timetable" ON timetable;
CREATE POLICY "select_timetable" ON timetable FOR SELECT TO authenticated USING (is_admin() OR (is_staff() AND department_id = my_department_id()) OR (is_student() AND department_id = my_department_id() AND year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)));
DROP POLICY IF EXISTS "insert_timetable" ON timetable;
CREATE POLICY "insert_timetable" ON timetable FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_timetable" ON timetable;
CREATE POLICY "update_timetable" ON timetable FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_timetable" ON timetable;
CREATE POLICY "delete_timetable" ON timetable FOR DELETE TO authenticated USING (is_admin() OR is_staff());

-- EXAM SCHEDULES
DROP POLICY IF EXISTS "select_exam_schedules" ON exam_schedules;
CREATE POLICY "select_exam_schedules" ON exam_schedules FOR SELECT TO authenticated USING (is_admin() OR is_staff() OR (is_student() AND department_id = my_department_id() AND year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)));
DROP POLICY IF EXISTS "insert_exam_schedules" ON exam_schedules;
CREATE POLICY "insert_exam_schedules" ON exam_schedules FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_exam_schedules" ON exam_schedules;
CREATE POLICY "update_exam_schedules" ON exam_schedules FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "select_announcements" ON announcements;
CREATE POLICY "select_announcements" ON announcements FOR SELECT TO authenticated USING (is_active = true AND publish_at <= now() AND (target_audience = 'ALL' OR (target_audience = 'DEPARTMENT' AND my_department_id() = department_id) OR (target_audience = 'YEAR' AND is_student() AND target_year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)) OR (target_audience = 'DEPARTMENT_YEAR' AND my_department_id() = department_id AND is_student() AND target_year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)) OR is_admin() OR is_staff()));
DROP POLICY IF EXISTS "insert_announcements" ON announcements;
CREATE POLICY "insert_announcements" ON announcements FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_announcements" ON announcements;
CREATE POLICY "update_announcements" ON announcements FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_announcements" ON announcements;
CREATE POLICY "delete_announcements" ON announcements FOR DELETE TO authenticated USING (is_admin());

-- PLACEMENTS
DROP POLICY IF EXISTS "select_placements" ON placements;
CREATE POLICY "select_placements" ON placements FOR SELECT TO authenticated USING (is_active = true OR is_admin() OR is_staff());
DROP POLICY IF EXISTS "insert_placements" ON placements;
CREATE POLICY "insert_placements" ON placements FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_placements" ON placements;
CREATE POLICY "update_placements" ON placements FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_placements" ON placements;
CREATE POLICY "delete_placements" ON placements FOR DELETE TO authenticated USING (is_admin());

-- STUDY MATERIALS
DROP POLICY IF EXISTS "select_study_materials" ON study_materials;
CREATE POLICY "select_study_materials" ON study_materials FOR SELECT TO authenticated USING (is_active = true);
DROP POLICY IF EXISTS "insert_study_materials" ON study_materials;
CREATE POLICY "insert_study_materials" ON study_materials FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_study_materials" ON study_materials;
CREATE POLICY "delete_study_materials" ON study_materials FOR DELETE TO authenticated USING (is_admin() OR is_staff());

-- DOCUMENTS
DROP POLICY IF EXISTS "select_documents" ON documents;
CREATE POLICY "select_documents" ON documents FOR SELECT TO authenticated USING (uploaded_by = auth.uid() OR is_admin() OR is_staff() OR (processing_status = 'READY' AND (visibility = 'ALL' OR (visibility = 'DEPARTMENT' AND department_id = my_department_id()) OR (visibility = 'DEPARTMENT_YEAR' AND department_id = my_department_id() AND is_student() AND target_year = (SELECT year FROM students WHERE profile_id = auth.uid() LIMIT 1)))));
DROP POLICY IF EXISTS "insert_documents" ON documents;
CREATE POLICY "insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_documents" ON documents;
CREATE POLICY "update_documents" ON documents FOR UPDATE TO authenticated USING (uploaded_by = auth.uid() OR is_admin()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_documents" ON documents;
CREATE POLICY "delete_documents" ON documents FOR DELETE TO authenticated USING (is_admin());

-- CHAT SESSIONS
DROP POLICY IF EXISTS "select_chat_sessions" ON chat_sessions;
CREATE POLICY "select_chat_sessions" ON chat_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insert_chat_sessions" ON chat_sessions;
CREATE POLICY "insert_chat_sessions" ON chat_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "update_chat_sessions" ON chat_sessions;
CREATE POLICY "update_chat_sessions" ON chat_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "delete_chat_sessions" ON chat_sessions;
CREATE POLICY "delete_chat_sessions" ON chat_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- CHAT MESSAGES
DROP POLICY IF EXISTS "select_chat_messages" ON chat_messages;
CREATE POLICY "select_chat_messages" ON chat_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insert_chat_messages" ON chat_messages;
CREATE POLICY "insert_chat_messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "delete_chat_messages" ON chat_messages;
CREATE POLICY "delete_chat_messages" ON chat_messages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "select_notifications" ON notifications;
CREATE POLICY "select_notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- AUDIT LOGS
DROP POLICY IF EXISTS "select_audit_logs" ON audit_logs;
CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- EVENTS
DROP POLICY IF EXISTS "select_events" ON events;
CREATE POLICY "select_events" ON events FOR SELECT TO authenticated USING (is_active = true);
DROP POLICY IF EXISTS "insert_events" ON events;
CREATE POLICY "insert_events" ON events FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "update_events" ON events;
CREATE POLICY "update_events" ON events FOR UPDATE TO authenticated USING (is_admin() OR is_staff()) WITH CHECK (is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_events" ON events;
CREATE POLICY "delete_events" ON events FOR DELETE TO authenticated USING (is_admin());

-- STUDENT SKILLS
DROP POLICY IF EXISTS "select_student_skills" ON student_skills;
CREATE POLICY "select_student_skills" ON student_skills FOR SELECT TO authenticated USING (is_admin() OR (is_student() AND student_id = my_student_id()) OR (is_staff() AND EXISTS (SELECT 1 FROM students s WHERE s.id = student_skills.student_id AND s.department_id = my_department_id())));
DROP POLICY IF EXISTS "insert_student_skills" ON student_skills;
CREATE POLICY "insert_student_skills" ON student_skills FOR INSERT TO authenticated WITH CHECK (is_student() AND student_id = my_student_id() OR is_admin() OR is_staff());
DROP POLICY IF EXISTS "delete_student_skills" ON student_skills;
CREATE POLICY "delete_student_skills" ON student_skills FOR DELETE TO authenticated USING (is_student() AND student_id = my_student_id() OR is_admin() OR is_staff());
