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
            Điểm học phần được tính dựa trên <strong>các điểm thành phần mà bạn nhập thủ công</strong>, 
            theo công thức:
          </p>
          <code>
            Điểm HP = (QT × wQT) + (GK × wGK) + (TH × wTH) + (CK × wCK)
          </code>

          <p>Trong đó:</p>
          <ul>
            <li><strong>QT, GK, TH, CK</strong>: Điểm Quá trình, Giữa kỳ, Thực hành, Cuối kỳ.</li>
            <li><strong>w</strong>: Trọng số (%) của từng cột điểm.</li>
          </ul>

          <p>
            <strong>Lưu ý quan trọng:</strong> 
            Điểm học phần <u>chỉ được tính từ các điểm bạn nhập trực tiếp</u>. 
            Các giá trị do hệ thống tự gợi ý từ <em>Điểm kỳ vọng</em> sẽ <strong>không</strong> được dùng để tính Điểm HP.
          </p>
        </div>

        <div className="instruction-item">
          <h3>Điểm trung bình học kỳ / Toàn khóa</h3>
          <p>Sử dụng công thức trung bình có trọng số theo số tín chỉ:</p>
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
            Khi bạn nhập giá trị vào cột <strong>"Điểm kỳ vọng"</strong>, hệ thống sẽ 
            <strong>tính toán và hiển thị điểm tối thiểu cần đạt</strong> ở các cột điểm 
            chưa có kết quả.
          </p>

          <p>Công thức gợi ý:</p>
          <code>
            Điểm cần đạt = (Điểm kỳ vọng − Điểm đã có) / Trọng số còn lại
          </code>

          <p>
            Các điểm này chỉ mang tính <strong>tham khảo / hỗ trợ lập kế hoạch</strong>, 
            <strong>không được xem là điểm thật</strong> và 
            <strong>không ảnh hưởng đến Điểm HP</strong> nếu bạn chưa nhập điểm thực tế.
          </p>

          <p>
            <em>
              Nếu điểm cần đạt lớn hơn 10.0, hệ thống sẽ hiển thị màu đỏ để cảnh báo mục tiêu khó hoặc không khả thi.
            </em>
          </p>
        </div>
      </section>

      <section>
        <h2>3. Trọng số bằng 0 (Cột bị vô hiệu hóa)</h2>

        <div className="instruction-item">
          <p>
            Khi một cột điểm có <strong>trọng số = 0%</strong>:
          </p>
          <ul>
            <li>Cột điểm đó sẽ được <strong>tô màu xám</strong> để phân biệt.</li>
            <li>Điểm trong cột <strong>không được tính</strong> vào Điểm HP.</li>
            <li>Hệ thống chỉ hiển thị nhãn <em>"Điểm QT / GK / TH / CK"</em> (không có chữ “Nhập”).</li>
          </ul>

          <p>
            Điều này thường dùng cho các môn <strong>không có một số thành phần điểm nhất định</strong> 
            (ví dụ: không có Thực hành hoặc Giữa kỳ).
          </p>
        </div>
      </section>

      <section>
        <h2>4. Cơ chế tự động tính toán lại (Rebalancing)</h2>

        <div className="instruction-item">
          <ul>
            <li>
              <strong>Kỳ vọng toàn khóa:</strong> Phân bổ điểm cần đạt cho các học kỳ chưa hoàn thành.
            </li>
            <li>
              <strong>Kỳ vọng học kỳ:</strong> Phân bổ điểm cho các môn trong học kỳ theo số tín chỉ.
            </li>
            <li>
              <strong>Ưu tiên thủ công:</strong> Nếu bạn nhập điểm kỳ vọng cho một môn, môn đó sẽ được giữ nguyên 
              và hệ thống điều chỉnh các môn còn lại để đảm bảo mục tiêu chung.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>5. Quy định & Hướng dẫn nhập liệu</h2>

        <div className="instruction-item">
          <ul>
            <li>
              <strong>Tìm kiếm môn:</strong> Click vào "Mã HP" hoặc "Tên HP" để tìm môn học trong dữ liệu UIT 
              (tự động điền tín chỉ và trọng số mặc định).
            </li>
            <li>
              <strong>Lưu dữ liệu:</strong> Mọi thay đổi được lưu tự động trong trình duyệt (Local Storage).
            </li>
            <li>
              <strong>Tùy chỉnh:</strong> Nhấn vào biểu tượng 
              <span className="three-dots"> ⋮ </span>
              để chỉnh sửa trọng số hoặc xóa môn / học kỳ.
            </li>
            <li>
              <strong>Khôi phục mặc định:</strong> Dùng chức năng <em>"Khôi phục mặc định"</em> để lấy lại 
              trọng số chuẩn theo Mã HP từ cơ sở dữ liệu nhà trường.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>5. Hướng dẫn nhập điểm từ file PDF</h2>
        <div className="instruction-item">
          <h3>Cách nhập điểm từ file PDF</h3>
          <ol>
            <li>Lấy file PDF từ hệ thống UIT:
              <ol type="a">
                <li>Truy cập <a href="https://student.uit.edu.vn/sinhvien/kqhoctap" target="_blank" rel="noopener noreferrer">https://student.uit.edu.vn/sinhvien/kqhoctap</a></li>
                <li>Nhấn vào nút <strong>"In Bảng Điểm"</strong></li>
                <li>Nhấn <kbd>CTRL + P</kbd>, chọn lưu dưới dạng PDF và bấm lưu</li>
              </ol>
            </li>
            <li>Trong ứng dụng này, nhấn vào nút <strong>"Nhập từ PDF"</strong></li>
            <li>Chọn file PDF vừa tải về</li>
            <li>Chờ hệ thống xử lý và trích xuất dữ liệu</li>
            <li>Kiểm tra và xác nhận dữ liệu đã được nhập tự động</li>
          </ol>

          <h3>Lưu ý khi sử dụng tính năng nhập từ PDF</h3>
          <ul>
            <li>Chỉ hỗ trợ file PDF xuất từ hệ thống quản lý đào tạo của trường</li>
            <li>Đảm bảo file PDF không bị khóa hoặc bảo vệ bằng mật khẩu</li>
            <li>Hệ thống sẽ tự động nhận diện và điền các thông tin:
              <ul>
                <li>Mã học phần và tên học phần</li>
                <li>Số tín chỉ</li>
                <li>Điểm quá trình, giữa kỳ, thực hành, cuối kỳ (nếu có)</li>
                <li>Trọng số mặc định của từng môn học</li>
              </ul>
            </li>
            <li>Sau khi nhập, bạn có thể chỉnh sửa lại thông tin nếu cần thiết</li>
          </ul>

          <p className="note">
            <strong>Lưu ý quan trọng:</strong> Vui lòng kiểm tra kỹ dữ liệu sau khi nhập từ file PDF để đảm bảo tính chính xác.
          </p>
        </div>
      </section>

      <section>
        <h2>6. Xuất dữ liệu ra file Excel</h2>
        <div className="instruction-item">
          <h3>Cách xuất dữ liệu ra Excel</h3>
          <ol>
            <li>Đảm bảo bạn đã nhập đầy đủ dữ liệu điểm số</li>
            <li>Nhấn vào nút <strong>"Xuất Excel"</strong> ở góc trên bên phải màn hình</li>
            <li>Chọn vị trí lưu file trên máy tính của bạn</li>
            <li>Đặt tên file và nhấn <strong>Lưu</strong></li>
          </ol>

          <h3>Thông tin có trong file Excel</h3>
          <ul>
            <li>Toàn bộ thông tin môn học đã nhập</li>
            <li>Điểm các thành phần (quá trình, giữa kỳ, thực hành, cuối kỳ)</li>
            <li>Trọng số từng phần</li>
            <li>Điểm tổng kết môn học</li>
            <li>Điểm kỳ vọng (nếu có)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Instructions;
