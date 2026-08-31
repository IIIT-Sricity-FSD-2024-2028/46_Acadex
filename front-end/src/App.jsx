import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────────────────────
import { AdminLayout } from './admin/components/admin/AdminLayout';
import { Dashboard as AdminDashboard } from './admin/pages/admin/Dashboard';
import { Users } from './admin/pages/admin/Users';
import { UserDetails } from './admin/pages/admin/UserDetails';
import { Learners } from './admin/pages/admin/Learners';
import { LearnerDetails } from './admin/pages/admin/LearnerDetails';
import { Instructors } from './admin/pages/admin/Instructors';
import { InstructorDetails } from './admin/pages/admin/InstructorDetails';
import { Organizations } from './admin/pages/admin/Organizations';
import { OrganizationDetails } from './admin/pages/admin/OrganizationDetails';
import { OrganizationVerification } from './admin/pages/admin/OrganizationVerification';
import { Courses as AdminCourses } from './admin/pages/admin/Courses';
import { CourseDetails } from './admin/pages/admin/CourseDetails';
import { CourseApproval } from './admin/pages/admin/CourseApproval';
import { Enrollments } from './admin/pages/admin/Enrollments';
import { Payments } from './admin/pages/admin/Payments';
import { Transactions } from './admin/pages/admin/Transactions';
import { Refunds } from './admin/pages/admin/Refunds';
import { Certificates } from './admin/pages/admin/Certificates';
import { Disputes as AdminDisputes } from './admin/pages/admin/Disputes';
import { Analytics as AdminAnalytics } from './admin/pages/admin/Analytics';
import { Profile as AdminProfile } from './admin/pages/admin/Profile';
import { Settings as AdminSettings } from './admin/pages/admin/Settings';

// ──────────────────────────────────────────────────────────────
// INSTRUCTOR
// ──────────────────────────────────────────────────────────────
import { AuthLayout } from './instructor/layouts/AuthLayout';
import { InstructorLayout } from './instructor/layouts/InstructorLayout';

// Auth Pages
import { Login } from './instructor/pages/auth/Login';
import { Register } from './instructor/pages/auth/Register';

// Instructor Pages
import { Dashboard as InstructorDashboard } from './instructor/pages/instructor/Dashboard';
import { Profile as InstructorProfile } from './instructor/pages/instructor/Profile';

// Course Pages
import { MyCourses } from './instructor/pages/courses/MyCourses';
import { CreateCourse } from './instructor/pages/courses/CreateCourse';
import { EditCourse } from './instructor/pages/courses/EditCourse';
import { CourseContent } from './instructor/pages/courses/CourseContent';
import { CreateModule } from './instructor/pages/courses/CreateModule';
import { CreateLesson } from './instructor/pages/courses/CreateLesson';
import { CreateQuiz } from './instructor/pages/courses/CreateQuiz';

// Student Pages
import { Students } from './instructor/pages/students/Students';
import { StudentProgress } from './instructor/pages/students/StudentProgress';

// Insights Pages
import { Reviews } from './instructor/pages/insights/Reviews';
import { Analytics as InstructorAnalytics } from './instructor/pages/insights/Analytics';
import { Notifications as InstructorNotifications } from './instructor/pages/insights/Notifications';
import { Settings as InstructorSettings } from './instructor/pages/insights/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root → redirect to role selector */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ── ADMIN ROUTES ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetails />} />

          <Route path="learners" element={<Learners />} />
          <Route path="learners/:learnerId" element={<LearnerDetails />} />

          <Route path="instructors" element={<Instructors />} />
          <Route path="instructors/:instructorId" element={<InstructorDetails />} />

          <Route path="organizations" element={<Organizations />} />
          <Route path="organizations/:organizationId" element={<OrganizationDetails />} />
          <Route path="organizations/verification" element={<OrganizationVerification />} />

          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="courses/approval" element={<CourseApproval />} />

          <Route path="enrollments" element={<Enrollments />} />
          <Route path="disputes" element={<AdminDisputes />} />

          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="refunds" element={<Refunds />} />

          <Route path="certificates" element={<Certificates />} />
          <Route path="analytics" element={<AdminAnalytics />} />

          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ── INSTRUCTOR AUTH ROUTES ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ── INSTRUCTOR ROUTES ── */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="profile" element={<InstructorProfile />} />

          {/* Courses */}
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="courses/:id/content" element={<CourseContent />} />
          <Route path="courses/module/create" element={<CreateModule />} />
          <Route path="courses/module/:id/edit" element={<CreateModule />} />
          <Route path="courses/lesson/create" element={<CreateLesson />} />
          <Route path="courses/lesson/:id/edit" element={<CreateLesson />} />
          <Route path="courses/quiz/create" element={<CreateQuiz />} />
          <Route path="courses/quiz/:id/edit" element={<CreateQuiz />} />

          {/* Students */}
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProgress />} />

          {/* Insights & Settings */}
          <Route path="reviews" element={<Reviews />} />
          <Route path="analytics" element={<InstructorAnalytics />} />
          <Route path="notifications" element={<InstructorNotifications />} />
          <Route path="settings" element={<InstructorSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
