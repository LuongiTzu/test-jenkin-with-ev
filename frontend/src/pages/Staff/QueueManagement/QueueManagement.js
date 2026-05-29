import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheck, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import StatsHeader from "../components/StatsHeader/StatsHeader";
import styles from "./QueueManagement.module.css";
import { useState, useEffect, useCallback } from "react";
import BatterySwapModal from "./BatterySwapModal";
import DirectSwapModal from "./DirectSwapModal";
import axios from "axios";

function QueueManagement() {
  const [activeTab, setActiveTab] = useState(1);
  const [maTram, setMaTram] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDirectSwap, setShowDirectSwap] = useState(false);


  // Lấy mã trạm của nhân viên đang đăng nhập
  useEffect(() => {
    const fetchNhanVienInfo = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const res = await axios.get(`/api/user-service/nhanvien/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.maTram) {
          setMaTram(res.data.maTram);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin nhân viên:", err);
      }
    };

    fetchNhanVienInfo();
  }, []);

  // Lấy danh sách đơn theo trạm + enrich dữ liệu
  const fetchOrders = useCallback(async () => {
    if (!maTram) return;

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // 1) Lấy danh sách đơn theo trạm và trạng thái
      const res = await axios.get(
        `/api/station-service/dat-lich/tram/${maTram}/trang-thai`,
        {
          params: { trangThai: activeTab === 1 ? "Chờ xác nhận" : "Đã xác nhận" },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const rawOrders = res.data;

      // 2) Enrich dữ liệu (lấy tên tài xế, loại xe, loại pin)
      const enriched = await Promise.all(
        rawOrders.map(async (order) => {
          let taiXeName = "Không rõ";
          let xeLoai = "Không rõ";
          let pinLoai = "Không rõ";

          try {
            const txRes = await axios.get(`/api/user-service/taixe/${order.maTaiXe}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            taiXeName = txRes.data.nguoiDung.hoTen;
          } catch { }

          try {
            const xeRes = await axios.get(`/api/vehicle-service/vehicles/${order.maXeGiaoDich}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            xeLoai = xeRes.data.loaiXe;

            if (xeRes.data.maPin) {
              try {
                const pinRes = await axios.get(`/api/battery-service/pins/${xeRes.data.maPin}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                order.pinDi = {
                  maPin: pinRes.data.maPin,
                  loaiPin: pinRes.data.loaiPin,
                  dungLuong: pinRes.data.dungLuong,
                  sucKhoe: pinRes.data.sucKhoe,
                  tinhTrang: pinRes.data.tinhTrang,
                  ngayBaoDuong: pinRes.data.ngayBaoDuongGanNhat,
                };
              } catch (err) {
                console.warn("Không lấy được pin đi:", err);
              }
            }
            // 🟢 Nếu đơn đã xác nhận & có mã giao dịch → lấy thông tin pin đến
            if (order.maGiaoDichDoiPin) {
              try {
                const giaoDichRes = await axios.get(
                  `/api/transaction-service/giaodichdoipin/${order.maGiaoDichDoiPin}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                const maPinNhan = giaoDichRes.data.maPinNhan;

                if (maPinNhan) {
                  const pinDenRes = await axios.get(`/api/battery-service/pins/${maPinNhan}`);
                  order.pinDen = {
                    maPin: pinDenRes.data.maPin,
                    loaiPin: pinDenRes.data.loaiPin,
                    dungLuong: pinDenRes.data.dungLuong,
                    sucKhoe: pinDenRes.data.sucKhoe,
                    tinhTrang: pinDenRes.data.tinhTrang,
                  };
                }
              } catch (err) {
                console.warn("⚠️ Không lấy được pin đến:", err);
              }
            }
          } catch { }

          return {
            ...order,
            name: taiXeName,
            car: xeLoai,
            pinLoai, // ✅ thêm vào đây
            maTram,
            time: order.ngayDat ? order.ngayDat.substring(11, 16) : "--:--",
            code: `LS-${order.maLichSuDat}`,
            color: activeTab === 1 ? "#3B82F6" : "#10B981",
            status: activeTab === 1 ? "đang chờ" : "đã xác nhận",
          };
        })
      );

      setOrders(enriched);
    } catch (err) {
      console.error("❌ Lỗi lấy đơn theo trạm:", err);
    } finally {
      setLoading(false);
    }
  }, [maTram, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className={styles.queuePage}>
      <StatsHeader />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        {/* LEFT: Tabs */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab(1)}
            className={styles.actionBtn}
            style={{
              backgroundColor: activeTab === 1 ? "#111827" : "#e5e7eb",
              color: activeTab === 1 ? "#fff" : "#111827",
            }}
          >
            Chờ Xác Nhận
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={styles.actionBtn}
            style={{
              backgroundColor: activeTab === 2 ? "#111827" : "#e5e7eb",
              color: activeTab === 2 ? "#fff" : "#111827",
            }}
          >
            Đã Xác Nhận
          </button>
        </div>

        {/* RIGHT: Direct swap */}
        <button
          className={styles.actionBtn}
          style={{ backgroundColor: "#111827" }}
          onClick={() => setShowDirectSwap(true)}
        >
          Đổi pin trực tiếp
        </button>

        {showDirectSwap && (
          <DirectSwapModal
            maTram={maTram}
            onClose={() => setShowDirectSwap(false)}
            onConfirm={fetchOrders}
          />
        )}
      </div>


      {/* Danh sách */}
      <div className={styles.ordersSection}>
        <h2>{activeTab === 1 ? "Đơn Chờ Xác Nhận" : "Đơn Đã Xác Nhận"}</h2>
        <p className={styles.subtitle}>
          {activeTab === 1
            ? "Các tài xế đã đặt chỗ và đang chờ nhân viên xác nhận"
            : "Các đơn đã được xác nhận và chờ bắt đầu thay pin"}
        </p>

        <div className={styles.ordersList}>

          {/* Skeleton khi loading */}
          {loading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLeft}>
                  <div className={`${styles.skeletonBlock} ${styles.skeletonTime}`}></div>
                  <div className={styles.info}>
                    <div className={`${styles.skeletonBlock} ${styles.skeletonName}`}></div>
                    <div className={`${styles.skeletonBlock} ${styles.skeletonCar}`}></div>
                    <div className={`${styles.skeletonBlock} ${styles.skeletonCode}`}></div>
                  </div>
                </div>

                <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`}></div>
              </div>
            ))
          )}

          {/* Nếu không loading và không có đơn */}
          {!loading && orders.length === 0 && (
            <div className={styles.emptyState}>Không có đơn nào.</div>
          )}

          {/* Danh sách đơn chính */}
          {!loading && orders.length > 0 && orders.map((order) => (
            <div key={order.maLichDat} className={styles.orderCard}>
              <div className={styles.left}>
                <div className={styles.time}>{order.time}</div>
                <div className={styles.info}>
                  <div className={styles.name}>{order.name}</div>
                  <div className={styles.car}>{order.car}</div>
                  <div className={styles.code}>{order.code}</div>
                </div>
              </div>

              <div className={styles.right}>
                <div
                  className={styles.status}
                  style={{
                    backgroundColor: order.color + "20",
                    color: order.color,
                  }}
                >
                  <FontAwesomeIcon icon={activeTab === 1 ? faClock : faCheck} />
                  <span>{order.status}</span>
                </div>

                <button
                  className={styles.actionBtn}
                  style={{
                    backgroundColor: activeTab === 1 ? "#111827" : "#3B82F6",
                  }}
                  onClick={() => setSelectedOrder(order)}
                >
                  {activeTab === 1 ? "Xác Nhận" : "Bắt Đầu Thay Pin"}
                  <FontAwesomeIcon icon={activeTab === 1 ? faCheck : faArrowRight} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <BatterySwapModal
          mode={activeTab === 1 ? "CHO_XAC_NHAN" : "DA_XAC_NHAN"}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={() => {
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

export default QueueManagement;