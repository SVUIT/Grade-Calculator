import React from "react";
import type { Semester, Course } from "../../types";
import SemesterBlock from "./SemesterBlock";
import AddSemesterRow from "./AddSemesterRow";
import SummaryRows from "./SummaryRows";

interface GradeTableProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;
  updateSubjectField: (s: number, i: number, f: string, v: string) => void;
  deleteSemester: (id: string) => void; // Changed from index to ID
  deleteSubject: (s: number, i: number) => void;
  openAdvancedModal: (s: number, i: number) => void;
  
  // Menu & Dropdown State
  openMenu: { s: number; i: number } | null;
  setOpenMenu: (val: { s: number; i: number } | null) => void;
  
  // Semester Menu State
  semesterMenuOpen?: number | null;
  setSemesterMenuOpen?: (val: number | null) => void;

  // Add Dropdown
  addDropdownOpen: number | null;
  setAddDropdownOpen: (val: number | null) => void;
  addSearchTerm: string;
  setAddSearchTerm: (term: string) => void;
  addSearchResults: { category: string; subjects: Course[] }[];
  addExpandedCategories: Set<string>;
  setAddExpandedCategories: (cats: Set<string>) => void;

  // Edit Dropdown
  editDropdownOpen: { s: number; i: number; field: string } | null;
  setEditDropdownOpen: (
    val: { s: number; i: number; field: string } | null
  ) => void;
  editSearchTerm: string;
  setEditSearchTerm: (term: string) => void;
  editSearchResults: { category: string; subjects: Course[] }[];
  editExpandedCategories: Set<string>;
  setEditExpandedCategories: (cats: Set<string>) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({
  semesters,
  setSemesters,
  updateSubjectField,
  deleteSemester,
  deleteSubject,
  openAdvancedModal,
  openMenu,
  setOpenMenu,
  semesterMenuOpen,
  setSemesterMenuOpen,
  addDropdownOpen,
  setAddDropdownOpen,
  addSearchTerm,
  setAddSearchTerm,
  addSearchResults,
  addExpandedCategories,
  setAddExpandedCategories,
  editDropdownOpen,
  setEditDropdownOpen,
  editSearchTerm,
  setEditSearchTerm,
  editSearchResults,
  editExpandedCategories,
  setEditExpandedCategories,
}) => {
  return (
    <table className="grade-table">
      <colgroup>
        <col className="col-stt" />
        <col className="col-mahp" />
        <col className="col-tenhp" />
        <col className="col-tc" />
        <col className="col-score" /> {/* QT */}
        <col className="col-score" /> {/* GK */}
        <col className="col-score" /> {/* TH */}
        <col className="col-score" /> {/* CK */}
        <col className="col-diemhp" />
        <col className="col-expected" />
      </colgroup>
      <thead>
        <tr>
          <th>STT</th>
          <th>Mã HP</th>
          <th>Tên HP</th>
          <th>TC</th>
          <th>QT</th>
          <th>GK</th>
          <th>TH</th>
          <th>CK</th>
          <th>Điểm HP</th>
          <th>Điểm kỳ vọng</th>
        </tr>
      </thead>

      <tbody>
        {semesters.map((sem, si) => (
          <SemesterBlock
            // Use ID for key to ensure React handles deletion correctly
            key={sem.id || `sem-${si}`} 
            semester={sem}
            semesterIndex={si}
            semesters={semesters}
            setSemesters={setSemesters}
            updateSubjectField={updateSubjectField}
            deleteSemester={deleteSemester}
            deleteSubject={deleteSubject}
            openAdvancedModal={openAdvancedModal}
            semesterMenuOpen={semesterMenuOpen}
            setSemesterMenuOpen={setSemesterMenuOpen}
            addDropdownOpen={addDropdownOpen}
            setAddDropdownOpen={setAddDropdownOpen}
            addSearchTerm={addSearchTerm}
            setAddSearchTerm={setAddSearchTerm}
            addSearchResults={addSearchResults}
            addExpandedCategories={addExpandedCategories}
            setAddExpandedCategories={setAddExpandedCategories}
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

        <AddSemesterRow semesters={semesters} setSemesters={setSemesters} />
        <SummaryRows semesters={semesters} />
      </tbody>
    </table>
  );
};

export default GradeTable;