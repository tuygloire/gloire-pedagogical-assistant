
// User interface definition for authentication and profile management
export type UserRole = 'Super Admin' | 'Pedagogical Assistant' | 'Teacher' | 'Student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'deactivated';
  lastLogin?: number;
}

export interface SystemStats {
  totalUsers: number;
  totalPlans: number;
  totalAssessments: number;
  totalSchemes: number;
  totalSlides: number;
  totalDownloads: number;
  activeNow: number;
}

// Global configuration for generating standard lesson plans
export interface GenerationConfig {
  gradeLevel: string;
  subject: string;
  topic: string;
  duration: string;
  pedagogicalApproach: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  gradeLevel?: string;
  subject: string;
  topic: string;
  duration: string;
  objectives: string[];
  materials: string[];
  outline: LessonSection[];
  assessment: string;
  homework: string;
  createdAt: number;
  updatedAt?: number;
  downloads?: number;
  type?: 'standard' | 'rtb' | 'slides' | 'homework' | 'quiz' | 'exam' | 'reb' | 'nursery' | 'scheme';
  isTruncated?: boolean;
}

export interface LessonSection {
  title: string;
  duration: string;
  content: string;
}

export interface RTBActivityStep {
  title: string;
  duration: string;
  trainerActivity: string;
  learnerActivity: string;
  trainerResources: string;
  traineeResources: string;
  expertView?: string;
}

export interface RTBSessionPlan extends LessonPlan {
  type: 'rtb';
  schoolName: string;
  academicYear: string;
  term: string;
  trainerName: string;
  trade: string;
  sector: string;
  level: string;
  date: string;
  week: string;
  noTrainees: string;
  className: string;
  moduleCodeName: string;
  learningOutcome: string;
  indicativeContent: string;
  topicOfSession: string;
  range: string;
  durationOfSession: string;
  methodology: string;
  objectivesText: string;
  understandingLevel: string; // Bloom's Level (e.g., Knowledge, Understanding, Solving)
  facilitationTechniques: string;
  lessonImportance: string;
  language: string;
  ksaObjectives: {
    knowledge: string[];
    skills: string[];
    attitudes: string[];
  };
  procedure: {
    introduction: RTBActivityStep;
    development: RTBActivityStep[];
    conclusion: {
      summary: RTBActivityStep;
      assessment: RTBActivityStep;
      evaluation: RTBActivityStep;
    };
  };
  crossCuttingIssue: string;
  references: string;
  appendices: string;
  reflection: string;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
}

export enum AppView {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  SLIDES = 'slides',
  HOMEWORK = 'homework',
  QUIZZES = 'quizzes',
  EXAMS = 'exams',
  SCHEME_GENERATOR = 'scheme_generator',
  SCHEME_PLANS = 'scheme_plans',
  GENERATOR = 'generator',
  RTB_PLANS = 'rtb_plans',
  RTB_GENERATOR = 'rtb_generator',
  RTB_SETTINGS = 'rtb_settings',
  REB_GENERATOR = 'reb_generator',
  REB_PLANS = 'reb_plans',
  NURSERY_GENERATOR = 'nursery_generator',
  NURSERY_PLANS = 'nursery_plans',
  HISTORY = 'history',
  AUTH = 'auth',
  ADMIN_DASHBOARD = 'admin_dashboard',
  ADMIN_USERS = 'admin_users',
  ADMIN_CMS = 'admin_cms',
  ADMIN_SETTINGS = 'admin_settings',
  ADMIN_REPORTS = 'admin_reports'
}

export interface RTBGenerationConfig {
  schoolName: string;
  academicYear: string;
  term: string;
  trainerName: string;
  trade: string;
  sector: string;
  level: string;
  date: string;
  week: string;
  noTrainees: string;
  className: string;
  moduleCodeName: string;
  topicOfSession: string;
  learningOutcome?: string;
  indicativeContent?: string;
  durationOfSession?: string;
  methodology: string;
  range?: string;
  language: string;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
  referenceFile?: {
    data: string;
    mimeType: string;
  };
}

export interface RTBDefaultSettings {
  schoolName: string;
  trainerName: string;
  trade: string;
  academicYear: string;
  province: string;
  district: string;
  sector: string;
  level: string;
  term: string;
  moduleCodeName?: string;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolCode?: string;
  additionalInfo?: string;
}

export interface SchemeRow {
  week: string;
  dateRange: string;
  learningOutcome: string;
  duration: string;
  indicativeContent: string;
  learningActivities: string;
  resources: string;
  evidences: string;
  learningPlace: string;
  observation: string;
}

