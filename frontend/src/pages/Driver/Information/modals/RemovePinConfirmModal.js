// components/CarManagement/Modals/RemovePinConfirmModal.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../CarManagement.module.css";
import { faCarBattery, faBatteryFull, faTrash } from "@fortawesome/free-solid-svg-icons";

function RemovePinConfirmModal({ isOpen, car, onClose, onSuccess }) {
  
  // Tháo pin (xóa pin hiện tại)
  const handleRemovePin = async () => {
    if (!car?.maPin) return;

    const token = localStorage.getItem("token");

    try {
      // Xóa pin
      const deleteResponse = await fetch(
        `/api/battery-service/pins/${car.maPin}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (deleteResponse.ok) {
        // Cập nhật xe thành không có pin
        const updateCarResponse = await fetch(
          `/api/vehicle-service/vehicles/${car.maPhuongTien}/unlink-pin`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (updateCarResponse.ok) {
          alert("Đã tháo và xóa pin thành công!");
          onSuccess();
        }
      } else {
        alert("Tháo pin thất bại!");
      }
    } catch (error) {
      console.error("Lỗi tháo pin:", error);
      alert("Lỗi kết nối!");
    }
  };

  if (!isOpen || !car) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>
          <FontAwesomeIcon icon={faCarBattery} style={{ marginRight: "10px", color: "#dc3545" }} />
          Xác nhận Tháo Pin
        </h2>
        <div className={styles.pinInfoCurrent}>
          <FontAwesomeIcon icon={faBatteryFull} className={styles.batteryIcon} />
          <div>
            <p><strong>Pin #{car.maPin}</strong></p>
            <p>Loại: {car.pinInfo?.loaiPin || "Chưa rõ"}</p>
            <p>Dung lượng: {car.pinInfo?.dungLuong || "Chưa rõ"} kWh</p>
            <p>Sức khỏe: {car.pinInfo?.sucKhoe || "Chưa rõ"}%</p>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={`${styles.actionButton} ${styles.removeButton}`} onClick={handleRemovePin}>
            <FontAwesomeIcon icon={faTrash} style={{ marginRight: "8px" }} />
            Tháo pin
          </button>
          <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemovePinConfirmModal;