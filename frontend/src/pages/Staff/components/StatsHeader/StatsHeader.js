import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartColumn,
    faDollarSign,
    faUser,
    faWrench,
    faBatteryFull,
    faBolt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./StatsHeader.module.css";

const StatsHeader = () => {
    const [statusStation, setStatusStation] = useState({
        day: 0,
        charging: 0,
        maintenance: 0,
    });

    const [statusTotal, setStatusTotal] = useState({
        day: 0,
        charging: 0,
        maintenance: 0,
    });

    // ⭐ Rating theo trạm
    const [ratingStation, setRatingStation] = useState(0);

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (!userId) {
                console.error("❌ Không tìm thấy userId");
                setLoading(false);
                return;
            }

            // 🔹 Lấy mã trạm nhân viên
            const nvRes = await fetch(`/api/user-service/nhanvien/user/${userId}`, {
                headers,
            });
            if (!nvRes.ok) {
                console.error("❌ Không lấy được thông tin nhân viên");
                setLoading(false);
                return;
            }

            const nhanVien = await nvRes.json();
            const maTram = Number(nhanVien.maTram ?? nhanVien.ma_tram);

            const [totalRes, stationRes, ratingRes] = await Promise.all([
                fetch(`/api/battery-service/status`, { headers }),
                fetch(`/api/battery-service/status?tram=${maTram}`, { headers }),
                fetch(`/api/feedback-service/danhgia/tram/${maTram}/trung-binh-sao`, { headers }),
            ]);

            // =============================
            // 🔹 Tổng hệ thống
            // =============================
            const totalData = totalRes.ok ? await totalRes.json() : {};
            setStatusTotal({
                day: totalData.day ?? 0,
                charging: totalData.dangSac ?? 0,
                maintenance: totalData.baoTri ?? 0,
            });

            // =============================
            // 🔹 Theo trạm
            // =============================
            const stationData = stationRes.ok ? await stationRes.json() : {};
            setStatusStation({
                day: stationData.day ?? 0,
                charging: stationData.dangSac ?? 0,
                maintenance: stationData.baoTri ?? 0,
            });

            // =============================
            // 🔹 Rating theo trạm
            // =============================
            if (ratingRes.ok) {
                const ratingValue = await ratingRes.json();
                setRatingStation(Number(ratingValue?.toFixed(1)) || 0);
            }

        } catch (err) {
            console.error("⚠️ Lỗi StatsHeader:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className={styles.statsHeader}>
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    const format = (tram, total) => (
        <>
            <div>{tram}</div>
            <small style={{ fontSize: "12px", opacity: 0.8 }}>
                pin / {total} toàn hệ thống
            </small>
        </>
    );

    const statsData = [
        { id: 1, icon: faChartColumn, color: "#4F46E5", value: "47", label: "Thay Pin Hôm Nay" },
        { id: 2, icon: faDollarSign, color: "#10B981", value: "$1175", label: "Doanh Thu" },

        {
            id: 3,
            icon: faUser,
            color: "#F97316",
            value: ratingStation > 0 ? `${ratingStation} ` : "Chưa có",
            label: "Sao đánh Giá",
        },

        {
            id: 4,
            icon: faWrench,
            color: "#EF4444",
            value: format(statusStation.maintenance, statusTotal.maintenance),
            label: "Pin Bảo Trì",
        },
        {
            id: 5,
            icon: faBatteryFull,
            color: "#22C55E",
            value: format(statusStation.day, statusTotal.day),
            label: "Pin Đầy",
        },
        {
            id: 6,
            icon: faBolt,
            color: "#F59E0B",
            value: format(statusStation.charging, statusTotal.charging),
            label: "Pin Đang Sạc",
        },
    ];

    return (
        <div className={styles.statsHeader}>
            {statsData.map((item) => (
                <div key={item.id} className={styles.card}>
                    <div className={styles.icon}>
                        <FontAwesomeIcon icon={item.icon} size="lg" color={item.color} />
                    </div>
                    <div className={styles.value}>{item.value}</div>
                    <div className={styles.label}>{item.label}</div>
                </div>
            ))}
        </div>
    );
};

export default StatsHeader;
