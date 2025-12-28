import { useState, useEffect } from "react";
import { Semester, Subject } from "../types";
import { getSearchResults, normalizeScore, hasAllScores, calcSubjectScore, calcRequiredScores, calcSemesterAverage } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";
const CUMULATIVE_KEY = "grade_app_cumulative";

const generateId = (prefix = "sem") => `${prefix}-${self.crypto.randomUUID()}`;

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
  expectedScore: "", // Sẽ được lưu vào localStorage
});

export const useGradeApp = () => {
  // 1. Theme State & Storage
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as "light" | "dark") || "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  // 2. Cumulative Expected GPA State & Storage
  const [cumulativeExpected, setCumulativeExpected] = useState<string>(() => {
    return localStorage.getItem(CUMULATIVE_KEY) || "";
  });

  useEffect(() => {
    localStorage.setItem(CUMULATIVE_KEY, cumulativeExpected);
  }, [cumulativeExpected]);

  // 3. Semesters Data State & Storage (Includes expectedAverage per semester)
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          id: s.id || generateId("sem"),
          // Giữ lại expectedAverage từ LocalStorage
          expectedAverage: s.expectedAverage || "",
          subjects: s.subjects.map((sub: any) => ({
            ...sub,
            id: sub.id || generateId("sub"),
            // Giữ lại expectedScore từ LocalStorage
            expectedScore: sub.expectedScore || ""
          }))
        }));
      }
    } catch (error) {
      console.error("Error reading from local storage:", error);
    }
    return [
      {
        id: generateId("sem"),
        name: "Học kỳ 1",
        subjects: [createEmptySubject()],
        expectedAverage: "",
      },
    ];
  });

  // Lưu vào localStorage mỗi khi semesters thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(semesters));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  }, [semesters]);

  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ semesterIdx: number; subjectIdx: number } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);

  // Helper Logic
  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => {
      const updated = [...prev];
      if (updated[sIdx]) {
        updated[sIdx] = {
          ...updated[sIdx],
          subjects: updated[sIdx].subjects.filter((_, idx) => idx !== subIdx)
        };
      }
      return updated;
    });
  };

  const openAdvancedModal = (s: number, i: number) => {
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  // Rebalancing Logic
  const distributeToSubjects = (subjects: Subject[], targetGPA: number, skipIdx: number = -1) => {
    const totalCredits = subjects.reduce((a, b) => a + (Number(b.credits) || 0), 0);
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
        lockedPoints += (Number(calcSubjectScore(sub)) || 0) * cred;
      } else {
        flexibleCredits += cred;
        flexibleIndices.push(idx);
      }
    });

    if (flexibleCredits > 0) {
      const totalNeeded = targetGPA * totalCredits;
      const remainingNeeded = totalNeeded - lockedPoints;
      const avgForOthers = Math.max(0, remainingNeeded / flexibleCredits);
      const strVal = avgForOthers.toFixed(2);

      flexibleIndices.forEach(idx => {
        // LƯU expectedScore vào từng môn
        subjects[idx].expectedScore = strVal;
        const req = calcRequiredScores(subjects[idx], avgForOthers);
        Object.assign(subjects[idx], req);
      });
    }
    return subjects;
  };

  const rebalanceGlobal = (updatedSemesters: Semester[], sIdx: number) => {
    if (!cumulativeExpected || cumulativeExpected.trim() === "") return updatedSemesters;

    const globalTarget = Number(cumulativeExpected);
    if (isNaN(globalTarget)) return updatedSemesters;

    let totalAllCredits = 0;
    let lockedPoints = 0;
    let flexibleCredits = 0;
    const flexibleIndices: number[] = [];

    updatedSemesters.forEach((sem, idx) => {
      const semCredits = sem.subjects.reduce((a, b) => a + (Number(b.credits) || 0), 0);
      if (semCredits <= 0) return;
      totalAllCredits += semCredits;

      const isFinished = sem.subjects.every(s => hasAllScores(s));

      if (idx === sIdx || isFinished) {
          let currentSemSum = 0;
          sem.subjects.forEach(sub => {
              const cred = Number(sub.credits) || 0;
              const val = hasAllScores(sub) ? Number(calcSubjectScore(sub)) : (Number(sub.expectedScore) || 0);
              currentSemSum += val * cred;
          });
          lockedPoints += currentSemSum;
      } else {
          flexibleCredits += semCredits;
          flexibleIndices.push(idx);
      }
    });

    if (flexibleCredits > 0) {
      const totalNeeded = globalTarget * totalAllCredits;
      const remaining = totalNeeded - lockedPoints;
      const newAvg = Math.max(0, remaining / flexibleCredits);
      const newAvgStr = newAvg.toFixed(2);

      flexibleIndices.forEach(idx => {
        // LƯU expectedAverage vào từng học kỳ
        updatedSemesters[idx].expectedAverage = newAvgStr;
        updatedSemesters[idx].subjects = distributeToSubjects(updatedSemesters[idx].subjects, newAvg);
      });
    }
    return updatedSemesters;
  };

  // Update Handlers
  const updateSubjectField = (sIdx: number, subIdx: number, field: string, value: string) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[sIdx] || !updated[sIdx].subjects[subIdx]) return prev;

      const isScoreField = ["progressScore", "midtermScore", "practiceScore", "finalScore"].includes(field);
      const newValue = isScoreField ? normalizeScore(value) : value;

      const targetSem = updated[sIdx];
      const targetSub = targetSem.subjects[subIdx];
      targetSub[field] = newValue;
      
      if (isScoreField && targetSub.expectedScore) {
          const req = calcRequiredScores(targetSub, Number(targetSub.expectedScore));
          Object.assign(targetSub, req);
      }

      if (isScoreField && targetSem.expectedAverage && targetSem.expectedAverage.trim() !== "") {
        targetSem.subjects = distributeToSubjects(targetSem.subjects, Number(targetSem.expectedAverage));
      }

      return rebalanceGlobal(updated, sIdx);
    });
  };

  const updateSubjectExpectedScore = (sIdx: number, subIdx: number, value: string) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const semester = updated[sIdx];
      const subject = semester.subjects[subIdx];

      // LƯU expectedScore
      subject.expectedScore = value;
      const num = Number(value);
      if (!isNaN(num) && value.trim() !== "") {
          Object.assign(subject, calcRequiredScores(subject, num));
      }

      if (semester.expectedAverage && semester.expectedAverage.trim() !== "") {
          const target = Number(semester.expectedAverage);
          if (!isNaN(target)) {
              semester.subjects = distributeToSubjects(semester.subjects, target, subIdx);
          }
      } 
      
      return rebalanceGlobal(updated, sIdx);
    });
  };

  const updateSemesterExpectedAverage = (sIdx: number, value: string) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const semester = updated[sIdx];
      
      // LƯU expectedAverage
      semester.expectedAverage = value;
      const target = Number(value);

      if (!isNaN(target) && value.trim() !== "") {
        semester.subjects = distributeToSubjects(semester.subjects, target);
      }

      return rebalanceGlobal(updated, sIdx);
    });
  };

  const applyExpectedAverage = (targetGPA: string, semesterIndex?: number) => {
    if (semesterIndex === undefined) {
      // Áp dụng cho toàn khóa
      setCumulativeExpected(targetGPA);
      const target = Number(targetGPA);
      if (isNaN(target)) return;

      setSemesters((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        let totalAllCredits = 0;
        let lockedPoints = 0;
        let flexibleCredits = 0;
        const flexibleIndices: number[] = [];

        updated.forEach((sem: any, idx: number) => {
          const semCredits = sem.subjects.reduce((a: number, b: any) => a + (Number(b.credits) || 0), 0);
          if (semCredits <= 0) return;
          totalAllCredits += semCredits;

          if (sem.subjects.every((s: any) => hasAllScores(s))) {
            const { avg } = calcSemesterAverage(sem.subjects);
            lockedPoints += Number(avg) * semCredits;
          } else {
            flexibleCredits += semCredits;
            flexibleIndices.push(idx);
          }
        });

        if (flexibleCredits > 0) {
          const totalNeeded = target * totalAllCredits;
          const remaining = totalNeeded - lockedPoints;
          const newAvg = Math.max(0, remaining / flexibleCredits);
          flexibleIndices.forEach(idx => {
            // LƯU expectedAverage cho từng học kỳ linh hoạt
            updated[idx].expectedAverage = newAvg.toFixed(2);
            updated[idx].subjects = distributeToSubjects(updated[idx].subjects, newAvg);
          });
        }
        return updated;
      });
    } else {
      // Áp dụng cho 1 học kỳ cụ thể
      updateSemesterExpectedAverage(semesterIndex, targetGPA);
    }
  };

  // Callback để SummaryRows cập nhật
  const handleApplyExpectedOverall = (updatedSemesters: Semester[]) => {
    setSemesters(updatedSemesters);
  };

  // Search Logic
  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(null);
  const [semesterMenuOpen, setSemesterMenuOpen] = useState<number | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState<number | null>(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [addExpandedCategories, setAddExpandedCategories] = useState<Set<string>>(new Set());
  const [editDropdownOpen, setEditDropdownOpen] = useState<{ s: number; i: number; field: string } | null>(null);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editExpandedCategories, setEditExpandedCategories] = useState<Set<string>>(new Set());

  const addSearchResults = getSearchResults(addSearchTerm, SUBJECTS_DATA);
  const editSearchResults = getSearchResults(editSearchTerm, SUBJECTS_DATA);

  return {
    theme, toggleTheme, semesters, setSemesters, cumulativeExpected, setCumulativeExpected,
    updateSubjectExpectedScore, updateSemesterExpectedAverage, modalOpen, setModalOpen,
    editing, setEditing, backupSubject, setBackupSubject, deleteSemester, deleteSubject,
    openAdvancedModal, updateSubjectField, applyExpectedAverage, openMenu, setOpenMenu,
    semesterMenuOpen, setSemesterMenuOpen, addDropdownOpen, setAddDropdownOpen,
    addSearchTerm, setAddSearchTerm, addExpandedCategories, setAddExpandedCategories,
    editDropdownOpen, setEditDropdownOpen, editSearchTerm, setEditSearchTerm,
    editExpandedCategories, setEditExpandedCategories, addSearchResults, editSearchResults,
    handleApplyExpectedOverall, // Export callback mới
  };
};