import React, { useState } from "react";
import type { Semester, Subject } from "../../types";
import {
  calcRequiredScores,
  calcSubjectScore,
  hasAllScores,
  normalizeScore,
} from "../../utils/gradeUtils";
import { SUBJECTS_DATA } from "../../constants";

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

  const fieldMap: { key: string; minKey: string; weightKey: string; label: string }[] = [
      { key: "progressScore", minKey: "minProgressScore", weightKey: "progressWeight", label: "QT" },
      { key: "midtermScore", minKey: "minMidtermScore", weightKey: "midtermWeight", label: "GK" },
      { key: "practiceScore", minKey: "minPracticeScore", weightKey: "practiceWeight", label: "TH" },
      { key: "finalScore", minKey: "minFinalScore", weightKey: "finalWeight", label: "CK" },
  ];

  const handleScoreCommit = (fieldKey: string, value: string) => {
    const normalized = normalizeScore(value);
    const updated = [...semesters];
    const subj = updated[editing.semesterIdx].subjects[editing.subjectIdx];
    (subj as any)[fieldKey] = normalized;

    // Reset all min fields
    ["minProgressScore", "minMidtermScore", "minPracticeScore", "minFinalScore"].forEach(
      (field) => { (subj as any)[field] = ""; }
    );

    if (subj.expectedScore && subj.expectedScore.toString().trim() !== "") {
      const xp = Number(subj.expectedScore);
      if (!isNaN(xp)) {
        const required = calcRequiredScores(subj, xp);
        Object.entries(required).forEach(([field, val]) => {
          (subj as any)[field] = val;
        });
      }
    }
    setSemesters(updated);
  };

  const checkWeightTotal = (subj: Subject) => {
    const total =
      Number(subj.progressWeight || 0) +
      Number(subj.midtermWeight || 0) +
      Number(subj.practiceWeight || 0) +
      Number(subj.finalWeight || 0);
    setWeightError(total !== 100);
  };

  const handleWeightCommit = (weightKey: string) => {
    let val = tempWeightValue;
    if (val !== "" && !/^\d+$/.test(val)) {
        const num = Number.parseFloat(val);
        val = Number.isNaN(num) ? "0" : Math.floor(num).toString();
    }
    if (val !== "") {
        let num = Number(val);
        if (num > 100) num = 100;
        if (num < 0) num = 0;
        val = num.toString();
    }

    const updated = [...semesters];
    const targetSub = updated[editing.semesterIdx].subjects[editing.subjectIdx];
    (targetSub as any)[weightKey] = val;
    
    checkWeightTotal(targetSub);

    // Khi trọng số thay đổi, tính toán lại điểm tối thiểu nếu có điểm kỳ vọng
    if (targetSub.expectedScore && targetSub.expectedScore.toString().trim() !== "") {
      const xp = Number(targetSub.expectedScore);
      if (!isNaN(xp)) {
        // Reset min fields trước khi tính lại với trọng số mới
        ["minProgressScore", "minMidtermScore", "minPracticeScore", "minFinalScore"].forEach(
          (field) => { (targetSub as any)[field] = ""; }
        );
        
        const required = calcRequiredScores(targetSub, xp);
        Object.entries(required).forEach(([field, v]) => {
          (targetSub as any)[field] = v;
        });
      }
    }
    
    setSemesters(updated);
    setActiveWeightField(null);
  };

  const handleResetToDefaultWeights = () => {
    const currentSub = semesters[editing.semesterIdx].subjects[editing.subjectIdx];
    let defaultWeights = null;

    // Tìm kiếm trong dữ liệu gốc
    for (const cat in SUBJECTS_DATA) {
      const found = SUBJECTS_DATA[cat].find(c => c.courseCode === currentSub.courseCode);
      if (found) {
        defaultWeights = found.defaultWeights;
        break;
      }
    }

    if (defaultWeights) {
      const updated = [...semesters];
      const subj = updated[editing.semesterIdx].subjects[editing.subjectIdx];
      subj.progressWeight = (defaultWeights.progressWeight * 100).toString();
      subj.midtermWeight = (defaultWeights.midtermWeight * 100).toString();
      subj.practiceWeight = (defaultWeights.practiceWeight * 100).toString();
      subj.finalWeight = (defaultWeights.finalTermWeight * 100).toString();
      
      checkWeightTotal(subj);

      // Tính toán lại điểm tối thiểu nếu có điểm kỳ vọng
      if (subj.expectedScore && subj.expectedScore.trim() !== "") {
        // Reset min fields
        ["minProgressScore", "minMidtermScore", "minPracticeScore", "minFinalScore"].forEach(
          (field) => { (subj as any)[field] = ""; }
        );
        const req = calcRequiredScores(subj, Number(subj.expectedScore));
        Object.assign(subj, req);
      }

      setSemesters(updated);
    }
  };

  const handleExpectedScoreCommit = (val: string) => {
    const xp = Number(val);
    const updated = [...semesters];
    const subject = updated[editing.semesterIdx].subjects[editing.subjectIdx];
    subject.expectedScore = val;

    if (!Number.isNaN(xp) && val.trim() !== "") {
        const requiredScores = calcRequiredScores(subject, xp);
        Object.entries(requiredScores).forEach(([field, value]) => {
            (subject as any)[field] = value;
        });
    }
    setSemesters(updated);
  };

  const handleClose = () => {
    onClose();
    setWeightError(false);
  };

  const currentSub = semesters[editing.semesterIdx].subjects[editing.subjectIdx];

  return (
    <>
      <div
        style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(0,0,0,0.6)", 
            zIndex: 99,
        }}
        onClick={handleClose}
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
          width: "95%", 
          maxWidth: "480px", 
          maxHeight: "90vh", 
          overflowY: "auto", 
          zIndex: 100,
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          color: "var(--text-color)",
          boxSizing: "border-box"
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", textAlign: "center", fontSize: "1.1rem" }}>
          {currentSub.courseName}
        </h3>

        <div style={{ width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              fontSize: "14px",
              tableLayout: "fixed" 
            }}
          >
            <colgroup>
              <col style={{ width: "45px" }} />   
              <col style={{ width: "30%" }} />   
              <col style={{ width: "30%" }} />   
              <col style={{ width: "85px" }} />  
            </colgroup>
            <thead>
              <tr>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "8px 4px", border: "1px solid var(--border-color)", fontSize: "11px" }}></th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "8px 4px", border: "1px solid var(--border-color)", fontSize: "11px" }}>Hiện tại</th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "8px 4px", border: "1px solid var(--border-color)", fontSize: "11px" }}>Tối thiểu</th>
                <th style={{ background: "var(--primary-purple)", color: "white", padding: "8px 4px", border: "1px solid var(--border-color)", fontSize: "11px" }}>Trọng số</th>
              </tr>
            </thead>

            <tbody>
              {fieldMap.map((f) => {
                const score = (currentSub as any)[f.key];
                const minScore = (currentSub as any)[f.minKey];
                const isOver10 = minScore && Number(minScore) > 10;
                const weightVal = (currentSub as any)[f.weightKey];

                return (
                  <tr key={f.key}>
                    <td style={{ background: "var(--primary-purple)", color: "white", fontWeight: "bold", border: "1px solid var(--border-color)", fontSize: "12px" }}>
                      {f.label}
                    </td>

                    <td style={{ border: "1px solid var(--border-color)", padding: 0 }}>
                      <input
                        value={score}
                        inputMode="decimal"
                        onChange={(e) => {
                          const updated = [...semesters];
                          (updated[editing.semesterIdx].subjects[editing.subjectIdx] as any)[f.key] = e.target.value;
                          setSemesters(updated);
                        }}
                        onBlur={(e) => handleScoreCommit(f.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleScoreCommit(f.key, (e.target as HTMLInputElement).value);
                            e.currentTarget.blur();
                          }
                        }}
                        style={{
                          background: "transparent",
                          color: "var(--text-color)",
                          textAlign: "center",
                          width: "100%",
                          padding: "10px 4px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          border: "none",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </td>

                    <td style={{ border: "1px solid var(--border-color)", padding: 0, color: isOver10 ? "red" : "inherit" }}>
                      <div style={{ padding: "10px 4px", fontWeight: isOver10 ? "bold" : "normal" }}>
                        {minScore || ""}
                      </div>
                    </td>

                    <td 
                      style={{ 
                        border: "1px solid var(--border-color)", 
                        padding: 0, 
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                      onClick={() => {
                          if (activeWeightField !== f.weightKey) {
                              setActiveWeightField(f.weightKey);
                              setTempWeightValue(weightVal);
                          }
                      }}
                    >
                      {activeWeightField === f.weightKey ? (
                          <input
                              autoFocus
                              type="text"
                              inputMode="numeric"
                              value={tempWeightValue}
                              onChange={(e) => setTempWeightValue(e.target.value)}
                              onBlur={() => handleWeightCommit(f.weightKey)}
                              onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                      handleWeightCommit(f.weightKey);
                                  }
                              }}
                              style={{
                                  background: "var(--input-bg)",
                                  color: "var(--text-color)",
                                  textAlign: "center",
                                  width: "100%",
                                  height: "100%",
                                  position: "absolute",
                                  top: 0, left: 0,
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  border: "none",
                                  outline: "none",
                                  boxSizing: "border-box"
                              }}
                          />
                      ) : (
                          <div style={{ padding: "10px 4px", color: weightError ? "red" : "inherit", fontWeight: "bold" }}>
                              {weightVal}%
                          </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <button
            onClick={handleResetToDefaultWeights}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-purple)",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "4px 0",
              textDecoration: "underline"
            }}
          >
            Khôi phục mặc định
          </button>
          <div style={{ fontSize: "10px", color: weightError ? "red" : "var(--text-muted)", fontWeight: 600 }}>
            *Tổng trọng số phải bằng 100%
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Điểm học phần:</span>
              <span style={{ fontWeight: "800", fontSize: "18px", color: "var(--primary-purple)" }}>
                {calcSubjectScore(currentSub)}
              </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Điểm kỳ vọng:</span>
              <input
                type="text"
                inputMode="decimal"
                value={currentSub.expectedScore || ""}
                disabled={hasAllScores(currentSub)}
                onChange={(e) => {
                    const updated = [...semesters];
                    updated[editing.semesterIdx].subjects[editing.subjectIdx].expectedScore = e.target.value;
                    setSemesters(updated);
                }}
                onBlur={(e) => handleExpectedScoreCommit(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleExpectedScoreCommit((e.target as HTMLInputElement).value);
                        e.currentTarget.blur();
                    }
                }}
                style={{
                    background: "transparent",
                    color: "var(--primary-purple)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    width: "90px",
                    textAlign: "right",
                    opacity: hasAllScores(currentSub) ? 0.5 : 1
                }}
              />
          </div>
        </div>

        <div style={{ marginTop: 25, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            style={{ 
              background: "#5B5A64", 
              padding: "10px 20px", 
              borderRadius: 8, 
              color: "white",
              fontWeight: "bold",
              border: "none"
            }}
            onClick={() => {
              if (backupSubject) {
                const updated = [...semesters];
                updated[editing.semesterIdx].subjects[editing.subjectIdx] = backupSubject;
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
              fontWeight: "bold",
              border: "none",
              opacity: weightError ? 0.6 : 1
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