# SkillSync test plan

| ID | Test | Expected result |
|---|---|---|
| T01 | Insert student with unique email | Insert succeeds |
| T02 | Insert duplicate email | Rejected by UNIQUE constraint |
| T03 | Insert student with year 0 | Rejected by CHECK constraint |
| T04 | Insert student_skill with unknown student_id | Rejected by foreign key |
| T05 | GET /api/students after seed | JSON students with skill arrays |
| T06 | GET /api/projects?q=vision | Matching project results |
| T07 | GET /api/matches?student_id=1&project_id=1 | Required count, matched count, score and details |
| T08 | Change application status to accepted | Open project moves to in_progress via trigger |
| T09 | Query project_summary | Aggregated project/skill/application counts |
| T10 | Full-text search for “computer vision” | Relevant project returned |

Record actual outcome, date, and screenshot for each test during execution. Do not mark tests passed before running them.
