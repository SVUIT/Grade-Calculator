"use client";

import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import Instructions from "../components/Instructions/Instructions";
import { useGradeApp } from "../hooks/useGradeApp";
import { uploadPdf } from "../config/appwrite";
import { Subject, ProcessedPdfData } from "../types";

export type TabType = "grades" | "instructions";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("grades");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const {
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
  } = useGradeApp();

  /* ================== PDF UPLOAD ================== */
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingPdf(true);
    setPdfError(null);

    try {
      const data: ProcessedPdfData = await uploadPdf(file);

      const formattedSemesters = data.semesters.map((sem, semIndex) => ({
        id: `pdf-sem-${Date.now()}-${semIndex}`,
        name: sem.semesterName,
        subjects: sem.courses.map((c, i): Subject => ({
          id: `pdf-sub-${Date.now()}-${i}`,
          courseCode: c.courseCode || "",
          courseName: c.courseNameVi || "",
          credits: c.credits?.toString() || "0",

          progressScore: c.scores?.progressScore?.toString() || "",
          practiceScore: c.scores?.practiceScore?.toString() || "",
          midtermScore: c.scores?.midtermScore?.toString() || "",
          finalScore: c.scores?.finaltermScore?.toString() || "",

          minProgressScore: "0",
          minPracticeScore: "0",
          minMidtermScore: "0",
          minFinalScore: "0",

          progressWeight: "20",
          practiceWeight: "20",
          midtermWeight: "20",
          finalWeight: "40",

          score: c.scores?.totalScore?.toString() || "",
          expectedScore: "",
        })),
      }));

      setSemesters(formattedSemesters);
    } catch (err: any) {
      setPdfError(err.message || "Lỗi khi đọc file PDF");
    } finally {
      setLoadingPdf(false);
      e.target.value = "";
    }
  };
  /* ================================================ */

  return (
    <div className={theme === "light" ? "light-mode" : ""} style={{ minHeight: "100vh" }}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div
        className="app-container"
        onClick={() => {
          setOpenMenu(null);
          setSemesterMenuOpen(null);
          setEditDropdownOpen(null);
          setAddDropdownOpen(null);
        }}
      >
        {activeTab === "grades" ? (
          <>
            <div style={{ marginBottom: "20px" }}>
            {/* Tiêu đề ở giữa */}
            <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
              Bảng điểm
            </h1>

            {/* Nút PDF nằm bên phải, phía dưới */}
            <div className="pdf-import-wrapper">
              <label
                htmlFor="pdf-upload"
                className="pdf-import-btn"
              >
                {loadingPdf ? "Đang xử lý..." : "Nhập điểm từ PDF"}
              </label>

              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                hidden
                disabled={loadingPdf}
                onChange={handlePdfUpload}
              />
            </div>
          </div>

            {pdfError && <p style={{ color: "red" }}>{pdfError}</p>}

            <div className="table-wrapper">
              <GradeTable
                semesters={semesters}
                setSemesters={setSemesters}
                updateSubjectField={updateSubjectField}
                deleteSemester={deleteSemester}
                deleteSubject={deleteSubject}
                openAdvancedModal={openAdvancedModal}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                semesterMenuOpen={semesterMenuOpen}
                setSemesterMenuOpen={setSemesterMenuOpen}
                addDropdownOpen={addDropdownOpen}
                setAddDropdownOpen={setAddDropdownOpen}
                addSearchTerm={addSearchTerm}
                setAddSearchTerm={setAddSearchTerm}
                addSearchResults={addSearchResults}
                addExpandedCategories={addExpandedCategories}
                setAddExpandedCategories={setAddExpandedCategories}
                editDropdownOpen={editDropdownOpen}
                setEditDropdownOpen={setEditDropdownOpen}
                editSearchTerm={editSearchTerm}
                setEditSearchTerm={setEditSearchTerm}
                editSearchResults={editSearchResults}
                editExpandedCategories={editExpandedCategories}
                setEditExpandedCategories={setEditExpandedCategories}
              />
            </div>
          </>
        ) : (
          <Instructions />
        )}

        {modalOpen && editing && (
          <EditModal
            editing={editing}
            semesters={semesters}
            setSemesters={setSemesters}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
              setBackupSubject(null);
            }}
            backupSubject={backupSubject}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
