import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Customers.module.css";

function EditDriverModal({ show, onClose, onUpdateDriver, loading, driver }) {
  const [editDriver, setEditDriver] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    gioiTinh: "",
    ngaySinh: "",
    bangLaiXe: "",
    matKhau: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("info");

  // Khi driver thay đổi, cập nhật form
  useEffect(() => {
    if (driver) {
      setEditDriver({
        hoTen: driver.name || "",
        email: driver.email || "",
        soDienThoai: driver.soDienThoai || "",
        gioiTinh: driver.gioiTinh || "",
        ngaySinh: driver.ngaySinh ? driver.ngaySinh.split('T')[0] : "",
        bangLaiXe: driver.bangLaiXe || "",
        matKhau: ""
      });
      setConfirmPassword("");
      setActiveTab("info");
    }
  }, [driver]);

  const validateInfoForm = () => {
    const newErrors = {};

    if (!editDriver.hoTen.trim()) {
      newErrors.hoTen = "Họ tên không được để trống";
    }

    if (!editDriver.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(editDriver.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!editDriver.soDienThoai.trim()) {
      newErrors.soDienThoai = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(editDriver.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ";
    }

    if (!editDriver.bangLaiXe.trim()) {
      newErrors.bangLaiXe = "Bằng lái xe không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (editDriver.matKhau) {
      if (editDriver.matKhau.length < 6) {
        newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
      } else if (editDriver.matKhau !== confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDriver(prev => ({
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

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let isValid = false;
    
    if (activeTab === "info") {
      isValid = validateInfoForm();
    } else if (activeTab === "password") {
      isValid = validatePasswordForm();
    }

    if (isValid) {
      const submitData = { ...editDriver };
      if (activeTab === "password" && !submitData.matKhau) {
        delete submitData.matKhau;
      }
      
      onUpdateDriver(driver.id, submitData);
    }
  };

  const handleClose = () => {
    setEditDriver({
      hoTen: "",
      email: "",
      soDienThoai: "",
      gioiTinh: "",
      ngaySinh: "",
      bangLaiXe: "",
      matKhau: ""
    });
    setConfirmPassword("");
    setErrors({});
    setActiveTab("info");
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!show || !driver) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa thông tin tài xế</h3>
          <button 
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === "info" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("info")}
            type="button"
          >
            Thông tin cá nhân
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === "password" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("password")}
            type="button"
          >
            Đổi mật khẩu
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Tab Thông tin cá nhân */}
          {activeTab === "info" && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Họ và Tên *</label>
                  <input
                    type="text"
                    name="hoTen"
                    value={editDriver.hoTen}
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
                    value={editDriver.email}
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
                    value={editDriver.soDienThoai}
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
                    value={editDriver.gioiTinh}
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
                  <label>Ngày Sinh</label>
                  <input
                    type="date"
                    name="ngaySinh"
                    value={editDriver.ngaySinh}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bằng Lái Xe *</label>
                  <input
                    type="text"
                    name="bangLaiXe"
                    value={editDriver.bangLaiXe}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="VD: B2, C, D..."
                    className={errors.bangLaiXe ? styles.errorInput : ""}
                  />
                  {errors.bangLaiXe && <span className={styles.errorText}>{errors.bangLaiXe}</span>}
                </div>
              </div>
            </>
          )}

          {/* Tab Đổi mật khẩu */}
          {activeTab === "password" && (
            <div className={styles.passwordSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Mật khẩu mới</label>
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="matKhau"
                      value={editDriver.matKhau}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Để trống nếu không đổi mật khẩu"
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
                  <div className={styles.passwordHint}>
                    Mật khẩu phải có ít nhất 6 ký tự
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={loading}
                    placeholder="Nhập lại mật khẩu mới"
                    className={errors.confirmPassword ? styles.errorInput : ""}
                  />
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className={styles.passwordNote}>
                <p><strong>Lưu ý:</strong></p>
                <ul>
                  <li>Để trống mật khẩu nếu không muốn thay đổi</li>
                  <li>Mật khẩu mới phải có ít nhất 6 ký tự</li>
                  <li>Mật khẩu xác nhận phải khớp với mật khẩu mới</li>
                </ul>
              </div>
            </div>
          )}

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
              {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDriverModal;