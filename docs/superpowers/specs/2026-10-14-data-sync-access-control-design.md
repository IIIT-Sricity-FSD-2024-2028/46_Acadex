# Data Sync, Access Control & Backend-Only Rendering Design

**Date:** 2026-10-14  
**Project:** FSD Learning Platform (NestJS + React)

---

## 1. Goal

Enforce a clean data model where:
- All rendered data originates from backend JSON (no hardcoded frontend values)
- Disputes can only be raised by learners and are visible to admin (and read-only to org)
- Organizations have no Reports or Analytics sections
- Course enrollment requires both an organization and at least one instructor on the course
- User identity flows through `users.json` → linked entities (instructors, learners, organizations)
- Instructor affiliation is org-based (`organizations.json`), not university-based

---

## 2. Architecture

### 2.1 Data Model Relationships

```
users.json
  ├─ role=Instructor → instructors.json (via userId)
  ├─ role=Student    → learners.json    (via userId)
  ├─ role=Organization → organizations.json (via email match or orgId)
  └─ role=Admin      → (admin users in users.json directly)

courses.json
  ├─ organizationId  → organizations.json
  └─ instructors[]   → instructors.json

enrollments.json
  ├─ learnerId       → learners.json
  └─ courseId        → courses.json

disputes.json
  └─ raisedById      → learners.json (ONLY — role=Learner)

quizzes.json         → courseId → courses.json
certificates.json    → learnerId + courseId
```

`universities.json` — retained only as student academic institution reference in `learners.json` (`universityId`). Not used in instructor affiliation or course flow.

`assignments.json` — retained in backend but not exposed in course flow (quizzes replace assignments).

---

## 3. Backend Changes

### 3.1 Disputes — Learner-Only Creation

**File:** `back-end/src/modules/disputes/disputes.service.ts`  
**File:** `back-end/src/modules/disputes/dto/dispute.dto.ts`

- Add `@IsEnum(DisputeRole)` constraint on `raisedByRole` in `CreateDisputeDto` with only `Learner` allowed
- In `DisputesService.create()`: throw `BadRequestException` if `raisedByRole !== 'Learner'`
- Remove `DisputeRole.ORGANIZATION` and `DisputeRole.EDUCATOR` from the enum (or leave enum but reject at service level)

**File:** `back-end/data/disputes.json`  
- Remove DSP-2026-081 (raised by instructor Prof. James Wilson, role="Educator") — violates the learner-only rule

### 3.2 Enrollment Validation — Org + Instructor Required

**File:** `back-end/src/modules/enrollments/enrollments.service.ts`  
- Before creating enrollment, fetch the course
- If `course.organizationId` is null or empty → throw `BadRequestException('Course must belong to an organization')`
- If `course.instructors` is empty or missing → throw `BadRequestException('Course must have at least one instructor')`

### 3.3 Analytics Endpoint — Real Data

**File:** `back-end/src/modules/analytics/`  
- Ensure `/analytics/instructor` returns real aggregated data from `enrollments.json`, `courses.json`, `reviews.json`
- Ensure `/analytics/organization` (if it exists) returns real data — not static values

---

## 4. Frontend Changes

### 4.1 Remove Org Reports, Analytics, Disputes from Sidebar + Routes

**File:** `front-end/src/components/organization/OrgSidebar.jsx`  
- Remove "Reports & Exports" nav item (`/org/reports`)
- Remove "Analytics" nav item (`/org/analytics`)
- Remove "Disputes & Governance" nav item (`/org/disputes`)

**File:** `front-end/src/App.jsx`  
- Remove `OrgReports`, `OrgAnalytics`, `OrgDisputes` imports
- Remove `/org/reports`, `/org/analytics`, `/org/disputes` routes
- Add redirects for those paths → `/org/dashboard`

### 4.2 OrgContext — Remove Hardcoded defaultOrgInfo

**File:** `front-end/src/context/OrgContext.jsx`  
- Remove `defaultOrgInfo` constant with hardcoded values
- On mount, fetch org info from `GET /organization/profile` (or equivalent endpoint)
- Initialize `info` state as `{}` (empty), populate from API response
- Show loading state until API responds; never fall back to hardcoded values

### 4.3 Org Analytics — Replace Hardcoded Chart Data

**File:** `front-end/src/pages/organization/Analytics.jsx`  
- Remove all hardcoded `timeframeData` objects with static chart points, enrollment numbers, revenue figures
- Fetch from `/analytics/organization?timeframe=X` endpoint
- Render loading state while fetching; show empty-state if endpoint returns no data

### 4.4 Disputes — Read-Only for Org (no raise button)

Per the approved design: org admins can see learner-raised disputes in read-only mode.  
**File:** `front-end/src/pages/organization/Disputes.jsx`  
- Remove "Raise Dispute" button and modal
- Remove `raiseDispute` calls
- Keep the list view and detail drawer (read-only)
- Note: this page is removed from sidebar nav (step 4.1) but the route is kept accessible if needed

Actually, since disputes are removed from org sidebar and routes entirely (step 4.1), this page is unreachable. The page file can remain but the route is redirected.

### 4.5 ConnectUniversity — Rename to Connect Organization

**File:** `front-end/src/pages/instructor/onboarding/ConnectUniversity.jsx`  
- Update all "University" labels to "Organization" in the UI text
- The underlying logic already uses instructor-requests API which links to organizations

---

## 5. Data Integrity

- `disputes.json`: Remove instructor-raised dispute (DSP-2026-081)
- Ratings and course names are already in `courses.json`; no frontend overrides needed
- Avatar/photo URLs: already from Unsplash URLs stored in backend JSON; no hardcoded frontend avatars to change beyond the `defaultOrgInfo` logo

---

## 6. Success Criteria

1. No hardcoded org info renders when backend returns data
2. Org sidebar has no Disputes, Reports, or Analytics links
3. POST /disputes with `raisedByRole=Educator` or `raisedByRole=Organization` returns 400
4. POST /enrollments for a course without `organizationId` returns 400
5. Course ratings and names displayed in learner/org/instructor views come from API response
6. Instructor affiliation page shows "Organization" language, not "University"
