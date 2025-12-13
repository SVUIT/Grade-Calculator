import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import { useGradeApp } from "../hooks/useGradeApp";

export default function Home() {
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

  return (
    <div className={theme === 'light' ? 'light-mode' : ''} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div
        className="app-container"
        onClick={() => {
          setOpenMenu(null);
          setSemesterMenuOpen(null);
          setEditDropdownOpen(null);
          setAddDropdownOpen(null);
        }}
      >
        <h1>Bảng điểm</h1>

        {/* TABLE CHÍNH VỚI WRAPPER SCROLL */}
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

        {/* ================== POPUP EDIT ================== */}
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