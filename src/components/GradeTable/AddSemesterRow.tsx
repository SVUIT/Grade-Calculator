import React from "react";
import type { Semester } from "../../types";

interface AddSemesterRowProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[] | ((prev: Semester[]) => Semester[])) => void;
}

const AddSemesterRow: React.FC<AddSemesterRowProps> = ({
  semesters,
  setSemesters,
}) => {
  return (
    <tr style={{ background: "transparent" }}>
      <td className="semester-bg"></td>
      <td colSpan={9} style={{ textAlign: "left", padding: 10 }}>
        <button
          onClick={() => {
            const newId = `sem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            if (typeof setSemesters === 'function') {
                setSemesters([
                  ...semesters,
                  {
                    id: newId,
                    name: "Nhập tên học kỳ",
                    subjects: [
                      {
                        maHP: "",
                        tenHP: "",
                        tinChi: "",
                        diemQT: "",
                        diemGK: "",
                        diemTH: "",
                        diemCK: "",
                        min_diemQT: "",
                        min_diemGK: "",
                        min_diemTH: "",
                        min_diemCK: "",
                        weight_diemQT: "20",
                        weight_diemGK: "20",
                        weight_diemTH: "20",
                        weight_diemCK: "40",
                        diemHP: "",
                        expectedScore: "",
                      },
                    ],
                  },
                ]);
            }
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            background: "transparent",
            color: "#8C8C8C",
            border: "none",
            cursor: "pointer"
          }}
        >
          + Thêm học kỳ
        </button>
      </td>
    </tr>
  );
};

export default AddSemesterRow;