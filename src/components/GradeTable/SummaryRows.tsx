import React from 'react';
import { Semester } from '../../types';

interface SummaryRowsProps {
  semesters: Semester[];
}

const calculateSubjectGrade = (subject: any) => {
  // Get scores with fallback to 0 if not provided
  const progress = parseFloat(subject.progressScore) || 0;  // QT - 20%
  const midterm = parseFloat(subject.midtermScore) || 0;    // GK - 30%
  const practice = parseFloat(subject.practiceScore) || 0;  // TH - 20%
  const final = parseFloat(subject.finalScore) || 0;        // CK - 30%

  // Apply fixed weights as per the grading system
  const progressWeight = 0.20;  // 20%
  const midtermWeight = 0.30;   // 30%
  const practiceWeight = 0.20;  // 20%
  const finalWeight = 0.30;     // 30%

  // Calculate final score
  return (progress * progressWeight) +
         (midterm * midtermWeight) +
         (practice * practiceWeight) +
         (final * finalWeight);
};

const calculateSemesterAverage = (semester: Semester) => {
  const subjects = semester.subjects || [];
  if (subjects.length === 0) return 0;
  
  const total = subjects.reduce((sum: number, subject: any) => {
    return sum + calculateSubjectGrade(subject);
  }, 0);
  
  return total / subjects.length;
};

const calculateTotalCredits = (semesters: Semester[]) => {
  return semesters.reduce((total, semester) => {
    return total + (semester.subjects || []).reduce((sum, subject) => {
      return sum + (parseInt(subject.credits) || 0);
    }, 0);
  }, 0);
};

const SummaryRows: React.FC<SummaryRowsProps> = ({ semesters }) => {
  if (semesters.length === 0) return null;

  const currentSemester = semesters[0];
  const currentSemesterAverage = calculateSemesterAverage(currentSemester);
  const totalCredits = calculateTotalCredits(semesters);
  const currentSemesterCredits = (currentSemester.subjects || []).reduce((sum, subject) => {
    return sum + (parseInt(subject.credits) || 0);
  }, 0);

  // Calculate cumulative average
  const cumulativeAverage = semesters.length > 0
    ? semesters.reduce((sum, sem) => sum + calculateSemesterAverage(sem), 0) / semesters.length
    : 0;

  return (
    <>
      {/* 1) Total credits taken */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Số tín chỉ đã học</td>
        <td style={{ textAlign: "center" }}>{totalCredits}</td>
        <td colSpan={6}></td>
      </tr>

      {/* 2) This semester's credits */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Số tín chỉ học kỳ này</td>
        <td style={{ textAlign: "center" }}>{currentSemesterCredits}</td>
        <td colSpan={6}></td>
      </tr>

      {/* 3) Current semester average */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Điểm trung bình chung</td>
        <td colSpan={5}></td>
        <td style={{
          textAlign: "center",
          color: "var(--primary-purple)",
          fontWeight: "bold"
        }}>
          {currentSemesterAverage.toFixed(2)}
        </td>
        <td></td>
      </tr>

      {/* 4) Cumulative average */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Điểm trung bình chung tích lũy</td>
        <td colSpan={5}></td>
        <td style={{
          textAlign: "center",
          color: "var(--primary-purple)",
          fontWeight: "bold"
        }}>
          {cumulativeAverage.toFixed(2)}
        </td>
        <td></td>
      </tr>
    </>
  );
};

export default SummaryRows;
