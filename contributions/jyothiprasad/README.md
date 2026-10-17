# Jyothiprasad — Public Pages, Authentication and Remaining Super-Admin Pages

## Contribution scope

Landing page, sign-in, sign-up, and all super-admin pages except the learner directory and payment page assigned to Puneeth.

## Public and authentication responsibilities

- Maintain the landing page, responsive layout, and navigation into the platform.
- Provide sign-in and sign-up forms, validation, loading states, and actionable error messages.
- Route authenticated users to their correct actor workspace.
- Display compact demo credentials supplied by the backend for the selected actor.
- Coordinate authentication, session handling, protected routes, and sign-out across actors.

## Super-admin responsibilities

- Maintain the platform overview and backend financial and operational summaries.
- Maintain organization and administrator directories and their permitted account actions.
- Display organization details, instructors, courses, payments, and administrative activity through the appropriate shared views.
- Maintain administrator history and the combined super-admin account, settings, and notifications experience.
- Preserve the permissions separating platform oversight from organization-owned profile details and instructor assignment.

## Main frontend files

- [Landing page](../../front-end/src/pages/Landing.jsx)
- [Sign-in](../../front-end/src/pages/Signin.jsx)
- [Sign-up](../../front-end/src/pages/Signup.jsx)
- [Super-admin login entry](../../front-end/src/pages/super-admin/Login.jsx)
- [Super-admin dashboard](../../front-end/src/pages/super-admin/Dashboard.jsx)
- [Organizations](../../front-end/src/pages/super-admin/Organizations.jsx)
- [Administrators](../../front-end/src/pages/super-admin/Admins.jsx)
- [Super-admin settings](../../front-end/src/pages/super-admin/Settings.jsx)
- [Administrator history](../../front-end/src/components/workspace/AdministratorHistory.jsx)
- [Super-admin layout](../../front-end/src/components/super-admin/SuperAdminLayout.jsx)
- [Application routes](../../front-end/src/App.jsx)

## Backend integration

Coordinate authentication, role authorization, platform summaries, account directories, settings, notifications, and administrator activity APIs. Public forms and dashboards must display backend results and handle failures without fabricating records.

## Workflow handoffs

Puneeth owns super-admin `Learners.jsx` and `Payments.jsx`. Coordinate shared account-directory and administration components with Nishanth, and actor-specific authentication integration with all workflow owners.
