# Nishanth — Admin Workflow

## Contribution scope

Administrator dashboards, user management, course review and approval, certificates, disputes, payment visibility, and administrator account pages.

## Workflow responsibilities

- Present backend platform totals and the course approval queue.
- Provide a unified user directory with learner and organization filtering and detailed views.
- Show a learner’s enrollments and an organization’s instructors and courses.
- Review submitted courses and approve or reject their publication.
- Show pending courses and the ten most recently approved courses in the admin course list.
- Display certificate learner names, email addresses, and course information.
- Support dispute investigation and resolution with recorded activity.
- Keep payment records read-only and enforce permitted account suspension or deletion actions.
- Maintain the combined administrator account, settings, and notifications experience.

## Main frontend files

- [Dashboard](../../front-end/src/pages/admin/Dashboard.jsx)
- [Users](../../front-end/src/pages/admin/Users.jsx)
- [User details](../../front-end/src/pages/admin/UserDetails.jsx)
- [Courses](../../front-end/src/pages/admin/Courses.jsx)
- [Course approvals](../../front-end/src/pages/admin/CourseApproval.jsx)
- [Course details](../../front-end/src/pages/admin/CourseDetails.jsx)
- [Certificates](../../front-end/src/pages/admin/Certificates.jsx)
- [Payments](../../front-end/src/pages/admin/Payments.jsx)
- [Disputes](../../front-end/src/pages/admin/Disputes.jsx)
- [Settings](../../front-end/src/pages/admin/Settings.jsx)

## Backend integration

Coordinate with platform administration, users, course workflows, certificates, disputes, payments, and settings APIs. User actions must be authorized by the backend; frontend visibility alone does not grant permission.

## Workflow handoffs

Suhaas submits organization courses for admin review. Ruvan manages instructor curriculum drafts. Puneeth owns the student workflow and the super-admin learner and payment pages; Jyothiprasad owns the remaining super-admin pages.
