import React from "react";
import type { Semester, Course } from "../../types";
import SemesterBlock from "./SemesterBlock";
import AddSemesterRow from "./AddSemesterRow";
import SummaryRows from "./SummaryRows";

interface GradeTableProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;
  cumulativeExpected: string;
  setCumulativeExpected: (value: string) => void;
  updateSubjectField: (s: number, i: number, f: string, v: string) => void;
  deleteSemester: (id: string) => void;
  deleteSubject: (s: number, i: number) => void;
  openAdvancedModal: (s: number, i: number) => void;

  openMenu: { s: number; i: number } | null;
  setOpenMenu: (val: { s: number; i: number } | null) => void;

  semesterMenuOpen?: number | null;
  setSemesterMenuOpen?: (val: number | null) => void;

  addDropdownOpen: number | null;
  setAddDropdownOpen: (val: number | null) => void;
  addSearchTerm: string;
  setAddSearchTerm: (term: string) => void;
  addSearchResults: { category: string; subjects: Course[] }[];
  addExpandedCategories: Set<string>;
  setAddExpandedCategories: (cats: Set<string>) => void;

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
  cumulativeExpected,
  setCumulativeExpected,
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
  // Handler để cập nhật semesters khi SummaryRows thay đổi điểm kỳ vọng
  const handleApplyExpectedOverall = (updatedSemesters: Semester[]) => {
    setSemesters(updatedSemesters);
  };

  return (
    <table className="grade-table">
      {/* Column definitions */}
      <colgroup>
        <col className="col-stt" />
        <col className="col-mahp" />
        <col className="col-tenhp" />
        <col className="col-tc" />
        <col className="col-score" />
        <col className="col-score" />
        <col className="col-score" />
        <col className="col-score" />
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
        <SummaryRows 
          semesters={semesters}
          cumulativeExpected={cumulativeExpected}
          onApplyExpectedOverall={handleApplyExpectedOverall}
          onSetCumulativeExpected={setCumulativeExpected}
        />
      </tbody>
    </table>
  );
};

export default GradeTable;