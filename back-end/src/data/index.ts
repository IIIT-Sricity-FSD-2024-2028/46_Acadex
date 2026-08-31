export const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Learner', status: 'Active', verificationStatus: 'Verified', institution: 'MIT', studentId: 'MIT-12345', degree: 'Computer Science', graduationYear: 2025, createdAt: '2023-01-15', lastLogin: '2023-10-24' },
  { id: 2, name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@university.edu', role: 'Instructor', status: 'Active', verificationStatus: 'Verified', expertise: 'Computer Science & Full-stack', qualification: 'Ph.D. Computer Science, Stanford University', organization: 'University of Tech', coursesCount: 12, createdAt: '2023-01-12', lastLogin: '2023-10-25' },
  { id: 3, name: 'Acme Corp', email: 'admin@acme.com', role: 'Organization', status: 'Pending', verificationStatus: 'Pending', domain: 'acme.com', type: 'Corporate', instructorsCount: 10, learnersCount: 500, coursesCount: 20, createdAt: '2023-10-01', lastLogin: '2023-10-15' },
  { id: 4, name: 'Sarah Connor', email: 'sarah@example.com', role: 'Learner', status: 'Active', verificationStatus: 'Verified', institution: 'Caltech', studentId: 'CT-55678', degree: 'Electrical Engineering', graduationYear: 2025, createdAt: '2023-02-01', lastLogin: '2023-10-18' },
  { id: 5, name: 'Alice Johnson', email: 'alice@example.com', role: 'Learner', status: 'Active', verificationStatus: 'Pending', institution: 'Stanford', studentId: 'ST-98765', degree: 'Data Science', graduationYear: 2024, createdAt: '2023-03-10', lastLogin: '2023-10-20' },
  { id: 6, name: 'Robert Brown', email: 'robert@example.com', role: 'Instructor', status: 'Active', verificationStatus: 'Pending', expertise: 'Web Development', qualification: 'Senior Frontend Engineer', organization: 'Code Masters', coursesCount: 2, createdAt: '2023-04-12', lastLogin: '2023-10-22' },
  { id: 7, name: 'Tech University', email: 'info@tech.edu', role: 'Organization', status: 'Active', verificationStatus: 'Verified', domain: 'tech.edu', type: 'University', instructorsCount: 50, learnersCount: 2000, coursesCount: 150, createdAt: '2023-05-18', lastLogin: '2023-10-21' },
  { id: 8, name: 'David Wilson', email: 'david.w@example.com', role: 'Learner', status: 'Suspended', verificationStatus: 'Pending', institution: 'Harvard University', studentId: 'HU-44321', degree: 'Economics', graduationYear: 2026, createdAt: '2023-06-05', lastLogin: '2023-09-18' },
  { id: 9, name: 'Dr. Emily Watson', email: 'emily.watson@example.com', role: 'Instructor', status: 'Active', verificationStatus: 'Verified', expertise: 'Cloud Computing & DevOps', qualification: 'Master of Cloud Systems', organization: 'Cloud Masters Org', coursesCount: 8, createdAt: '2023-01-28', lastLogin: '2023-10-26' },
  { id: 10, name: 'Global Tech Institute', email: 'partners@globaltech.org', role: 'Organization', status: 'Active', verificationStatus: 'Verified', domain: 'globaltech.org', type: 'Institute', instructorsCount: 25, learnersCount: 1200, coursesCount: 45, createdAt: '2023-02-14', lastLogin: '2023-10-23' },
  { id: 11, name: 'Admin User', email: 'admin@platform.com', role: 'Admin', status: 'Active', verificationStatus: 'Verified', expertise: 'System Administration', qualification: 'Platform Super Admin', organization: 'Coursera Platform', coursesCount: 0, createdAt: '2023-01-01', lastLogin: 'Just now' },
];

