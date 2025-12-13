import { useState, useEffect } from "react";
import type { Semester, Subject } from "../types";
import { getSearchResults, normalizeScore } from "../utils/gradeUtils";
import { SUBJECTS_DATA } from "../constants";

const LOCAL_STORAGE_KEY = "grade_app_semesters";
const THEME_KEY = "grade_app_theme";

// Helper to generate unique ID
const generateId = () => `sem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        // Migration: Ensure all semesters have IDs
        return parsed.map((s: Semester) => ({
          ...s,
          id: s.id || generateId()
        }));
      }
    } catch (error) {
      console.error("Error reading from local storage:", error);
    }
    
    // Default initial state
    return [
      {
        id: generateId(),
        name: "Học kỳ 1",
        subjects: [
          {
            maHP: "",
            tenHP: "",
            tinChi: "",
            diemQT: "",
            diemGK: "",
            diemTH: "",
            diemCK: "",
            min_diemQT: "",
            min_diemGK: "",
            min_diemTH: "",
            min_diemCK: "",
            weight_diemQT: "20",
            weight_diemGK: "20",
            weight_diemTH: "20",
            weight_diemCK: "40",
            diemHP: "",
            expectedScore: "",
          },
        ],
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
  // Updated to use ID for precise deletion
  const deleteSemester = (id: string) => {
    setSemesters((prevSemesters) => prevSemesters.filter((s) => s.id !== id));
  };

  // ======================= DELETE SUBJECT =====================
  const deleteSubject = (sIdx: number, subIdx: number) => {
    setSemesters((prev) => 
      prev.map((sem, i) => {
        if (i !== sIdx) return sem;
        return {
          ...sem,
          subjects: sem.subjects.filter((_, idx) => idx !== subIdx)
        };
      })
    );
  };

  // ======================= OPEN POPUP EDIT ====================
  const openAdvancedModal = (s: number, i: number) => {
    // Deep copy for backup
    setBackupSubject(JSON.parse(JSON.stringify(semesters[s].subjects[i])));
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  // ================== UPDATE ANY FIELD ========================
  const updateSubjectField = (sIdx: number, subIdx: number, field: string, value: string) => {
    setSemesters((prev) => 
      prev.map((sem, i) => {
        if (i !== sIdx) return sem;
        
        return {
          ...sem,
          subjects: sem.subjects.map((sub, j) => {
            if (j !== subIdx) return sub;
            
            // Normalize score fields
            const isScoreField = ["diemQT", "diemGK", "diemTH", "diemCK"].includes(field);
            const newValue = isScoreField ? normalizeScore(value) : value;

            return { ...sub, [field]: newValue };
          })
        };
      })
    );
  };

  const [openMenu, setOpenMenu] = useState<{ s: number; i: number } | null>(
    null
  );
  
  // New state for Semester Menu - No longer strictly needed but kept for compatibility
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