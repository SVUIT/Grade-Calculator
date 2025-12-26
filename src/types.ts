export interface Course {
  courseCode: string;
  courseNameEn: string;
  courseNameVi: string;
  courseType: string;
  credits: number;
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

  // Scores
  progressScore: string;
  practiceScore: string;
  midtermScore: string;
  finalScore: string; // Maps to finaltermScore

  // Min Scores (calculated)
  minProgressScore: string;
  minPracticeScore: string;
  minMidtermScore: string;
  minFinalScore: string;

  // Weights (0-100 strings for UI)
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
  cumulativeGpa: number;
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
