import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import styles from "./Register.module.css";

const Register = () => {
  const [formData, setFormData] = useState({
    Ho_Ten: "",
    Email: "",
    Sdt: "",
    Gioi_tinh: "Nam",
    Mat_Khau: "",
    Xac_Nhan_Mat_Khau: "",
    Ngay_sinh: "",
    Dia_Chi: "",
    Bang_Lai_Xe: "",
    Vai_Tro: "TAIXE",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // HÀM KIỂM TRA ĐỦ TUỔI LÁI XE (>= 18 TUỔI)
  const kiemTraDuTuoi = (ngaySinh) => {
    if (!ngaySinh) return true;
    
    const today = new Date();
    const birthDate = new Date(ngaySinh);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // KIỂM TRA MẬT KHẨU TỐI THIỂU 6 KÝ TỰ
      if (formData.Mat_Khau.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự!");
      }

      // KIỂM TRA XÁC NHẬN MẬT KHẨU
      if (formData.Mat_Khau !== formData.Xac_Nhan_Mat_Khau) {
        throw new Error("Mật khẩu và xác nhận mật khẩu không khớp!");
      }

      // KIỂM TRA ĐỦ TUỔI LÁI XE
      if (!kiemTraDuTuoi(formData.Ngay_sinh)) {
        throw new Error("Bạn phải đủ 18 tuổi trở lên để đăng ký lái xe!");
      }

      console.log("Đang gọi API đăng ký tài xế...");

      // CHUẨN HÓA DATA THEO ENDPOINT register-tai-xe
      const registerData = {
        hoTen: formData.Ho_Ten,
        email: formData.Email,
        soDienThoai: formData.Sdt,
        gioiTinh: formData.Gioi_tinh,
        matKhau: formData.Mat_Khau,
        ngaySinh: formData.Ngay_sinh,
        diaChi: formData.Dia_Chi,
        bangLaiXe: formData.Bang_Lai_Xe,
      };

      // GỌI API ĐĂNG KÝ
      const res = await fetch("/api/user-service/auth/register-tai-xe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: Đăng ký thất bại`);
      }

      const data = await res.json();
      console.log("Register success:", data);

      // ĐĂNG KÝ THÀNH CÔNG - CHUYỂN SANG LOGIN
      setLoading(false);
      alert("Đăng ký tài xế thành công! Chuyển đến trang đăng nhập...");
      navigate("/login");

    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Đăng ký tài xế</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.inputuser}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Họ tên:</label>
            <input
              type="text"
              name="Ho_Ten"
              value={formData.Ho_Ten}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="example@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại:</label>
            <input
              type="text"
              name="Sdt"
              value={formData.Sdt}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="0987654321"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Giới tính:</label>
            <select
              name="Gioi_tinh"
              value={formData.Gioi_tinh}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              name="Mat_Khau"
              value={formData.Mat_Khau}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Xác nhận mật khẩu:</label>
            <input
              type="password"
              name="Xac_Nhan_Mat_Khau"
              value={formData.Xac_Nhan_Mat_Khau}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ngày sinh:</label>
            <input
              type="date"
              name="Ngay_sinh"
              value={formData.Ngay_sinh}
              onChange={handleChange}
              className={styles.input}
              disabled={loading}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ:</label>
            <input
              type="text"
              name="Dia_Chi"
              value={formData.Dia_Chi}
              onChange={handleChange}
              className={styles.input}
              disabled={loading}
              placeholder="Nhập địa chỉ đầy đủ"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bằng lái xe:</label>
            <input
              type="text"
              name="Bang_Lai_Xe"
              value={formData.Bang_Lai_Xe}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={loading}
              placeholder="VD: A1-123456, B2-789012"
            />
          </div>

          <input type="hidden" name="Vai_Tro" value="TAIXE" />
        </div>

        {/* HIỂN THỊ LỖI Ở ĐÂY - DƯỚI CÙNG TRƯỚC NÚT ĐĂNG KÝ */}
        {error && <div className={styles.error}>{error}</div>}

        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký tài xế"}
        </button>
        
        <div className={styles.loginLink}>
          <span>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></span>
        </div>
      </form>
    </div>
  );
};

export default Register;