import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EditModal from "../components/GradeTable/EditModal";
import GradeTable from "../components/GradeTable/GradeTable";
import { useGradeApp } from "../hooks/useGradeApp";
import { uploadPdf } from "../config/appwrite";
import { useState } from "react";
import type { Subject } from "../types";
import GraduationCheck from "../components/GraduationCheck/GraduationCheck";

// Type definitions for PDF processing
interface CourseScores {
  progressScore?: number;
  midtermScore?: number;
  practiceScore?: number;
  finaltermScore?: number;
  totalScore?: number;
}

interface Course {
  courseCode: string;
  courseNameVi: string;
  credits: number;
  scores: CourseScores;
}

interface SemesterData {
  semesterName: string;
  courses: Course[];
}

interface ProcessedPdfData {
  semesters: SemesterData[];
  courseCode?: string;
  courseNameVi?: string;
  credits?: number;
  scores?: CourseScores;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Helper function to process PDF file using Appwrite Cloud Function
  const processPdfFile = async (file: File): Promise<ProcessedPdfData> => {
    try {
      // Use the uploadPdf function from appwrite config
      const response = await uploadPdf(file);
      
      // The response should match the ProcessedPdfData interface
      if (response && response.semesters) {
        return response as ProcessedPdfData;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error uploading/processing PDF:', error);
      // Return a default structure if processing fails
      return {
        semesters: [{
          semesterName: 'Học kỳ 1',
          courses: []
        }]
      };
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Upload and process the PDF file using the API endpoint
      const responseData = await uploadPdf(file);
      
      // If the response doesn't contain semesters, try processing locally
      if (!responseData.semesters) {
        const localProcessed = await processPdfFile(file);
        if (localProcessed?.semesters) {
          responseData.semesters = localProcessed.semesters;
        } else {
          throw new Error('Không thể đọc dữ liệu từ file PDF');
        }
      }

      // Transform the parsed data to match our expected format
      const formattedSemesters = responseData.semesters.map((semester: SemesterData, semIndex: number) => ({
        id: `sem-${Date.now()}-${semIndex}`,
        name: String(semester.semesterName || `Học kỳ ${semIndex + 1}`).trim(),
        subjects: semester.courses ? semester.courses.map((course: Course, index: number) => {
          const scores = course.scores || {};
          return {
            id: `subj-${Date.now()}-${semIndex}-${index}`,
            courseCode: String(course.courseCode || '').trim(),
            courseName: String(course.courseNameVi || '').trim(),
            credits: course.credits?.toString() || '0',
            progressScore: scores.progressScore !== null && scores.progressScore !== undefined ? String(scores.progressScore) : '',
            midtermScore: scores.midtermScore !== null && scores.midtermScore !== undefined ? String(scores.midtermScore) : '',
            practiceScore: scores.practiceScore !== null && scores.practiceScore !== undefined ? String(scores.practiceScore) : '',
            finalScore: scores.finaltermScore !== null && scores.finaltermScore !== undefined ? String(scores.finaltermScore) : '',
            minProgressScore: '0',
            minMidtermScore: '0',
            minPracticeScore: '0',
            minFinalScore: '0',
            progressWeight: '20',
            midtermWeight: '20',
            practiceWeight: '20',
            finalWeight: '40',
            score: scores.totalScore !== null && scores.totalScore !== undefined ? String(scores.totalScore) : '',
            expectedScore: ''
          };
        }) : []
      }));
      
      // Update the state with the new semesters
      if (formattedSemesters.length > 0) {
        setSemesters(formattedSemesters);
        return;
      }
      
      // Handle single course case if no semesters but has course data
      if (responseData.courseCode || responseData.courseNameVi) {
        setSemesters(prevSemesters => {
          const newSemesters = [...prevSemesters];
          
          // If no semesters exist, create one
          if (newSemesters.length === 0) {
            newSemesters.push({
              id: `sem-${Date.now()}`,
              name: 'Học kỳ 1',
              subjects: []
            });
          }

          // Create a new subject with all required fields
          const newSubject: Subject = {
            id: `subj-${Date.now()}`,
            courseCode: responseData.courseCode?.trim() || '',
            courseName: responseData.courseNameVi?.trim() || '',
            credits: responseData.credits?.toString() || '0',
            progressScore: responseData.scores?.progressScore !== null && responseData.scores?.progressScore !== undefined ? String(responseData.scores.progressScore) : '',
            midtermScore: responseData.scores?.midtermScore !== null && responseData.scores?.midtermScore !== undefined ? String(responseData.scores.midtermScore) : '',
            practiceScore: responseData.scores?.practiceScore !== null && responseData.scores?.practiceScore !== undefined ? String(responseData.scores.practiceScore) : '',
            finalScore: responseData.scores?.finaltermScore !== null && responseData.scores?.finaltermScore !== undefined ? String(responseData.scores.finaltermScore) : '',
            minProgressScore: '0',
            minMidtermScore: '0',
            minPracticeScore: '0',
            minFinalScore: '0',
            progressWeight: '20',
            midtermWeight: '20',
            practiceWeight: '20',
            finalWeight: '40',
            score: responseData.scores?.totalScore !== null && responseData.scores?.totalScore !== undefined ? String(responseData.scores.totalScore) : '',
            expectedScore: ''
          };

          // Add the new subject to the first semester
          const firstSemester = { 
            ...newSemesters[0],
            subjects: [...(newSemesters[0]?.subjects || []), newSubject]
          };
          
          return [firstSemester, ...newSemesters.slice(1)];
        });
      }
      
      event.target.value = '';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error processing PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Bảng điểm</h1>
          <div>
            <label htmlFor="pdf-upload" className="button" style={{
              padding: '10px 20px',
              backgroundColor: 'var(--primary-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'inline-block',
              marginLeft: '10px',
              transition: 'opacity 0.2s'
            }}>
              {isLoading ? 'Đang xử lý...' : 'Nhập điểm từ PDF'}
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Graduation Check Section */}
        <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <h2>Kiểm tra tốt nghiệp</h2>
          <GraduationCheck />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            Lỗi: {error}
          </div>
        )}

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