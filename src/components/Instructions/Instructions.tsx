import React from "react";

const Instructions: React.FC = () => {
  return (
    <div className="instructions-container">
      <h1>Hướng dẫn sử dụng</h1>
      
      <section>
        <h2>1. Cách tính điểm trung bình (GPA)</h2>
        <div className="instruction-item">
          <h3>Điểm học phần (Môn học)</h3>
          <p>
            Điểm học phần được tính bằng tổng điểm các thành phần nhân với trọng số tương ứng:
          </p>
          <code>
            Điểm HP = (QT × wQT) + (GK × wGK) + (TH × wTH) + (CK × wCK)
          </code>
          <p>Trong đó:</p>
          <ul>
            <li><strong>QT, GK, TH, CK</strong>: Điểm Quá trình, Giữa kỳ, Thực hành, Cuối kỳ.</li>
            <li><strong>w</strong>: Trọng số của từng cột điểm (Tổng trọng số phải bằng 100%).</li>
          </ul>
        </div>

        <div className="instruction-item">
          <h3>Điểm trung bình học kỳ / Toàn khóa</h3>
          <p>Sử dụng công thức tính điểm trung bình có trọng số theo số tín chỉ:</p>
          <code>
            ĐTB = Σ(Điểm HP × Số tín chỉ) / Σ(Tổng số tín chỉ)
          </code>
        </div>
      </section>

      <section>
        <h2>2. Điểm kỳ vọng (Expected Score)</h2>
        <div className="instruction-item">
          <h3>Cách thức hoạt động</h3>
          <p>
            Khi bạn nhập một con số vào cột <strong>"Điểm kỳ vọng"</strong>, hệ thống sẽ tự động tính toán số điểm 
            tối thiểu bạn cần đạt được ở các cột điểm <em>chưa có kết quả</em> để đạt được mục tiêu đó.
          </p>
          <p>Công thức tính điểm thành phần cần thiết:</p>
          <code>
            Điểm cần đạt = (Điểm kỳ vọng - Điểm đã có) / Trọng số còn lại
          </code>
          <p>
            <em>Lưu ý:</em> Nếu điểm cần đạt vượt quá 10.0, hệ thống sẽ hiển thị chữ màu đỏ để cảnh báo mục tiêu có thể không khả thi.
          </p>
        </div>
      </section>

      <section>
        <h2>3. Cơ chế tự động tính toán lại (Rebalancing)</h2>
        <p>Hệ thống hỗ trợ tính toán bắc cầu từ cấp độ cao nhất xuống thấp nhất:</p>
        <div className="instruction-item">
          <ul>
            <li>
              <strong>Kỳ vọng chung:</strong> Khi nhập mục tiêu GPA toàn khóa, hệ thống sẽ phân bổ điểm cần đạt cho tất cả các học kỳ chưa hoàn thành.
            </li>
            <li>
              <strong>Kỳ vọng học kỳ:</strong> Khi nhập mục tiêu GPA học kỳ, hệ thống sẽ phân bổ điểm cho các môn học trong kỳ đó dựa trên số tín chỉ.
            </li>
            <li>
              <strong>Thứ tự ưu tiên:</strong> Nếu bạn nhập thủ công điểm kỳ vọng cho một môn, môn đó sẽ được "khóa" và hệ thống sẽ điều chỉnh điểm các môn còn lại để vẫn đảm bảo mục tiêu chung của học kỳ.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>4. Quy định & Hướng dẫn nhập liệu</h2>
        <div className="instruction-item">
          <ul>
            <li><strong>Tìm kiếm môn:</strong> Click vào cột "Mã HP" hoặc "Tên HP" để tìm kiếm môn học có sẵn trong dữ liệu UIT (tự động điền tín chỉ và trọng số mặc định).</li>
            <li><strong>Dữ liệu:</strong> Mọi thông tin bạn nhập được lưu tự động vào trình duyệt (Local Storage) và sẽ không mất đi khi bạn tải lại trang.</li>
            <li>
              <strong>Tùy chỉnh:</strong> Bạn có thể click vào nút 3 chấm 
              <span className="three-dots">⋮</span> 
              để chỉnh sửa trọng số % hoặc xóa môn học/học kỳ.
            </li>
            <li>
              <strong>Khôi phục mặc định:</strong> Bạn có thể nhấn vào dòng chữ <em>"Khôi phục mặc định"</em>. 
              Hệ thống sẽ dựa vào Mã HP để lấy lại bộ trọng số (QT, GK, TH, CK) chuẩn từ cơ sở dữ liệu của nhà trường nếu bạn lỡ tay chỉnh sửa sai.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Instructions;