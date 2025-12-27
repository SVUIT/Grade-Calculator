import type { Subject, Course } from "../types/index";

// ================== AUTO CALCULATE - ĐIỂM HP =================
export const calcSubjectScore = (subj: Partial<Subject>): string => {
  // If diemHP is already set (from PDF), use it directly
  if (subj.diemHP && subj.diemHP.trim() !== '') {
    return subj.diemHP;
  }
  
  // Otherwise, use the default calculation (though this might not match the PDF's calculation)
  const scores = [
    Number(subj.progressScore) || 0,
    Number(subj.midtermScore) || 0,
    Number(subj.practiceScore) || 0,
    Number(subj.finalScore) || 0,
  ];

  const weights = [
    Number(subj.progressWeight) || 0,
    Number(subj.midtermWeight) || 0,
    Number(subj.practiceWeight) || 0,
    Number(subj.finalWeight) || 0,
  ];

  const totalWeight = weights.reduce((a, b) => a + b, 0);

  if (totalWeight !== 100) return "Sai %";

  let total = 0;
  let hasAllScores = true;
  
  for (let i = 0; i < 4; i++) {
    if (scores[i] === null) {
      hasAllScores = false;
      break;
    }
    total += scores[i]! * (weights[i] / 100);
  }
  
  if (!hasAllScores) return "";

  return total.toFixed(2);
};

// ================== TRUNG BÌNH HỌC KỲ =======================
export const calcSemesterAverage = (subjects: Subject[]) => {
  let totalTC = 0;
  let totalScore = 0;

  subjects.forEach((sub) => {
    const hp = Number(calcSubjectScore(sub));
    const tc = Number(sub.credits);
    if (!isNaN(hp) && !isNaN(tc)) {
      totalTC += tc;
      totalScore += hp * tc;
    }
  });

  if (totalTC === 0) return { tc: 0, avg: 0 };
  return { tc: totalTC, avg: (totalScore / totalTC).toFixed(2) };
};

// ================== VALIDATE SCORE INPUT ======================
export const normalizeScore = (value: string): string => {
  const trimmed = value.trim();

  // Return empty string for empty input
  if (trimmed === "") return "";

  let num = Number(trimmed);

  if (isNaN(num)) return ""; // Return empty for non-numeric input
  if (num < 0) return "0"; // Minimum score is 0
  if (num > 100) return "100"; // Maximum score is 100

  // Round to 2 decimal places if not an integer
  return num % 1 === 0 ? num.toString() : parseFloat(num.toFixed(2)).toString();
};

export const calcRequiredScores = (subj: Subject, expected: number): Partial<Subject> => {
  const fields: (keyof Subject)[] = ["progressScore", "midtermScore", "practiceScore", "finalScore"];
  const weightFields: (keyof Subject)[] = ["progressWeight", "midtermWeight", "practiceWeight", "finalWeight"];
  const minFields: (keyof Subject)[] = ["minProgressScore", "minMidtermScore", "minPracticeScore", "minFinalScore"];

  let currentSum = 0;
  let missingWeight = 0;
  const missingFields: string[] = [];
  const missingMinFields: string[] = [];


  fields.forEach((f, idx) => {
    const raw = subj[f] as string;
    const score = Number(raw);
    const w = Number(subj[weightFields[idx]]) / 100;

    if (raw.trim() !== "" && !isNaN(score)) {
      currentSum += score * w; // có điểm
    } else {
      missingWeight += w; // chưa nhập
      missingFields.push(f as string);
      missingMinFields.push(minFields[idx] as string);

    }
  });

  if (missingWeight === 0) return {}; // không có mục trống → không tính được

  const need = (expected - currentSum) / missingWeight;

  // cho phép > 10, không giới hạn
  const valid = Math.max(0, need);

  const result: Partial<Subject> = {};
  missingMinFields.forEach((f) => {
    (result as any)[f] = valid.toFixed(2);
  });

  return result;
};

// ================== CHECK ĐỦ 4 CỘT ĐIỂM =================
export const hasAllScores = (subj: Subject): boolean => {
  const fields: (keyof Subject)[] = ["progressScore", "midtermScore", "practiceScore", "finalScore"];
  return fields.every((f) => {
    const val = subj[f];
    return val !== undefined && val.toString().trim() !== "";
  });
};

// ================== SEARCH HELPER =================
export const getSearchResults = (searchTerm: string, data: Record<string, Course[]>) => {
  if (!searchTerm.trim()) {
    return Object.entries(data).map(([cat, subs]) => ({
      category: cat,
      subjects: subs,
    }));
  }

  const query = searchTerm.toLowerCase();
  const results: { category: string; subjects: Course[] }[] = [];

  Object.entries(data).forEach(([category, subjects]) => {
    const filtered = subjects.filter(
      (s) => s.courseCode.toLowerCase().includes(query) || s.courseNameVi.toLowerCase().includes(query)
    );
    if (filtered.length > 0) {
      results.push({ category, subjects: filtered });
    }
  });

  return results;
};