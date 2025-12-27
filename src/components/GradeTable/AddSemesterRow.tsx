import React from "react";
import type { Semester } from "../../types";
import { v4 as uuidv4 } from "uuid";

interface AddSemesterRowProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;
}

const AddSemesterRow: React.FC<AddSemesterRowProps> = ({ semesters, setSemesters }) => {
  return (
    <tr style={{ background: "transparent" }}>
      <td className="semester-bg"></td>
      <td colSpan={9} style={{ textAlign: "left", padding: 10 }}>
        <button
          onClick={() => {
            const newId = `sem-${uuidv4()}`;
            const newSubId = `sub-${uuidv4()}`;

            setSemesters([
              ...semesters,
              {
                id: newId,
                name: "Nhập tên học kỳ",
                semesterName: "Nhập tên học kỳ",
                year: new Date().getFullYear().toString(),
                subjects: [
                  {
                    id: newSubId,
                    courseCode: "",
                    courseName: "",
                    credits: "",
                    progressScore: "",
                    midtermScore: "",
                    practiceScore: "",
                    finalScore: "",
                    minProgressScore: "",
                    minMidtermScore: "",
                    minPracticeScore: "",
                    minFinalScore: "",
                    progressWeight: "20",
                    midtermWeight: "20",
                    practiceWeight: "20",
                    finalWeight: "40",
                    score: "",
                    expectedScore: "",
                  },
                ],
              },
            ]);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            background: "transparent",
            color: "#8C8C8C",
            border: "none",
            cursor: "pointer",
          }}
        >
          + Thêm học kỳ
        </button>
      </td>
    </tr>
  );
};

export default AddSemesterRow;
