import React from "react";
import type { Semester } from "../../types";
import { calcSubjectScore, calcRequiredScores } from "../../utils/gradeUtils";

interface SummaryRowsProps {
  semesters: Semester[];
  cumulativeExpected: string;
  onApplyExpectedOverall: (updatedSemesters: Semester[]) => void;
  onSetCumulativeExpected: (value: string) => void;
}

const SummaryRows: React.FC<SummaryRowsProps> = ({ 
  semesters, 
  cumulativeExpected,
  onApplyExpectedOverall,
  onSetCumulativeExpected 
}) => {
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
              sem.subjects.reduce((a, s) => a + Number(s.credits || 0), 0),
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
                const tc = Number(sub.credits);
                if (!isNaN(hp) && !isNaN(tc)) {
                  totalTC += tc;
                  totalScore += hp * tc;
                }
              });
            });
            return totalTC === 0 ? "0.00" : (totalScore / totalTC).toFixed(2);
          })()}
        </td>

        <td>
          <div
            contentEditable
            suppressContentEditableWarning
            data-placeholder={"Nhập điểm kỳ vọng cả khóa"}
            className="editable-cell expected-score-cell"
            role="textbox"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => {
              const text = e.currentTarget.textContent?.trim() || "";
              
              // Lưu giá trị nhập vào (kể cả rỗng)
              onSetCumulativeExpected(text);
              
              if (text === "") return;
              const xp = Number(text);
              if (isNaN(xp)) return;

              // Áp dụng điểm kỳ vọng cho tất cả môn chưa có đủ điểm
              const updated = JSON.parse(JSON.stringify(semesters));
              updated.forEach((sem: any) => {
                sem.subjects.forEach((sub: any) => {
                  const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                    const v = (sub as any)[f];
                    return v !== undefined && v.toString().trim() !== "";
                  });
                  if (hasAll) return;

                  // Lưu expectedScore cho từng môn
                  sub.expectedScore = xp.toString();
                  const required = calcRequiredScores(sub, xp);
                  Object.entries(required).forEach(([field, value]) => {
                    (sub as any)[field] = value;
                  });
                });
              });

              // Gọi callback để cập nhật state và localStorage
              onApplyExpectedOverall(updated);
            }}
          >
            {cumulativeExpected}
          </div>
        </td>
      </tr>
    </>
  );
};

export default SummaryRows;