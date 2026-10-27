# Acadex

Online learning requires coordination between students, instructors, educational organizations, and platform administrators. Managing course content, enrollments, assessments, payments, and learner progress across separate systems makes it difficult to maintain consistent records, oversee course quality, and resolve issues.

The project aims to provide a unified EdTech platform with dedicated workspaces for each actor. It will support the learning journey from course discovery and enrollment to assessment and certification, while enabling organizations to manage teaching activities and administrators to oversee platform operations.

## Identified Actors

| Actor | Responsibility |
| --- | --- |
| Student / Learner | Enroll in courses, complete learning activities, and track progress and achievements. |
| Instructor / Educator | Develop learning content for assigned courses and monitor learner performance. |
| Organization | Manage institutional courses, instructors, learners, and enrollments. |
| Administrator | Oversee users, course approvals, certificates, payments, and disputes. |

## Planned Features for Each Actor

### Student / Learner

- Register, sign in, recover account access, and manage a personal profile.
- Browse and search courses, view course details, and enroll in free or paid courses.
- Access lessons and learning materials, complete quizzes, and track course progress.
- View and download completion certificates with verifiable credentials.
- Submit course ratings and reviews.
- View billing history, payment details, and receipts.
- Raise support requests or disputes and track their resolution.
- Receive notifications about learning and account activity.

### Instructor / Educator

- Manage an instructor profile and respond to organization invitations or teaching requests.
- Access assigned courses and develop modules, lessons, and quizzes.
- Submit curriculum changes for organization approval.
- View enrolled learners and monitor their progress and assessment results.
- Review learner feedback and respond to course reviews.
- View teaching analytics and receive course and account notifications.

### Organization

- Manage the organization profile and account settings.
- Create and edit courses, assign instructors, and submit courses for platform approval.
- Review instructor curriculum submissions and manage course archives.
- Invite instructors, review join requests, and manage teaching assignments.
- Manage learners, assign courses, and monitor enrollments and completion.
- View institutional analytics, course performance, and revenue reports.
- Raise and track disputes and receive operational notifications.

### Administrator

- View platform activity and operational metrics through a dashboard.
- Manage user accounts and review account details and status.
- Review course submissions, approve or reject publication, and manage course records.
- Monitor certificates and learner achievements.
- Review payments, transactions, and refunds, and export payment records.
- Investigate disputes and update their resolution status.
- Manage a personal profile, account settings, and notifications.

## Getting Started

### Prerequisites

- Git installed on your computer.
- Node.js 22 and npm installed and available in your terminal.

Check that the tools are available:

```sh
git --version
node --version
npm --version
```

### 1. Clone the repository

```sh
git clone https://github.com/IIIT-Sricity-FSD-2024-2028/46_Edtech.git
cd 46_Edtech
```

The application uses the `front-end/` directory for React and Vite, and `back-end/` for the NestJS API. Run the commands below from the repository root, where the main `package.json` is located.

### 2. Install dependencies

```sh
npm ci --prefix back-end
npm ci --prefix front-end
```

Dependencies must be installed in both directories; installing only at the repository root does not install them.

### 3. Configure the backend (optional)

The backend can start with its built-in defaults. To configure it explicitly, create a file named `.env` inside `back-end/` with the following content:

```dotenv
NODE_ENV=development
PORT=3000
API_PREFIX=api
SWAGGER_PATH=api/docs
CORS_ORIGIN=http://localhost:5173
DATA_DIR=./data
DATA_STORAGE_MODE=memory
```

No separate database server or manual migration is required. The backend loads seed data automatically. In `memory` mode, changes reset when the backend restarts. To retain changes in local JSON files under `back-end/data/`, set `DATA_STORAGE_MODE=file` before starting the backend.

### 4. Start the backend

In a terminal at the repository root, run:

```sh
npm run backend:dev
```

Keep this terminal running. The API starts at `http://localhost:3000/api`, and the Swagger API documentation is available at `http://localhost:3000/api/docs`.

### 5. Start the frontend

Open a second terminal at the repository root and run:

```sh
npm run frontend:dev
```

Open `http://localhost:5173` in your browser. Keep both terminals running while using the application. Vite forwards `/api` and `/uploads` requests to the backend on port `3000`.

Use the two commands above to start the project: the root `npm run dev` command currently references a missing `scripts/dev.mjs` file.

Press `Ctrl+C` in each terminal to stop the servers.

### Build the project

To compile both the backend and frontend, run this from the repository root after installing dependencies:

```sh
npm run build
```

Build output is written to `back-end/dist/` and `front-end/dist/`.
