import React, { useState } from "react";
import type { Semester, Subject } from "../../types";
import {
  calcRequiredScores,
  calcSubjectScore,
  hasAllScores,
  normalizeScore,
} from "../../utils/gradeUtils";

interface EditModalProps {
  editing: { semesterIdx: number; subjectIdx: number };
  semesters: Semester[];
  setSemesters: (semesters: Semester[]) => void;
  onClose: () => void;
  backupSubject: Subject | null;
}

const EditModal: React.FC<EditModalProps> = ({
  editing,
  semesters,
  setSemesters,
  onClose,
  backupSubject,
}) => {
  const [weightError, setWeightError] = useState(false);
  
  // State quản lý việc nhập trọng số
  const [activeWeightField, setActiveWeightField] = useState<string | null>(null);
  const [tempWeightValue, setTempWeightValue] = useState<string>("");

  const handleWeightCommit = (field: string) => {
    let val = tempWeightValue;
    
    // Validate số
    if (val !== "" && !/^\d+$/.test(val)) {
        const num = parseFloat(val);
        val = isNaN(num) ? "0" : Math.floor(num).toString();
    }
    
    if (val !== "") {
        let num = Number(val);
        if (num > 100) num = 100;
        if (num < 0) num = 0;
        val = num.toString();
    }

    const updated = [...semesters];
    // Use type assertion or indexed access with strict types
    (updated[editing.semesterIdx].subjects[editing.subjectIdx] as any)[`weight_${field}`] = val;
    setSemesters(updated);

    // Check tổng trọng số sau khi commit
    const subj = updated[editing.semesterIdx].subjects[editing.subjectIdx];
    const total =
      Number(subj.weight_diemQT || 0) +
      Number(subj.weight_diemGK || 0) +
      Number(subj.weight_diemTH || 0) +
      Number(subj.weight_diemCK || 0);
    setWeightError(total !== 100);

    setActiveWeightField(null);
  };

  const handleClose = () => {
    onClose();
    setWeightError(false);
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99 }}
        onClick={handleClose}
        onKeyDown={handleOverlayKeyDown}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "var(--modal-bg)",
          padding: "20px",
          borderRadius: 10,
          border: "1px solid var(--border-color)",
          
          width: "95%", // Responsive width
          maxWidth: "600px", // Maximum width
          maxHeight: "90vh", // Prevent overflow on small screens
          overflowY: "auto", // Scroll if too tall
          zIndex: 100,
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          color: "var(--text-color)",
          boxSizing: "border-box"
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", textAlign: "center", fontSize: "1.2rem", wordBreak: "break-word" }}>
          {semesters[editing.semesterIdx].subjects[editing.subjectIdx].tenHP}
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              fontSize: "14px",
              minWidth: "300px" // Ensure table doesn't crush
            }}
          >
            <thead>
              <tr>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "10px", border: "1px solid var(--border-color)", fontSize: "12px" }}></th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "10px", border: "1px solid var(--border-color)", fontSize: "12px" }}>Điểm hiện tại</th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "10px", border: "1px solid var(--border-color)", fontSize: "12px" }}>Điểm tối thiểu</th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "10px", border: "1px solid var(--border-color)", fontSize: "12px" }}>Trọng số</th>
              </tr>
            </thead>

            <tbody>
              {["diemQT", "diemGK", "diemTH", "diemCK"].map((f) => {
                const currentSubject =
                  semesters[editing.semesterIdx].subjects[editing.subjectIdx];
                const score = (currentSubject as any)[f];
                const minScore = (currentSubject as any)[`min_${f}`];
                const hasMinScore = minScore && minScore.toString().trim() !== "";
                const isOver10 = hasMinScore && Number(minScore) > 10;
                const weightVal = (currentSubject as any)[`weight_${f}`];

                return (
                  <tr key={f}>
                    <td style={{ background: "var(--primary-purple)", color: "white", fontWeight: "bold", padding: "10px 5px", border: "1px solid var(--border-color)", fontSize: "13px" }}>
                      {f.replace("diem", "")}
                    </td>

                    <td style={{ background: "var(--dropdown-bg)", padding: 0, border: "1px solid var(--border-color)" }}>
                      <input
                        value={score}
                        placeholder=""
                        inputMode="decimal"
                        onChange={(e) => {
                          const newVal = e.target.value;
                          const updated = [...semesters];
                          (updated[editing.semesterIdx].subjects[editing.subjectIdx] as any)[
                            f
                          ] = newVal;
                          setSemesters(updated);
                        }}
                        onBlur={(e) => {
                          const normalized = normalizeScore(e.target.value);
                          const updated = [...semesters];
                          const subj =
                            updated[editing.semesterIdx].subjects[
                              editing.subjectIdx
                            ];
                          (subj as any)[f] = normalized;

                          ["diemQT", "diemGK", "diemTH", "diemCK"].forEach(
                            (field) => {
                              (subj as any)[`min_${field}`] = "";
                            }
                          );

                          if (
                            subj.expectedScore &&
                            subj.expectedScore.toString().trim() !== ""
                          ) {
                            const xp = Number(subj.expectedScore);
                            const required = calcRequiredScores(subj, xp);
                            Object.entries(required).forEach(([field, value]) => {
                              (subj as any)[field] = value;
                            });
                          }
                          setSemesters(updated);
                        }}
                        style={{
                          background: "transparent",
                          color: "var(--text-color)",
                          textAlign: "center",
                          width: "100%",
                          padding: "10px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          border: "none",
                          outline: "none",
                        }}
                      />
                    </td>

                    <td style={{ background: "var(--dropdown-bg)", padding: 0, border: "1px solid var(--border-color)" }}>
                      <input
                        value={minScore}
                        disabled
                        readOnly
                        style={{
                          background: "transparent",
                          color: isOver10 ? "red" : "var(--text-color)",
                          textAlign: "center",
                          width: "100%",
                          padding: "10px",
                          fontSize: "14px",
                          fontWeight: isOver10 ? "bold" : "normal",
                          border: "none",
                          outline: "none",
                        }}
                      />
                    </td>

                    <td 
                      style={{ background: "var(--dropdown-bg)", padding: 0, border: "1px solid var(--border-color)", cursor: 'pointer' }}
                      onClick={() => {
                          if (activeWeightField !== f) {
                              setActiveWeightField(f);
                              setTempWeightValue(weightVal);
                          }
                      }}
                    >
                      {activeWeightField === f ? (
                          <input
                              autoFocus
                              type="text"
                              inputMode="numeric"
                              value={tempWeightValue}
                              onChange={(e) => setTempWeightValue(e.target.value)}
                              onBlur={() => handleWeightCommit(f)}
                              onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                      handleWeightCommit(f);
                                  }
                              }}
                              style={{
                                  background: "transparent",
                                  color: "var(--text-color)",
                                  textAlign: "center",
                                  width: "100%",
                                  padding: "10px",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  border: "none",
                                  outline: "none",
                              }}
                          />
                      ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <span style={{ color: weightError ? "red" : "var(--text-color)", fontSize: "14px", fontWeight: "bold" }}>
                                  {weightVal}%
                              </span>
                          </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: "right", marginTop: 8, fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
          *Tổng trọng số phải bằng 100%
        </div>

        {/* Summary */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-color)", fontSize: "14px" }}>Điểm học phần:</span>
                <span style={{ fontWeight: "bold", color: "var(--text-color)", fontSize: "16px" }}>
                {calcSubjectScore(
                    semesters[editing.semesterIdx].subjects[editing.subjectIdx]
                )}
                </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", color: "var(--text-color)", fontSize: "14px" }}>Điểm kỳ vọng:</span>
                <input
                type="text"
                inputMode="decimal"
                value={
                    semesters[editing.semesterIdx].subjects[editing.subjectIdx]
                    .expectedScore || ""
                }
                disabled={hasAllScores(
                    semesters[editing.semesterIdx].subjects[editing.subjectIdx]
                )}
                onChange={(e) => {
                    const updated = [...semesters];
                    updated[editing.semesterIdx].subjects[
                    editing.subjectIdx
                    ].expectedScore = e.target.value;
                    setSemesters(updated);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const expectedVal = (e.target as HTMLInputElement).value;
                        const xp = Number(expectedVal);
                        if (!isNaN(xp) && expectedVal.trim() !== "") {
                            const updated = [...semesters];
                            const subject = updated[editing.semesterIdx].subjects[editing.subjectIdx];
                            const requiredScores = calcRequiredScores(subject, xp);
                            Object.entries(requiredScores).forEach(([field, value]) => {
                                (subject as any)[field] = value;
                            });
                            setSemesters(updated);
                        }
                        e.currentTarget.blur();
                    }
                }}
                style={{
                    background: "transparent",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    outline: "none",
                    width: "80px",
                    textAlign: "right",
                    cursor: hasAllScores(semesters[editing.semesterIdx].subjects[editing.subjectIdx]) ? "not-allowed" : "text",
                    opacity: hasAllScores(semesters[editing.semesterIdx].subjects[editing.subjectIdx]) ? 0.5 : 1
                }}
                />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            marginTop: 25,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            style={{ 
              background: "#5B5A64", 
              padding: "10px 20px", 
              borderRadius: 8, 
              color: "white",
              fontWeight: "bold",
              border: "none",
              fontSize: "14px"
            }}
            onClick={() => {
              if (backupSubject) {
                const updated = [...semesters];
                updated[editing.semesterIdx].subjects[editing.subjectIdx] =
                  backupSubject;
                setSemesters(updated);
              }
              handleClose();
            }}
          >
            Hủy
          </button>

          <button
            style={{
              background: weightError ? "#555" : "var(--primary-purple)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              cursor: weightError ? "not-allowed" : "pointer",
              fontWeight: "bold",
              border: "none",
              opacity: weightError ? 0.6 : 1,
              fontSize: "14px"
            }}
            disabled={weightError}
            onClick={handleClose}
          >
            Lưu
          </button>
        </div>
      </div>
    </>
  );
};

export default EditModal;