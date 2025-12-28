"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import Instructions from "../components/Instructions/Instructions";
import { useGradeApp } from "../hooks/useGradeApp";
import { uploadPdf } from "../config/appwrite";
import { Subject, ProcessedPdfData, Semester } from "../types";

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
          minProgressScore: "",
          minPracticeScore: "",
          minMidtermScore: "",
          minFinalScore: "",
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

  const exportToExcel = (semesters: Semester[]) => {
    try {
      const wb = XLSX.utils.book_new();

      semesters.forEach((semester) => {
        const data = [
          [semester.name],
          ['STT', 'Mã HP', 'Tên HP', 'TC', 'QT', 'GK', 'TH', 'CK', 'Điểm HP', 'Điểm kỳ vọng'],
          ...semester.subjects.map((subject, idx) => [
            idx + 1,
            subject.courseCode,
            subject.courseName,
            subject.credits,
            subject.progressScore || '',
            subject.midtermScore || '',
            subject.practiceScore || '',
            subject.finalScore || '',
            subject.score || '',
            subject.expectedScore || '',
          ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
          { wch: 5 },
          { wch: 10 },
          { wch: 40 },
          { wch: 5 },
          { wch: 5 },
          { wch: 5 },
          { wch: 5 },
          { wch: 5 },
          { wch: 10 },
          { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, semester.name.slice(0, 31));
      });

      const fileName = `bang-diem-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Lỗi khi xuất file Excel:', error);
      alert('Đã xảy ra lỗi khi xuất file Excel. Vui lòng thử lại.');
    }
  };

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
              <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
                Bảng điểm
              </h1>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                <div className="pdf-import-wrapper">
                  <label htmlFor="pdf-upload" className="pdf-import-btn">
                    {loadingPdf ? "Đang xử lý..." : "Nhập từ PDF"}
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

                <button
                  onClick={() => exportToExcel(semesters)}
                  className="pdf-import-btn"
                  style={{
                    backgroundColor: '#2e7d32',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <span>Xuất Excel</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
                  </svg>
                </button>
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
