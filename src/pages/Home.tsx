"use client";

import { useState } from "react";
import XlsxPopulate from "xlsx-populate/browser/xlsx-populate";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import Instructions from "../components/Instructions/Instructions";
import { useGradeApp } from "../hooks/useGradeApp";
import { uploadPdf } from "../config/appwrite";
import { Subject, ProcessedPdfData, findCourseByCode, Semester } from "../types";
import { SUBJECTS_DATA } from "../constants";

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

  const exportToExcel = async (semesters: Semester[]) => {
    try {
      const workbook = await XlsxPopulate.fromBlankAsync();

      semesters.forEach((semester, sIndex) => {
        const safeName =
          semester.name?.replace(/[\\/?*[\]:]/g, "_").slice(0, 31) ||
          `Semester_${sIndex + 1}`;
        const sheet =
          sIndex === 0
            ? workbook.sheet(0).name(safeName)
            : workbook.addSheet(safeName);

        const headers = [
          "STT",
          "Mã HP",
          "Tên HP",
          "TC",
          "QT",
          "GK",
          "TH",
          "CK",
          "Điểm HP",
          "Điểm kỳ vọng",
        ];

        // Write semester name
        sheet.cell("A1").value(semester.name);
        
        // Write headers in row 2, each in its own cell
        headers.forEach((header, colIndex) => {
          sheet.cell(2, colIndex + 1).value(header);
        });

        semester.subjects.forEach((subject: Subject, idx: number) => {
          sheet.cell(`A${idx + 3}`).value(idx + 1);
          sheet.cell(`B${idx + 3}`).value(subject.courseCode);
          sheet.cell(`C${idx + 3}`).value(subject.courseName);
          sheet.cell(`D${idx + 3}`).value(subject.credits);
          sheet.cell(`E${idx + 3}`).value(subject.progressScore || "");
          sheet.cell(`F${idx + 3}`).value(subject.midtermScore || "");
          sheet.cell(`G${idx + 3}`).value(subject.practiceScore || "");
          sheet.cell(`H${idx + 3}`).value(subject.finalScore || "");
          sheet.cell(`I${idx + 3}`).value(subject.score || "");
          sheet.cell(`J${idx + 3}`).value(subject.expectedScore || "");
        });

        // Style the header row
        sheet.row(2).style({ bold: true, fill: "bfbfbf" });
        
        // Set column widths
        sheet.column("A").width(5);
        sheet.column("B").width(15);  // Mã HP
        sheet.column("C").width(40);  // Tên HP
        sheet.column("D").width(5);   // TC
        sheet.column("E").width(8);   // QT
        sheet.column("F").width(8);   // GK
        sheet.column("G").width(8);   // TH
        sheet.column("H").width(8);   // CK
        sheet.column("I").width(12);  // Điểm HP
        sheet.column("J").width(15);  // Điểm kỳ vọng
        sheet.column("B").width(10);
        sheet.column("C").width(40);
        sheet.column("D").width(5);
        sheet.column("E").width(5);
        sheet.column("F").width(5);
        sheet.column("G").width(5);
        sheet.column("H").width(5);
        sheet.column("I").width(10);
        sheet.column("J").width(15);
      });

      const blob = await workbook.outputAsync();
      const fileName = `bang-diem-${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      alert("Đã xảy ra lỗi khi xuất file Excel. Vui lòng thử lại.");
    }
  };
  /* ================== PDF UPLOAD ================== */
  // Flatten all courses for lookup
  const getAllCourses = () => {
    return Object.values(SUBJECTS_DATA).flat();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingPdf(true);
    setPdfError(null);

    try {
      const data: ProcessedPdfData = await uploadPdf(file);
      const allCourses = getAllCourses();

      const formattedSemesters = data.semesters.map((sem, semIndex) => {
        return {
          id: `pdf-sem-${Date.now()}-${semIndex}`,
          name: sem.semesterName,
          subjects: sem.courses.map((c, i): Subject => {
            // Find course in our database to get default weights
            const courseData = findCourseByCode(c.courseCode, allCourses);
            const defaultWeights = courseData?.defaultWeights || {
              progressWeight: 0.2,
              practiceWeight: 0.2,
              midtermWeight: 0.2,
              finalTermWeight: 0.4
            };

            return {
              id: `pdf-sub-${Date.now()}-${i}`,
              courseCode: c.courseCode || "",
              courseName: c.courseNameVi || courseData?.courseNameVi || "",
              credits: (c.credits || courseData?.credits || 0).toString(),

              // Set scores from PDF
              progressScore: c.scores?.progressScore?.toString() || "",
              practiceScore: c.scores?.practiceScore?.toString() || "",
              midtermScore: c.scores?.midtermScore?.toString() || "",
              finalScore: c.scores?.finaltermScore?.toString() || "",

              // Set weights from course data or use defaults
              progressWeight: (defaultWeights.progressWeight * 100).toString(),
              practiceWeight: (defaultWeights.practiceWeight * 100).toString(),
              midtermWeight: (defaultWeights.midtermWeight * 100).toString(),
              finalWeight: (defaultWeights.finalTermWeight * 100).toString(),

              // Set total score if available
              score: c.scores?.totalScore?.toString() || "",
              expectedScore: "",
            };
          }),
        };
      });

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
            <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', alignItems: 'center' }}>
              <div className="pdf-import-wrapper">
                <label
                  htmlFor="pdf-upload"
                  className="pdf-import-btn"
                  style={{
                    padding: '10px 10px',
                    height: '40px',
                    minWidth: '160px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
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
              
              <button 
                onClick={() => exportToExcel(semesters)}
                className="export-excel-btn"
                style={{
                  padding: '10px 10px',
                  height: '40px',
                  minWidth: '160px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Xuất Excel
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
