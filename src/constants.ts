import courses from "./assets/courses_weighted.json";
import type { Course } from "./types";

const CATEGORY_MAP: Record<string, string> = {
  "ĐC": "Đại cương",
  "CSNN": "Cơ sở nhóm ngành (CSNN)",
  "CSN": "Cơ sở ngành (CSN)",
  "CN": "Chuyên ngành (CN/CNTC)",
  "CNTC": "Chuyên ngành (CN/CNTC)",
  "TN": "Khác (Tự chọn/CĐTN/TN)",
  "CĐTN": "Khác (Tự chọn/CĐTN/TN)",
};

export const SUBJECTS_DATA = (courses as Course[]).reduce((acc, course) => {
  const cat = CATEGORY_MAP[course.courseType] || "Khác (Tự chọn/CĐTN/TN)";
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(course);
  return acc;
}, {} as Record<string, Course[]>);
