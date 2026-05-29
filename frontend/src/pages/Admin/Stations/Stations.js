import axios from "axios";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faPlus,
    faMapMarkerAlt,
    faEye,
    faEdit,
    faTimes,
    faDollarSign,
    faBatteryFull,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import styles from "./Stations.module.css";
import BatteryGrid from "../Batteries/modals/BatteryGrid"; // ✅ tái sử dụng file cũ

// ===== KPI đầu trang =====
const topKpi = [
    {
        title: "Tổng Doanh Thu",
        value: "$267.000",
        sub: "+12.5%",
        icon: faDollarSign,
        color: "#16a34a",
    },
    {
        title: "Tổng Lần Thay Pin",
        value: "12.847",
        sub: "+8.3%",
        icon: faBatteryFull,
        color: "#3b82f6",
    },
    {
        title: "Trạm Hoạt Động",
        value: "24",
        sub: "Tất Cả Trực Tuyến",
        icon: faLocationDot,
        color: "#a855f7",
    },
    {
        title: "Khách Hàng",
        value: "8.547",
        sub: "+156 mới",
        icon: faUser,
        color: "#f97316",
    },
];

export default function Stations() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal form thêm/sửa trạm
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedStation, setSelectedStation] = useState(null);
    const [formData, setFormData] = useState({
        tenTram: "",
        diaChi: "",
        kinhDo: "",
        viDo: "",
        soLuongPinToiDa: "",
        soDT: "",
        trangThai: "Hoạt động",
    });

    // Modal BatteryGrid
    const [showBatteryGrid, setShowBatteryGrid] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState(null);

    // Gọi API danh sách trạm
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await axios.get("/api/station-service/tram");
                setStations(res.data);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách trạm:", err);
                setError("Không thể tải danh sách trạm");
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    const openModal = (mode, station = null) => {
        setModalMode(mode);
        if (station) {
            setSelectedStation(station);
            setFormData(station);
        } else {
            setFormData({
                tenTram: "",
                diaChi: "",
                kinhDo: "",
                viDo: "",
                soLuongPinToiDa: "",
                soDT: "",
                trangThai: "Hoạt động",
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setFormData({
            tenTram: "",
            diaChi: "",
            kinhDo: "",
            viDo: "",
            soLuongPinToiDa: "",
            soDT: "",
            trangThai: "Hoạt động",
        });
        setSelectedStation(null);
        setShowModal(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                const res = await axios.post("/api/station-service/tram", formData);
                setStations((prev) => [...prev, res.data]);
                alert("✅ Thêm trạm thành công!");
            } else if (modalMode === "edit") {
                const res = await axios.put(
                    `/api/station-service/tram/${selectedStation.maTram}`,
                    formData
                );
                setStations((prev) =>
                    prev.map((st) =>
                        st.maTram === selectedStation.maTram ? res.data : st
                    )
                );
                alert("✅ Cập nhật trạm thành công!");
            }
            setShowModal(false);
        } catch (err) {
            console.error("❌ Lỗi khi lưu dữ liệu:", err);
            alert("❌ Không thể lưu dữ liệu.");
        }
    };

    if (loading) return <p>Đang tải dữ liệu trạm...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className={styles.wrapper}>
            {/* ===== KPI Section ===== */}
            <div className={styles.kpiGrid}>
                {topKpi.map((item, i) => (
                    <div key={i} className={styles.kpiCard}>
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

            {/* ===== Header ===== */}
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Quản Lý Trạm</h2>
                <div className={styles.headerActions}>
                    <button className={styles.filterBtn}>
                        <FontAwesomeIcon icon={faFilter} /> Lọc
                    </button>
                    <button
                        className={styles.addBtn}
                        onClick={() => openModal("add")}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Thêm Trạm
                    </button>
                </div>
            </div>

            {/* ===== Danh sách trạm ===== */}
            <div className={styles.stationList}>
                {stations.map((st, i) => (
                    <div
                        key={i}
                        className={styles.stationCard}
                        onClick={() => {
                            setSelectedStationId(st.maTram);
                            setShowBatteryGrid(true);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <div className={styles.infoRow}>
                            <div className={styles.infoLeft}>
                                <div className={styles.iconWrapper}>
                                    <FontAwesomeIcon
                                        icon={faMapMarkerAlt}
                                        className={styles.icon}
                                    />
                                    <div
                                        className={`${styles.status} ${styles[
                                            st.trangThai === "Hoạt động"
                                                ? "active"
                                                : st.trangThai === "Bảo trì"
                                                    ? "maintenance"
                                                    : "offline"
                                            ]}`}
                                    >
                                        {st.trangThai}
                                    </div>
                                </div>
                                <div>
                                    <h3 className={styles.stationName}>{st.tenTram}</h3>
                                    <div className={styles.infoDetails}>
                                        <div>
                                            Lần Thay Pin: <span>{st.swaps ?? 0}</span>
                                        </div>
                                        <div>
                                            Doanh Thu: <span>${st.revenue ?? 0}</span>
                                        </div>
                                        <div>
                                            Sử Dụng: <span>{st.utilization ?? 0}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.actionBtns}>
                                <button
                                    className={styles.iconBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal("view", st);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button
                                    className={styles.iconBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal("edit", st);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.progressWrapper}>
                            <div className={styles.progressInfo}>
                                <span>Sử Dụng</span>
                                <span>{st.utilization ?? 0}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${st.utilization ?? 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== Modal BatteryGrid ===== */}
            {showBatteryGrid && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => {
                        // Khi click vào overlay (không phải vào phần nội dung modal)
                        if (e.target.classList.contains(styles.modalOverlay)) {
                            setShowBatteryGrid(false);
                        }
                    }}
                >
                    <div className={styles.modalContentLarge}>
                        <div className={styles.modalHeader}>
                            <h3>
                                Pin tại{" "}
                                {stations.find((s) => s.maTram === selectedStationId)?.tenTram ||
                                    "Trạm"}
                            </h3>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowBatteryGrid(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <BatteryGrid stationId={selectedStationId} />
                    </div>
                </div>
            )}
        </div>
    );
}