export interface SchemeOfWork extends LessonPlan {
  type: 'scheme';
  academicYear: string;
  term: string;
  termStartDate?: string;
  termEndDate?: string;
  moduleStartDate?: string;
  moduleStartWeek?: string;
  teacherName: string;
  schoolName: string;
  language: string;
  numWeeks: number;
  sector: string;
  trade: string;
  qualificationTitle: string;
  rqfLevel: string;
  moduleCodeTitle: string;
  learningHours: string;
  numClasses: string;
  date: string;
  className: string;
  rows: SchemeRow[];
  generalObservation?: string;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
}

export interface SchemeGenerationConfig {
  academicYear: string;
  term: string;
  teacherName: string;
  schoolName: string;
  sector: string;
  trade: string;
  qualificationTitle: string;
  rqfLevel: string;
  moduleCodeTitle: string;
  learningHours: string;
  numClasses: string;
  date: string;
  className: string;
  subject?: string;
  gradeLevel?: string;
  language?: string;
  numWeeks?: number;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
  chronogramFile?: { data: string; mimeType: string };
  curriculaFile?: { data: string; mimeType: string };
}

export interface HomeworkQuestion {
  question: string;
  marks: number;
  type: 'mixed' | 'multiple-choice' | 'short-answer';
  options?: string[];
  answer: string;
  explanation: string;
  page?: string;
  reference?: string;
}

export interface Homework extends LessonPlan {
  type: 'homework' | 'quiz' | 'exam';
  questions: HomeworkQuestion[];
  instructions: string;
  totalMarks: number;
  assessmentType: 'homework' | 'quiz' | 'exam';
  schoolName?: string;
  district?: string;
  sector?: string;
  trainerName?: string;
  trade?: string;
  gradeLevel?: string;
  date?: string;
  term?: string;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
}

export interface HomeworkGenerationConfig {
  gradeLevel: string;
  subject: string;
  topic: string;
  numQuestions: number;
  questionType: 'mixed' | 'multiple-choice' | 'short-answer';
  difficulty: 'easy' | 'medium' | 'hard';
  assessmentType: 'homework' | 'quiz' | 'exam';
  term: string;
  date: string;
  schoolName: string;
  district: string;
  sector: string;
  trainerName: string;
  trade: string;
  totalMarks: number;
  schoolLogoLeft?: string;
  schoolLogoRight?: string;
  referenceFile?: {
    data: string;
    mimeType: string;
  };
}

export interface SlideContent {
  title: string;
  points: string[];
  imagePrompt?: string;
  goal?: string;
  isAchieved?: boolean;
  imageUrl?: string;
}

export interface Presentation extends LessonPlan {
  type: 'slides';
  slides: SlideContent[];
}

export interface SlideGenerationConfig {
  gradeLevel: string;
  subject: string;
  topic: string;
  duration: string;
  numSlides: number;
  referenceFile?: { data: string; mimeType: string };
}

export interface REBLessonPlan extends LessonPlan {
  type: 'reb';
  school: string;
  teacher: string;
  term: string;
  date: string;
  classSize: string;
  location: string;
  specialNeeds: string;
  unitNo: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonNo: string;
  instructionalObjective: string;
  steps: any[];
}

export interface REBGenerationConfig {
  school: string;
  teacher: string;
  subject: string;
  gradeLevel: string;
  term: string;
  date: string;
  duration: string;
  classSize: string;
  location: string;
  specialNeeds: string;
  language: string;
  unitNo: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonNo: string;
  lessonTitle: string;
  includeAIActivities: boolean;
  isDetailed: boolean;
  referenceFile?: {
    data: string;
    mimeType: string;
  };
}

export interface NurseryLessonPlan extends LessonPlan {
  type: 'nursery';
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  classSize: string;
  language: string;
  lessonSteps: any[];
}

export interface NurseryGenerationConfig {
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  gradeLevel: string;
  lessonName: string;
  duration: string;
  classSize: string;
  language: string;
  referenceFile?: {
    data: string;
    mimeType: string;
  };
}

export interface CMSResource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'video' | 'link';
  category: string;
  url: string;
  createdAt: number;
}

export interface CMSContent {
  id: string;
  title: string;
  body: string;
  author: string;
  type: 'post' | 'page' | 'announcement';
  status: 'published' | 'draft';
  category: string;
  featuredImage?: string;
  attachmentUrl?: string;
  createdAt: number;
}

export interface SystemMenu {
  id: string;
  label: string;
  url: string;
  order: number;
  target: '_self' | '_blank';
}

export interface GlobalSettings {
  systemName: string;
  academicYear: string;
  currentTerm: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  supportEmail: string;
  defaultLogoLeft: string;
  defaultLogoRight: string;
  seoTitle: string;
  seoDescription: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerText: string;
  primaryColor: string;
  faviconUrl: string;
  googleAnalyticsId: string;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: number;
  adminName: string;
}
