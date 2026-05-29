import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Customers.module.css";

function AddDriverModal({ show, onClose, onAddDriver, loading }) {
  const [newDriver, setNewDriver] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    gioiTinh: "",
    matKhau: "",
    ngaySinh: "",
    bangLaiXe: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!newDriver.hoTen.trim()) {
      newErrors.hoTen = "Họ tên không được để trống";
    }

    if (!newDriver.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(newDriver.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!newDriver.soDienThoai.trim()) {
      newErrors.soDienThoai = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(newDriver.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ";
    }

    if (!newDriver.matKhau) {
      newErrors.matKhau = "Mật khẩu không được để trống";
    } else if (newDriver.matKhau.length < 6) {
      newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (newDriver.matKhau !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!newDriver.bangLaiXe.trim()) {
      newErrors.bangLaiXe = "Bằng lái xe không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddDriver(newDriver);
    }
  };

  const handleClose = () => {
    setNewDriver({
      hoTen: "",
      email: "",
      soDienThoai: "",
      gioiTinh: "",
      matKhau: "",
      ngaySinh: "",
      bangLaiXe: ""
    });
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Thêm Tài Xế Mới</h3>
          <button 
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Họ và Tên *</label>
              <input
                type="text"
                name="hoTen"
                value={newDriver.hoTen}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={errors.hoTen ? styles.errorInput : ""}
              />
              {errors.hoTen && <span className={styles.errorText}>{errors.hoTen}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={newDriver.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={errors.email ? styles.errorInput : ""}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Số Điện Thoại *</label>
              <input
                type="tel"
                name="soDienThoai"
                value={newDriver.soDienThoai}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={errors.soDienThoai ? styles.errorInput : ""}
              />
              {errors.soDienThoai && <span className={styles.errorText}>{errors.soDienThoai}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Giới Tính *</label>
              <select 
                name="gioiTinh" 
                value={newDriver.gioiTinh}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Mật Khẩu *</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="matKhau"
                  value={newDriver.matKhau}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  minLength="6"
                  placeholder="Ít nhất 6 ký tự"
                  className={errors.matKhau ? styles.errorInput : ""}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.matKhau && <span className={styles.errorText}>{errors.matKhau}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Xác Nhận Mật Khẩu *</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? styles.errorInput : ""}
              />
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ngày Sinh</label>
              <input
                type="date"
                name="ngaySinh"
                value={newDriver.ngaySinh}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Bằng Lái Xe *</label>
              <input
                type="text"
                name="bangLaiXe"
                value={newDriver.bangLaiXe}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="VD: B2, C, D..."
                className={errors.bangLaiXe ? styles.errorInput : ""}
              />
              {errors.bangLaiXe && <span className={styles.errorText}>{errors.bangLaiXe}</span>}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={styles.saveBtn}
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm Tài Xế"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDriverModal;