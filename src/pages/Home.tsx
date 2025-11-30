import { useState } from "react";

export default function Home() {
  const [semesters, setSemesters] = useState<{
    name: string;
    subjects: any[];
  }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<{ semesterIdx: number; subjectIdx: number } | null>(null);

  // ======================= ADD SUBJECT ========================
  const addSubject = (idx: number) => {
    const updated = [...semesters];
    updated[idx].subjects.push({
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
      weight_diemQT: "",
      weight_diemGK: "",
      weight_diemTH: "",
      weight_diemCK: "",
      diemHP: "",
    });
    setSemesters(updated);
  };

  // ======================= DELETE SUBJECT =====================
  const deleteSubject = (s: number, i: number) => {
    const updated = [...semesters];
    updated[s].subjects.splice(i, 1);
    setSemesters(updated);
  };

  // ======================= OPEN POPUP EDIT ====================
  const openAdvancedModal = (s: number, i: number) => {
    setEditing({ semesterIdx: s, subjectIdx: i });
    setModalOpen(true);
  };

  // ================== UPDATE ANY FIELD ========================
  const updateSubjectField = (s: number, i: number, f: string, v: string) => {
    const updated = [...semesters];
    updated[s].subjects[i][f] = v;
    setSemesters(updated);
  };

  // ================== AUTO CALCULATE - ĐIỂM HP =================
  const calcSubjectScore = (subj: {
    diemQT: any;
    diemGK: any;
    diemTH: any;
    diemCK: any;
    weight_diemQT: any;
    weight_diemGK: any;
    weight_diemTH: any;
    weight_diemCK: any;
  }) => {
    const scores = [
      Number(subj.diemQT) || 0,
      Number(subj.diemGK) || 0,
      Number(subj.diemTH) || 0,
      Number(subj.diemCK) || 0,
    ];

    const weights = [
      Number(subj.weight_diemQT) || 0,
      Number(subj.weight_diemGK) || 0,
      Number(subj.weight_diemTH) || 0,
      Number(subj.weight_diemCK) || 0,
    ];

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    if (totalWeight !== 100) return "Sai %"; 

    return (
      scores[0] * (weights[0] / 100) +
      scores[1] * (weights[1] / 100) +
      scores[2] * (weights[2] / 100) +
      scores[3] * (weights[3] / 100)
    ).toFixed(2);
  };

  // ================== TRUNG BÌNH HỌC KỲ =======================
  const calcSemesterAverage = (subjects: any[]) => {
    let totalTC = 0,
      totalScore = 0;

    subjects.forEach((sub) => {
      const hp = Number(calcSubjectScore(sub));
      const tc = Number(sub.tinChi);
      if (!isNaN(hp) && !isNaN(tc)) {
        totalTC += tc;
        totalScore += hp * tc;
      }
    });

    if (totalTC === 0) return { tc: 0, avg: 0 };
    return { tc: totalTC, avg: (totalScore / totalTC).toFixed(2) };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Bảng điểm</h1>

      {/* TABLE CHÍNH */}
      <table
        border={1}
  cellPadding={8}
  style={{
    width: "100%",
    borderCollapse: "collapse",
    background: "transparent", // nền trong suốt
    color: "white",            // chữ trắng toàn bảng
    borderColor: "#515058",    // đường kẻ màu
  }}
      >
        <thead>
          <tr style={{ background: "#711AFF", color: "#fff" }}>
            <th style={{ border: "1px solid #515058", color: "#711AFF" }}>STT</th>
            <th style={{ border: "1px solid #515058" }}>Mã HP</th>
            <th style={{ border: "1px solid #515058" }}>Tên học phần</th>
            <th style={{ border: "1px solid #515058" }}>Tín chỉ</th>
            <th style={{ border: "1px solid #515058" }}>QT</th>
            <th style={{ border: "1px solid #515058" }}>GK</th>
            <th style={{ border: "1px solid #515058" }}>TH</th>
            <th style={{ border: "1px solid #515058" }}>CK</th>
            <th style={{ border: "1px solid #515058" }}>Điểm HP</th>
            <th style={{ border: "1px solid #515058" }}>Điểm kỳ vọng</th>
          </tr>
        </thead>

        <tbody>
          {semesters.map((sem, si) => {
            const avg = calcSemesterAverage(sem.subjects);

            return (
              <>
                {/* HÀNG HỌC KỲ */}
                <tr key={"sem" + si}>
                  <td style={{ background: "#711AFF", color: "#fff" }}></td>
  <td colSpan={10} style={{ background: "transparent", fontWeight: "bold" }}>
    {" "}
    <span
      contentEditable
      suppressContentEditableWarning
      style={{ cursor: "pointer" }}
      onBlur={(e) => {
        const updated = [...semesters];
        updated[si].name = e.currentTarget.textContent || "";
        setSemesters(updated);
      }}
    >
      {sem.name}
    </span>
    <button
      onClick={() => addSubject(si)}
      style={{ marginLeft: 10, padding: "4px 8px"}}
    >
      + Thêm môn
    </button>
  </td>
</tr>


                {/* MÔN HỌC */}
                {sem.subjects.map((sub, i) => (
                  <tr key={i}>
                    <td style={{ background: "#711AFF" }}>{i + 1}</td>

                    {["maHP", "tenHP", "tinChi"].map((f) => (
                      <td key={f}>
                        <input
                          value={sub[f]}
                          style={{
                            width: "100%",
                            border: "none",        // bỏ khung
                            outline: "none",       // bỏ highlight khi focus
                            background: "transparent",
                            color: "white",        // chữ trắng
                          }}
                          onChange={(e) => updateSubjectField(si, i, f, e.target.value)}
                        />
                      </td>
                    ))}

                    {["diemQT", "diemGK", "diemTH", "diemCK"].map((f) => (
                      <td key={f}>
                        <input
                          value={sub[f]}
                          style={{
                            width: "100%",
                            border: "none",        // bỏ khung
                            outline: "none",       // bỏ highlight khi focus
                            background: "transparent",
                            color: "white",        // chữ trắng
                          }}
                          onChange={(e) => updateSubjectField(si, i, f, e.target.value)}
                        />
                      </td>
                    ))}

                    <td>
                      <b style={{ color: "#fff" }}>{calcSubjectScore(sub)}</b>
                    </td>

                    <td>{/* Điểm kỳ vọng */}</td>

                    <td style={{ position: "relative", border: "none" }}>
                      <span
                        style={{ cursor: "pointer", fontSize: 22 }}
                        onClick={() => {
                          const m = document.getElementById(`menu-${si}-${i}`);
                          m && (m.style.display = m.style.display === "block" ? "none" : "block");
                        }}
                      >
                        ⋮
                      </span>

                      <div
                        id={`menu-${si}-${i}`}
                        style={{
                          display: "none",
                          position: "absolute",
                          right: 0,
                          top: 25,
                          background: "#2E2D33",
                          border: "1px solid #4F4F4F",
                          zIndex: 10,
                        }}
                      >
                        <div style={{ padding: 6, cursor: "pointer" }} onClick={() => deleteSubject(si, i)}>
                          Xóa
                        </div>

                        <div style={{ padding: 6, cursor: "pointer" }} onClick={() => openAdvancedModal(si, i)}>
                          Chỉnh sửa
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* TRUNG BÌNH HỌC KỲ */}
                <tr style={{ background: "transparent", fontWeight: "bold" }}>
                  <td style={{ background: "#711AFF", color: "#fff" }}></td>
                  <td colSpan={2}>Trung bình học kỳ</td>
                  <td>{avg.tc}</td>
                  <td colSpan={4}></td>
                  <td>{avg.avg}</td>
                  <td></td>
                </tr>
              </>
            );
          })}

          {/* =================== HÀNG + THÊM HỌC KỲ CUỐI CÙNG =================== */}
          <tr style={{ background: "transparent" }}>
            <td style={{ background: "#711AFF", color: "#fff" }}></td>
  <td colSpan={10} style={{ textAlign: "left", padding: 10 }}>
    <button
      onClick={() =>
        setSemesters([...semesters, { name: "Nhập tên học kỳ", subjects: [] }])
      }
      style={{
        padding: "6px 12px",
        borderRadius: 4,
        background: "transparent",
        color: "#fff",
      }}
    >
      + Thêm học kỳ
    </button>
  </td>
</tr>


          {/* 1) Tổng số tín chỉ toàn khóa */}
          <tr style={{ background: "transparent", fontWeight: "bold" }}>
            <td style={{ background: "#711AFF", color: "#fff" }}></td>
            <td colSpan={2}>Số tín chỉ đã học</td>
            <td>
              {semesters.reduce(
                (sum, sem) => sum + sem.subjects.reduce((a, s) => a + Number(s.tinChi || 0), 0),
                0
              )}
            </td>

            <td colSpan={4}></td>
            <td style={{ color: "black" }}></td>
            <td></td>
          </tr>

          {/* 2) Điểm trung bình chung toàn khóa */}
          <tr style={{ background: "transparent", fontWeight: "bold" }}>
            <td style={{ background: "#711AFF", color: "#fff" }}></td>
            <td colSpan={2}>Điểm trung bình chung</td>

            <td colSpan={5}></td>

            <td>
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
        </tbody>
      </table>

      {/* ================== POPUP EDIT ================== */}
      {modalOpen && editing && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }}
            onClick={() => setModalOpen(false)}
          />

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "#2B2A2F",
              padding: 20,
              borderRadius: 8,
              minWidth: 450,
              zIndex: 100,
            }}
          >
            <h3>{semesters[editing.semesterIdx].subjects[editing.subjectIdx].tenHP}</h3>

            <table border={1} cellPadding={6} style={{ width: "100%", textAlign: "center" }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Điểm hiện tại</th>
                  <th>Điểm tối thiểu</th>
                  <th>Trọng số (%)</th>
                </tr>
              </thead>

              <tbody>
                {["diemQT", "diemGK", "diemTH", "diemCK"].map((f) => (
                  <tr key={f}>
                    <td>{f.replace("diem", "Điểm ")}</td>

                    <td>
                      <input
                        value={semesters[editing.semesterIdx].subjects[editing.subjectIdx][f]}
                        onChange={(e) =>
                          updateSubjectField(editing.semesterIdx, editing.subjectIdx, f, e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={semesters[editing.semesterIdx].subjects[editing.subjectIdx][`min_${f}`] || ""}
                        onChange={(e) =>
                          updateSubjectField(editing.semesterIdx, editing.subjectIdx, `min_${f}`, e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        value={semesters[editing.semesterIdx].subjects[editing.subjectIdx][`weight_${f}`] || ""}
                        placeholder="Nhập %"
                        onChange={(e) =>
                          updateSubjectField(editing.semesterIdx, editing.subjectIdx, `weight_${f}`, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "end", gap: 10 }}>
              <button style={{ background: "#5B5A64", padding: "6px 12px" }} onClick={() => setModalOpen(false)}>
                Hủy
              </button>

              <button style={{ background: "#711AFF", color: "#fff", padding: "6px 12px" }} onClick={() => setModalOpen(false)}>
                Lưu
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
