// pages/Admin/InformationAdmin/InformationAdmin.js
import { useState, useEffect } from "react";
import Button from "../../../components/Shares/Button/Button.js";
import styles from "./InformationAdmin.module.css";

// Hàm chuẩn hóa ngày sinh về yyyy-MM-dd
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    if (dateStr.includes('-')) {
        const [first, second, third] = dateStr.split('-');
        if (first.length === 4) return dateStr;
        return `${third}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
    }
    return dateStr;
};

function InformationAdmin() {
    // ==== PHẦN THÔNG TIN ADMIN ====
    const [userInfo, setUserInfo] = useState(null);
    const [editUserInfo, setEditUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State cho modal đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const fetchAdminInfo = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                window.location.href = "/login";
                return;
            }

            try {
                // Sử dụng endpoint /quanly/{id} để lấy thông tin admin
                const response = await fetch(`/api/user-service/quanly/${userId}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                setUserInfo(data);
                setEditUserInfo({
                    maNguoiDung: data.maNguoiDung,
                    hoTen: data.hoTen || "",
                    email: data.email || "",
                    soDienThoai: data.soDienThoai || "",
                    gioiTinh: data.gioiTinh || "",
                    ngaySinh: (data.ngaySinh || "").substring(0, 10)
                });
            } catch (error) {
                console.error("Error fetching admin data:", error);
                alert("Lỗi tải thông tin admin: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminInfo();
    }, []);

    // Hàm Lưu thay đổi thông tin
    const handleSaveAdmin = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            alert("Vui lòng đăng nhập lại!");
            return;
        }

        const payload = {
            hoTen: editUserInfo.hoTen,
            email: editUserInfo.email,
            soDienThoai: editUserInfo.soDienThoai,
            gioiTinh: editUserInfo.gioiTinh,
            ngaySinh: formatDate(editUserInfo.ngaySinh)
        };

        try {
            const response = await fetch(`/api/user-service/quanly/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert("Cập nhật thành công!");
            setUserInfo(prev => ({ ...prev, ...payload }));
        } catch (error) {
            console.error("Error updating admin data:", error);
            alert("Cập nhật thất bại!\n" + error.message);
        }
    };

    // Hàm đổi mật khẩu
    const handleChangePassword = async () => {
        if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        setChangingPassword(true);

        try {
            const payload = {
                ...editUserInfo,
                matKhau: passwordForm.newPassword
            };

            const response = await fetch(`/api/user-service/quanly/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            alert("Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Đổi mật khẩu thất bại!\n" + error.message);
        } finally {
            setChangingPassword(false);
        }
    };

    // Mở modal đổi mật khẩu
    const openPasswordModal = () => {
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setShowPasswordModal(true);
    };

    if (loading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {/* ====== Thông tin hồ sơ admin ====== */}
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Thông Tin Quản Trị Viên</h1>
                </div>
                
                <form className={styles.form} onSubmit={e => e.preventDefault()}>
                    {/* ID Admin - chỉ hiển thị, không chỉnh sửa */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Mã Admin</label>
                        <input
                            type="text"
                            value={editUserInfo?.maNguoiDung || ""}
                            readOnly
                            className={styles.readonlyInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tên Đầy Đủ</label>
                        <input
                            type="text"
                            value={editUserInfo?.hoTen || ""}
                            onChange={e => setEditUserInfo({ ...editUserInfo, hoTen: e.target.value })}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={editUserInfo?.email || ""}
                            onChange={e => setEditUserInfo({ ...editUserInfo, email: e.target.value })}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Số Điện Thoại</label>
                        <input
                            type="text"
                            value={editUserInfo?.soDienThoai || ""}
                            onChange={e => setEditUserInfo({ ...editUserInfo, soDienThoai: e.target.value })}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Giới tính</label>
                        <select
                            value={editUserInfo?.gioiTinh || ""}
                            onChange={e => setEditUserInfo({ ...editUserInfo, gioiTinh: e.target.value })}
                            className={styles.input}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ngày sinh</label>
                        <input
                            type="date"
                            value={editUserInfo?.ngaySinh || ""}
                            onChange={e => setEditUserInfo({ ...editUserInfo, ngaySinh: e.target.value })}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <Button 
                            type="button" 
                            onClick={handleSaveAdmin}
                            className={styles.primaryBtn}
                        >
                            Lưu Thay Đổi
                        </Button>
                        
                        <Button 
                            type="button" 
                            onClick={openPasswordModal}
                            className={styles.secondaryBtn}
                        >
                            Đổi Mật Khẩu
                        </Button>
                    </div>
                </form>
            </div>

            {/* ====== Modal đổi mật khẩu ====== */}
            {showPasswordModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Đổi Mật Khẩu</h2>
                            <button 
                                className={styles.closeButton}
                                onClick={() => setShowPasswordModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    className={styles.input}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    className={styles.input}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelBtn}
                                onClick={() => setShowPasswordModal(false)}
                                disabled={changingPassword}
                            >
                                Hủy
                            </button>
                            <button 
                                className={styles.confirmBtn}
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                            >
                                {changingPassword ? "Đang xử lý..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InformationAdmin;