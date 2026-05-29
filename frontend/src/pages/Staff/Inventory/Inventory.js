import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotateRight,
    faWrench,
    faFileLines,
    faPlus,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import StatsHeader from "../components/StatsHeader/StatsHeader";
import styles from "./Inventory.module.css";
import FilterModal from "../Inventory/FilterModal/FilterModal";
import CheckModal from "../Inventory/CheckModal/CheckModal";
import LogsModal from "../Inventory/LogsModal/LogsModal";
import SettingsModal from "../Inventory/SettingsModal/SettingsModal";

/* ========= ÁNH XẠ MÀU CHO TÌNH TRẠNG KỸ THUẬT ========= */
const STATUS_COLORS = {
    "đầy": "#22C55E",
    "đang sạc": "#F59E0B",
    "bảo trì": "#EF4444",
    "không xác định": "#6B7280",
};

function Inventory() {
    const [pins, setPins] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [showCheck, setShowCheck] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPin, setSelectedPin] = useState(null);

    const [filters, setFilters] = useState({
        status: [],
        model: "",
        minCap: null,
        maxCap: null,
        minHealth: null,
        maxHealth: null,
    });

    const getAuthToken = () => localStorage.getItem("token");

    /* ========================== LẤY DANH SÁCH PIN ========================== */
    const fetchPinList = async () => {
        try {
            setListLoading(true);
            const token = getAuthToken();
            const userId = localStorage.getItem("userId");

            if (!userId) {
                console.error("❌ Không tìm thấy userId");
                setPins([]);
                return;
            }

            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            /* =================== 1) Lấy mã trạm của nhân viên =================== */
            const nvRes = await fetch(`/api/user-service/nhanvien/user/${userId}`, {
                headers,
            });

            if (!nvRes.ok) {
                console.error("❌ Không lấy được thông tin nhân viên");
                setPins([]);
                return;
            }

            const nhanVien = await nvRes.json();
            const maTramNhanVien = Number(nhanVien.maTram ?? nhanVien.ma_tram);

            /* =================== 2) Fetch pin, lịch sử, trạm =================== */
            const [pinsRes, historyRes, tramRes] = await Promise.all([
                fetch("/api/battery-service/pins", { headers }),
                fetch("/api/battery-service/lichsu-pin-tram", { headers }),
                fetch("/api/station-service/tram", { headers }),
            ]);

            if (!pinsRes.ok || !historyRes.ok || !tramRes.ok) {
                console.error("❌ Lỗi tải dữ liệu");
                setPins([]);
                return;
            }

            const pinsData = await pinsRes.json();
            const historyData = await historyRes.json();
            const tramData = await tramRes.json();

            /* =================== 3) Lấy lịch sử mới nhất của từng pin =================== */
            const latestHistoryMap = {};

            for (const h of historyData) {
                const pinId = Number(h.maPin ?? h.ma_pin);
                const date = new Date(h.ngayThayDoi ?? h.ngay_thay_doi ?? "1970-01-01");

                if (!latestHistoryMap[pinId] || date > latestHistoryMap[pinId].date) {
                    latestHistoryMap[pinId] = { ...h, date };
                }
            }

            /* =================== 4) Lọc pin theo đúng trạm nhân viên =================== */
            const filteredPins = pinsData.filter((p) => {
                const pinId = Number(p.maPin ?? p.ma_pin);
                const hist = latestHistoryMap[pinId];
                return hist && Number(hist.maTram ?? hist.ma_tram) === maTramNhanVien;
            });

            /* =================== 5) Map dữ liệu pin =================== */
            const mapped = filteredPins.map((p, index) => {
                const pinId = Number(p.maPin ?? p.ma_pin ?? index + 1);

                // 🔹 Tình trạng kỹ thuật
                const tinhTrangEnum = p.tinhTrang ?? p.tinh_trang ?? "DAY";
                let statusLabel =
                    tinhTrangEnum === "DAY"
                        ? "đầy"
                        : tinhTrangEnum === "DANG_SAC"
                            ? "đang sạc"
                            : tinhTrangEnum === "BAO_TRI"
                                ? "bảo trì"
                                : "không xác định";

                // 🔹 Trạng thái sở hữu
                const ownEnum = (p.trangThaiSoHuu ?? p.trang_thai_so_huu ?? "").toUpperCase();
                let ownStatusLabel = "Không xác định";
                switch (ownEnum) {
                    case "SAN_SANG":
                        ownStatusLabel = "Sẵn sàng";
                        break;
                    case "CHUA_SAN_SANG":
                        ownStatusLabel = "Chưa sẵn sàng";
                        break;
                    case "DANG_SU_DUNG":
                        ownStatusLabel = "Đang sử dụng";
                        break;
                    case "DANG_VAN_CHUYEN":
                        ownStatusLabel = "Đang vận chuyển";
                        break;
                    case "DUOC_GIU_CHO": ownStatusLabel = "Đã được đặt trước"; break;
                    default:
                        ownStatusLabel = "Không xác định";
                }

                const record = latestHistoryMap[pinId];

                let tramName = "Chưa có lịch sử";
                if (record) {
                    const tram = tramData.find(
                        (t) =>
                            Number(t.maTram ?? t.ma_tram) ===
                            Number(record.maTram ?? record.ma_tram)
                    );
                    tramName = tram
                        ? tram.tenTram ?? tram.ten_tram
                        : `Trạm ${record.maTram}`;
                }

                return {
                    id: pinId,
                    title: `Pin ${pinId} – ${tramName}`,
                    type: p.loaiPin ?? p.loai_pin ?? "Không rõ",
                    status: statusLabel,
                    ownStatus: ownStatusLabel,
                    health: Number(p.sucKhoe ?? p.suc_khoe ?? 0),
                    capacity: p.dungLuong ?? p.dung_luong ?? 0,
                    lastMaintenance:
                        p.ngayBaoDuongGanNhat ?? p.ngay_bao_duong_gan_nhat ?? "—",
                    importDate: p.ngayNhapKho ?? p.ngay_nhap_kho ?? "—",
                };
            });

            setPins(mapped);
        } catch (err) {
            console.error("⚠️ Lỗi:", err);
            setPins([]);
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchPinList();
    }, []);

    /* =================== Lọc phía frontend =================== */
    const filteredPins = pins.filter((p) => {
        const matchStatus =
            filters.status.length === 0 || filters.status.includes(p.status);
        const matchModel = !filters.model || p.type === filters.model;
        const matchCap =
            (!filters.minCap || p.capacity >= filters.minCap) &&
            (!filters.maxCap || p.capacity <= filters.maxCap);
        const matchHealth =
            (!filters.minHealth || p.health >= filters.minHealth) &&
            (!filters.maxHealth || p.health <= filters.maxHealth);

        return matchStatus && matchModel && matchCap && matchHealth;
    });

    if (listLoading) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p>🔄 Đang tải dữ liệu pin...</p>
            </div>
        );
    }

    /* =================== UI =================== */
    return (
        <div className={styles.inventoryPage}>
            <StatsHeader />

            <div className={styles.headerRow}>
                <h2>Kho Pin</h2>

                <div className={styles.headerButtons}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => setShowFilter(true)}
                    >
                        <FontAwesomeIcon icon={faFilter} /> Lọc
                    </button>

                    <button
                        className={styles.primaryBtn}
                        onClick={() => setShowCheck(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Ghi nhận trả pin
                    </button>

                    <button
                        className={styles.primaryBtn}
                        onClick={fetchPinList}
                        disabled={listLoading}
                    >
                        <FontAwesomeIcon
                            icon={faRotateRight}
                            className={listLoading ? styles.spin : ""}
                        />{" "}
                        Làm mới
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredPins.map((pin) => {
                    const color = STATUS_COLORS[pin.status] || "#6B7280";
                    return (
                        <div key={pin.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.title}>{pin.title}</div>
                                    <div className={styles.type}>{pin.type}</div>
                                </div>
                                <div className={styles.statusBadge}>
                                    <span
                                        className={styles.statusDot}
                                        style={{ background: color }}
                                    />
                                    <span className={styles.statusText}>
                                        {pin.status.charAt(0).toUpperCase() +
                                            pin.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* ⭐ Hàng TRẠNG THÁI SỞ HỮU (giống sức khỏe / dung lượng) */}
                            <div className={styles.metrics}>
                                <div>
                                    <div className={styles.metricLabel}>Trạng thái sở hữu:</div>
                                    <div className={styles.metricValue}>{pin.ownStatus}</div>
                                </div>
                                <div />
                            </div>

                            <div className={styles.metrics}>
                                <div>
                                    <div className={styles.metricLabel}>Sức khỏe:</div>
                                    <div className={styles.metricValue}>{pin.health}%</div>
                                </div>
                                <div>
                                    <div className={styles.metricLabel}>Dung lượng:</div>
                                    <div className={styles.metricValue}>
                                        {pin.capacity} kWh
                                    </div>
                                </div>
                            </div>

                            <div className={styles.datesRow}>
                                <div>
                                    <div className={styles.metricLabel}>Ngày nhập kho:</div>
                                    <div className={styles.metricValue}>{pin.importDate}</div>
                                </div>
                                <div>
                                    <div className={styles.metricLabel}>
                                        Lần bảo dưỡng gần nhất:
                                    </div>
                                    <div className={styles.metricValue}>
                                        {pin.lastMaintenance}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${pin.health}%`,
                                        background: color,
                                    }}
                                />
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.action}
                                    onClick={() => {
                                        setSelectedPin(pin);
                                        setShowLogs(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFileLines} />
                                    Lịch sử
                                </button>

                                <button
                                    className={styles.action}
                                    onClick={() => {
                                        setSelectedPin(pin);
                                        setShowSettings(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faWrench} />
                                    Cài đặt
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredPins.length === 0 && (
                    <div className={styles.emptyState}>Không có pin nào trong kho.</div>
                )}
            </div>

            {showFilter && (
                <FilterModal
                    current={filters}
                    onClose={() => setShowFilter(false)}
                    onApply={(newFilters) => {
                        setFilters(newFilters);
                        setShowFilter(false);
                    }}
                />
            )}

            {showCheck && (
                <CheckModal
                    open={showCheck}
                    onClose={() => setShowCheck(false)}
                    onDone={() => fetchPinList()}
                />
            )}

            {showLogs && selectedPin && (
                <LogsModal
                    slot={selectedPin}
                    onClose={() => {
                        setSelectedPin(null);
                        setShowLogs(false);
                    }}
                />
            )}

            {showSettings && selectedPin && (
                <SettingsModal
                    slot={selectedPin}
                    onClose={() => {
                        setSelectedPin(null);
                        setShowSettings(false);
                    }}
                    onApply={() => {
                        setShowSettings(false);
                        fetchPinList();
                    }}
                />
            )}
        </div>
    );
}

export default Inventory;
