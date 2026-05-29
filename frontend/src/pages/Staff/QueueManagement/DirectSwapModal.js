import { useState, useEffect } from "react";
import Select from "react-select";
import styles from "./DirectSwapModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faSearch,
    faUser,
    faCreditCard,
    faMoneyBillWave,
    faGift,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function DirectSwapModal({ maTram, onClose, onConfirm }) {

    const [searchName, setSearchName] = useState("");

    // --- STATES QUAN TRỌNG ---
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [pinDi, setPinDi] = useState(null);
    const [availablePins, setAvailablePins] = useState([]);
    const [selectedPin, setSelectedPin] = useState("");

    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingPins, setLoadingPins] = useState(false);

    const [payment, setPayment] = useState(null);

    const token = localStorage.getItem("token");

    // ============================
    // 🔍 TÌM TÀI XẾ BẰNG MÃ
    // ============================
    const handleSearch = async () => {
        if (!searchName.trim()) return;
        setLoadingSearch(true);

        try {
            const id = searchName.trim();
            const res = await axios.get(`/api/user-service/taixe/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                await selectDriver(res.data);
            } else {
                alert("⚠ Không tìm thấy tài xế!");
            }
        } catch (err) {
            console.error("❌ Lỗi tìm tài xế:", err);
            alert("Không tìm thấy tài xế!");
        } finally {
            setLoadingSearch(false);
        }
    };

    // ============================
    // 🚗 Khi có tài xế → Lấy danh sách xe
    // ============================
    const selectDriver = async (driver) => {
        setSelectedDriver(driver);

        try {
            const xeListRes = await axios.get(
                `/api/vehicle-service/vehicles/by-driver/${driver.maTaiXe}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVehicles(xeListRes.data);
            setSelectedVehicle(null);
            setPinDi(null);

        } catch (err) {
            console.error("❌ Lỗi load xe:", err);
            alert("Không tìm thấy xe của tài xế!");
        }
    };

    // ============================
    // 🔋 Khi chọn xe → lấy pin đi
    // ============================
    const handleSelectVehicle = async (vehicleId) => {

        const xe = vehicles.find(v => v.maPhuongTien === vehicleId);
        setSelectedVehicle(xe);

        if (!xe?.maPin) {
            setPinDi(null);
            return;
        }

        try {
            const pinRes = await axios.get(
                `/api/battery-service/pins/${xe.maPin}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPinDi(pinRes.data);

        } catch (err) {
            console.error("❌ Lỗi load pin đi:", err);
            alert("Không lấy được pin của xe!");
        }
    };

    // ============================
    // 🔋 Load pin đến theo loại pin
    // ============================
    useEffect(() => {
        const loadAvailablePins = async () => {
            if (!pinDi) return;

            setLoadingPins(true);

            try {
                const res = await axios.get(
                    `/api/battery-service/lichsu-pin-tram/${maTram}/available`,
                    {
                        params: { loaiPin: pinDi.loaiPin },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setAvailablePins(res.data);

            } catch (err) {
                console.error("❌ Không load pin đến:", err);
            } finally {
                setLoadingPins(false);
            }
        };

        loadAvailablePins();
    }, [pinDi, maTram]);

    // ============================
    // 📝 Gửi giao dịch trực tiếp
    // ============================
    const handleSubmit = async () => {
        if (!selectedDriver || !selectedVehicle || !pinDi || !selectedPin) {
            alert("⚠ Thiếu thông tin!");
            return;
        }

        if (!payment) {
            alert("⚠ Vui lòng chọn phương thức thanh toán!");
            return;
        }

        const ngay = new Date().toISOString();

        try {
            // Nếu thanh toán bằng GÓI → trừ lượt trước
            if (payment === "package") {
                try {
                    await axios.put(
                        `/api/subscription-service/lichsudangkygoi/giaodich/${selectedDriver.maTaiXe}`,
                        {
                            maTaiXe: selectedDriver.maTaiXe,
                            ngayGiaoDich: new Date().toISOString().split("T")[0]
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (err) {
                    alert("❌ Gói không hợp lệ hoặc đã hết lượt!");
                    return;
                }
            }

            // 1️⃣ PIN ĐI → Đang sạc + chưa sẵn sàng
            await axios.patch(
                `/api/battery-service/pins/${pinDi.maPin}/state`,
                {
                    tinhTrang: "DANG_SAC",
                    trangThaiSoHuu: "CHUA_SAN_SANG"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2️⃣ PIN ĐẾN → giao cho tài xế
            await axios.patch(
                `/api/battery-service/pins/${selectedPin}/state`,
                {
                    tinhTrang: "DAY",
                    trangThaiSoHuu: "DANG_SU_DUNG"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 3️⃣ Gắn PIN MỚI vào xe
            await axios.post(
                `/api/vehicle-service/vehicles/${selectedVehicle.maPhuongTien}/link-pin/${selectedPin}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 4️⃣ Tạo giao dịch hoàn thành
            await axios.post(
                `/api/transaction-service/giaodichdoipin`,
                {
                    maPinTra: pinDi.maPin,
                    maPinNhan: selectedPin,
                    ngayGiaoDich: ngay,
                    trangThaiGiaoDich: "Đã hoàn thành",
                    thanhtien: payment === "package" ? 0 : 1200000,
                    phuongThucThanhToan: payment,
                    maTram,
                    maTaiXe: selectedDriver.maTaiXe,
                    maXeGiaoDich: selectedVehicle.maPhuongTien
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("✅ Giao dịch trực tiếp hoàn thành!");
            onConfirm();
            onClose();

        } catch (err) {
            console.error("❌ Lỗi xử lý giao dịch:", err);
            alert("Có lỗi xảy ra khi tạo giao dịch!");
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {/* HEADER */}
                <div className={styles.header}>
                    <h2>Đổi Pin Trực Tiếp</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* STEP 1 */}
                <div className={styles.section}>
                    <h3>1. Nhập mã tài xế</h3>

                    <div className={styles.searchRow}>
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Nhập mã tài xế..."
                        />
                        <button onClick={handleSearch}>
                            <FontAwesomeIcon icon={faSearch} /> Tìm
                        </button>
                    </div>

                    {loadingSearch && <p>Đang tìm...</p>}

                    {selectedDriver && (
                        <div className={styles.foundDriverBox}>
                            <FontAwesomeIcon icon={faUser} className={styles.iconUser} />
                            <span>Đã tìm thấy tài xế: <b>{selectedDriver.nguoiDung.hoTen}</b></span>
                        </div>
                    )}
                </div>

                {/* STEP 2 */}
                {selectedDriver && (
                    <div className={styles.section}>
                        <h3>2. Chọn xe của tài xế</h3>

                        <Select
                            options={vehicles.map(v => ({
                                value: v.maPhuongTien,
                                label: `Xe ${v.loaiXe} - Biển số ${v.bienSo}`
                            }))}
                            onChange={(opt) => handleSelectVehicle(opt.value)}
                            placeholder="Chọn xe..."
                            isSearchable
                        />
                    </div>
                )}

                {/* STEP 3 */}
                {selectedVehicle && pinDi && (
                    <div className={styles.section}>
                        <h3>3. Pin đi của xe</h3>

                        <div className={styles.card}>
                            <p><b>Xe:</b> {selectedVehicle.loaiXe}</p>
                            <p><b>Pin ID:</b> {pinDi.maPin}</p>
                            <p><b>Loại pin:</b> {pinDi.loaiPin}</p>
                            <p><b>Sức khỏe:</b> {pinDi.sucKhoe}%</p>
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {pinDi && (
                    <div className={styles.section}>
                        <h3>4. Chọn pin đến</h3>

                        {loadingPins ? (
                            <p>Đang tải...</p>
                        ) : (
                            <Select
                                options={availablePins.map(p => ({
                                    value: p.maPin,
                                    label: `Mã ${p.maPin} | SK: ${p.sucKhoe}%`
                                }))}
                                onChange={(opt) => setSelectedPin(opt.value)}
                                placeholder="Chọn pin..."
                                isSearchable
                            />
                        )}
                    </div>
                )}

                {/* STEP 5 */}
                {selectedPin && (
                    <div className={styles.section}>
                        <h3>5. Phương thức thanh toán</h3>

                        <div className={styles.paymentBtns}>
                            <button
                                className={`${styles.payBtn} ${payment === "card" ? styles.active : ""}`}
                                onClick={() => setPayment("card")}
                            >
                                <FontAwesomeIcon icon={faCreditCard} /> Thẻ
                            </button>

                            <button
                                className={`${styles.payBtn} ${payment === "cash" ? styles.active : ""}`}
                                onClick={() => setPayment("cash")}
                            >
                                <FontAwesomeIcon icon={faMoneyBillWave} /> Tiền mặt
                            </button>

                            <button
                                className={`${styles.payBtn} ${payment === "package" ? styles.active : ""}`}
                                onClick={() => setPayment("package")}
                            >
                                <FontAwesomeIcon icon={faGift} /> Gói
                            </button>
                        </div>

                        {/* ⭐ Tổng tiền hiển thị ngay tại đây */}
                        <div className={styles.priceRow} style={{ marginTop: "12px" }}>
                            <span>Tổng tiền:</span>
                            <strong>{payment === "package" ? "0₫" : "1.200.000₫"}</strong>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
                    <button className={styles.primaryBtn} onClick={handleSubmit}>
                        Tạo giao dịch
                    </button>
                </div>

            </div>
        </div>
    );
}