import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCreditCard,
  faMoneyBillWave,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./BatterySwapModal.module.css";
import axios from "axios";
import Select from "react-select";

function BatterySwapModal({ order, mode = "CHO_XAC_NHAN", onClose, onConfirm }) {
  const [pinDenInfo, setPinDenInfo] = useState(null);

  // trạng thái giao dịch
  const [transactionStatus, setTransactionStatus] = useState("chờ giao dịch");

  // thanh toán
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const fetchPinDen = async () => {
      if (!order) return;

      const token = localStorage.getItem("token");
      let pinId = null;

      if (mode === "CHO_XAC_NHAN") {
        pinId = order.maPinDuocGiu;
      } else {
        pinId = order?.pinDen?.maPin || order?.maPinNhan;
      }

      if (!pinId) return;

      try {
        const res = await axios.get(
          `/api/battery-service/pins/${pinId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPinDenInfo(res.data);
      } catch (err) {
        console.error("❌ Không lấy được pin đến:", err);
      }
    };

    fetchPinDen();
  }, [order, mode]);

  // hủy đơn
  const handleCancelBooking = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn này không?")) return;

    const token = localStorage.getItem("token");

    try {
      // 1️⃣ Trả Pin về trạng thái ban đầu
      await axios.patch(
        `/api/battery-service/pins/${order.maPinDuocGiu}/state`,
        {
          tinhTrang: "DAY",
          trangThaiSoHuu: "SAN_SANG"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️⃣ Hủy đơn trong station-service
      await axios.put(
        `/api/station-service/dat-lich/${order.maLichSuDat}/huy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đơn đã được hủy!");
      onConfirm();
      onClose();

    } catch (err) {
      console.error(err);
      alert("❌ Không thể hủy đơn");
    }
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");

    // 🟢 MODE 1 — CHỜ XÁC NHẬN (tạo giao dịch + gán vào đơn)
    if (mode === "CHO_XAC_NHAN") {
      try {
        const pinNhan = order.maPinDuocGiu;

        const payloadGiaoDich = {
          maPinTra: String(order?.pinDi?.maPin),
          maPinNhan: String(pinNhan),
          ngayGiaoDich: null,
          trangThaiGiaoDich: "Đang xử lý",
          thanhtien: 1200000,
          phuongThucThanhToan: payment,
          maTram: order?.maTram,
          maTaiXe: order?.maTaiXe,
        };

        const res = await axios.post(
          `/api/transaction-service/giaodichdoipin`,
          payloadGiaoDich,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const maGiaoDich = res.data.maGiaoDichDoiPin;

        await axios.put(
          `/api/station-service/dat-lich/${order.maLichSuDat}`,
          {
            trangThaiXacNhan: "Đã xác nhận",
            trangThaiDoiPin: "Đang xử lý",
            maGiaoDichDoiPin: maGiaoDich,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("✅ Đơn đã được xác nhận!");
        onConfirm();
        onClose();

      } catch (err) {
        console.error(err);
        alert("❌ Lỗi khi xác nhận đơn!");
      }
      return;
    }

    // 🟢 MODE 2 — ĐÃ XÁC NHẬN (cập nhật giao dịch + trừ gói nếu cần)
    if (mode === "DA_XAC_NHAN") {

      if (!payment) {
        alert("⚠️ Vui lòng chọn phương thức thanh toán!");
        return;
      }

      const token = localStorage.getItem("token");
      const maGiaoDich = order.maGiaoDichDoiPin;

      try {
        const isUsingPackage = payment === "package";

        // 🟢 1️⃣ Nếu dùng gói → kiểm tra & trừ lượt gói TRƯỚC
        if (isUsingPackage) {
          try {
            await axios.put(
              `/api/subscription-service/lichsudangkygoi/giaodich/${order.maTaiXe}`,
              {
                maTaiXe: order.maTaiXe,
                ngayGiaoDich: new Date().toISOString().split("T")[0]
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            alert("❌ Gói dịch vụ không hợp lệ hoặc đã hết lượt! Không thể hoàn thành giao dịch.");
            return;
          }
        }

        // 🟢 2️⃣ Cập nhật giao dịch
        const payloadUpdate = {
          maPinTra: String(order?.pinDi?.maPin),
          maPinNhan: String(order?.pinDen?.maPin || order.maPinNhan),
          ngayGiaoDich: new Date().toISOString(),
          trangThaiGiaoDich: transactionStatus,
          thanhtien: isUsingPackage ? 0 : 1200000,
          phuongThucThanhToan: payment,
          maTram: order?.maTram,
          maTaiXe: order?.maTaiXe,
        };

        // 🔵 1️⃣ Cập nhật pin đi → đưa vào sạc
        await axios.patch(
          `/api/battery-service/pins/${order.pinDi.maPin}/state`,
          {
            tinhTrang: "DANG_SAC",
            trangThaiSoHuu: "CHUA_SAN_SANG"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 🟢 2️⃣ Cập nhật pin đến → thuộc sở hữu tài xế
        const pinNhanId = order?.pinDen?.maPin || order.maPinNhan;
        await axios.patch(
          `/api/battery-service/pins/${pinNhanId}/state`,
          {
            tinhTrang: "DAY",
            trangThaiSoHuu: "DANG_SU_DUNG"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 🟣 3️⃣ Cập nhật xe để gắn pin mới
        await axios.post(
          `/api/vehicle-service/vehicles/${order.maXeGiaoDich}/link-pin/${pinNhanId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          `/api/transaction-service/giaodichdoipin/${maGiaoDich}`,
          payloadUpdate,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 🟢 3️⃣ Cập nhật trạng thái đặt lịch
        await axios.put(
          `/api/station-service/dat-lich/${order.maLichSuDat}`,
          {
            trangThaiDoiPin: "Hoàn thành",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("✅ Đã hoàn thành giao dịch!");
        onConfirm();
        onClose();

      } catch (err) {
        console.error(err);
        alert("❌ Cập nhật giao dịch thất bại!");
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2>
            {mode === "CHO_XAC_NHAN" ? "Xác Nhận Đơn Đặt Pin" : "Chi Tiết Giao Dịch Thay Pin"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.main}>
          {/* Thông tin khách hàng */}
          <div className={styles.customerCard}>
            <h3>Thông Tin Khách Hàng</h3>
            <div className={styles.infoGrid}>
              <div><strong>Tên:</strong> {order?.name}</div>
              <div><strong>Xe:</strong> {order?.car}</div>
              <div><strong>Mã Đặt Chỗ:</strong> {order?.code}</div>
              <div><strong>Mô hình Pin:</strong> {order?.pinDi?.loaiPin || "Không rõ"}</div>
            </div>
          </div>

          {/* Pin đi + Pin đến */}
          <div className={styles.pinGrid}>
            <div className={`${styles.pinCard} ${styles.pinOut}`}>
              <h4>Pin đi</h4>
              <p className={styles.note}>Pin tài xế mang đến trạm</p>
              <p>Mã pin: <strong>{order?.pinDi?.maPin || "Không rõ"}</strong></p>
              <p>Loại pin: <strong>{order?.pinDi?.loaiPin || "Không rõ"}</strong></p>
              <p>Dung lượng: <strong>{order?.pinDi?.dungLuong || "--"} kWh</strong></p>
              <p>Sức khỏe: <strong>{order?.pinDi?.sucKhoe || "--"}%</strong></p>
            </div>

            <div className={`${styles.pinCard} ${styles.pinIn}`}>
              <h4>Pin đến</h4>
              <p className={styles.note}>Pin nhân viên giao cho tài xế</p>
              {pinDenInfo ? (
                <>
                  <p>Mã pin: <strong>{pinDenInfo.maPin}</strong></p>
                  <p>Loại pin: <strong>{pinDenInfo.loaiPin}</strong></p>
                  <p>Dung lượng: <strong>{pinDenInfo.dungLuong} kWh</strong></p>
                  <p>Sức khỏe: <strong>{pinDenInfo.sucKhoe}%</strong></p>

                  {mode === "CHO_XAC_NHAN" && (
                    <p style={{ fontStyle: "italic", color: "#555" }}>
                      (Pin được hệ thống chọn ngẫu nhiên khi tài xế đặt lịch)
                    </p>
                  )}
                </>
              ) : (
                <p>Đang tải thông tin pin...</p>
              )}
            </div>
          </div>

          {/* Trạng thái giao dịch */}
          <div className={styles.checklistRow}>
            <label>
              <input
                type="radio"
                name="status"
                checked={transactionStatus === "chờ giao dịch"}
                onChange={() => setTransactionStatus("chờ giao dịch")}
              />
              Chờ giao dịch
            </label>
            <label>
              <input
                type="radio"
                name="status"
                checked={transactionStatus === "Đã hoàn thành"}
                onChange={() => setTransactionStatus("Đã hoàn thành")}
              />
              Đã hoàn thành
            </label>
          </div>

          {/* Thanh toán */}
          {/* Chỉ hiện payment khi ở trạng thái đã xác nhận */}
          {mode === "DA_XAC_NHAN" && (
            <div className={styles.paymentBox}>
              <h4>Thanh Toán Dịch Vụ</h4>
              <div className={styles.priceRow}>
                <span>Tổng tiền:</span>
                <strong>{payment === "package" ? "0₫" : "1.200.000₫"}</strong>
              </div>

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
                  <FontAwesomeIcon icon={faGift} /> Sử dụng gói
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>

          {mode === "CHO_XAC_NHAN" ? (
            <button
              className={styles.cancelBtn}
              onClick={handleCancelBooking}   // 🔥 hàm mới
            >
              Hủy đơn đặt lịch
            </button>
          ) : (
            <button
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Đóng
            </button>
          )}

          <button
            className={styles.primaryBtn}
            onClick={handleConfirm}
          >
            {mode === "CHO_XAC_NHAN" ? "Xác Nhận Đơn" : "Lưu Trạng Thái"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatterySwapModal;