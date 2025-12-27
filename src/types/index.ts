// src/types/index.ts

// Course related types
export interface CourseScores {
  progressScore?: number;
  midtermScore?: number;
  practiceScore?: number;
  finaltermScore?: number;
  totalScore?: number;
}

export interface Course {
  courseCode: string;
  courseNameEn: string;
  courseNameVi: string;
  courseType: string;
  credits: number;
  scores?: CourseScores;
  defaultWeights: {
    progressWeight: number;
    practiceWeight: number;
    midtermWeight: number;
    finalTermWeight: number;
  };
}

export interface Subject {
  id?: string;
  courseCode: string;
  courseName: string;
  credits: string; // kept as string for UI compatibility
  progressScore: string;
  practiceScore: string;
  midtermScore: string;
  finalScore: string; // Maps to finaltermScore
  minProgressScore: string;
  minPracticeScore: string;
  minMidtermScore: string;
  minFinalScore: string;
  progressWeight: string;
  practiceWeight: string;
  midtermWeight: string;
  finalWeight: string; // Maps to finalTermWeight
  score: string; // diemHP
  expectedScore: string;
  [key: string]: any;
}

export interface SemesterSummary {
  averageScore: number;
  creditsEarned: number;
}

export interface CumulativeSummary {
  totalCreditsAccumulated: number;
  gpa: number;
  cumulativeGpa?: number; // For backward compatibility
}

export interface Semester {
  id?: string;
  name: string;
  semesterName: string;
  year: string;
  subjects: Subject[];
  semesterSummary?: SemesterSummary;
  cumulativeSummary?: CumulativeSummary;
}

// PDF processing types
export interface SemesterData {
  semesterName: string;
  courses: Course[];
}

export interface ProcessedPdfData {
  semesters: SemesterData[];
  courseCode?: string;
  courseNameVi?: string;
  credits?: number;
  scores?: CourseScores;
}

// Academic record types
export interface AcademicRecord {
  totalCredits: number;
  gpa: number;
  hasFGrade: boolean;
  completedThesis: boolean;
  thesisScore?: number;
  englishProficiency: {
    type: "IELTS" | "TOEFL" | "TOEIC" | "VSTEP" | "UIT";
    score: number;
  };
  completedMilitaryTraining: boolean;
  completedPhysicalEducation: boolean;
  completedSoftSkills: boolean;
  isUnderDisciplinaryAction: boolean;
}
