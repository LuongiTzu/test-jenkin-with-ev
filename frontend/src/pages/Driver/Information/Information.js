// pages/Driver/Information/Information.js
import { useState, useEffect } from "react";
import Button from "../../../components/Shares/Button/Button.js";
import CarManagement from "./CarManagement";
import styles from "./Information.module.css";

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

function Information() {
    // ==== PHẦN THÔNG TIN NGƯỜI DÙNG ====
    const [userInfo, setUserInfo] = useState(null);
    const [editUserInfo, setEditUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maTaiXe, setMaTaiXe] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await fetch(`/api/user-service/taixe/user/${userId}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("User data received:", data);
                
                setMaTaiXe(data.maTaiXe);
                setUserInfo(data);

                const nguoiDung = data.nguoiDung;
                setEditUserInfo({
                    hoTen: nguoiDung?.hoTen || "",
                    email: nguoiDung?.email || "",
                    soDienThoai: nguoiDung?.soDienThoai || "",
                    gioiTinh: nguoiDung?.gioiTinh || "",
                    ngaySinh: (nguoiDung?.ngaySinh || "").substring(0, 10),
                    bangLaiXe: data.bangLaiXe || ""
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
                alert("Lỗi tải thông tin người dùng: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    // Hàm Lưu thay đổi (PUT lên API)
    const handleSaveUser = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId || !maTaiXe) {
            alert("Vui lòng đăng nhập lại!");
            return;
        }

        const payload = {
            hoTen: editUserInfo.hoTen,
            email: editUserInfo.email,
            soDienThoai: editUserInfo.soDienThoai,
            gioiTinh: editUserInfo.gioiTinh,
            ngaySinh: formatDate(editUserInfo.ngaySinh),
            bangLaiXe: editUserInfo.bangLaiXe
        };

        try {
            const response = await fetch(`/api/user-service/taixe/${maTaiXe}`, {
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
            
            setUserInfo(prev => ({
                ...prev,
                bangLaiXe: payload.bangLaiXe,
                nguoiDung: {
                    ...prev.nguoiDung,
                    hoTen: payload.hoTen,
                    email: payload.email,
                    soDienThoai: payload.soDienThoai,
                    gioiTinh: payload.gioiTinh,
                    ngaySinh: payload.ngaySinh
                }
            }));
        } catch (error) {
            console.error("Error updating user data:", error);
            alert("Cập nhật thất bại!\n" + error.message);
        }
    };

    return (
        <nav className={styles.wrapper}>
            {/* ====== Thông tin hồ sơ tài xế ====== */}
            <div className={styles.userdatail}>
                <div className={styles.header}>
                    <h1>Thông Tin Hồ Sơ</h1>
                </div>
                {loading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : (
                    <form className={styles.form} onSubmit={e => e.preventDefault()}>
                        {/* Hiển thị ID tài xế */}
                        <div className={styles.formdetail}>
                            <label htmlFor="maTaiXe">Mã Tài Xế</label>
                            <input
                                id="maTaiXe"
                                type="text"
                                value={maTaiXe || ""}
                                readOnly
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formdetail}>
                            <label htmlFor="hoTen">Tên Đầy Đủ</label>
                            <input
                                id="hoTen"
                                type="text"
                                value={editUserInfo?.hoTen || ""}
                                onChange={e => setEditUserInfo({ ...editUserInfo, hoTen: e.target.value })}
                            />
                        </div>
                        <div className={styles.formdetail}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="text"
                                value={editUserInfo?.email || ""}
                                onChange={e => setEditUserInfo({ ...editUserInfo, email: e.target.value })}
                            />
                        </div>
                        <div className={styles.formdetail}>
                            <label htmlFor="soDienThoai">Số Điện Thoại</label>
                            <input
                                id="soDienThoai"
                                type="text"
                                value={editUserInfo?.soDienThoai || ""}
                                onChange={e => setEditUserInfo({ ...editUserInfo, soDienThoai: e.target.value })}
                            />
                        </div>
                        <div className={styles.formdetail}>
                            <label htmlFor="gioiTinh">Giới tính</label>
                            <select
                                id="gioiTinh"
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
                        <div className={styles.formdetail}>
                            <label htmlFor="ngaySinh">Ngày sinh</label>
                            <input
                                id="ngaySinh"
                                type="date"
                                value={editUserInfo?.ngaySinh || ""}
                                onChange={e => setEditUserInfo({ ...editUserInfo, ngaySinh: e.target.value })}
                            />
                        </div>
                        <div className={styles.formdetail}>
                            <label htmlFor="bangLaiXe">Bằng lái xe</label>
                            <input
                                id="bangLaiXe"
                                type="text"
                                value={editUserInfo?.bangLaiXe || ""}
                                onChange={e => setEditUserInfo({ ...editUserInfo, bangLaiXe: e.target.value })}
                            />
                        </div>
                        <Button change type="button" onClick={handleSaveUser}>Lưu Thay Đổi</Button>
                    </form>
                )}
            </div>

            {/* ====== Component Quản lý Xe riêng ====== */}
            <CarManagement maTaiXe={maTaiXe} />
        </nav>
    );
}

export default Information;
