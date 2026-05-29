import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChangeBattery.module.css";
import LinkButton from "../../../components/Shares/LinkButton/LinkButton";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "axios";

function ChangeBattery() {
    const [packageList, setPackageList] = useState([]);
    const [orders, setOrders] = useState([]);
    const [maTaiXe, setMaTaiXe] = useState(null); // Thêm state lưu mã tài xế

    const handleCancelOrder = async (order) => {
        if (!window.confirm("Bạn có chắc muốn hủy đơn đặt pin này?")) return;

        try {
            const token = localStorage.getItem("token");

            // 1️⃣ Trả Pin được giữ về trạng thái SAN_SANG
            if (order.maPinDuocGiu) {
                await axios.patch(
                    `/api/battery-service/pins/${order.maPinDuocGiu}/state`,
                    {
                        tinhTrang: "DAY",
                        trangThaiSoHuu: "SAN_SANG"
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // 2️⃣ Gọi station-service để cập nhật trạng thái đơn → Hủy
            await axios.put(
                `/api/station-service/dat-lich/${order.id}/huy`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("❌ Bạn đã hủy đơn thành công!");

            // 3️⃣ Cập nhật lại danh sách đơn
            setOrders(prev => prev.filter(o => o.id !== order.id));

        } catch (err) {
            console.error("Lỗi hủy đơn:", err);
            alert("❌ Không thể hủy đơn!");
        }
    };
    useEffect(() => {
        const fetchTaiXeInfo = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const token = localStorage.getItem("token");

                if (!userId || !token) return null;

                // Lấy thông tin tài xế theo userId
                const taiXeRes = await fetch(`/api/user-service/taixe/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!taiXeRes.ok) {
                    console.error("❌ Không lấy được thông tin tài xế");
                    return null;
                }

                const taiXeData = await taiXeRes.json();
                return taiXeData.maTaiXe; // ✅ Lấy mã tài xế

            } catch (err) {
                console.error("💥 Lỗi khi lấy thông tin tài xế:", err);
                return null;
            }
        };

        const fetchOrderInfo = async (maTaiXe) => {
            try {
                const token = localStorage.getItem("token");

                if (!maTaiXe || !token) return;

                // Lấy lịch đặt pin theo mã tài xế
                const res = await fetch(`/api/station-service/dat-lich/tai-xe/${maTaiXe}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    console.error("❌ Không thể tải danh sách đặt lịch");
                    return;
                }

                const data = await res.json();

                if (data.length > 0) {
                    const allOrders = data.map(item => ({
                        id: item.maLichSuDat,
                        status: item.trangThaiXacNhan,
                        stationName: item.tram?.tenTram,
                        time: new Date(item.ngayDat).toLocaleString("vi-VN"),
                        orderCode: "ORD-" + String(item.maLichSuDat).padStart(4, "0"),
                        maPinDuocGiu: item.maPinDuocGiu
                    }));

                    setOrders(allOrders.reverse()); // Mới nhất lên đầu
                } else {
                    setOrders([]); // Không có đơn nào
                }

            } catch (err) {
                console.error("💥 Lỗi khi tải lịch đặt pin:", err);
            }
        };

        const fetchPackageInfo = async (maTaiXe) => {
            try {
                const token = localStorage.getItem("token");

                if (!token || !maTaiXe) return;

                // SỬA: Dùng mã tài xế thay vì userId
                const res = await fetch(`/api/subscription-service/lichsudangkygoi/taixe/${maTaiXe}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("API Response:", data); // THÊM LOG ĐỂ DEBUG

                    // XỬ LÝ TRẠNG THÁI ĐÚNG
                    const allPackages = data.map(goi => {
                        // SỬA: Kiểm tra cả "CON_HAN" và "HET_HAN"
                        const isActive = goi.trangThai === "CON_HAN";
                        console.log(goi.trangThai)
                        const statusText = isActive ? "Hoạt động" : "Hết hạn";
                        console.log(statusText)
                        const statusClass = isActive ? styles.statusActive : styles.statusExpired;

                        return {
                            packageName: goi.goiDichVu?.tenGoi || "Gói dịch vụ",
                            used: (goi.goiDichVu?.soLanDoi || 0) - goi.soLanConLai,
                            total: goi.goiDichVu?.soLanDoi || 0,
                            remaining: goi.soLanConLai,
                            nextBillDate: new Date(goi.ngayKetThuc).toLocaleDateString('vi-VN'),
                            isActive: isActive,
                            statusText: statusText,
                            statusClass: statusClass,
                            rawStatus: goi.trangThai // THÊM ĐỂ DEBUG
                        };
                    });

                    setPackageList(allPackages);
                }
            } catch (error) {
                console.error("Fetch package error:", error);
            }
        };

        // Hàm chính để chạy tất cả
        const fetchAllData = async () => {
            const maTaiXeThuc = await fetchTaiXeInfo();

            if (maTaiXeThuc) {
                setMaTaiXe(maTaiXeThuc); // Lưu mã tài xế vào state
                await Promise.all([
                    fetchOrderInfo(maTaiXeThuc),
                    fetchPackageInfo(maTaiXeThuc)
                ]);
            }
        };

        fetchAllData();
    }, []);

    return (
        <nav className={styles.wrapper}>
            {/* PHẦN ĐẶT CHỖ - LUÔN HIỆN */}
            <div className={styles.orderplace}>
                <div className={styles.header}>
                    <h1>Đặt Chỗ Hoạt Động</h1>
                    <p>Danh sách đơn đặt pin của bạn</p>
                </div>

                {orders.length > 0 ? (
                    <div className={styles.orderList}>
                        {orders.map((order, index) => (
                            <div key={index} className={styles.orderItem}>

                                {/* Cột trái */}
                                <div className={styles.info}>
                                    <p className={`${styles.status} ${order.status === "Chờ xác nhận" ? styles.pending : ""
                                        }`}>
                                        {order.status}
                                    </p>
                                    <h3>{order.stationName}</h3>
                                    <p className={styles.time}>{order.time}</p>

                                    {/* 🔥 NÚT HỦY CHỈ HIỆN KHI CHỜ XÁC NHẬN */}
                                    {order.status === "Chờ xác nhận" && (
                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => handleCancelOrder(order)}
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>

                                {/* Cột phải */}
                                <div className={styles.orderRight}>
                                    <div className={styles.orderid}>
                                        <FontAwesomeIcon icon={faMapLocationDot} className={styles.faMapLocationDot} />
                                        <p>{order.orderCode}</p>
                                    </div>

                                    {/* Nút điều hướng */}
                                    <LinkButton to="/dashboard" black>Đường đi</LinkButton>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ marginTop: "10px" }}>⏳ Bạn chưa có đơn đặt pin nào.</p>
                )}
            </div>

            {/* PHẦN TRẠNG THÁI ĐĂNG KÝ - LUÔN HIỆN */}
            <div className={styles.statusregister}>
                <div className={styles.header}>
                    <h1>Trạng thái đăng ký</h1>
                    <p>Gói và sử dụng hiện tại của bạn</p>
                </div>

                {packageList.length > 0 ? (
                    <div className={styles.packageList}>
                        {packageList.map((packageInfo, index) => {
                            const progressPercent = (packageInfo.used / packageInfo.total) * 100;

                            return (
                                <div key={index} className={styles.packageItem}>
                                    <div className={styles.packagename}>
                                        <h1>{packageInfo.packageName}</h1>
                                        <p className={packageInfo.statusClass}>
                                            {packageInfo.statusText}
                                            {/* THÊM DEBUG: <small>({packageInfo.rawStatus})</small> */}
                                        </p>
                                    </div>
                                    <div className={styles.change}>
                                        <p>Lần Thay Đã Sử Dụng</p>
                                        <p>{packageInfo.used}/{packageInfo.total}</p>
                                    </div>
                                    <div className={styles.progresscontainer}>
                                        <div
                                            className={`${styles.progressbar} ${packageInfo.isActive ? styles.activeProgress : styles.expiredProgress
                                                }`}
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>

                                    <div className={styles.nextorder}>
                                        <p>Ngày hết hạn</p>
                                        <p>{packageInfo.nextBillDate}</p>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.noPackage}>
                        <p>Không có gói nào</p>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default ChangeBattery;