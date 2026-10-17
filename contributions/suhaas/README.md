# Suhaas — Organization Workflow

## Contribution scope

Organization dashboards, institutional courses, instructor assignment, curriculum approvals, learner views, invitations, disputes, and organization account pages.

## Workflow responsibilities

- Display organization-specific courses, instructors, learners, and analytics from the backend.
- Create and edit courses, then submit initial course publication requests to the administrator.
- Assign courses directly to instructors belonging to the same organization.
- Prevent instructors from another institute from appearing as valid assignment choices.
- Review instructor curriculum submissions and approve changes before learners see them.
- Manage instructor invitations and their recorded statuses.
- Show course enrollments and learner progress within the organization.
- Archive completed or inactive courses while retaining enrollment and financial history.
- Maintain organization disputes and the combined profile, settings, and notifications experience.

## Main frontend files

- [Organization dashboard](../../front-end/src/pages/organization/Dashboard.jsx)
- [Analytics](../../front-end/src/pages/organization/Analytics.jsx)
- [Courses](../../front-end/src/pages/organization/Courses.jsx)
- [Create course](../../front-end/src/pages/organization/CreateCourse.jsx)
- [Edit course](../../front-end/src/pages/organization/EditCourse.jsx)
- [Course details](../../front-end/src/pages/organization/CourseDetails.jsx)
- [Course assignment](../../front-end/src/pages/organization/AssignCourses.jsx)
- [Instructors](../../front-end/src/pages/organization/Instructors.jsx)
- [Instructor invitations](../../front-end/src/pages/organization/InstructorRequests.jsx)
- [Learners](../../front-end/src/pages/organization/Learners.jsx)
- [Disputes](../../front-end/src/pages/organization/Disputes.jsx)
- [Profile](../../front-end/src/pages/organization/Profile.jsx)

## Backend integration

Coordinate organization APIs, organization-scoped workspace data, instructor invitations, and the course workflow service. Ownership, institute membership, draft approval, publication, and archive restrictions must be enforced on the backend.

## Workflow handoffs

Nishanth owns initial admin course approvals. Ruvan owns instructor draft creation and submission. Puneeth owns the student experience that consumes approved course content.
