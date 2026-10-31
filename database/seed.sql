-- Demonstration records. Safe to run after schema.sql; unique keys avoid duplicate seed data.
INSERT INTO student(name,email,department,year,experience_level) VALUES
('Aarav Rao','aarav@example.edu','CSE(AIML)',2,'intermediate'),
('Diya Menon','diya@example.edu','CSE',2,'advanced'),
('Kabir Shah','kabir@example.edu','ECE',3,'intermediate'),
('Meera Iyer','meera@example.edu','CSE(AIML)',2,'beginner')
ON CONFLICT(email) DO NOTHING;
INSERT INTO skill(skill_name,category) VALUES
('Python','Programming'),('Machine Learning','AI/ML'),('Computer Vision','AI/ML'),('React','Web Development'),('PostgreSQL','Database'),('Data Visualization','Data')
ON CONFLICT(skill_name) DO NOTHING;
INSERT INTO student_skill(student_id,skill_id,proficiency,years_experience)
SELECT s.student_id,k.skill_id,v.proficiency,v.years_exp FROM (VALUES
('aarav@example.edu','Python','advanced',1.5),('aarav@example.edu','Machine Learning','intermediate',1.0),('aarav@example.edu','Computer Vision','intermediate',0.5),
('diya@example.edu','Python','advanced',2.0),('diya@example.edu','React','advanced',2.0),('diya@example.edu','PostgreSQL','intermediate',1.0),
('kabir@example.edu','Computer Vision','advanced',1.5),('kabir@example.edu','Python','intermediate',1.0),('kabir@example.edu','Data Visualization','intermediate',1.0),
('meera@example.edu','React','beginner',0.5),('meera@example.edu','PostgreSQL','beginner',0.5)
) AS v(email,skill_name,proficiency,years_exp) JOIN student s ON s.email=v.email JOIN skill k ON k.skill_name=v.skill_name
ON CONFLICT(student_id,skill_id) DO NOTHING;
INSERT INTO project(title,description,owner_id,status)
SELECT v.title,v.description,s.student_id,'open' FROM (VALUES
('Campus Vision Lab','Build a computer vision prototype to identify objects in campus images.','aarav@example.edu'),
('Peer Learning Portal','Create a web platform for peer tutoring and learning analytics.','diya@example.edu'),
('Student Data Insights','Explore student engagement data and present visual summaries.','kabir@example.edu')
) v(title,description,email) JOIN student s ON s.email=v.email
WHERE NOT EXISTS (SELECT 1 FROM project p WHERE p.title=v.title);
INSERT INTO project_skill(project_id,skill_id,required_level)
SELECT p.project_id,k.skill_id,v.level FROM (VALUES
('Campus Vision Lab','Python','intermediate'),('Campus Vision Lab','Machine Learning','intermediate'),('Campus Vision Lab','Computer Vision','advanced'),
('Peer Learning Portal','React','intermediate'),('Peer Learning Portal','PostgreSQL','intermediate'),
('Student Data Insights','Python','intermediate'),('Student Data Insights','Data Visualization','intermediate')
) v(title,skill_name,level) JOIN project p ON p.title=v.title JOIN skill k ON k.skill_name=v.skill_name
ON CONFLICT(project_id,skill_id) DO NOTHING;
