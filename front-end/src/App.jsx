import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────
// 0. LANDING & GATEWAY
// ──────────────────────────────────────────────────────────────
import Landing from './pages/Landing';
import VerifyCertificate from './pages/VerifyCertificate';
import UnavailablePage from './pages/UnavailablePage';
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import ForgotPassword from './pages/Forgot_Password';

// ──────────────────────────────────────────────────────────────
// 1. STUDENT / LEARNER PAGES
// ──────────────────────────────────────────────────────────────
import StudentDashboard from './pages/student/Dashboard';
import StudentExplore from './pages/student/ExploreCourses';
import StudentCourseDetails from './pages/student/CourseDetails';
import StudentCheckout from './pages/student/Checkout';
import StudentPaymentSuccess from './pages/student/PaymentSuccess';
import StudentMyLearning from './pages/student/MyLearning';
import StudentLearningPlayer from './pages/student/LearningPlayer';
import StudentQuiz from './pages/student/Quiz';
import StudentCertificates from './pages/student/Certificates';
import StudentProfile from './pages/student/Profile';
import StudentBilling from './pages/student/Billing';
import StudentReviews from './pages/student/Reviews';
import StudentDisputes from './pages/student/Disputes';
import StudentRouteMiddleware from './components/student/layout/StudentRouteMiddleware';
import RoleGuard from './components/auth/RoleGuard';

// ──────────────────────────────────────────────────────────────
// 2. INSTRUCTOR / EDUCATOR PAGES & LAYOUTS
// ──────────────────────────────────────────────────────────────
import { InstructorLayout } from './components/instructor/layouts/InstructorLayout';
import { InstructorProvider } from './context/InstructorContext';
import { Dashboard as InstructorDashboard } from './pages/instructor/instructor/Dashboard';
import { Profile as InstructorProfile } from './pages/instructor/instructor/Profile';
import { MyCourses } from './pages/instructor/courses/MyCourses';
import { CourseContent as InstructorCourseContent } from './pages/instructor/courses/CourseContent';

function InstructorEditCourseRedirect() {
  const { id } = useParams();
  return <Navigate to={`/instructor/courses/${id}/content`} replace />;
}

import { CreateModule } from './pages/instructor/courses/CreateModule';
import { CreateLesson } from './pages/instructor/courses/CreateLesson';
import { CreateQuiz as InstructorCreateQuiz } from './pages/instructor/courses/CreateQuiz';
import { Students as InstructorStudents } from './pages/instructor/students/Students';
import { StudentProgress } from './pages/instructor/students/StudentProgress';
import { Reviews as InstructorReviews } from './pages/instructor/insights/Reviews';
import { Analytics as InstructorAnalytics } from './pages/instructor/insights/Analytics';
import { Notifications as InstructorNotifications } from './pages/instructor/insights/Notifications';
import { Settings as InstructorSettings } from './pages/instructor/insights/Settings';

// ──────────────────────────────────────────────────────────────
// 3. ORGANIZATION ADMIN PAGES
// ──────────────────────────────────────────────────────────────
import OrgLayout from './components/organization/OrgLayout';
import OrgDashboard from './pages/organization/Dashboard';
import OrgProfile from './pages/organization/Profile';
import OrgInstructorRequests from './pages/organization/InstructorRequests';
import OrgInstructorRequestDetails from './pages/organization/InstructorRequestDetails';
import OrgInstructors from './pages/organization/Instructors';
import OrgInstructorDetails from './pages/organization/InstructorDetails';
import OrgLearners from './pages/organization/Learners';
import OrgLearnerDetails from './pages/organization/LearnerDetails';
import OrgCourses from './pages/organization/Courses';
import OrgCourseDetails from './pages/organization/CourseDetails';
import OrgCreateCourse from './pages/organization/CreateCourse';
import OrgEditCourse from './pages/organization/EditCourse';
import OrgAssignCourses from './pages/organization/AssignCourses';
import OrgDisputes from './pages/organization/Disputes';
import OrgAnalytics from './pages/organization/Analytics';

