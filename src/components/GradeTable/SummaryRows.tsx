import React from "react";
import type { Semester } from "../../types";
import { calcSubjectScore, calcRequiredScores } from "../../utils/gradeUtils";

interface SummaryRowsProps {
  semesters: Semester[];
  cumulativeExpected: string;
  onApplyExpectedOverall: (updatedSemesters: Semester[]) => void;
  onSetCumulativeExpected: (value: string) => void;
  isCumulativeManual: boolean;
  setIsCumulativeManual: (value: boolean) => void;
}

const SummaryRows: React.FC<SummaryRowsProps> = ({ 
  semesters, 
  cumulativeExpected,
  onApplyExpectedOverall,
  onSetCumulativeExpected,
  isCumulativeManual,
  setIsCumulativeManual
}) => {
  return (
    <>
      {/* 1) Tổng số tín chỉ toàn khóa */}
      <tr style={{ background: "transparent", fontWeight: "bold" }}>
        <td className="semester-bg"></td>
        <td colSpan={2} className="summary-label">
          <span className="label-content">Số tín chỉ đã học</span>
        </td>
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
        <td colSpan={2} className="summary-label">
          <span className="label-content">Điểm trung bình chung</span>
        </td>

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
            style={{ color: isCumulativeManual ? "white" : undefined }}
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
              onSetCumulativeExpected(text);
              
              if (text === "") {
                // Xóa điểm kỳ vọng toàn khóa
                setIsCumulativeManual(false);
                
                const updated = JSON.parse(JSON.stringify(semesters));
                updated.forEach((sem: any) => {
                  // Xóa điểm trung bình kỳ vọng học kỳ nếu không phải người dùng nhập
                  if (!sem.isExpectedAverageManual) {
                    sem.expectedAverage = "";
                  }
                  
                  sem.subjects.forEach((sub: any) => {
                    // Chỉ xóa điểm kỳ vọng môn nếu không phải người dùng nhập
                    if (!sub.isExpectedManual) {
                      sub.expectedScore = "";
                    }
                  });
                });
                onApplyExpectedOverall(updated);
                return;
              }

              const xp = Number(text);
              if (isNaN(xp) || xp < 0 || xp > 10) return;

              // Đánh dấu là người dùng nhập
              setIsCumulativeManual(true);

              // Tính toán lại điểm kỳ vọng dựa trên các điểm đã có
              const updated = JSON.parse(JSON.stringify(semesters));
              
              // Tính tổng tín chỉ và điểm đã lock (có đủ điểm hoặc người dùng nhập)
              let totalCredits = 0;
              let lockedCredits = 0;
              let lockedPoints = 0;
              
              updated.forEach((sem: any) => {
                sem.subjects.forEach((sub: any) => {
                  const credits = Number(sub.credits) || 0;
                  totalCredits += credits;
                  
                  const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                    const v = (sub as any)[f];
                    return v !== undefined && v.toString().trim() !== "";
                  });
                  
                  if (hasAll) {
                    // Môn đã có đủ điểm
                    lockedCredits += credits;
                    lockedPoints += Number(calcSubjectScore(sub)) * credits;
                  } else if (sub.isExpectedManual && sub.expectedScore) {
                    // Môn có điểm kỳ vọng do người dùng nhập
                    lockedCredits += credits;
                    lockedPoints += Number(sub.expectedScore) * credits;
                  }
                });
              });
              
              // Tính điểm cần thiết cho các môn còn lại
              const remainingCredits = totalCredits - lockedCredits;
              let requiredAvg = 0;
              
              if (remainingCredits > 0) {
                requiredAvg = Math.max(0, Math.min(10, (xp * totalCredits - lockedPoints) / remainingCredits));
              }
              
              // Áp dụng điểm kỳ vọng cho các môn chưa có
              updated.forEach((sem: any) => {
                // Tính điểm trung bình kỳ vọng cho học kỳ nếu chưa được nhập
                if (!sem.isExpectedAverageManual) {
                  let semTotalCredits = 0;
                  let semLockedCredits = 0;
                  let semLockedPoints = 0;
                  
                  sem.subjects.forEach((sub: any) => {
                    const credits = Number(sub.credits) || 0;
                    semTotalCredits += credits;
                    
                    const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                      const v = (sub as any)[f];
                      return v !== undefined && v.toString().trim() !== "";
                    });
                    
                    if (hasAll) {
                      semLockedCredits += credits;
                      semLockedPoints += Number(calcSubjectScore(sub)) * credits;
                    } else if (sub.isExpectedManual && sub.expectedScore) {
                      semLockedCredits += credits;
                      semLockedPoints += Number(sub.expectedScore) * credits;
                    }
                  });
                  
                  const semRemainingCredits = semTotalCredits - semLockedCredits;
                  if (semRemainingCredits > 0) {
                    sem.expectedAverage = requiredAvg.toFixed(2);
                  }
                }
                
                sem.subjects.forEach((sub: any) => {
                  const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                    const v = (sub as any)[f];
                    return v !== undefined && v.toString().trim() !== "";
                  });
                  
                  // Chỉ cập nhật môn chưa có đủ điểm VÀ chưa được người dùng nhập
                  if (!hasAll && !sub.isExpectedManual) {
                    sub.expectedScore = requiredAvg.toFixed(2);
                    const required = calcRequiredScores(sub, requiredAvg);
                    Object.entries(required).forEach(([field, value]) => {
                      (sub as any)[field] = value;
                    });
                  }
                });
              });

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