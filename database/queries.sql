-- 1. SELECT with JOIN: student skills
SELECT s.name,k.skill_name,ss.proficiency,ss.years_experience
FROM student s JOIN student_skill ss USING(student_id) JOIN skill k USING(skill_id)
ORDER BY s.name,k.skill_name;
-- 2. Projects with owner and required skills
SELECT p.title,owner.name AS owner, p.status, array_agg(k.skill_name ORDER BY k.skill_name) AS required_skills
FROM project p JOIN student owner ON owner.student_id=p.owner_id
LEFT JOIN project_skill ps ON ps.project_id=p.project_id LEFT JOIN skill k ON k.skill_id=ps.skill_id
GROUP BY p.project_id,owner.name ORDER BY p.created_at DESC;
-- 3. GROUP BY / HAVING: most demanded skills
SELECT k.skill_name,COUNT(*) AS project_demand
FROM project_skill ps JOIN skill k USING(skill_id)
GROUP BY k.skill_id,k.skill_name HAVING COUNT(*) >= 1 ORDER BY project_demand DESC,k.skill_name;
-- 4. Subquery: students with at least one advanced skill
SELECT name,email FROM student s WHERE EXISTS
(SELECT 1 FROM student_skill ss WHERE ss.student_id=s.student_id AND ss.proficiency IN ('advanced','expert'));
-- 5. Aggregate analytics
SELECT status,COUNT(*) AS project_count FROM project GROUP BY status ORDER BY project_count DESC;
-- 6. View
SELECT * FROM project_summary ORDER BY application_count DESC,required_skill_count DESC;
-- 7. Full-text search
SELECT project_id,title,ts_rank(to_tsvector('english',description),plainto_tsquery('english','computer vision')) AS relevance
FROM project WHERE to_tsvector('english',description) @@ plainto_tsquery('english','computer vision')
ORDER BY relevance DESC;
-- 8. Application transaction (replace IDs with real IDs in your database)
-- BEGIN;
-- INSERT INTO application(project_id,student_id) VALUES (1,2);
-- COMMIT;
-- 9. UPDATE / trigger demonstration (replace application ID)
-- UPDATE application SET status='accepted' WHERE application_id=1;
-- 10. DELETE demonstration: use only on test data
-- DELETE FROM application WHERE application_id=1;
-- 11. ALTER example (safe, idempotent)
ALTER TABLE student ADD COLUMN IF NOT EXISTS bio TEXT;
-- 12. DROP example: temporary table only, avoids deleting core project data
CREATE TEMP TABLE demo_drop(id INT);
DROP TABLE demo_drop;
