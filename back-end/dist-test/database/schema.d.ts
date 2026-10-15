export interface UserEntity {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'Student' | 'Learner' | 'Instructor' | 'Educator' | 'Organization' | 'Admin' | 'SuperAdmin' | 'Super Admin';
    status: 'Active' | 'Inactive' | 'Suspended' | 'Pending' | 'Pending Affiliation';
    avatar?: string;
    verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
    organizationId?: string | null;
    organizationName?: string | null;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string;
}
export interface LearnerEntity {
    id: string;
    userId?: string;
    name: string;
    email: string;
    avatar?: string;
    learnerType: 'Undergraduate' | 'Postgraduate' | 'Corporate' | 'Professional' | 'Lifelong';
    university?: string;
    universityId?: string;
    enrolledCourses?: number;
    overallProgress?: number;
    certificatesEarned?: number;
    status: 'Active' | 'Inactive' | 'Suspended';
    createdAt?: string;
    updatedAt?: string;
}
export interface StudentEntity {
    id: string;
    learnerId: string;
    universityId: string;
    studentStatus: 'Enrolled' | 'Graduated' | 'On Leave';
    graduationYear: number;
    degree?: string;
    gpa?: number;
    createdAt?: string;
}
export interface UniversityEntity {
    id: string;
    name: string;
    domain: string;
    location: string;
    website: string;
    status?: 'Active' | 'Verified';
    createdAt?: string;
}
export interface EducatorEntity {
    id: string;
    userId?: string;
    name: string;
    email: string;
    avatar?: string;
    organizationId: string;
    organizationName?: string;
    educatorType: string;
    bio: string;
    expertise: string[] | string;
    specialization?: string;
    profileUrl?: string;
    status: 'Active' | 'Pending' | 'Suspended';
    verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
    coursesCount?: number;
    enrolledStudents?: number;
    avgRating?: number;
    revenueGenerated?: number;
    createdAt?: string;
    updatedAt?: string;
}
export interface OrganizationEntity {
    id: string;
    name: string;
    email: string;
    location: string;
    website: string;
    status: 'Active' | 'Verified' | 'Pending';
    tagline?: string;
    phone?: string;
    address?: string;
    totalRevenue?: number;
    monthlyRevenue?: number;
    currency?: string;
    logo?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface CourseEntity {
    id: string;
    educatorId?: string;
    instructorId?: string;
    instructorName?: string;
    instructors?: Array<{
        id: string;
        name: string;
        role: 'Lead Instructor' | 'Co-Instructor' | 'Guest Lecturer';
        avatar?: string;
        specialization?: string;
    }>;
    organizationId?: string;
    universityId?: string;
    title: string;
    subtitle?: string;
    description: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
    accessType: 'Paid Masterclass' | 'Institutional Scholarship' | 'Open Enterprise Cohort' | 'Free';
    status: 'Published' | 'Draft' | 'Archived' | 'Pending Approval';
    price: number;
    rating?: number;
    totalHours?: string | number;
    lessonsCount?: number;
    enrolledCount?: number;
    thumbnail?: string;
    image?: string;
    visibility?: boolean;
    certificate?: boolean;
    objectives?: string[];
    prerequisites?: string;
    modules?: ModuleEntity[];
    createdAt?: string;
    updatedAt?: string;
}
export interface ModuleEntity {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    sequenceNumber: number;
    items?: any[];
    lessons?: LessonEntity[];
    createdAt?: string;
}
export interface LessonEntity {
    id: string;
    moduleId: string;
    courseId?: string;
    title: string;
    contentUrl?: string;
    url?: string;
    duration?: string | number;
    sequenceNumber: number;
    type?: 'Video' | 'Reading' | 'Quiz' | 'Lab';
    fileName?: string;
    fileSize?: string;
    createdAt?: string;
}
export interface EnrollmentEntity {
    id: string;
    learnerId: string;
    learnerName?: string;
    learnerEmail?: string;
    learnerAvatar?: string;
    courseId: string;
    courseTitle?: string;
    enrolledDate?: string;
    enrolledAt?: string;
    progress: number;
    completedLessons?: string[];
    status: 'Active' | 'Completed' | 'Dropped' | 'Paused';
    createdAt?: string;
    updatedAt?: string;
}
export interface AssignmentEntity {
    id: string;
    courseId: string;
    courseTitle?: string;
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
    createdAt?: string;
}
export interface SubmissionEntity {
    id: string;
    assignmentId: string;
    learnerId: string;
    learnerName?: string;
    submittedAt: string;
    score?: number;
    feedback?: string;
    content?: string;
    status: 'Submitted' | 'Graded' | 'Pending Review';
}
export interface CertificateEntity {
    id: string;
    learnerId: string;
    learnerName?: string;
    courseId: string;
    courseTitle?: string;
    credentialId: string;
    issuedAt: string;
    expiryDate?: string | null;
    status: 'Issued' | 'Revoked' | 'Verified';
    certificateUrl?: string;
    grade?: string;
    instructorSignature?: string;
}
export interface PaymentEntity {
    id: string;
    learnerId?: string;
    payer?: string;
    payerEmail?: string;
    courseId?: string;
    course?: string;
    courseTitle?: string;
    amount: number;
    paymentMethod: string;
    method?: string;
    transactionId?: string;
    paymentDate?: string;
    date?: string;
    status: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
    type?: 'Tuition' | 'Disbursement' | 'Platform Fee' | 'Royalty Payout';
    facultyRoyalty?: number;
    platformFee?: number;
    createdAt?: string;
}
export interface ReviewEntity {
    id: string;
    learnerId: string;
    learnerName: string;
    learnerAvatar?: string;
    courseId: string;
    courseTitle?: string;
    rating: number;
    comment: string;
    createdAt: string;
}
export interface QuizEntity {
    id: string;
    courseId: string;
    courseTitle?: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    passingScore?: number;
    status: 'Published' | 'Draft';
    questionsCount?: number;
    questions?: QuizQuestionEntity[];
    createdAt?: string;
}
export interface QuizQuestionEntity {
    id: string;
    quizId: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
    sequenceNumber: number;
}
export interface AdminEntity {
    id: string;
    userId?: string;
    name: string;
    email: string;
    adminLevel: 'SuperAdmin' | 'FacultyLead' | 'ComplianceOfficer';
    status: 'Active' | 'Inactive';
    permissions?: string[];
    createdAt?: string;
}
export interface DisputeEntity {
    id: string;
    raisedBy: string;
    raisedById?: string;
    raisedByRole?: 'Organization' | 'Faculty' | 'Learner' | 'Student';
    disputeType: string;
    subject?: string;
    description: string;
    courseId?: string;
    courseTitle?: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved' | 'Closed';
    createdAt: string;
    resolvedAt?: string | null;
    adminNotes?: string;
    desiredResolution?: string;
    assignedAdmin?: string;
}
