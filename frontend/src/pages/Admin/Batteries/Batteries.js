import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDollarSign,
    faBatteryFull,
    faLocationDot,
    faUsers,
    faWrench,
    faCalendar,
    faClock,
    faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Batteries.module.css";
import BatteryGrid from "./modals/BatteryGrid"; // 👈 Giao diện con hiển thị Kho Pin

function Batteries() {
    const [batteryData, setBatteryData] = useState({
        topKpi: [
            {
                title: "Tổng Doanh Thu",
                value: "$267.000",
                sub: "+12.5%",
                color: "#16a34a",
                icon: faDollarSign,
            },
            {
                title: "Tổng Lần Thay Pin",
                value: "12.847",
                sub: "+8.3%",
                color: "#3b82f6",
                icon: faBatteryFull,
            },
            {
                title: "Trạm Hoạt Động",
                value: "24",
                sub: "Tất cả trực tuyến",
                color: "#a855f7",
                icon: faLocationDot,
            },
            {
                title: "Khách Hàng",
                value: "8.547",
                sub: "+156 mới",
                color: "#f97316",
                icon: faUsers,
            },
        ],
        fleet: { totalBatteries: 0, healthy: 0, degraded: 0, critical: 0 },
        allocation: [
            { station: "Trạm Trung Tâm", used: 17, total: 20 },
            { station: "Trạm Thương Mại", used: 10, total: 15 },
            { station: "Trạm Sân Bay", used: 10, total: 25 },
        ],
    });

    /* 🟣 API: Lấy tổng quan đội pin */
    const fetchBatterySummary = async () => {
        try {
            const response = await fetch("/api/battery-service/summary");
            if (response.ok) {
                const summary = await response.json();
                setBatteryData((prev) => ({
                    ...prev,
                    fleet: {
                        totalBatteries: summary.totalBatteries ?? 0,
                        healthy: summary.healthy ?? 0,
                        degraded: summary.degraded ?? 0,
                        critical: summary.critical ?? 0,
                    },
                }));
            } else {
                console.error("❌ Lỗi lấy dữ liệu tổng quan đội pin:", response.status);
            }
        } catch (err) {
            console.error("⚠️ Lỗi kết nối API summary:", err);
        }
    };

    useEffect(() => {
        fetchBatterySummary();
    }, []);

    return (
        <div className={styles.wrapper}>
            {/* ===== KPI ===== */}
            <div className={styles.kpiGrid}>
                {batteryData.topKpi.map((item, index) => (
                    <div key={index} className={styles.kpiCard}>
                        <div className={styles.kpiInfo}>
                            <p className={styles.kpiTitle}>{item.title}</p>
                            <h2 className={styles.kpiValue}>{item.value}</h2>
                            <p className={styles.kpiSub}>{item.sub}</p>
                        </div>
                        <div
                            className={styles.kpiIcon}
                            style={{ color: item.color, backgroundColor: item.color + "20" }}
                        >
                            <FontAwesomeIcon icon={item.icon} />
                        </div>
                    </div>
                ))}
            </div>

            {/* === 3 CARD: Fleet / Maintenance / Allocation === */}
            <div className={styles.cardGrid}>
                {/* Tổng Quan Đội Pin */}
                <div className={styles.card}>
                    <h3>Tổng Quan Đội Pin</h3>
                    <div className={styles.fleetStats}>
                        <p>
                            Tổng số pin: <span>{batteryData.fleet.totalBatteries}</span>
                        </p>
                        <p>
                            Tình trạng tốt (&gt;90%):{" "}
                            <span className={styles.green}>{batteryData.fleet.healthy}</span>
                        </p>
                        <p>
                            Suy giảm (70–90%):{" "}
                            <span className={styles.yellow}>{batteryData.fleet.degraded}</span>
                        </p>
                        <p>
                            Nguy kịch (&lt;70%):{" "}
                            <span className={styles.red}>{batteryData.fleet.critical}</span>
                        </p>
                    </div>
                </div>

                {/* Lịch Bảo Trì */}
                <div className={styles.card}>
                    <h3>Lịch Bảo Trì</h3>
                    <div className={styles.maintenanceList}>
                        <div className={`${styles.maintenanceItem} ${styles.redBg}`}>
                            <FontAwesomeIcon icon={faWrench} />
                            <div>
                                <strong>Khẩn cấp: 8 pin</strong>
                                <p>Cần kiểm tra ngay lập tức</p>
                            </div>
                        </div>
                        <div className={`${styles.maintenanceItem} ${styles.yellowBg}`}>
                            <FontAwesomeIcon icon={faCalendar} />
                            <div>
                                <strong>Tuần này: 15 pin</strong>
                                <p>Bảo trì theo kế hoạch</p>
                            </div>
                        </div>
                        <div className={`${styles.maintenanceItem} ${styles.blueBg}`}>
                            <FontAwesomeIcon icon={faClock} />
                            <div>
                                <strong>Tháng sau: 23 pin</strong>
                                <p>Kiểm tra định kỳ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phân Bổ Pin */}
                <div className={styles.card}>
                    <h3>Phân Bổ Pin</h3>
                    <div className={styles.allocationList}>
                        {batteryData.allocation.map((st, i) => {
                            const percent = Math.round((st.used / st.total) * 100);
                            return (
                                <div key={i} className={styles.allocationRow}>
                                    <span>{st.station}</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span>
                                        {st.used}/{st.total}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <button className={styles.optimizeBtn}>Tối Ưu Phân Bổ</button>
                </div>
            </div>

            {/* === KHO PIN (component con) === */}
            <BatteryGrid />
        </div>
    );
}

export default Batteries;