export const instructors = [
  { id: '1', userId: 2, name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@university.edu', expertise: 'Computer Science & Full-stack', qualification: 'Ph.D. Computer Science, Stanford University', organization: 'University of Tech', verificationStatus: 'Verified', status: 'Active', courses: 12, phone: '+1 (555) 123-4567', location: 'San Francisco, CA', website: 'https://sarahjenkins.dev', bio: 'Dr. Sarah Jenkins has over 15 years of experience in software engineering and education. She specializes in full-stack web development and has taught thousands of students worldwide.', orgDepartment: 'Department of Computer Science & Engineering', orgRole: 'Admin & Lead Faculty', orgWorkEmail: 's.jenkins@univ.edu', orgWebsite: 'https://univ.edu', orgJoined: 'Jan 12, 2023' },
  { id: '2', userId: 6, name: 'Robert Brown', email: 'robert@example.com', expertise: 'Web Development', qualification: 'Senior Frontend Engineer', organization: 'Code Masters', verificationStatus: 'Pending', status: 'Active', courses: 2 },
  { id: '3', userId: 9, name: 'Dr. Emily Watson', email: 'emily.watson@example.com', expertise: 'Cloud Computing & DevOps', qualification: 'Master of Cloud Systems', organization: 'Cloud Masters Org', verificationStatus: 'Verified', status: 'Active', courses: 8 },
  { id: '4', userId: 11, name: 'Prof. Michael Chen', email: 'michael.chen@example.com', expertise: 'Cybersecurity', qualification: 'Ph.D. in Information Security', organization: 'Tech University', verificationStatus: 'Verified', status: 'Active', courses: 6 },
  { id: '5', userId: 12, name: 'Anita Patel', email: 'anita.patel@example.com', expertise: 'UX/UI Design', qualification: 'Certified Design Lead', organization: 'Global Tech Institute', verificationStatus: 'Pending', status: 'Active', courses: 3 },
];

export const courses = [
  {
    id: '1',
    title: 'Advanced React Patterns & Architecture',
    subtitle: 'Master modern React development by building scalable, maintainable enterprise applications.',
    description: 'In this comprehensive course, you will learn the most advanced design patterns in the React ecosystem. We dive deep into compound components, render props, custom hooks architecture, performance optimization, state machines, and micro-frontends.',
    instructor: 'Dr. Sarah Jenkins',
    instructorId: '1',
    organization: 'University of Tech',
    category: 'Computer Science',
    level: 'Advanced',
    price: 79.99,
    students: 1245,
    rating: 4.9,
    status: 'Published',
    visibility: true,
    certificate: true,
    updated: '2 days ago',
    timestamp: 1716300000000,
    createdDate: '2023-05-10',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    objectives: [
      'Build scalable React applications using advanced design patterns',
      'Implement custom hooks and compound component patterns',
      'Optimize rendering cycles and manage complex application state',
      'Architect robust enterprise front-ends with micro-frontend concepts'
    ],
    prerequisites: 'Solid foundation in modern JavaScript (ES6+) and core React fundamentals (Hooks, Props, State).',
    modules: [
      {
        id: 1,
        title: 'Introduction to React Patterns & Component Architecture',
        description: 'Learn the fundamentals of advanced component patterns in React and understand when to choose appropriate architectural styles.',
        objectives: ['Understand compound components and state reducers', 'Create flexible, reusable UI components'],
        items: [
          { id: 101, type: 'Video', title: 'Course Overview & Architectural Goals', duration: 8, fileName: '01_intro_architecture.mp4', fileSize: '32.4 MB', url: '' },
          { id: 102, type: 'Video', title: 'Compound Components Deep Dive', duration: 15, fileName: '02_compound_components.mp4', fileSize: '64.1 MB', url: '' },
          { id: 103, type: 'Reading', title: 'Component Composition vs Inheritance', duration: 10, fileName: 'reading_composition.pdf', fileSize: '1.4 MB', url: '' },
          { id: 104, type: 'Video', title: 'State Reducer & Control Props Pattern', duration: 18, fileName: '04_state_reducers.mp4', fileSize: '78.2 MB', url: '' },
          { id: 105, type: 'Quiz', title: 'Quiz: Core Component Patterns', duration: 15, fileName: '', fileSize: '', url: '' },
        ],
      },
      {
        id: 2,
        title: 'Custom Hooks & State Optimization',
        description: 'Master custom hook composition, useSyncExternalStore, and minimizing unnecessary re-renders in large applications.',
        objectives: ['Extract and share complex stateful logic', 'Optimize component render performance'],
        items: [
          { id: 201, type: 'Video', title: 'Advanced Hook Encapsulation', duration: 14, fileName: '05_hooks_encapsulation.mp4', fileSize: '52.0 MB', url: '' },
          { id: 202, type: 'Reading', title: 'Memory Management & Memoization in React 19', duration: 12, fileName: 'react19_memoization.pdf', fileSize: '2.1 MB', url: '' },
          { id: 203, type: 'Quiz', title: 'Quiz: Performance & Hooks', duration: 20, fileName: '', fileSize: '', url: '' },
        ],
      },
    ]
  },
  {
    id: '2',
    title: 'Full-stack Next.js 14 Masterclass',
    subtitle: 'Build production-ready fullstack applications with Server Components, App Router, and Server Actions.',
    description: 'Learn full-stack web development with Next.js 14, React Server Components, streaming SSR, PostgreSQL database integrations with Drizzle/Prisma, authentication with NextAuth, and enterprise deployments.',
    instructor: 'Dr. Sarah Jenkins',
    instructorId: '1',
    organization: 'University of Tech',
    category: 'Web Development',
    level: 'Intermediate',
    price: 89.99,
    students: 840,
    rating: 4.8,
    status: 'Published',
    visibility: true,
    certificate: true,
    updated: '1 week ago',
    timestamp: 1715800000000,
    createdDate: '2023-06-15',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
    objectives: [
      'Master the App Router and Server Components',
      'Implement secure Server Actions and Data Mutation',
      'Integrate production SQL databases and caching',
      'Deploy fullstack applications with optimal performance'
    ],
    prerequisites: 'Basic familiarity with React and TypeScript.',
    modules: [
      {
        id: 1,
        title: 'App Router Fundamentals',
        description: 'Understand the architecture of Next.js 14 App Router and streaming rendering.',
        objectives: ['Configure layout and route groups', 'Work with Server and Client components'],
        items: [
          { id: 101, type: 'Video', title: 'Next.js 14 App Router Overview', duration: 12, fileName: '01_nextjs_intro.mp4', fileSize: '45.0 MB', url: '' },
          { id: 102, type: 'Reading', title: 'Server Components Mental Model', duration: 8, fileName: 'rsc_mental_model.pdf', fileSize: '1.2 MB', url: '' },
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Python for Data Science Bootcamp',
    subtitle: 'From data analysis basics to machine learning models using NumPy, Pandas, and Scikit-Learn.',
    description: 'Master practical Python for data analysis, statistical modeling, data visualization with Matplotlib and Seaborn, and machine learning fundamentals.',
    instructor: 'Dr. Sarah Jenkins',
    instructorId: '1',
    organization: 'University of Tech',
    category: 'Data Science',
    level: 'Beginner',
    price: 49.99,
    students: 420,
    rating: 4.7,
    status: 'Draft',
    visibility: false,
    certificate: true,
    updated: '3 hours ago',
    timestamp: 1716400000000,
    createdDate: '2023-10-25',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    objectives: [
      'Write clean, idiomatic Python code',
      'Perform data manipulation with Pandas & NumPy',
      'Create impactful statistical visualisations',
      'Build baseline machine learning models'
    ],
    prerequisites: 'No prior programming experience required.',
    modules: []
  },
  {
    id: '4',
    title: 'Cloud Architecture Masterclass',
    subtitle: 'Design resilient and highly scalable multi-cloud infrastructure.',
    description: 'Deep dive into AWS, GCP, and Azure cloud computing architecture, microservices, Kubernetes, and disaster recovery.',
    instructor: 'Dr. Emily Watson',
    instructorId: '3',
    organization: 'Cloud Masters Org',
    category: 'Cloud Computing',
    level: 'Advanced',
    price: 99.99,
    students: 620,
    rating: 4.7,
    status: 'Published',
    visibility: true,
    certificate: true,
    updated: '3 days ago',
    timestamp: 1716100000000,
    createdDate: '2023-06-15',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    objectives: ['Design fault-tolerant architectures', 'Manage multi-region deployments'],
    prerequisites: 'Basic networking and systems knowledge.',
    modules: []
  },
  {
    id: '5',
    title: 'Ethical Hacking & Penetration Testing',
    subtitle: 'Hands-on offensive security, network scanning, and vulnerability assessment.',
    description: 'Learn modern ethical hacking methodologies, Kali Linux toolkits, web application testing, and security auditing.',
    instructor: 'Prof. Michael Chen',
    instructorId: '4',
    organization: 'Tech University',
    category: 'Cybersecurity',
    price: 99.99,
    students: 450,
    rating: 4.6,
    status: 'Published',
    visibility: true,
    certificate: true,
    updated: '5 days ago',
    timestamp: 1715900000000,
    createdDate: '2023-07-22',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop',
    objectives: ['Perform penetration testing assessments', 'Identify OWASP Top 10 vulnerabilities'],
    prerequisites: 'Basic knowledge of TCP/IP and command line.',
    modules: []
  },
  {
    id: '6',
    title: 'UX Research & Design Systems',
    subtitle: 'From user interviews to enterprise design token architectures.',
    description: 'Understand user research methodologies, prototyping, Figma component systems, and design tokens.',
    instructor: 'Anita Patel',
    instructorId: '5',
    organization: 'Global Tech Institute',
    category: 'Design',
    price: 59.99,
    students: 980,
    rating: 4.4,
    status: 'Pending Approval',
    visibility: true,
    certificate: true,
    updated: '1 day ago',
    timestamp: 1716200000000,
    createdDate: '2023-09-05',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=450&fit=crop',
    objectives: ['Conduct quantitative and qualitative user research', 'Build scalable design systems'],
    prerequisites: 'Figma fundamentals.',
    modules: []
  },
];

export const learners = [
  { id: 1, userId: 1, name: 'John Doe', email: 'john@example.com', institution: 'MIT', studentId: 'MIT-12345', degree: 'Computer Science', graduationYear: 2025, verificationStatus: 'Verified', status: 'Active', progress: 85, lastActive: '2 hours ago', enrolledCoursesCount: 2, completedCoursesCount: 1, avgScore: 92, learningHours: 34 },
  { id: 2, userId: 5, name: 'Alice Johnson', email: 'alice@example.com', institution: 'Stanford', studentId: 'ST-98765', degree: 'Data Science', graduationYear: 2024, verificationStatus: 'Pending', status: 'Active', progress: 100, lastActive: '1 day ago', enrolledCoursesCount: 3, completedCoursesCount: 2, avgScore: 88, learningHours: 48 },
  { id: 3, userId: 4, name: 'Sarah Connor', email: 'sarah@example.com', institution: 'Caltech', studentId: 'CT-55678', degree: 'Electrical Engineering', graduationYear: 2025, verificationStatus: 'Verified', status: 'Active', progress: 32, lastActive: '1 week ago', enrolledCoursesCount: 1, completedCoursesCount: 0, avgScore: 78, learningHours: 12 },
  { id: 4, userId: 8, name: 'David Wilson', email: 'david.w@example.com', institution: 'Harvard University', studentId: 'HU-44321', degree: 'Economics', graduationYear: 2026, verificationStatus: 'Pending', status: 'Suspended', progress: 65, lastActive: '5 mins ago', enrolledCoursesCount: 2, completedCoursesCount: 1, avgScore: 85, learningHours: 29 },
  { id: 5, userId: 13, name: 'Priya Sharma', email: 'priya.sharma@example.com', institution: 'IIT Delhi', studentId: 'IIT-33201', degree: 'Artificial Intelligence', graduationYear: 2025, verificationStatus: 'Verified', status: 'Active', progress: 10, lastActive: '3 days ago', enrolledCoursesCount: 1, completedCoursesCount: 0, avgScore: 90, learningHours: 6 },
  { id: 6, userId: 14, name: 'Marcus Johnson', email: 'mjohnson@example.com', institution: 'UC Berkeley', studentId: 'UCB-88120', degree: 'Computer Science', graduationYear: 2025, verificationStatus: 'Verified', status: 'Active', progress: 100, lastActive: '1 day ago', enrolledCoursesCount: 2, completedCoursesCount: 1, avgScore: 95, learningHours: 42 },
  { id: 7, userId: 15, name: 'Sofia Rodriguez', email: 's.rodriguez@example.com', institution: 'UT Austin', studentId: 'UTA-99314', degree: 'Software Engineering', graduationYear: 2024, verificationStatus: 'Verified', status: 'Active', progress: 32, lastActive: '1 week ago', enrolledCoursesCount: 1, completedCoursesCount: 0, avgScore: 82, learningHours: 16 },
  { id: 8, userId: 16, name: 'David Kim', email: 'david.kim@example.com', institution: 'NYU', studentId: 'NYU-44109', degree: 'Information Systems', graduationYear: 2025, verificationStatus: 'Verified', status: 'Active', progress: 65, lastActive: '5 mins ago', enrolledCoursesCount: 3, completedCoursesCount: 2, avgScore: 91, learningHours: 38 },
  { id: 9, userId: 17, name: 'Aisha Patel', email: 'apatel@example.com', institution: 'Georgia Tech', studentId: 'GT-77215', degree: 'Computer Science', graduationYear: 2026, verificationStatus: 'Verified', status: 'Active', progress: 10, lastActive: '3 days ago', enrolledCoursesCount: 1, completedCoursesCount: 0, avgScore: 74, learningHours: 8 },
];

export const organizations = [
  { id: 1, userId: 3, name: 'Acme Corp', domain: 'acme.com', type: 'Corporate', instructors: 10, learners: 500, courses: 20, verificationStatus: 'Pending', status: 'Active' },
  { id: 2, userId: 7, name: 'Tech University', domain: 'tech.edu', type: 'University', instructors: 50, learners: 2000, courses: 150, verificationStatus: 'Verified', status: 'Active' },
  { id: 3, userId: 10, name: 'Global Tech Institute', domain: 'globaltech.org', type: 'Institute', instructors: 25, learners: 1200, courses: 45, verificationStatus: 'Verified', status: 'Active' },
  { id: 4, userId: 14, name: 'Cloud Masters Org', domain: 'cloudmasters.io', type: 'Corporate', instructors: 8, learners: 350, courses: 12, verificationStatus: 'Verified', status: 'Active' },
  { id: 5, userId: 15, name: 'Code Masters', domain: 'codemasters.dev', type: 'Startup', instructors: 5, learners: 180, courses: 8, verificationStatus: 'Pending', status: 'Active' },
  { id: 6, userId: 16, name: 'University of Tech', domain: 'univ.edu', type: 'University', instructors: 45, learners: 1850, courses: 38, verificationStatus: 'Verified', status: 'Active' },
];

export const certificates = [
  { id: 'CERT-9001', learner: 'Alice Johnson', course: 'Advanced React Patterns', instructor: 'Robert Brown', issuedDate: '2023-10-20', status: 'Valid' },
  { id: 'CERT-9002', learner: 'John Doe', course: 'Introduction to Machine Learning', instructor: 'Jane Smith', issuedDate: '2023-09-15', status: 'Valid' },
  { id: 'CERT-9003', learner: 'Sarah Connor', course: 'Cloud Architecture Masterclass', instructor: 'Dr. Emily Watson', issuedDate: '2023-10-01', status: 'Valid' },
  { id: 'CERT-9004', learner: 'Priya Sharma', course: 'Python for Beginners', instructor: 'Jane Smith', issuedDate: '2023-10-12', status: 'Valid' },
  { id: 'CERT-9005', learner: 'David Wilson', course: 'Ethical Hacking & Penetration Testing', instructor: 'Prof. Michael Chen', issuedDate: '2023-08-30', status: 'Revoked' },
];

export const disputes = [
  {
    id: 'DSP-3001',
    raisedBy: 'John Doe',
    raisedByType: 'Learner',
    subject: 'Course content does not match description',
    course: 'Introduction to Machine Learning',
    organization: 'Tech Academy',
    type: 'Course Content',
    priority: 'High',
    date: '2024-01-15',
    status: 'Pending',
    description: 'The course advertised advanced ML topics but only covers basics. Requesting a full review and either a course update or a refund.',
    createdAt: '2024-01-15T10:00:00Z',
    timeline: [{ event: 'Dispute Created', date: '2024-01-15T10:00:00Z' }],
    comments: [{ user: 'Admin', text: 'Reviewing curriculum match.', timestamp: '2024-01-16T09:00:00Z' }]
  },
  {
    id: 'DSP-3002',
    raisedBy: 'Tech Academy',
    raisedByType: 'Organization',
    subject: 'Incorrect revenue split for December',
    course: 'Python for Beginners',
    organization: 'Tech Academy',
    type: 'Payment',
    priority: 'High',
    date: '2024-01-18',
    status: 'Pending',
    description: 'Our revenue share for December was calculated at 60% instead of the agreed 70%. Requesting a recalculation and reimbursement of the difference.',
    createdAt: '2024-01-18T14:00:00Z',
    timeline: [{ event: 'Dispute Created', date: '2024-01-18T14:00:00Z' }],
    comments: []
  },
  {
    id: 'DSP-3003',
    raisedBy: 'Emily Chen',
    raisedByType: 'Learner',
    subject: 'Certificate not issued after course completion',
    course: 'Advanced React Patterns',
    organization: 'Code Masters',
    type: 'Certificate',
    priority: 'Medium',
    date: '2024-01-20',
    status: 'Pending',
    description: 'Completed the course on Jan 18th but have not received the completion certificate. Progress shows 100% on the platform.',
    createdAt: '2024-01-20T11:00:00Z',
    timeline: [{ event: 'Dispute Created', date: '2024-01-20T11:00:00Z' }],
    comments: []
  },
  {
    id: 'DSP-3004',
    raisedBy: 'Code Masters',
    raisedByType: 'Organization',
    subject: 'Unauthorized course suspension',
    course: 'Full-Stack Bootcamp',
    organization: 'Code Masters',
    type: 'Course Status',
    priority: 'High',
    date: '2024-01-22',
    status: 'Resolved',
    description: 'Our course was suspended without prior notice or explanation. We request immediate reinstatement or a detailed explanation.',
    createdAt: '2024-01-22T09:00:00Z',
    resolvedBy: 'Admin Team',
    resolutionNote: 'Suspension lifted after review.',
    timeline: [{ event: 'Dispute Created', date: '2024-01-22T09:00:00Z' }, { event: 'Resolved', date: '2024-01-23T10:00:00Z' }],
    comments: []
  },
  {
    id: 'DSP-3005',
    raisedBy: 'Michael Torres',
    raisedByType: 'Learner',
    subject: 'Instructor unresponsive to questions for 3 weeks',
    course: 'Python for Beginners',
    organization: 'Tech Academy',
    type: 'Instructor Conduct',
    priority: 'Medium',
    date: '2024-01-25',
    status: 'Rejected',
    description: 'The course instructor has not responded to any Q&A posts in over 3 weeks. This is affecting learning progress significantly.',
    createdAt: '2024-01-25T08:00:00Z',
    rejectionReason: 'Instructor has been active, response times are within acceptable SLA.',
    timeline: [{ event: 'Dispute Created', date: '2024-01-25T08:00:00Z' }, { event: 'Rejected', date: '2024-01-26T12:00:00Z' }],
    comments: []
  },
];

export const enrollments = [
  { id: 1, learnerId: 1, learner: 'John Doe', course: 'Introduction to Machine Learning', courseId: '1', instructor: 'Jane Smith', organization: 'Tech Academy', enrollmentDate: '2023-09-01', progress: 75, grade: 'A', status: 'Active' },
  { id: 2, learnerId: 2, learner: 'Alice Johnson', course: 'Advanced React Patterns', courseId: '1', instructor: 'Dr. Sarah Jenkins', organization: 'University of Tech', enrollmentDate: '2023-10-05', progress: 100, grade: 'A+', status: 'Completed' },
  { id: 3, learnerId: 3, learner: 'Sarah Connor', course: 'Cloud Architecture Masterclass', courseId: '4', instructor: 'Dr. Emily Watson', organization: 'Cloud Masters Org', enrollmentDate: '2023-08-20', progress: 90, grade: 'A', status: 'Active' },
  { id: 4, learnerId: 4, learner: 'David Wilson', course: 'Ethical Hacking & Penetration Testing', courseId: '5', instructor: 'Prof. Michael Chen', organization: 'Tech University', enrollmentDate: '2023-07-15', progress: 100, grade: 'A', status: 'Completed' },
  { id: 5, learnerId: 5, learner: 'Priya Sharma', course: 'Python for Beginners', courseId: '3', instructor: 'Jane Smith', organization: 'Tech Academy', enrollmentDate: '2023-10-10', progress: 45, grade: 'B', status: 'Active' },
  { id: 6, learnerId: 6, learner: 'Marcus Johnson', course: 'Advanced React Patterns & Architecture', courseId: '1', instructor: 'Dr. Sarah Jenkins', organization: 'University of Tech', enrollmentDate: '2023-10-15', progress: 100, grade: 'A+', status: 'Completed' },
  { id: 7, learnerId: 7, learner: 'Sofia Rodriguez', course: 'Advanced React Patterns & Architecture', courseId: '1', instructor: 'Dr. Sarah Jenkins', organization: 'University of Tech', enrollmentDate: '2023-10-18', progress: 32, grade: 'B-', status: 'Active' },
  { id: 8, learnerId: 8, learner: 'David Kim', course: 'Full-stack Next.js 14 Masterclass', courseId: '2', instructor: 'Dr. Sarah Jenkins', organization: 'University of Tech', enrollmentDate: '2023-10-02', progress: 65, grade: 'B+', status: 'Active' },
  { id: 9, learnerId: 9, learner: 'Aisha Patel', course: 'Full-stack Next.js 14 Masterclass', courseId: '2', instructor: 'Dr. Sarah Jenkins', organization: 'University of Tech', enrollmentDate: '2023-10-22', progress: 10, grade: 'C', status: 'Active' },
];

export const notifications = [
  { id: 1, title: 'New Course Pending Approval', message: 'Advanced React Patterns has been submitted for approval.', type: 'Approvals', date: '2023-10-20T10:00:00Z', unread: true },
  { id: 2, title: 'New student enrollment', message: 'Marcus Johnson enrolled in Advanced React Patterns.', type: 'Courses', date: '2023-10-26T09:30:00Z', unread: true },
  { id: 3, title: 'New 5-star review', message: 'Sofia Rodriguez left a 5-star review on Full-stack Next.js.', type: 'Reviews', date: '2024-01-15T08:45:00Z', unread: true },
  { id: 4, title: 'Organization Verification Request', message: 'Acme Corp has submitted documents for platform verification.', type: 'Approvals', date: '2023-10-01T14:20:00Z', unread: false },
  { id: 5, title: 'Course published successfully', message: 'Your course Advanced React Patterns is now live.', type: 'System', date: '2023-09-10T16:00:00Z', unread: false },
  { id: 6, title: 'Organization Invitation', message: 'You have been invited to join Global Tech University.', type: 'Organization', date: '2023-11-02T11:15:00Z', unread: false },
];

export const transactions = [
  { id: 'TXN-1001', orderId: 'ORD-5001', userId: 1, user: 'John Doe', course: 'Introduction to Machine Learning', amount: 49.99, paymentGateway: 'Stripe', paymentMethod: 'Credit Card (Visa •••• 4242)', date: '2023-09-01T10:30:00Z', status: 'Successful' },
  { id: 'TXN-1002', orderId: 'ORD-5002', userId: 2, user: 'Alice Johnson', course: 'Advanced React Patterns', amount: 79.99, paymentGateway: 'PayPal', paymentMethod: 'PayPal', date: '2023-10-05T14:15:00Z', status: 'Successful' },
  { id: 'TXN-1003', orderId: 'ORD-5003', userId: 4, user: 'Bob Wilson', course: 'Python for Beginners', amount: 29.99, paymentGateway: 'Stripe', paymentMethod: 'Mastercard •••• 8812', date: '2023-10-26T09:00:00Z', status: 'Failed' },
  { id: 'TXN-1004', orderId: 'ORD-5004', userId: 3, user: 'Sarah Connor', course: 'Cloud Architecture Masterclass', amount: 89.99, paymentGateway: 'Stripe', paymentMethod: 'Stripe', date: '2023-08-20T11:45:00Z', status: 'Successful' },
  { id: 'TXN-1005', orderId: 'ORD-5005', userId: 8, user: 'David Wilson', course: 'Ethical Hacking & Penetration Testing', amount: 99.99, paymentGateway: 'Razorpay', paymentMethod: 'Razorpay Netbanking', date: '2023-07-15T16:30:00Z', status: 'Successful' },
  { id: 'TXN-1006', orderId: 'ORD-5006', userId: 5, user: 'Priya Sharma', course: 'Python for Beginners', amount: 29.99, paymentGateway: 'PayPal', paymentMethod: 'PayPal', date: '2023-10-10T08:20:00Z', status: 'Refunded' },
];

export const refunds = [
  { id: 'REF-2001', learner: 'John Doe', course: 'Introduction to Machine Learning', transaction: 'TXN-1001', amount: 49.99, reason: 'Accidental purchase', date: '2023-10-25', status: 'Pending' },
  { id: 'REF-2002', learner: 'Alice Johnson', course: 'Advanced React Patterns', transaction: 'TXN-1002', amount: 79.99, reason: 'Course prerequisites too advanced', date: '2023-10-27', status: 'Pending' },
  { id: 'REF-2003', learner: 'Priya Sharma', course: 'Python for Beginners', transaction: 'TXN-1006', amount: 29.99, reason: 'Duplicate enrollment', date: '2023-10-10', status: 'Approved' },
];

export const reports = [
  { id: 'REP-101', title: 'User Report', description: 'Comprehensive report of all users, roles, and platform activity.', lastGenerated: '2023-10-26', formats: ['CSV', 'PDF'] },
  { id: 'REP-102', title: 'Course Report', description: 'Detailed statistics on courses, enrollments, and completion rates.', lastGenerated: '2023-10-25', formats: ['CSV', 'PDF'] },
  { id: 'REP-103', title: 'Revenue Report', description: 'Financial data, transactions, and instructor payouts.', lastGenerated: '2023-10-24', formats: ['CSV', 'PDF'] },
  { id: 'REP-104', title: 'Organization Report', description: 'Metrics for university and corporate partners.', lastGenerated: '2023-10-22', formats: ['CSV', 'PDF'] },
];

export const reviews = [
  {
    id: 1,
    name: 'Marcus Johnson',
    avatar: 'M',
    course: 'Advanced React Patterns',
    courseId: '1',
    rating: 5,
    date: '2 days ago',
    timestamp: 1716300000000,
    content: 'This is exactly what I was looking for. The instructor explains complex concepts in a very digestible way. The sections on Compound Components and Render Props were eye-opening.',
    response: 'Thank you Marcus! I am glad the patterns were helpful for your projects.'
  },
  {
    id: 2,
    name: 'Sofia Rodriguez',
    avatar: 'S',
    course: 'Full-stack Next.js 14 Masterclass',
    courseId: '2',
    rating: 4,
    date: '1 week ago',
    timestamp: 1715800000000,
    content: 'Great course overall. The pacing is a bit fast in the server actions section, but otherwise very comprehensive.',
    response: null
  },
  {
    id: 3,
    name: 'David Kim',
    avatar: 'D',
    course: 'Advanced React Patterns',
    courseId: '1',
    rating: 5,
    date: '2 weeks ago',
    timestamp: 1715200000000,
    content: 'Best React course I have taken. The architectural patterns are very applicable to enterprise applications.',
    response: null
  },
];

export const quizzes = [
  {
    id: '105',
    courseId: '1',
    title: 'Quiz: Core Component Patterns',
    passingScore: 80,
    showExplanations: true,
    questions: [
      {
        id: 1,
        text: 'Which of the following is a key advantage of the custom hook pattern in React?',
        points: 10,
        explanation: 'Custom hooks allow extracting and reusing stateful component logic cleanly across components without altering component hierarchy.',
        options: [
          { id: 'opt_1', text: 'It allows for sharing stateful logic between components.', isCorrect: true },
          { id: 'opt_2', text: 'It automatically optimizes rendering performance.', isCorrect: false },
          { id: 'opt_3', text: 'It replaces the need for Context API entirely.', isCorrect: false },
          { id: 'opt_4', text: 'It forces synchronous updates across DOM nodes.', isCorrect: false },
        ]
      },
      {
        id: 2,
        text: 'What problem does the Compound Components pattern primarily solve?',
        points: 10,
        explanation: 'Compound Components enable a set of components to work together with implicit shared state, providing an expressive and clean API like <select> and <option>.',
        options: [
          { id: 'opt_5', text: 'Implicit state sharing between connected child components.', isCorrect: true },
          { id: 'opt_6', text: 'Handling asynchronous network requests.', isCorrect: false },
          { id: 'opt_7', text: 'Compiling JSX directly to WebAssembly.', isCorrect: false },
          { id: 'opt_8', text: 'Preventing prop drilling in deep third-party libraries only.', isCorrect: false },
        ]
      },
    ]
  },
  {
    id: '203',
    courseId: '1',
    title: 'Quiz: Performance & Hooks',
    passingScore: 80,
    showExplanations: true,
    questions: [
      {
        id: 1,
        text: 'When should you typically use useMemo in React?',
        points: 10,
        explanation: 'useMemo caches the result of expensive calculations between renders when dependencies have not changed.',
        options: [
          { id: 'opt_201', text: 'To memoize computationally expensive calculations.', isCorrect: true },
          { id: 'opt_202', text: 'To trigger side-effects like data fetching.', isCorrect: false },
          { id: 'opt_203', text: 'To replace useRef for mutable instance values.', isCorrect: false },
        ]
      }
    ]
  }
];

export const activities = [
  {
    id: 1,
    userId: 1,
    title: 'Completed Quiz: Core Component Patterns',
    timestamp: 'Today at 10:45 AM',
    description: 'Scored 95% in Module 1 Assessment of Advanced React Patterns.',
    type: 'quiz'
  },
  {
    id: 2,
    userId: 1,
    title: 'Successful Authentication',
    timestamp: 'Yesterday at 04:20 PM',
    description: 'Logged into platform from Chrome on Windows (IP: 192.168.1.45).',
    type: 'login'
  },
  {
    id: 3,
    userId: 1,
    title: 'Issued Certificate of Completion',
    timestamp: 'Oct 22, 2023',
    description: 'Verified certificate issued for Introduction to Machine Learning.',
    type: 'certificate'
  },
  {
    id: 4,
    userId: 1,
    title: 'Billing & Payment Processed',
    timestamp: 'Oct 12, 2023',
    description: 'Payment transaction TXN-1001 confirmed successfully.',
    type: 'payment'
  },
  {
    id: 5,
    userId: 2,
    title: 'New student enrolled in Advanced React Patterns',
    timestamp: '2 hours ago',
    description: 'Marcus Johnson enrolled in Advanced React Patterns.',
    type: 'student'
  },
  {
    id: 6,
    userId: 2,
    title: 'Course Advanced React Patterns was updated',
    timestamp: '5 hours ago',
    description: 'Added new module: Custom Hooks & State Optimization.',
    type: 'course'
  },
  {
    id: 7,
    userId: 2,
    title: 'New review received (5 stars)',
    timestamp: '1 day ago',
    description: 'Marcus Johnson left a 5-star review.',
    type: 'review'
  }
];

export const adminSettings = {
  platformName: 'Coursera Platform',
  supportEmail: 'support@platform.com',
  enableRegistration: true,
  maintenanceMode: false,
  currency: 'USD',
  platformFeePercent: 15,
};

export const instructorSettings = {
  email: 'sarah.jenkins@university.edu',
  phone: '+1 (555) 123-4567',
  courseActivityNotifs: true,
  studentActivityNotifs: true,
  marketingUpdates: false,
  language: 'English (US)',
  timeZone: 'Pacific Time (PT)',
  profileVisibility: true,
};
