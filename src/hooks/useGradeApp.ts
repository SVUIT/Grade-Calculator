import { useState, useEffect } from "react";
import type { Semester, Subject } from "../types/index";
import { getSearchResults, normalizeScore } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";

// Helper to generate unique ID
const generateId = (prefix = "sem") => `${prefix}-${self.crypto.randomUUID()}`;

// Default empty subject based on new schema
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
  // Theme State
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

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Simple migration check: if data uses old key 'maHP', map it to new schema
        return parsed.map((s: any) => ({
          ...s,
          id: s.id || generateId("sem"),
          subjects: s.subjects.map((sub: any) => {
            if (sub.maHP !== undefined) {
              // Map old structure to new structure
              return {
                id: sub.id || generateId("sub"),
                courseCode: sub.maHP,
                courseName: sub.tenHP,
                credits: sub.tinChi,
                progressScore: sub.diemQT,
                midtermScore: sub.diemGK,
                practiceScore: sub.diemTH,
                finalScore: sub.diemCK,
                minProgressScore: sub.min_diemQT || "",
                minMidtermScore: sub.min_diemGK || "",
                minPracticeScore: sub.min_diemTH || "",
                minFinalScore: sub.min_diemCK || "",
                progressWeight: sub.weight_diemQT || "20",
                midtermWeight: sub.weight_diemGK || "20",
                practiceWeight: sub.weight_diemTH || "20",
                finalWeight: sub.weight_diemCK || "40",
                score: sub.diemHP,
                expectedScore: sub.expectedScore
              };
            }
            return {
               ...sub,
               id: sub.id || generateId("sub")
            };
          })
        }));
      }
    } catch (error) {
      console.error("Error reading from local storage:", error);
    }
    
    // Default initial state
    return [
      {
        id: generateId("sem"),
        name: "Học kỳ 1",
        subjects: [createEmptySubject()],
      },
    ];
  });

  // Save to local storage whenever semesters changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{
    semesterIdx: number;
    subjectIdx: number;
  } | null>(null);
  const [backupSubject, setBackupSubject] = useState<Subject | null>(null);

  // ======================= DELETE SEMESTER ====================
  const deleteSemester = (id: string) => {
    setSemesters((prevSemesters) => prevSemesters.filter((s) => s.id !== id));
  };

  // ======================= DELETE SUBJECT =====================
  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => {
      const updatedSemesters = [...prev];
      const targetSemester = updatedSemesters[sIdx];
      
      if (targetSemester) {
        // Create a new subjects array excluding the one at subIdx
        const updatedSubjects = targetSemester.subjects.filter((_, idx) => idx !== subIdx);
        
        updatedSemesters[sIdx] = {
          ...targetSemester,
          subjects: updatedSubjects
        };
      }
      
      return updatedSemesters;
    });
  };

  // ======================= OPEN POPUP EDIT ====================
  const openAdvancedModal = (s: number, i: number) => {
    // Deep copy for backup
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  // ================== UPDATE ANY FIELD ========================
  const updateSubjectField = (
    sIdx: number,
    subIdx: number,
    field: string,
    value: string
  ) => {
    setSemesters((prev) => {
      // Clone the semesters array
      const updatedSemesters = [...prev];
      const targetSemester = updatedSemesters[sIdx];
      if (!targetSemester) return prev;

      // Clone the subjects array for the target semester
      const updatedSubjects = [...targetSemester.subjects];
      const targetSubject = updatedSubjects[subIdx];
      if (!targetSubject) return prev;

      // Logic for score normalization
      const isScoreField = ["progressScore", "midtermScore", "practiceScore", "finalScore"].includes(field);
      const newValue = isScoreField ? normalizeScore(value) : value;

      // Update the specific subject
      updatedSubjects[subIdx] = {
        ...targetSubject,
        [field]: newValue,
      };

      // Update the semester with the new subjects array
      updatedSemesters[sIdx] = {
        ...targetSemester,
        subjects: updatedSubjects,
      };

      return updatedSemesters;
    });
  };

  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(
    null
  );
  
  const [semesterMenuOpen, setSemesterMenuOpen] = useState<number | null>(null);

  const [addDropdownOpen, setAddDropdownOpen] = useState<number | null>(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [addExpandedCategories, setAddExpandedCategories] = useState<
    Set<string>
  >(new Set());
  const [editDropdownOpen, setEditDropdownOpen] = useState<{
    s: number;
    i: number;
    field: string;
  } | null>(null);
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editExpandedCategories, setEditExpandedCategories] = useState<
    Set<string>
  >(new Set());

  const addSearchResults = getSearchResults(addSearchTerm, SUBJECTS_DATA);
  const editSearchResults = getSearchResults(editSearchTerm, SUBJECTS_DATA);

  return {
    theme,
    toggleTheme,
    semesters,
    setSemesters,
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
    addSearchResults,
    editSearchResults,
  };
};
