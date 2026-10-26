export interface StatItem {
  label: string;
  value: string;
  unit: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface Teacher {
  id: number;
  name: string;
  fullName: string;
  position: string;
  school: string;
  department: string;
  email: string;
  phone: string;
  lineId: string;
  avatar: string;
  bio: string;
  teachingPhilosophy: string;
  instructor?: string;
  instructorRole?: string;
  studentGroup?: string;
  statsJson?: string;
  educationJson?: string;
  achievementsJson?: string;
  stats?: StatItem[];
  education?: EducationItem[];
  academicAchievements?: string[];
  updatedAt?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  level: string;
  semester: string;
  credits: string;
  description: string;
  badgeColor?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Work {
  id: string;
  courseId: string;
  title: string;
  category: 'student' | 'media' | 'plan' | 'award' | string;
  categoryLabel?: string;
  date: string;
  studentName: string;
  image: string; // ภาพหน้างาน (Cover Image)
  galleryImages?: string; // ภาพข้างใน (JSON string)
  galleryList?: string[]; // รายการภาพข้างใน (Array of URLs/Base64)
  description: string;
  link: string;
  downloadText: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  tags: string;
  tagsList?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  course: string;
  format: string;
  size: string;
  url: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
