import type { Subject, Course } from "../types";

// ================== AUTO CALCULATE - ĐIỂM HP =================
export const calcSubjectScore = (subj: Partial<Subject>): string => {
  const scores = [
    Number(subj.progressScore) || 0,
    Number(subj.midtermScore) || 0,
    Number(subj.practiceScore) || 0,
    Number(subj.finalScore) || 0,
  ];

  // Get weights and convert to numbers, handling both percentage (e.g., 20) and decimal (e.g., 0.2) formats
  const weights = [
    Number(subj.progressWeight) || 0,
    Number(subj.midtermWeight) || 0,
    Number(subj.practiceWeight) || 0,
    Number(subj.finalWeight) || 0,
  ];

  // Check if weights are in percentage format (sum ~100) or decimal format (sum ~1)
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const isPercentageFormat = totalWeight > 1; // If sum is greater than 1, assume it's in percentage format
  
  // Convert weights to decimal if they're in percentage format
  const decimalWeights = isPercentageFormat 
    ? weights.map(w => w / 100)
    : weights;

  const hasScores = scores.some(score => score > 0);

  // Only check weight sum if there are actual scores to calculate
  if (hasScores) {
    const expectedTotal = isPercentageFormat ? 100 : 1;
    if (Math.abs(totalWeight - expectedTotal) > 0.01) {
      return "Sai %";
    }
  }

  // If no scores are entered, return empty string instead of 0
  if (!hasScores) {
    return "";
  }

  // Use the decimal weights for calculation
  const total =
    scores[0] * decimalWeights[0] +
    scores[1] * decimalWeights[1] +
    scores[2] * decimalWeights[2] +
    scores[3] * decimalWeights[3];

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

  // Nếu rỗng → trả rỗng (không mặc định 0)
  if (trimmed === "") return "";

  let num = Number(trimmed);

  if (isNaN(num)) return ""; // không phải số thì trả rỗng
  if (num < 0) num = 0; // không cho âm
  if (num > 10) num = 10; // không cho > 10

  // làm tròn tối đa 2 chữ số thập phân
  return parseFloat(num.toFixed(2)).toString();
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
    const weightVal = Number(subj[weightFields[idx]]) || 0;
    const w = weightVal / 100;

    if (raw.trim() !== "" && !isNaN(score)) {
      currentSum += score * w; // đã có điểm
    } else if (weightVal > 0) {
      missingWeight += w; // chưa nhập
      missingFields.push(f as string);
      missingMinFields.push(minFields[idx] as string);

    }
  });

  if (missingWeight <= 0) return {}; // không có mục trống → không tính được

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