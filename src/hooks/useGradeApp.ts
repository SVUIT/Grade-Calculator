import { useState, useEffect } from "react";
import { Semester, Subject } from "../types";
import {
  getSearchResults,
  normalizeScore,
  hasAllScores,
  calcSubjectScore,
  calcRequiredScores,
} from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";
const CUMULATIVE_KEY = "grade_app_cumulative";
const CUMULATIVE_MANUAL_KEY = "grade_app_cumulative_manual";

const generateId = (prefix = "sem") =>
  `${prefix}-${crypto.randomUUID()}`; 

const createEmptySubject = (): Subject => ({
  id: generateId("sub"),
  courseCode: "",
  courseName: "",
  credits: "",
  progressScore: "",
  midtermScore: "",
  practiceScore: "",
  finalScore: "",
  minProgressScore: "",
  minMidtermScore: "",
  minPracticeScore: "",
  minFinalScore: "",
  progressWeight: "20",
  midtermWeight: "20",
  practiceWeight: "20",
  finalWeight: "40",
  score: "",
  expectedScore: "",
  isExpectedManual: false,
});

export const useGradeApp = () => {
  /* ================= THEME ================= */
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const toggleTheme = () =>
    setTheme((p) => (p === "dark" ? "light" : "dark"));

  /* ================= CUMULATIVE GPA ================= */
  const [cumulativeExpected, setCumulativeExpected] = useState("");
  const [isCumulativeManual, setIsCumulativeManual] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CUMULATIVE_KEY);
    const savedManual = localStorage.getItem(CUMULATIVE_MANUAL_KEY);
    if (saved) setCumulativeExpected(saved);
    if (savedManual) setIsCumulativeManual(savedManual === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(CUMULATIVE_KEY, cumulativeExpected);
    localStorage.setItem(CUMULATIVE_MANUAL_KEY, isCumulativeManual.toString());
  }, [cumulativeExpected, isCumulativeManual]);

  /* ================= SEMESTERS ================= */
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSemesters(
        parsed.map((s: any) => ({
          ...s,
          id: s.id || generateId("sem"),
          expectedAverage: s.expectedAverage || "",
          isExpectedAverageManual: s.isExpectedAverageManual || false,
          subjects: s.subjects.map((sub: any) => ({
            ...sub,
            id: sub.id || generateId("sub"),
            expectedScore: sub.expectedScore || "",
            isExpectedManual: sub.isExpectedManual || false,
          })),
        }))
      );
    } else {
      setSemesters([
        {
          id: generateId("sem"),
          name: "Học kỳ 1",
          subjects: [createEmptySubject()],
          expectedAverage: "",
          isExpectedAverageManual: false,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (semesters.length > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(semesters)
      );
    }
  }, [semesters]);

  /* ================= UI ================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<{ semesterIdx: number; subjectIdx: number } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);

  /* ================= HELPERS ================= */
  const deleteSemester = (id: string) =>
    setSemesters((p) => p.filter((s) => s.id !== id));

  const deleteSubject = (sIdx: number, subIdx: number) =>
    setSemesters((p) => {
      const copy = [...p];
      copy[sIdx].subjects.splice(subIdx, 1);
      return copy;
    });

  const openAdvancedModal = (s: number, i: number) => {
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  /* ================= CALCULATION LOGIC ================= */
  const distributeToSubjects = (
    subjects: Subject[],
    targetGPA: number,
    skipIdx: number = -1
  ) => {
    const totalCredits = subjects.reduce(
      (a, b) => a + (Number(b.credits) || 0),
      0
    );
    if (totalCredits === 0) return subjects;

    let lockedPoints = 0;
    let flexibleCredits = 0;
    const flexibleIndices: number[] = [];

    subjects.forEach((sub, idx) => {
      const cred = Number(sub.credits) || 0;
      if (cred <= 0) return;

      if (idx === skipIdx) {
        lockedPoints += (Number(sub.expectedScore) || 0) * cred;
      } else if (hasAllScores(sub)) {
        lockedPoints += Number(calcSubjectScore(sub)) * cred;
      } else if (sub.isExpectedManual && sub.expectedScore) {
        lockedPoints += Number(sub.expectedScore) * cred;
      } else {
        flexibleCredits += cred;
        flexibleIndices.push(idx);
      }
    });

    if (flexibleCredits > 0) {
      const avg = Math.max(
        0,
        Math.min(10, (targetGPA * totalCredits - lockedPoints) / flexibleCredits)
      );
      flexibleIndices.forEach((idx) => {
        subjects[idx].expectedScore = avg.toFixed(2);
        subjects[idx].isExpectedManual = false;
        Object.assign(subjects[idx], calcRequiredScores(subjects[idx], avg));
      });
    }
    return subjects;
  };

  const rebalanceGlobal = (updated: Semester[], sIdx: number) => {
    if (!cumulativeExpected) return updated;
    const target = Number(cumulativeExpected);
    if (isNaN(target)) return updated;

    let totalCredits = 0;
    let locked = 0;
    let flexCredits = 0;
    const flexIdx: number[] = [];

    updated.forEach((sem, idx) => {
      const credits = sem.subjects.reduce(
        (a, b) => a + (Number(b.credits) || 0),
        0
      );
      if (!credits) return;
      totalCredits += credits;

      let semLocked = 0;
      let semFlexCredits = 0;
      let hasFlexible = false;

      sem.subjects.forEach((sub) => {
        const cred = Number(sub.credits) || 0;
        if (hasAllScores(sub)) {
          semLocked += Number(calcSubjectScore(sub)) * cred;
        } else if (sub.isExpectedManual && sub.expectedScore) {
          semLocked += Number(sub.expectedScore) * cred;
        } else {
          semFlexCredits += cred;
          hasFlexible = true;
        }
      });

      if (idx === sIdx || !hasFlexible) {
        locked += semLocked + (sem.expectedAverage && hasFlexible ? Number(sem.expectedAverage) * semFlexCredits : 0);
      } else if (sem.isExpectedAverageManual && sem.expectedAverage) {
        locked += semLocked + Number(sem.expectedAverage) * semFlexCredits;
      } else {
        locked += semLocked;
        flexCredits += semFlexCredits;
        flexIdx.push(idx);
      }
    });

    if (flexCredits > 0) {
      const avg = Math.max(
        0,
        Math.min(10, (target * totalCredits - locked) / flexCredits)
      );
      flexIdx.forEach((idx) => {
        updated[idx].expectedAverage = avg.toFixed(2);
        updated[idx].isExpectedAverageManual = false;
        updated[idx].subjects = distributeToSubjects(
          updated[idx].subjects,
          avg
        );
      });
    }
    return updated;
  };

  /* ================= UPDATE HANDLERS ================= */
  const updateSubjectField = (
    sIdx: number,
    subIdx: number,
    field: string,
    value: string
  ) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const sub = updated[sIdx].subjects[subIdx];
      sub[field] =
        ["progressScore", "midtermScore", "practiceScore", "finalScore"].includes(
          field
        )
          ? normalizeScore(value)
          : value;
      return rebalanceGlobal(updated, sIdx);
    });
  };

  const updateSubjectExpectedScore = (
    sIdx: number,
    subIdx: number,
    value: string
  ) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const sub = updated[sIdx].subjects[subIdx];
      
      if (value === "") {
        // Người dùng xóa điểm kỳ vọng
        sub.expectedScore = "";
        sub.isExpectedManual = false;
      } else {
        // Người dùng nhập điểm kỳ vọng
        const expectedVal = Number(value);
        if (!isNaN(expectedVal) && expectedVal >= 0 && expectedVal <= 10) {
          sub.expectedScore = value;
          sub.isExpectedManual = true;
          
          // Tính toán điểm yêu cầu cho môn này
          const required = calcRequiredScores(sub, expectedVal);
          Object.entries(required).forEach(([field, val]) => {
            (sub as any)[field] = val;
          });
        }
      }
      
      // Tính toán lại điểm trung bình kỳ vọng học kỳ
      // Dựa trên các môn đã có điểm kỳ vọng
      let totalCredits = 0;
      let lockedCredits = 0;
      let lockedPoints = 0;
      
      updated[sIdx].subjects.forEach((s: any) => {
        const credits = Number(s.credits) || 0;
        totalCredits += credits;
        
        const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
          const v = (s as any)[f];
          return v !== undefined && v.toString().trim() !== "";
        });
        
        if (hasAll) {
          lockedCredits += credits;
          lockedPoints += Number(calcSubjectScore(s)) * credits;
        } else if (s.isExpectedManual && s.expectedScore) {
          lockedCredits += credits;
          lockedPoints += Number(s.expectedScore) * credits;
        }
      });
      
      // Cập nhật điểm trung bình kỳ vọng học kỳ nếu chưa được người dùng nhập
      if (!updated[sIdx].isExpectedAverageManual && totalCredits > 0) {
        if (lockedCredits === totalCredits) {
          // Tất cả môn đều có điểm
          updated[sIdx].expectedAverage = (lockedPoints / totalCredits).toFixed(2);
        } else if (lockedCredits > 0) {
          // Có một số môn đã có điểm, tính trung bình tạm
          updated[sIdx].expectedAverage = (lockedPoints / totalCredits).toFixed(2);
        }
      }
      
      return rebalanceGlobal(updated, sIdx);
    });
  };

  const updateSemesterExpectedAverage = (sIdx: number, value: string) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      
      if (value === "") {
        updated[sIdx].expectedAverage = "";
        updated[sIdx].isExpectedAverageManual = false;
        updated[sIdx].subjects.forEach((sub: any) => {
          if (!sub.isExpectedManual) {
            sub.expectedScore = "";
          }
        });
      } else {
        const targetAvg = Number(value);
        if (!isNaN(targetAvg) && targetAvg >= 0 && targetAvg <= 10) {
          updated[sIdx].expectedAverage = value;
          updated[sIdx].isExpectedAverageManual = true;
          
          let totalCredits = 0;
          let lockedCredits = 0;
          let lockedPoints = 0;
          
          updated[sIdx].subjects.forEach((sub: any) => {
            const credits = Number(sub.credits) || 0;
            totalCredits += credits;
            
            const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
              const v = (sub as any)[f];
              return v !== undefined && v.toString().trim() !== "";
            });
            
            if (hasAll) {
              lockedCredits += credits;
              lockedPoints += Number(calcSubjectScore(sub)) * credits;
            } else if (sub.isExpectedManual && sub.expectedScore) {
              lockedCredits += credits;
              lockedPoints += Number(sub.expectedScore) * credits;
            }
          });
          
          const remainingCredits = totalCredits - lockedCredits;
          if (remainingCredits > 0) {
            const requiredAvg = Math.max(0, Math.min(10, (targetAvg * totalCredits - lockedPoints) / remainingCredits));
            
            updated[sIdx].subjects.forEach((sub: any) => {
              const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                const v = (sub as any)[f];
                return v !== undefined && v.toString().trim() !== "";
              });
              
              if (!hasAll && !sub.isExpectedManual) {
                sub.expectedScore = requiredAvg.toFixed(2);
                const required = calcRequiredScores(sub, requiredAvg);
                Object.entries(required).forEach(([field, val]) => {
                  (sub as any)[field] = val;
                });
              }
            });
          }
        }
      }
      
      return rebalanceGlobal(updated, sIdx);
    });
  };

  const applyExpectedAverage = (value: string, idx?: number) => {
    idx === undefined
      ? setCumulativeExpected(value)
      : updateSemesterExpectedAverage(idx, value);
  };

  /* ================= SEARCH ================= */
  const [openMenu, setOpenMenu] =
    useState<{ s: number; i: number } | null>(null);
  const [semesterMenuOpen, setSemesterMenuOpen] = useState<number | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState<number | null>(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [addExpandedCategories, setAddExpandedCategories] =
    useState<Set<string>>(new Set());
  const [editDropdownOpen, setEditDropdownOpen] =
    useState<{ s: number; i: number; field: string } | null>(null);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editExpandedCategories, setEditExpandedCategories] =
    useState<Set<string>>(new Set());

  return {
    theme,
    toggleTheme,
    semesters,
    setSemesters,
    cumulativeExpected,
    setCumulativeExpected,
    isCumulativeManual,
    setIsCumulativeManual,
    updateSubjectExpectedScore,
    updateSemesterExpectedAverage,
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    backupSubject,
    setBackupSubject,
    deleteSemester,
    deleteSubject,
    openAdvancedModal,
    updateSubjectField,
    applyExpectedAverage,
    openMenu,
    setOpenMenu,
    semesterMenuOpen,
    setSemesterMenuOpen,
    addDropdownOpen,
    setAddDropdownOpen,
    addSearchTerm,
    setAddSearchTerm,
    addExpandedCategories,
    setAddExpandedCategories,
    editDropdownOpen,
    setEditDropdownOpen,
    editSearchTerm,
    setEditSearchTerm,
    editExpandedCategories,
    setEditExpandedCategories,
    addSearchResults: getSearchResults(addSearchTerm, SUBJECTS_DATA),
    editSearchResults: getSearchResults(editSearchTerm, SUBJECTS_DATA),
  };
};