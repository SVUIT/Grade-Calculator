import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import { useGradeApp } from "../hooks/useGradeApp";
import { parseGradesFromPDF } from "../utils/pdfParser";

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

  const handleImportPDF = async (file: File): Promise<void> => {
    if (!file) {
      console.error('No file selected');
      alert('Vui lòng chọn file PDF');
      return;
    }

    console.log('File selected:', file);
    console.log('File size (bytes):', file.size);
    console.log('File type:', file.type);

    if (file.size === 0) {
      console.error('File is empty');
      alert('File trống. Vui lòng chọn file khác.');
      return;
    }

    try {
      console.log('Starting PDF parsing...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('File array buffer size (bytes):', arrayBuffer.byteLength);
      
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log('Uint8Array length:', uint8Array.length);
      
      const newSemesters = await parseGradesFromPDF(uint8Array);
      console.log('Parsed semesters:', newSemesters);
      
      if (!newSemesters || newSemesters.length === 0) {
        console.warn('No semesters found in the PDF. File content might be in an unexpected format.');
        alert('Không tìm thấy dữ liệu điểm trong file PDF. Vui lòng kiểm tra lại định dạng file.');
        return;
      }

      setSemesters(prevSemesters => {
        console.log('Previous semesters:', prevSemesters);
        const updatedSemesters = [...prevSemesters];
    
        newSemesters.forEach(newSemester => {
          const existingIndex = updatedSemesters.findIndex(s => s.name === newSemester.name);
          
          if (existingIndex >= 0) {
            const existingSemester = updatedSemesters[existingIndex];
            const existingSubjectCodes = new Set(existingSemester.subjects.map(s => s.maHP));
            
            const newSubjects = newSemester.subjects.filter(
              subject => !existingSubjectCodes.has(subject.maHP)
            );
            
            console.log(`Merging ${newSubjects.length} new subjects into existing semester: ${newSemester.name}`);
            updatedSemesters[existingIndex] = {
              ...existingSemester,
              subjects: [...existingSemester.subjects, ...newSubjects]
            };
          } else {
            console.log(`Adding new semester: ${newSemester.name} with ${newSemester.subjects.length} subjects`);
            updatedSemesters.push({
              ...newSemester,
              id: crypto.randomUUID(),
              subjects: newSemester.subjects.map(subject => ({
                ...subject,
                min_diemQT: '0',
                min_diemGK: '0',
                min_diemTH: '0',
                min_diemCK: '0',
                weight_diemQT: '0.2',
                weight_diemGK: '0.2',
                weight_diemTH: '0.2',
                weight_diemCK: '0.4',
                expectedScore: '0',
              }))
            });
          }
        });
        
        console.log('Updated semesters:', updatedSemesters);
        return updatedSemesters;
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Có lỗi xảy ra khi xử lý file PDF. Vui lòng thử lại.');
    }
  };

  return (
    <div className={theme === 'light' ? 'light-mode' : ''} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onImportPDF={(file: File) => handleImportPDF(file).catch(console.error)} 
      />

      <div
        className="app-container"
        onClick={() => {
          setOpenMenu?.(null);
          setSemesterMenuOpen?.(null);
          setEditDropdownOpen?.(null);
          setAddDropdownOpen?.(null);
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