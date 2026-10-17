# Puneeth — Student Workflow and Super-Admin Learners & Payments

## Contribution scope

The complete student workflow, plus the super-admin learner directory and `Payments.jsx` page.

## Student workflow responsibilities

- Display enrolled courses, course progress, and dashboard information from backend records.
- Provide course browsing, search, course details, checkout, and enrollment.
- Support lesson playback, recorded engagement, quizzes, and completion tracking.
- Display certificates, billing records, payment receipts, and payment results.
- Allow eligible enrolled learners to submit and maintain course reviews.
- Provide categorized dispute submission and dispute history.
- Maintain the combined student profile, settings, and notifications experience.

## Super-admin responsibilities

- Maintain the learner directory, filtering, learner details, and authorized account actions.
- Maintain payment records and the ledger view, preserving learner-to-platform and platform-to-organization records.
- Render monetary values with their backend currency, using rupees for INR records.
- Keep financial records read-only; do not add payment edit or delete actions.

## Main frontend files

- [Student pages](../../front-end/src/pages/student/)
- [Student dashboard](../../front-end/src/pages/student/Dashboard.jsx)
- [Course browser](../../front-end/src/pages/student/ExploreCourses.jsx)
- [Learning player](../../front-end/src/pages/student/LearningPlayer.jsx)
- [Billing](../../front-end/src/pages/student/Billing.jsx)
- [Student reviews](../../front-end/src/pages/student/Reviews.jsx)
- [Super-admin learners](../../front-end/src/pages/super-admin/Learners.jsx)
- [Super-admin payments](../../front-end/src/pages/super-admin/Payments.jsx)
- [Shared account directory](../../front-end/src/components/workspace/AccountDirectory.jsx)
- [Shared payment ledger](../../front-end/src/components/admin/PaymentLedger.jsx)

## Backend integration

Coordinate student, enrollment, learning activity, quiz, certificate, review, dispute, and payment APIs. Enrollment eligibility and review permissions must be checked by the backend. Dashboard, course, and billing views must reflect the same underlying records.

## Workflow handoffs

Jyothiprasad owns all other super-admin pages and public authentication pages. Shared directory and ledger changes should be coordinated with Nishanth because admin pages reuse those components.
