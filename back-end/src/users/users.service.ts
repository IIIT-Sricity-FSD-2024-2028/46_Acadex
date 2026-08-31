import { Injectable, NotFoundException } from '@nestjs/common';
import { users, enrollments, courses, transactions, activities, instructors, learners } from '../data';

@Injectable()
export class UsersService {
  findAll() {
    return users;
  }

  findOne(id: number) {
    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Related sub-resources
    const userEnrollments = enrollments.filter(e => e.learnerId === id || e.learner === user.name);
    const userCourses = courses.filter(c => c.instructor === user.name || (user.organization && c.organization === user.organization));
    const userTransactions = transactions.filter(t => t.userId === id || t.user === user.name);
    const userActivities = activities.filter(a => a.userId === id);
    const orgInstructors = instructors.filter(i => user.role === 'Organization' && (i.organization === user.name || i.organization === 'Tech Academy' || i.organization === 'Code Masters'));
    const orgLearners = learners.filter(l => user.role === 'Organization');

    return {
      ...user,
      enrollments: userEnrollments.length > 0 ? userEnrollments : [
        {
          id: 1,
          course: 'Introduction to Machine Learning',
          instructor: 'Dr. Sarah Jenkins',
          organization: 'Tech Academy',
          enrolledDate: '2023-09-01',
          progress: 85,
          grade: 'A',
          status: 'Active',
        },
        {
          id: 2,
          course: 'Full-Stack Web Development Bootcamp',
          instructor: 'Robert Brown',
          organization: 'Code Masters',
          enrolledDate: '2023-06-15',
          progress: 100,
          grade: 'A+',
          status: 'Completed',
        },
      ],
      courses: userCourses.length > 0 ? userCourses : courses.slice(0, 3),
      transactions: userTransactions.length > 0 ? userTransactions : transactions.slice(0, 3),
      activities: userActivities.length > 0 ? userActivities : activities.slice(0, 4),
      orgInstructors: orgInstructors.length > 0 ? orgInstructors : instructors.slice(0, 3),
      orgLearners: orgLearners.length > 0 ? orgLearners : learners.slice(0, 3),
    };
  }

  create(userDto: any) {
    const newUser = { id: Date.now(), ...userDto };
    users.push(newUser);
    return newUser;
  }

  update(id: number, userDto: any) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    users[index] = { ...users[index], ...userDto };
    return users[index];
  }

  remove(id: number) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    users.splice(index, 1);
    return { success: true };
  }
}
