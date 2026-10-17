# Ruvan — Instructor Workflow

## Contribution scope

Instructor-facing pages, course content management, learner progress, course reviews, and the instructor account experience.

## Workflow responsibilities

- Display the signed-in instructor’s assigned courses and backend engagement statistics.
- Keep course assignments within the instructor’s organization.
- Provide module, lesson, resource, and quiz editing for assigned courses.
- Save curriculum changes as drafts and submit them to the organization for approval before publication.
- Show enrolled learners and their recorded course progress and learning activity.
- Display verified course reviews and instructor responses.
- Maintain the combined profile, settings, and notifications experience.

## Main frontend files

- [Instructor dashboard](../../front-end/src/pages/instructor/instructor/Dashboard.jsx)
- [My courses](../../front-end/src/pages/instructor/courses/MyCourses.jsx)
- [Curriculum editor](../../front-end/src/pages/instructor/courses/CourseContent.jsx)
- [Quiz editor](../../front-end/src/pages/instructor/courses/CreateQuiz.jsx)
- [Learners](../../front-end/src/pages/instructor/students/Students.jsx)
- [Learner progress](../../front-end/src/pages/instructor/students/StudentProgress.jsx)
- [Analytics](../../front-end/src/pages/instructor/insights/Analytics.jsx)
- [Course reviews](../../front-end/src/pages/instructor/insights/Reviews.jsx)
- [Profile](../../front-end/src/pages/instructor/instructor/Profile.jsx)

## Backend integration

Coordinate instructor data and authorization with the instructor module, workspace service, course workflow service, quizzes, reviews, and notifications. Names, assignments, enrollments, ratings, and engagement figures must come from backend records.

## Workflow handoffs

Suhaas owns organization assignment and curriculum approval. Nishanth owns initial course approval for learner publication. Shared authentication work is coordinated with Jyothiprasad.
