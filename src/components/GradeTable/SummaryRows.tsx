import React from "react";
import type { Semester } from "../../types";
import { calcSubjectScore, calcRequiredScores } from "../../utils/gradeUtils";

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
              if (text === "") return;
              const xp = Number(text);
              if (isNaN(xp)) return;

              // Apply expected GPA across all subjects that are not fully scored
              const updated = JSON.parse(JSON.stringify(semesters));
              updated.forEach((sem: any) => {
                sem.subjects.forEach((sub: any) => {
                  const hasAll = ["progressScore", "midtermScore", "practiceScore", "finalScore"].every((f) => {
                    const v = (sub as any)[f];
                    return v !== undefined && v.toString().trim() !== "";
                  });
                  if (hasAll) return;

                  sub.expectedScore = xp.toString();
                  const required = calcRequiredScores(sub, xp);
                  Object.entries(required).forEach(([field, value]) => {
                    (sub as any)[field] = value;
                  });
                });
              });

              // Write back to local storage via a small event: dispatch a custom event consumers can catch
              // or simply replace window.localStorage directly here if desired by caller. We'll update by
              // setting a hidden global - callers using `setSemesters` should be invoked by parent components.
              // For now, try to update via a small hack: find global setter by dispatching a custom event.
              const event = new CustomEvent("applyExpectedOverall", { detail: updated });
              window.dispatchEvent(event as any);
            }}
          />
        </td>
      </tr>
    </>
  );
};

export default SummaryRows;