// ──────────────────────────────────────────────────────────────
// 4. PLATFORM ADMIN PAGES & LAYOUT
// ──────────────────────────────────────────────────────────────
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Users as AdminUsers } from './pages/admin/Users';
import { UserDetails as AdminUserDetails } from './pages/admin/UserDetails';
import { Courses as AdminCourses } from './pages/admin/Courses';
import { CourseDetails as AdminCourseDetails } from './pages/admin/CourseDetails';
import { CourseApproval as AdminCourseApproval } from './pages/admin/CourseApproval';
import { Payments as AdminPayments } from './pages/admin/Payments';
import { Transactions as AdminTransactions } from './pages/admin/Transactions';
import { Certificates as AdminCertificates } from './pages/admin/Certificates';
import { Disputes as AdminDisputes } from './pages/admin/Disputes';
import { Profile as AdminProfile } from './pages/admin/Profile';
import { Settings as AdminSettings } from './pages/admin/Settings';

// ──────────────────────────────────────────────────────────────
// 5. SUPER ADMIN PLATFORM GOVERNANCE PAGES & LAYOUT
// ──────────────────────────────────────────────────────────────
import { SuperAdminLayout } from './components/super-admin/SuperAdminLayout';
import { SuperAdminGuard } from './components/super-admin/SuperAdminGuard';
import SuperAdminLogin from './pages/super-admin/Login';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminPayments from './pages/super-admin/Payments';
import SuperAdminAdmins from './pages/super-admin/Admins';
import SuperAdminOrganizations from './pages/super-admin/Organizations';
import SuperAdminLearners from './pages/super-admin/Learners';
import SuperAdminSettings from './pages/super-admin/Settings';

function LegacyAdminUserRedirect() {
  const { learnerId, organizationId } = useParams();
  return <Navigate to={`/admin/users/${learnerId || organizationId}`} replace />;
}

function LegacyLearnRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/student/learn/${courseId}`} replace />;
}

function LegacyCourseRedirect() {
  const { id } = useParams();
  return <Navigate to={`/student/course/${id}`} replace />;
}

function LegacyPlayerRedirect() {
  const location = useLocation();
  const courseId = location.state?.courseId;
  return (
    <Navigate
      to={courseId ? `/student/learn/${courseId}` : '/student/my-learning'}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 0. CENTRAL LANDING GATEWAY & SUPER ADMIN (LEVEL 1) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />

      {/* ── Super Admin: public login + protected portal ──────────── */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      <Route
        path="/super-admin"
        element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="payments" element={<SuperAdminPayments />} />
        <Route path="admins" element={<SuperAdminAdmins />} />
        <Route path="organizations" element={<SuperAdminOrganizations />} />
        <Route path="learners" element={<SuperAdminLearners />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      <Route
        path="/organization"
        element={<Navigate to="/org/dashboard" replace />}
      />
      <Route
        path="/organization/landing"
        element={<Navigate to="/signin?role=Organization" replace />}
      />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify/:credentialId" element={<VerifyCertificate />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<UnavailablePage />} />
      <Route path="/privacy" element={<UnavailablePage />} />
      <Route path="/honor-code" element={<UnavailablePage />} />

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. STUDENT / LEARNER ROUTES (Protected by Route Middleware) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={
          <RoleGuard allowedRoles={['Student']} loginRole="Student" />
        }
      >
        <Route element={<StudentRouteMiddleware />}>
          <Route
            path="/student"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/explore" element={<StudentExplore />} />
          <Route path="/student/course/:id" element={<StudentCourseDetails />} />
          <Route path="/student/checkout" element={<StudentCheckout />} />
          <Route
            path="/student/payment-success"
            element={<StudentPaymentSuccess />}
          />
          <Route path="/student/my-learning" element={<StudentMyLearning />} />
          <Route
            path="/student/learn/:courseId"
            element={<StudentLearningPlayer />}
          />
          <Route path="/student/quiz" element={<StudentQuiz />} />
          <Route
            path="/student/certificates"
            element={<StudentCertificates />}
          />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/billing" element={<StudentBilling />} />
          <Route path="/student/reviews" element={<StudentReviews />} />
          <Route path="/student/disputes" element={<StudentDisputes />} />

          {/* Legacy URLs */}
          <Route
            path="/student/course-progress/:courseId"
            element={<LegacyLearnRedirect />}
          />
          <Route
            path="/student/player"
            element={<LegacyPlayerRedirect />}
          />
          <Route
            path="/explore"
            element={<Navigate to="/student/explore" replace />}
          />
          <Route
            path="/my-learning"
            element={<Navigate to="/student/my-learning" replace />}
          />
          <Route
            path="/certificates"
            element={<Navigate to="/student/certificates" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/student/profile" replace />}
          />
          <Route
            path="/reviews"
            element={<Navigate to="/student/reviews" replace />}
          />
          <Route
            path="/disputes"
            element={<Navigate to="/student/disputes" replace />}
          />
          <Route path="/course/:id" element={<LegacyCourseRedirect />} />

          {/* Student Catch-All 404 Route Redirect */}
          <Route
            path="/student/*"
            element={<Navigate to="/student/dashboard" replace />}
          />
        </Route>
      </Route>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. INSTRUCTOR / EDUCATOR ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        path="/instructor/login"
        element={<Navigate to="/signin?role=Instructor" replace />}
      />
      <Route
        path="/instructor/register"
        element={<Navigate to="/signup?role=Instructor" replace />}
      />

      <Route
        element={
          <RoleGuard allowedRoles={['Instructor']} loginRole="Instructor" />
        }
      >
        <Route
          path="/instructor"
          element={
            <InstructorProvider>
              <InstructorLayout />
            </InstructorProvider>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="profile" element={<InstructorProfile />} />

          {/* Courses */}
          <Route path="courses" element={<MyCourses />} />
          <Route
            path="courses/:id/edit"
            element={<InstructorEditCourseRedirect />}
          />
          <Route
            path="courses/:id/content"
            element={<InstructorCourseContent />}
          />
          <Route path="courses/module/create" element={<CreateModule />} />
          <Route path="courses/module/:id/edit" element={<CreateModule />} />
          <Route path="courses/lesson/create" element={<CreateLesson />} />
          <Route path="courses/lesson/:id/edit" element={<CreateLesson />} />
          <Route path="courses/quiz/create" element={<InstructorCreateQuiz />} />
          <Route
            path="courses/quiz/:id/edit"
            element={<InstructorCreateQuiz />}
          />

          {/* Students */}
          <Route path="students" element={<InstructorStudents />} />
          <Route path="students/:id" element={<StudentProgress />} />

          {/* Insights & Settings */}
          <Route path="reviews" element={<InstructorReviews />} />
          <Route path="analytics" element={<InstructorAnalytics />} />
          <Route path="notifications" element={<InstructorNotifications />} />
          <Route path="settings" element={<InstructorSettings />} />
        </Route>
      </Route>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. ORGANIZATION ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={
          <RoleGuard
            allowedRoles={['Organization']}
            loginRole="Organization"
          />
        }
      >
        <Route path="/org" element={<OrgDashboard />} />
        <Route path="/org/dashboard" element={<OrgDashboard />} />
        <Route path="/organization/dashboard" element={<OrgDashboard />} />

        <Route path="/org/profile" element={<OrgProfile />} />
        <Route path="/organization/profile" element={<OrgProfile />} />

        <Route
          path="/org/instructor-requests"
          element={<OrgInstructorRequests />}
        />
        <Route
          path="/org/instructor-requests/:id"
          element={<OrgInstructorRequestDetails />}
        />
        <Route
          path="/organization/instructor-requests"
          element={<OrgInstructorRequests />}
        />
        <Route
          path="/organization/instructor-requests/:id"
          element={<OrgInstructorRequestDetails />}
        />

        <Route path="/org/instructors" element={<OrgInstructors />} />
        <Route
          path="/org/instructors/:id"
          element={<OrgInstructorDetails />}
        />
        <Route path="/organization/instructors" element={<OrgInstructors />} />
        <Route
          path="/organization/instructors/:id"
          element={<OrgInstructorDetails />}
        />

        <Route path="/org/learners" element={<OrgLearners />} />
        <Route path="/org/learners/:id" element={<OrgLearnerDetails />} />
        <Route path="/organization/learners" element={<OrgLearners />} />
        <Route
          path="/organization/learners/:id"
          element={<OrgLearnerDetails />}
        />

        <Route path="/org/courses" element={<OrgCourses />} />
        <Route path="/org/courses/create" element={<OrgCreateCourse />} />
        <Route path="/org/courses/assign" element={<OrgAssignCourses />} />
        <Route path="/org/assign-courses" element={<OrgAssignCourses />} />
        <Route path="/org/courses/:id" element={<OrgCourseDetails />} />
        <Route path="/org/courses/:id/edit" element={<OrgEditCourse />} />

        <Route path="/organization/courses" element={<OrgCourses />} />
        <Route
          path="/organization/courses/create"
          element={<OrgCreateCourse />}
        />
        <Route
          path="/organization/courses/assign"
          element={<OrgAssignCourses />}
        />
        <Route
          path="/organization/assign-courses"
          element={<OrgAssignCourses />}
        />
        <Route
          path="/organization/courses/:id"
          element={<OrgCourseDetails />}
        />
        <Route
          path="/organization/courses/:id/edit"
          element={<OrgEditCourse />}
        />

        <Route path="/org/disputes" element={<OrgDisputes />} />
        <Route path="/org/raise-dispute" element={<OrgDisputes />} />
        <Route path="/organization/disputes" element={<OrgDisputes />} />
        <Route
          path="/organization/raise-dispute"
          element={<OrgDisputes />}
        />

        <Route
          path="/org/reports"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/org/settings"
          element={<Navigate to="/org/profile" replace />}
        />
        <Route
          path="/organization/reports"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/org/analytics"
          element={<OrgLayout><OrgAnalytics /></OrgLayout>}
        />
        <Route
          path="/organization/analytics"
          element={<OrgLayout><OrgAnalytics /></OrgLayout>}
        />
        <Route
          path="/organization/settings"
          element={<Navigate to="/org/profile" replace />}
        />
      </Route> {/* FIX: closes the Organization RoleGuard route */}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. PLATFORM ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={<RoleGuard allowedRoles={['Admin']} loginRole="Admin" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetails />} />

          {/* Consolidated into Users directory */}
          <Route path="learners" element={<Navigate to="/admin/users?role=Learner" replace />} />
          <Route path="learners/:learnerId" element={<LegacyAdminUserRedirect />} />
          <Route path="instructors" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="instructors/:instructorId" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="organizations" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="organizations/:organizationId" element={<LegacyAdminUserRedirect />} />
          <Route path="organizations/verification" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="enrollments" element={<Navigate to="/admin/users?role=Learner" replace />} />

          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId" element={<AdminCourseDetails />} />
          <Route path="courses/approval" element={<AdminCourseApproval />} />

          <Route path="disputes" element={<AdminDisputes />} />

          <Route path="payments" element={<AdminPayments />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="refunds" element={<Navigate to="/admin/payments" replace />} />

          <Route path="certificates" element={<AdminCertificates />} />
          
          {/* Analytics & Reports consolidated in Dashboard */}
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Notifications merged into Settings */}
          <Route path="notifications" element={<Navigate to="/admin/settings?tab=notifications" replace />} />

          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<UnavailablePage />} />
    </Routes>
  );
}