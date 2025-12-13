import React from "react";
import type { Semester, SubjectData } from "../../types";
import { calcSemesterAverage } from "../../utils/gradeUtils";
import SearchDropdown from "./SearchDropdown";
import SubjectRow from "./SubjectRow";

interface SemesterBlockProps {
  semester: Semester;
  semesterIndex: number;
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;

  // Handlers for subjects
  updateSubjectField: (s: number, i: number, f: string, v: string) => void;
  deleteSemester: (id: string) => void; // Changed to ID
  deleteSubject: (s: number, i: number) => void;
  openAdvancedModal: (s: number, i: number) => void;

  // Menu States (kept for compatibility but unused for semester delete now)
  semesterMenuOpen?: number | null;
  setSemesterMenuOpen?: (val: number | null) => void;

  // Add Dropdown State
  addDropdownOpen: number | null;
  setAddDropdownOpen: (val: number | null) => void;
  addSearchTerm: string;
  setAddSearchTerm: (term: string) => void;
  addSearchResults: { category: string; subjects: SubjectData[] }[];
  addExpandedCategories: Set<string>;
  setAddExpandedCategories: (cats: Set<string>) => void;

  // Passthrough for SubjectRow
  openMenu: { s: number; i: number } | null;
  setOpenMenu: (val: { s: number; i: number } | null) => void;
  editDropdownOpen: { s: number; i: number; field: string } | null;
  setEditDropdownOpen: (
    val: { s: number; i: number; field: string } | null
  ) => void;
  editSearchTerm: string;
  setEditSearchTerm: (term: string) => void;
  editSearchResults: { category: string; subjects: SubjectData[] }[];
  editExpandedCategories: Set<string>;
  setEditExpandedCategories: (cats: Set<string>) => void;
}

const SemesterBlock: React.FC<SemesterBlockProps> = ({
  semester: sem,
  semesterIndex: si,
  semesters,
  setSemesters,
  updateSubjectField,
  deleteSemester,
  deleteSubject,
  openAdvancedModal,
  addDropdownOpen,
  setAddDropdownOpen,
  addSearchTerm,
  setAddSearchTerm,
  addSearchResults,
  addExpandedCategories,
  setAddExpandedCategories,
  openMenu,
  setOpenMenu,
  editDropdownOpen,
  setEditDropdownOpen,
  editSearchTerm,
  setEditSearchTerm,
  editSearchResults,
  editExpandedCategories,
  setEditExpandedCategories,
}) => {
  const avg = calcSemesterAverage(sem.subjects);

  return (
    <React.Fragment>
      {/* HÀNG HỌC KỲ */}
      <tr>
        <td className="semester-bg"></td>
        <td colSpan={9} className="semester-title semester-header-td">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              contentEditable
              suppressContentEditableWarning
              className="editable-cell-multiline"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const newName = e.currentTarget.textContent || "";
                setSemesters((prev) => {
                  const updated = [...prev];
                  if (updated[si]) {
                      updated[si].name = newName;
                  }
                  return updated;
                });
              }}
            >
              {sem.name}
            </span>

            {/* Nút Thêm Môn */}
            <button
              type="button"
              className="btn-header-action btn-add"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAddDropdownOpen(addDropdownOpen === si ? null : si);
              }}
              style={{ position: "relative" }}
            >
              + Thêm môn
              {/* DROPDOWN THÊM MÔN */}
              {addDropdownOpen === si && (
                <SearchDropdown
                  searchTerm={addSearchTerm}
                  setSearchTerm={setAddSearchTerm}
                  searchResults={addSearchResults}
                  expandedCategories={addExpandedCategories}
                  setExpandedCategories={setAddExpandedCategories}
                  minWidth={260} // Explicitly smaller width for compact UI
                  onSelect={(subject: SubjectData) => {
                    setSemesters((prev) => {
                      const updated = JSON.parse(JSON.stringify(prev));
                      if (updated[si]) {
                          updated[si].subjects.push({
                              maHP: subject.code,
                              tenHP: subject.name,
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
                          });
                      }
                      return updated;
                    });
                    setAddDropdownOpen(null);
                    setAddSearchTerm("");
                    setAddExpandedCategories(new Set());
                  }}
                />
              )}
            </button>

            {/* Nút Xóa Học Kỳ (Trực tiếp) */}
            <button
              type="button"
              className="btn-header-action btn-delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sem.id) {
                    deleteSemester(sem.id);
                }
              }}
              title="Xóa học kỳ này"
            >
              Xóa
            </button>
          </div>
        </td>
      </tr>

      {/* MÔN HỌC */}
      {sem.subjects.map((sub, i) => (
        <SubjectRow
          key={i}
          semesterIndex={si}
          subjectIndex={i}
          subject={sub}
          semesters={semesters}
          setSemesters={setSemesters}
          updateSubjectField={updateSubjectField}
          deleteSubject={deleteSubject}
          openAdvancedModal={openAdvancedModal}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          editDropdownOpen={editDropdownOpen}
          setEditDropdownOpen={setEditDropdownOpen}
          editSearchTerm={editSearchTerm}
          setEditSearchTerm={setEditSearchTerm}
          editSearchResults={editSearchResults}
          editExpandedCategories={editExpandedCategories}
          setEditExpandedCategories={setEditExpandedCategories}
        />
      ))}

      {/* TRUNG BÌNH HỌC KỲ */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Trung bình học kỳ</td>
        <td style={{ textAlign: "center" }}>{avg.tc}</td>
        {/* Empty cells for QT, GK, TH, CK to show grid lines */}
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style={{ textAlign: "center" }}>{avg.avg}</td>
        <td></td>
      </tr>
    </React.Fragment>
  );
};

export default SemesterBlock;