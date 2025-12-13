import React from "react";
import type { Semester, Subject, SubjectData } from "../../types";
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

  editSearchResults: { category: string; subjects: SubjectData[] }[];
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
    // Cast to any to access string index, or ensure Subject type has index signature
    (updated[si].subjects[i] as any)[f] = normalized;

    // Reset min scores
    ["diemQT", "diemGK", "diemTH", "diemCK"].forEach((field) => {
       (updated[si].subjects[i] as any)[`min_${field}`] = "";
    });

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

  return (
    <tr>
      <td className="semester-bg" style={{ textAlign: "center" }}>{i + 1}</td>

      {["maHP", "tenHP", "tinChi"].map((f) => (
        <td
          key={f}
          style={{
            position: "relative",
            textAlign: f === "maHP" || f === "tinChi" ? "center" : "left",
          }}
        >
          {(f === "maHP" || f === "tenHP") && (
            <>
              <div
                contentEditable
                suppressContentEditableWarning
                className="editable-cell"
                data-placeholder={f === "maHP" ? "Nhập mã\nHP" : "Nhập tên HP"}
                role="textbox"
                tabIndex={0}
                style={
                  f === "maHP" ? { whiteSpace: "pre-wrap", lineHeight: "1.2" } : {}
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDropdownOpen({ s: si, i, field: f });
                  setEditSearchTerm("");
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault(); 
                        setEditDropdownOpen({ s: si, i, field: f });
                    }
                }}
              >
                {(sub as any)[f]}
              </div>

              {editDropdownOpen?.s === si &&
                editDropdownOpen?.i === i &&
                editDropdownOpen?.field === f && (
                  <SearchDropdown
                    searchTerm={editSearchTerm}
                    setSearchTerm={setEditSearchTerm}
                    searchResults={editSearchResults}
                    expandedCategories={editExpandedCategories}
                    setExpandedCategories={setEditExpandedCategories}
                    autoFocus={true}
                    minWidth={250}
                    onSelect={(subject: SubjectData) => {
                      const updated = [...semesters];
                      updated[si].subjects[i].maHP = subject.code;
                      updated[si].subjects[i].tenHP = subject.name;
                      setSemesters(updated);
                      setEditDropdownOpen(null);
                      setEditSearchTerm("");
                      setEditExpandedCategories(new Set());
                    }}
                  />
                )}
            </>
          )}

          {f === "tinChi" && (
            <div
              contentEditable
              suppressContentEditableWarning
              className="editable-cell editable-cell-multiline"
              data-placeholder="Nhập tín chỉ"
              role="textbox"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                updateSubjectField(si, i, f, e.target.innerText);
              }}
            >
              {(sub as any)[f]}
            </div>
          )}
        </td>
      ))}
      
      {["diemQT", "diemGK", "diemTH", "diemCK"].map((f) => {
        const score = (sub as any)[f];
        const minScore = (sub as any)[`min_${f}`];
        const hasMinScore = minScore && minScore.toString().trim() !== "";
        const isOver10 = hasMinScore && Number(minScore) > 10;

        return (
          <td
            key={f}
            className="score-cell"
            style={{
              background: hasMinScore ? "var(--primary-purple)" : "transparent",
            }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              title={`Trọng số: ${(sub as any)[`weight_${f}`]}%`}
              className={`score-content ${
                hasMinScore
                  ? isOver10
                    ? "score-over-10"
                    : "text-white"
                  : "text-normal"
              }`}
              data-placeholder={`Nhập điểm ${f.replace("diem", "")}`}
              role="textbox"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => handleScoreBlur(f, e.target.innerText, e.target as HTMLElement)}
            >
              {hasMinScore ? minScore : score}
            </div>
          </td>
        );
      })}

      <td style={{ textAlign: "center" }}>
        <b style={{ color: "var(--text-color)" }}>{calcSubjectScore(sub)}</b>
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
            right: "-10px", // Aligned with the dots
            top: "75%",    // Below the dots
            marginTop: 0,
            borderRadius: 8,
            minWidth: 140,
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