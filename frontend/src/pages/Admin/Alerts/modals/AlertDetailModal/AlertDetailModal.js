import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./AlertDetailModal.module.css";

function AlertDetailModal({ isOpen, onClose, alert, onUpdateStatus }) {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (alert) {
            setStatus(alert.rawStatus || "MOI");
        }
    }, [alert]);

    if (!isOpen || !alert) return null;

    const handleSave = async () => {
        setLoading(true);
        await onUpdateStatus(alert.id, status);
        setLoading(false);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Chi Tiết Cảnh Báo</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.infoGroup}>
                        <span className={styles.label}>Người gửi</span>
                        <div className={styles.value}>{alert.source}</div>
                    </div>

                    <div className={styles.infoGroup}>
                        <span className={styles.label}>Tiêu đề</span>
                        <div className={styles.value}>{alert.title}</div>
                    </div>

                    <div className={styles.infoGroup}>
                        <span className={styles.label}>Nội dung chi tiết</span>
                        <div className={styles.contentBox}>
                            {alert.content || "Không có nội dung chi tiết."}
                        </div>
                    </div>

                    <div className={styles.infoGroup}>
                        <span className={styles.label}>Trạng thái xử lý</span>
                        <select
                            className={styles.select}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="MOI">Mới</option>
                            <option value="DANG_XU_LY">Đang xử lý</option>
                            <option value="DA_XU_LY">Đã xử lý</option>
                        </select>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>
                        Đóng
                    </button>
                    <button
                        className={`${styles.btn} ${styles.saveBtn}`}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Cập nhật trạng thái"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlertDetailModal;
