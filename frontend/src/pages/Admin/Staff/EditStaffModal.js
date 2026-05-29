import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Staff.module.css";

function EditStaffModal({ show, onClose, onUpdateStaff, loading, staff }) {
  const [editStaff, setEditStaff] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    gioiTinh: "",
    ngaySinh: "",
    bangCap: "",
    kinhNghiem: "",
    matKhau: "" // Thêm field mật khẩu
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("info"); // "info" hoặc "password"

  // Khi staff thay đổi, cập nhật form
  useEffect(() => {
    if (staff) {
      setEditStaff({
        hoTen: staff.name || "",
        email: staff.email || "",
        soDienThoai: staff.soDienThoai || "",
        gioiTinh: staff.gioiTinh || "",
        ngaySinh: staff.ngaySinh ? staff.ngaySinh.split('T')[0] : "",
        bangCap: staff.bangCap || "",
        kinhNghiem: staff.kinhNghiem || "",
        matKhau: "" // Reset mật khẩu khi load thông tin mới
      });
      setConfirmPassword("");
      setActiveTab("info");
    }
  }, [staff]);

  const validateInfoForm = () => {
    const newErrors = {};

    if (!editStaff.hoTen.trim()) {
      newErrors.hoTen = "Họ tên không được để trống";
    }

    if (!editStaff.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(editStaff.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!editStaff.soDienThoai.trim()) {
      newErrors.soDienThoai = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(editStaff.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (editStaff.matKhau) {
      if (editStaff.matKhau.length < 6) {
        newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
      } else if (editStaff.matKhau !== confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditStaff(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error khi user bắt đầu nhập
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
      // Nếu ở tab password và không nhập mật khẩu mới, gửi mà không có matKhau
      const submitData = { ...editStaff };
      if (activeTab === "password" && !submitData.matKhau) {
        delete submitData.matKhau;
      }
      
      onUpdateStaff(staff.id, submitData);
    }
  };

  const handleClose = () => {
    setEditStaff({
      hoTen: "",
      email: "",
      soDienThoai: "",
      gioiTinh: "",
      ngaySinh: "",
      bangCap: "",
      kinhNghiem: "",
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

  if (!show || !staff) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa thông tin nhân viên</h3>
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
                    value={editStaff.hoTen}
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
                    value={editStaff.email}
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
                    value={editStaff.soDienThoai}
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
                    value={editStaff.gioiTinh}
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
                    value={editStaff.ngaySinh}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bằng Cấp</label>
                  <input
                    type="text"
                    name="bangCap"
                    value={editStaff.bangCap}
                    onChange={handleInputChange}
                    placeholder="VD: Đại học, Cao đẳng..."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Kinh Nghiệm</label>
                  <input
                    type="text"
                    name="kinhNghiem"
                    value={editStaff.kinhNghiem}
                    onChange={handleInputChange}
                    placeholder="VD: 2 năm kinh nghiệm..."
                    disabled={loading}
                  />
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
                      value={editStaff.matKhau}
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

export default EditStaffModal;