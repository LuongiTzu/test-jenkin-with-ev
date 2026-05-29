import { useState } from "react";
import styles from "./Support.module.css";
import Button from "../../../components/Shares/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPhone,
    faCircleExclamation,
    faGear,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

function Support() {
    const [openReport, setOpenReport] = useState(false);
    const [openChangePass, setOpenChangePass] = useState(false);

    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loadingChange, setLoadingChange] = useState(false);

    // ======= ĐỔI MẬT KHẨU =======
    const handleChangePassword = async () => {
        if (!newPass.trim() || !confirmPass.trim()) {
            alert("Nhập đầy đủ thông tin!");
            return;
        }

        if (newPass !== confirmPass) {
            alert("Mật khẩu không khớp!");
            return;
        }

        alert("Đổi mật khẩu OK (demo)");
        setOpenChangePass(false);
        setNewPass("");
        setConfirmPass("");
    };

    // ======= GỬI BÁO CÁO =======
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        let tieuDe = document.querySelector('input[name="tieuDe"]:checked')?.value;
        const noiDung = document.getElementById("noiDung").value;

        if (!userId) {
            alert("Chưa đăng nhập!");
            return;
        }

        if (!tieuDe) {
            alert("Chọn tiêu đề!");
            return;
        }

        if (!noiDung.trim()) {
            alert("Nhập nội dung!");
            return;
        }


        const payload = {
            maTaiXe: Number(userId),
            tieuDe,
            noiDung
        };

        try {
            const res = await fetch("/api/feedback-service/baocao", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("✅ Gửi thành công!");
                setOpenReport(false);
                document.querySelectorAll('input[name="tieuDe"]').forEach(el => el.checked = false);
                document.getElementById("noiDung").value = "";
            } else {
                const err = await res.text();
                alert("❌ Lỗi: " + err);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Không kết nối được server!");
        }
    };

    return (
        <nav className={styles.wrapper}>
            {/* Liên hệ */}
            <div className={styles.contactsupport}>
                <h1>Liên Hệ Hỗ Trợ</h1>

                <div className={styles.button}>
                    <Button white blackoutline>
                        <FontAwesomeIcon icon={faPhone} /> Gọi Hỗ Trợ
                    </Button>

                    <Button white blackoutline onClick={() => setOpenReport(true)}>
                        <FontAwesomeIcon icon={faCircleExclamation} /> Báo Lỗi
                    </Button>
                </div>
            </div>

            {/* Bảo mật */}
            <div className={styles.security}>
                <h1>An Toàn & Bảo Mật</h1>
                <Button white blackoutline onClick={() => setOpenChangePass(true)}>
                    <FontAwesomeIcon icon={faGear} /> Đổi mật khẩu
                </Button>
            </div>

            {/* ========= MODAL ĐỔI MẬT KHẨU ========= */}
            {openChangePass && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalPassword}>
                        <div className={styles.modalHead}>
                            <h2>🔒 Đổi mật khẩu</h2>
                            <button
                                className={styles.iconClose}
                                onClick={() => setOpenChangePass(false)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className={styles.formchange}>
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu mới..."
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                            />
                        </div>

                        <div className={styles.formchange}>
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu..."
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                change
                                disabled={loadingChange}
                                onClick={handleChangePassword}
                            >
                                {loadingChange ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                            <Button white blackoutline onClick={() => setOpenChangePass(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}


            {/* ========= MODAL BÁO CÁO ========= */}
            {openReport && (
                <div className={styles.modalOverlay} onClick={() => setOpenReport(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h2>Gửi Báo Cáo</h2>
                            <button onClick={() => setOpenReport(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {/* TIÊU ĐỀ */}
                        <div className={styles.formdetail}>
                            <label>Tiêu đề</label>
                            <div className={styles.radioGroup}>
                                {["Trạm lỗi pin", "Không nhận thông báo", "Không đổi được pin", "Khác(vui lòng ghi rõ bên dưới!)"].map((item) => (
                                    <label key={item} className={styles.radioItem}>
                                        <input type="radio" name="tieuDe" value={item} />
                                        <span className={styles.customRadio}></span>
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* NỘI DUNG */}
                        <div className={styles.formdetail}>
                            <label>Nội dung</label>
                            <textarea
                                id="noiDung"
                                className={styles.textarea}
                                placeholder="Mô tả chi tiết vấn đề..."
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button white blackoutline onClick={() => setOpenReport(false)}>Hủy</Button>
                            <Button change onClick={handleSubmit}>Gửi Báo Cáo</Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Support;
