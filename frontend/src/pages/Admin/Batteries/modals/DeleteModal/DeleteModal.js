import React, { useState } from "react";
import styles from "./DeleteModal.module.css";

export default function DeleteModal({ pin, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const deletePin = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const res = await fetch(`/api/battery-service/pins/${pin.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (res.ok) {
                onDeleted();
            } else {
                alert("Không thể xóa pin!");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>Xóa Pin</h3>

                <p>
                    Bạn có chắc chắn muốn xóa <b>Pin {pin.id}</b>?<br />
                    Hành động này không thể hoàn tác.
                </p>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Hủy
                    </button>

                    <button
                        className={styles.deleteBtn}
                        onClick={deletePin}
                        disabled={loading}
                    >
                        {loading ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}
