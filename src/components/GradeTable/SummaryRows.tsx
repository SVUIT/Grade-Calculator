import React from "react";
import type { Semester } from "../../types";
import { calcSubjectScore } from "../../utils/gradeUtils";

interface SummaryRowsProps {
  semesters: Semester[];
}

const SummaryRows: React.FC<SummaryRowsProps> = ({ semesters }) => {
  return (
    <>
      {/* 1) Tổng số tín chỉ toàn khóa */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Số tín chỉ đã học</td>
        <td style={{ textAlign: "center" }}>
          {semesters.reduce(
            (sum, sem) =>
              sum +
              sem.subjects.reduce((a, s) => a + Number(s.tinChi || 0), 0),
            0
          )}
        </td>

        {/* Empty cells for QT, GK, TH, CK */}
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        
        {/* Empty cell for Diem HP */}
        <td></td>
        
        {/* Empty cell for Expected */}
        <td></td>
      </tr>

      {/* 2) Điểm trung bình chung toàn khóa */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">Điểm trung bình chung</td>

        {/* Empty cells for TinChi, QT, GK, TH, CK */}
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>

        <td style={{ textAlign: "center" }}>
          {(() => {
            let totalTC = 0,
              totalScore = 0;
            semesters.forEach((sem) => {
              sem.subjects.forEach((sub) => {
                const hp = Number(calcSubjectScore(sub));
                const tc = Number(sub.tinChi);
                if (!isNaN(hp) && !isNaN(tc)) {
                  totalTC += tc;
                  totalScore += hp * tc;
                }
              });
            });
            return totalTC === 0 ? "0.00" : (totalScore / totalTC).toFixed(2);
          })()}
        </td>

        <td></td>
      </tr>
    </>
  );
};

export default SummaryRows;