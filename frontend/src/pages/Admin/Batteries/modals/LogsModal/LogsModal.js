import React, { useEffect, useState } from "react";
import styles from "./LogsModal.module.css";

export default function LogsModal({ slot, onClose }) {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [stations, setStations] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!slot) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // ⚙️ Headers chung cho tất cả request
                const headers = {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };

                // 🟢 Thử gọi endpoint tối ưu (nếu backend đã có)
                let historyRes = await fetch(
                    `/api/battery-service/lichsu-pin-tram/pin/${slot.id}`,
                    { headers }
                );

                // Nếu API chưa có, fallback về endpoint cũ
                if (!historyRes.ok) {
                    console.warn("⚠️ Endpoint /pin/{id} chưa có, fallback về /lichsu-pin-tram");
                    historyRes = await fetch("/api/battery-service/lichsu-pin-tram", {
                        headers,
                    });
                }

                const tramRes = await fetch("/api/station-service/tram", { headers });

                if (!historyRes.ok || !tramRes.ok) {
                    throw new Error("Không thể tải dữ liệu lịch sử hoặc trạm");
                }

                const [historyData, tramData] = await Promise.all([
                    historyRes.json(),
                    tramRes.json(),
                ]);

                let filtered = [];
                // Nếu backend chưa có API /pin/{id}, thì lọc thủ công
                if (Array.isArray(historyData)) {
                    filtered = historyData
                        .filter(
                            (h) => Number(h.maPin ?? h.ma_pin) === Number(slot.id)
                        )
                        .sort(
                            (a, b) =>
                                new Date(b.ngayThayDoi ?? b.ngay_thay_doi) -
                                new Date(a.ngayThayDoi ?? a.ngay_thay_doi)
                        );
                } else {
                    // Nếu API trả sẵn danh sách riêng cho pin
                    filtered = Array.isArray(historyData)
                        ? historyData
                        : [historyData];
                }

                setStations(tramData);
                setLogs(filtered);
            } catch (err) {
                console.error("⚠️ Lỗi tải dữ liệu logs:", err);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slot]);

    // 🔹 Hàm lấy tên trạm
    const getTramName = (maTram) => {
        const tram = stations.find(
            (t) => Number(t.maTram ?? t.ma_tram) === Number(maTram)
        );
        return tram
            ? tram.tenTram ?? tram.ten_tram ?? `Trạm ${maTram}`
            : `Trạm ${maTram}`;
    };

    if (!slot) return null;

    return (
        <div
            className={styles.overlay}
            onClick={(e) =>
                e.target.classList.contains(styles.overlay) && onClose?.()
            }
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Lịch sử pin – {slot.title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {loading ? (
                        <p>🔄 Đang tải dữ liệu...</p>
                    ) : logs.length > 0 ? (
                        <ul className={styles.logList}>
                            {logs.map((l, i) => {
                                const time =
                                    l.ngayThayDoi ?? l.ngay_thay_doi ?? "Không rõ thời gian";
                                const action = l.hanhDong ?? l.hanh_dong ?? "—";
                                const tramName = getTramName(l.maTram ?? l.ma_tram);
                                const formattedTime = new Date(time).toLocaleString("vi-VN", {
                                    hour12: false,
                                });
                                return (
                                    <li key={i}>
                                        <strong>{formattedTime}</strong> —{" "}
                                        {action} tại <em>{tramName}</em>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>Không có lịch sử nào cho pin này.</p>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
