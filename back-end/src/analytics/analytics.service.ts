import { Injectable } from '@nestjs/common';
import { users, courses, transactions, enrollments, activities } from '../data';

@Injectable()
export class AnalyticsService {
  getOverview() {
    return {
      stats: {
        totalUsers: '12,543',
        totalLearners: '11,200',
        totalInstructors: '843',
        totalRevenue: '$45,231',
        organizations: '42',
        courses: '1,204',
        enrollments: '45,231',
        pendingApprovals: '12',
      },
      totalUsersCount: users.length,
      totalCoursesCount: courses.length,
      totalTransactionsCount: transactions.length,
      totalEnrollmentsCount: enrollments.length,
      weeklyActiveUsers: [
        { name: 'Mon', active: 4000 },
        { name: 'Tue', active: 3000 },
        { name: 'Wed', active: 2000 },
        { name: 'Thu', active: 2780 },
        { name: 'Fri', active: 1890 },
        { name: 'Sat', active: 2390 },
        { name: 'Sun', active: 3490 },
      ],
      userGrowth: [
        { name: 'Jan', users: 4000, learners: 2400, instructors: 240 },
        { name: 'Feb', users: 3000, learners: 1398, instructors: 221 },
        { name: 'Mar', users: 2000, learners: 9800, instructors: 229 },
        { name: 'Apr', users: 2780, learners: 3908, instructors: 200 },
        { name: 'May', users: 1890, learners: 4800, instructors: 218 },
        { name: 'Jun', users: 2390, learners: 3800, instructors: 250 },
        { name: 'Jul', users: 3490, learners: 4300, instructors: 210 },
      ],
      revenueData: [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
        { name: 'Jul', revenue: 3490 },
      ],
      categoryData: [
        { name: 'Data Science', value: 400 },
        { name: 'Web Dev', value: 300 },
        { name: 'Business', value: 300 },
        { name: 'Design', value: 200 },
      ],
      pendingApprovals: [
        { type: 'Instructor', name: 'Robert Brown', date: '2023-10-25' },
        { type: 'Organization', name: 'Acme Corp', date: '2023-10-26' },
        { type: 'Course', name: 'Advanced React Patterns', date: '2023-10-20' },
      ],
    };
  }

  getInstructorAnalytics() {
    return {
      stats: {
        totalCourses: 12,
        totalStudents: '4,892',
        averageRating: 4.8,
        completionRate: '68%',
        activeLearners: '1,245',
        totalEnrollments: '4,892',
      },
      dashboardEnrollments: [
        { name: 'Jan', enrollments: 400, active: 240 },
        { name: 'Feb', enrollments: 300, active: 139 },
        { name: 'Mar', enrollments: 200, active: 980 },
        { name: 'Apr', enrollments: 278, active: 390 },
        { name: 'May', enrollments: 189, active: 480 },
        { name: 'Jun', enrollments: 239, active: 380 },
        { name: 'Jul', enrollments: 349, active: 430 },
      ],
      enrollmentTrend: [
        { month: 'Jan', value: 400 },
        { month: 'Feb', value: 300 },
        { month: 'Mar', value: 550 },
        { month: 'Apr', value: 450 },
        { month: 'May', value: 600 },
        { month: 'Jun', value: 800 },
        { month: 'Jul', value: 950 },
      ],
      coursePerformance: [
        { name: 'React Patterns', students: 1245 },
        { name: 'Next.js', students: 840 },
        { name: 'Python Basics', students: 420 },
        { name: 'Data Sci', students: 250 },
      ],
      engagementData: [
        { week: 'W1', hours: 40 },
        { week: 'W2', hours: 65 },
        { week: 'W3', hours: 85 },
        { week: 'W4', hours: 120 },
        { week: 'W5', hours: 90 },
        { week: 'W6', hours: 110 },
      ],
      recentActivity: activities.filter(a => a.userId === 2),
    };
  }
}
