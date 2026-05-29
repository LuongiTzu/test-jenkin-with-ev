// components/CarManagement/Modals/DeleteCarConfirmModal.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../CarManagement.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function DeleteCarConfirmModal({ isOpen, car, onClose, onSuccess }) {
  
  // Xóa xe (và xóa pin theo)
  const handleConfirmDelete = async () => {
    if (!car) return;

    const token = localStorage.getItem("token");

    try {
      // 1. Xóa xe trước
      const deleteCarResponse = await fetch(
        `/api/vehicle-service/vehicles/${car.maPhuongTien}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (deleteCarResponse.ok) {
        // 2. Nếu xe có pin, xóa pin luôn
        if (car.maPin) {
          await fetch(`/api/battery-service/pins/${car.maPin}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        alert("Xóa xe và pin thành công!");
        onSuccess();
      } else {
        alert("Xóa xe thất bại!");
      }
    } catch (error) {
      console.error("Lỗi xóa xe:", error);
      alert("Lỗi kết nối!");
    }
  };

  if (!isOpen || !car) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>
          <FontAwesomeIcon icon={faTrash} style={{ marginRight: "10px", color: "#dc3545" }} />
          Xác nhận Xóa Xe
        </h2>
        <p>Bạn có chắc muốn xóa xe <strong>{car.loaiXe}</strong> (VIN: {car.vin})?</p>
        <p className={styles.warningText}>Hành động này không thể hoàn tác!</p>
        <div className={styles.modalActions}>
          <button className={styles.deleteButton} type="button" onClick={handleConfirmDelete}>
            <FontAwesomeIcon icon={faTrash} style={{ marginRight: "8px" }} />
            Xóa Xe & Pin
          </button>
          <button className={styles.cancelButton} type="button" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCarConfirmModal;