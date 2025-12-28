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

  useEffect(() => {
    const saved = localStorage.getItem(CUMULATIVE_KEY);
    if (saved) setCumulativeExpected(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(CUMULATIVE_KEY, cumulativeExpected);
  }, [cumulativeExpected]);

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
          subjects: s.subjects.map((sub: any) => ({
            ...sub,
            id: sub.id || generateId("sub"),
            expectedScore: sub.expectedScore || "",
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

  /* ================= CALCULATION LOGIC (GIỮ NGUYÊN) ================= */
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
      } else {
        flexibleCredits += cred;
        flexibleIndices.push(idx);
      }
    });

    if (flexibleCredits > 0) {
      const avg = Math.max(
        0,
        (targetGPA * totalCredits - lockedPoints) / flexibleCredits
      );
      flexibleIndices.forEach((idx) => {
        subjects[idx].expectedScore = avg.toFixed(2);
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

      if (idx === sIdx || sem.subjects.every(hasAllScores)) {
        sem.subjects.forEach((sub) => {
          locked +=
            (hasAllScores(sub)
              ? Number(calcSubjectScore(sub))
              : Number(sub.expectedScore || 0)) *
            (Number(sub.credits) || 0);
        });
      } else {
        flexCredits += credits;
        flexIdx.push(idx);
      }
    });

    if (flexCredits > 0) {
      const avg = Math.max(
        0,
        (target * totalCredits - locked) / flexCredits
      );
      flexIdx.forEach((idx) => {
        updated[idx].expectedAverage = avg.toFixed(2);
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
      updated[sIdx].subjects[subIdx].expectedScore = value;
      return rebalanceGlobal(updated, sIdx);
    });
  };

  const updateSemesterExpectedAverage = (sIdx: number, value: string) => {
    setSemesters((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[sIdx].expectedAverage = value;
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
