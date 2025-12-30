import React from "react";
import type { Semester, Subject, Course } from "../../types";
import {
  calcRequiredScores,
  calcSubjectScore,
  hasAllScores,
  normalizeScore,
} from "../../utils/gradeUtils";
import SearchDropdown from "./SearchDropdown";

interface SubjectRowProps {
  semesterIndex: number;
  subjectIndex: number;
  subject: Subject;
  semesters: Semester[];
  setSemesters: (semesters: Semester[]) => void;
  updateSubjectField: (s: number, i: number, f: string, v: string) => void;
  deleteSubject: (s: number, i: number) => void;
  openAdvancedModal: (s: number, i: number) => void;

  // Dropdown / Menu State
  openMenu: { s: number; i: number } | null;
  setOpenMenu: (val: { s: number; i: number } | null) => void;

  editDropdownOpen: { s: number; i: number; field: string } | null;
  setEditDropdownOpen: (
    val: { s: number; i: number; field: string } | null
  ) => void;

  editSearchTerm: string;
  setEditSearchTerm: (term: string) => void;

  editSearchResults: { category: string; subjects: Course[] }[];
  editExpandedCategories: Set<string>;
  setEditExpandedCategories: (cats: Set<string>) => void;
}

const SubjectRow: React.FC<SubjectRowProps> = ({
  semesterIndex: si,
  subjectIndex: i,
  subject: sub,
  semesters,
  setSemesters,
  updateSubjectField,
  deleteSubject,
  openAdvancedModal,
  openMenu,
  setOpenMenu,
  editDropdownOpen,
  setEditDropdownOpen,
  editSearchTerm,
  setEditSearchTerm,
  editSearchResults,
  editExpandedCategories,
  setEditExpandedCategories,
}) => {

  const handleScoreBlur = (f: string, text: string, target: HTMLElement) => {
    updateSubjectField(si, i, f, text);
    const normalized = normalizeScore(text);
    if (target) target.innerText = normalized;

    const updated = [...semesters];
    (updated[si].subjects[i] as any)[f] = normalized;

    // Reset min scores
    const minMap: Record<string, string> = {
      "progressScore": "minProgressScore",
      "midtermScore": "minMidtermScore",
      "practiceScore": "minPracticeScore",
      "finalScore": "minFinalScore"
    };

    if (minMap[f]) {
         (updated[si].subjects[i] as any)[minMap[f]] = "";
    }

    // Recalculate if expected score exists
    if (sub.expectedScore && sub.expectedScore.toString().trim() !== "") {
      const expectedVal = Number(sub.expectedScore);
      const requiredScores = calcRequiredScores(updated[si].subjects[i], expectedVal);

      Object.entries(requiredScores).forEach(([field, value]) => {
         (updated[si].subjects[i] as any)[field] = value;
      });
    }

    setSemesters(updated);
  };

  const handleExpectedScoreBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (hasAllScores(sub)) return;
    const val = e.currentTarget.innerText.trim();
    const updated = [...semesters];
    updated[si].subjects[i].expectedScore = val;

    const xp = Number(val);
    if (!isNaN(xp) && val !== "") {
      const required = calcRequiredScores(updated[si].subjects[i], xp);
      Object.entries(required).forEach(([field, value]) => {
         (updated[si].subjects[i] as any)[field] = value;
      });
    }
    setSemesters(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

    const mainFields = [
    { key: "courseCode", placeholder: "Mã HP", align: "left" },
    { key: "courseName", placeholder: "Tên HP", align: "left" },
    { key: "credits", placeholder: "TC", align: "center" }
  ];

  return (
    <tr>
      <td className="semester-bg" style={{ textAlign: "center" }}>{i + 1}</td>

      {mainFields.map((field) => (
        <td
          key={field.key}
          style={{
            position: "relative",
            textAlign: field.align as any,
            padding: field.key === "credits" ? "0" : "8px 6px"

          }}
        >
          
          {(field.key === "courseCode" || field.key === "courseName") && (
            <>
              <div
                contentEditable
                suppressContentEditableWarning
                className="editable-cell"
                data-placeholder={field.placeholder}
                role="textbox"
                tabIndex={0}
                style={
                  field.key === "courseCode" ? { whiteSpace: "pre-wrap", lineHeight: "1.2", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", } : {
                  }
                  
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDropdownOpen({ s: si, i, field: field.key });
                  setEditSearchTerm("");
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault(); 
                        setEditDropdownOpen({ s: si, i, field: field.key });
                    }
                }}
              >
                {(sub as any)[field.key]}
              </div>

              {editDropdownOpen?.s === si &&
                editDropdownOpen?.i === i &&
                editDropdownOpen?.field === field.key && (
                  <SearchDropdown
                    searchTerm={editSearchTerm}
                    setSearchTerm={setEditSearchTerm}
                    searchResults={editSearchResults}
                    expandedCategories={editExpandedCategories}
                    setExpandedCategories={setEditExpandedCategories}
                    autoFocus={true}
                    minWidth={250}
                    onSelect={(course: Course) => {
                      const updated = [...semesters];
                      const targetSub = updated[si].subjects[i];

                      targetSub.courseCode = course.courseCode;
                      targetSub.courseName = course.courseNameVi;
                      
                      // Update credits if available
                      if (course.credits) {
                          targetSub.credits = course.credits.toString();
                      }

                      // Update weights if available
                      if (course.defaultWeights) {
                          targetSub.progressWeight = (course.defaultWeights.progressWeight * 100).toString();
                          targetSub.midtermWeight = (course.defaultWeights.midtermWeight * 100).toString();
                          targetSub.practiceWeight = (course.defaultWeights.practiceWeight * 100).toString();
                          targetSub.finalWeight = (course.defaultWeights.finalTermWeight * 100).toString();
                      }

                      setSemesters(updated);
                      setEditDropdownOpen(null);
                      setEditSearchTerm("");
                      setEditExpandedCategories(new Set());
                    }}
                  />
                )}
            </>
          )}

          {field.key === "credits" && (
            <div
              contentEditable
              suppressContentEditableWarning
              className="editable-cell editable-cell-multiline"
              data-placeholder="Nhập tín chỉ"
              role="textbox"
              tabIndex={0}
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "32px",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                updateSubjectField(si, i, field.key, e.currentTarget.innerText.trim());
              }}
            >
              {(sub as any)[field.key]}
            </div>
          )}

        </td>
      ))}
      
      {[
          { key: "progressScore", minKey: "minProgressScore", weightKey: "progressWeight", label: "QT" },
          { key: "midtermScore", minKey: "minMidtermScore", weightKey: "midtermWeight", label: "GK" },
          { key: "practiceScore", minKey: "minPracticeScore", weightKey: "practiceWeight", label: "TH" },
          { key: "finalScore", minKey: "minFinalScore", weightKey: "finalWeight", label: "CK" }
      ].map((f) => {
        const score = (sub as any)[f.key];
        const minScore = (sub as any)[f.minKey];
        const hasMinScore = minScore && minScore.toString().trim() !== "";
        const isOver10 = hasMinScore && Number(minScore) > 10;
        const weight = Number((sub as any)[f.weightKey]) || 0;
        const isZeroWeight = weight === 0;

        return (
          <td
            key={f.key}
            className="score-cell"
            style={{
              background: isZeroWeight 
                ? "rgba(128, 128, 128, 0.15)" // Màu xám cho cột trọng số 0
                : (hasMinScore ? (isOver10 ? "rgba(255, 0, 0, 0)" : "var(--primary-purple)") : "transparent") 
            }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              title={`Trọng số: ${weight}%`}
              className={`score-content ${
                hasMinScore
                  ? isOver10
                    ? "score-over-10"
                    : "text-white"
                  : "text-normal"
              }`}
              data-placeholder={`Nhập điểm ${f.label}`}
              role="textbox"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => handleScoreBlur(f.key, e.target.innerText, e.target as HTMLElement)}
              style={{
                color: hasMinScore ? (isOver10 ? "red" : "var(--primary-purple)") : (isZeroWeight ? "var(--text-muted)" : "inherit"),
                fontWeight: (hasMinScore || isZeroWeight) ? "bold" : "normal",
                fontStyle: hasMinScore ? "italic" : "normal",
                minHeight: "32px",
                opacity: isZeroWeight ? 0.8 : 1
              }}
            >
              {hasMinScore ? minScore : score}
            </div>
          </td>
        );
      })}

      <td style={{ textAlign: "center", background: "rgba(128, 128, 128, 0.15)", padding: 0 }}>
        <div style={{ 
          height: "32px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "var(--text-muted)",
          fontWeight: "bold"
        }}>
          {calcSubjectScore(sub)}
        </div>      
      </td>

      <td style={{ position: "relative" }}>
        <div
          contentEditable
          suppressContentEditableWarning
          data-placeholder={hasAllScores(sub) ? "" : "Nhập điểm\nkỳ vọng"}
          className={`editable-cell expected-score-cell ${
            hasAllScores(sub) ? "text-gray cursor-not-allowed" : "text-yellow"
          }`}
          role="textbox"
          tabIndex={hasAllScores(sub) ? -1 : 0}
          onBlur={handleExpectedScoreBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {sub.expectedScore}
        </div>

        {/* Action Dots */}
        <div
          className="row-action-dots"
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={openMenu?.s === si && openMenu?.i === i}
          onKeyDown={(e) => handleKeyDown(e, () => {
             e.stopPropagation();
             setOpenMenu(openMenu?.s === si && openMenu?.i === i ? null : { s: si, i });
          })}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(
              openMenu?.s === si && openMenu?.i === i ? null : { s: si, i }
            );
          }}
        >
          ⋮
        </div>

        {/* Dropdown Menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="dropdown-menu"
          role="menu"
          style={{
            display:
              openMenu?.s === si && openMenu?.i === i ? "flex" : "none",
            flexDirection: "column",
            position: "absolute",
            right: "0",    // Aligned with the right edge of the cell (Left of dots)
            top: "75%",    // Below the content
            marginTop: "0",
            borderRadius: 8,
            minWidth: 140, // Standard width
            width: "max-content",
            maxHeight: "none",
            overflowY: "visible",
            left: "auto",
            zIndex: 100,
            padding: "2px",
            background: "var(--dropdown-bg)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            gap: "0" 
          }}
        >
          <div style={{
            fontSize: "10px", 
            color: "var(--text-muted)",
            marginBottom: "2px",
            padding: "4px 6px",
            borderBottom: "1px solid var(--border-color)",
            fontWeight: 600
          }}>
            TUỲ CHỌN
          </div>

          <div 
             className="subject-item"
             role="menuitem"
             tabIndex={0}
             style={{ padding: "6px 8px", fontSize: "12px" }}
             onKeyDown={(e) => handleKeyDown(e, () => {
                setOpenMenu(null);
                openAdvancedModal(si, i);
             })}
             onClick={() => {
                setOpenMenu(null);
                openAdvancedModal(si, i);
             }}
          >
            Chỉnh sửa
          </div>

          <div 
             className="subject-item"
             role="menuitem"
             tabIndex={0}
             style={{ padding: "6px 8px", fontSize: "12px", color: "#ff4d4f" }}
             onKeyDown={(e) => handleKeyDown(e, () => {
                setOpenMenu(null);
                deleteSubject(si, i);
             })}
             onClick={() => {
                setOpenMenu(null);
                deleteSubject(si, i);
             }}
          >
            Xóa môn
          </div>
        </div>
      </td>
    </tr>
  );
};

export default SubjectRow;
