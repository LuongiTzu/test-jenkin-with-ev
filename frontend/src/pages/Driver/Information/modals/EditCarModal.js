// components/CarManagement/Modals/EditCarModal.js
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../../components/Shares/Button/Button";
import styles from "../CarManagement.module.css";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

function EditCarModal({ isOpen, car, onClose, onSuccess }) {
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (car) {
      setSelectedCar({ ...car });
    }
  }, [car]);

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");

    if (!selectedCar || !selectedCar.vin.trim() || !selectedCar.bienSo.trim() || !selectedCar.loaiXe.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const payload = {
      vin: selectedCar.vin.trim(),
      bienSo: selectedCar.bienSo.trim(),
      loaiXe: selectedCar.loaiXe.trim(),
      maTaiXe: selectedCar.maTaiXe,
    };

    try {
      const response = await fetch(`/api/vehicle-service/vehicles/${selectedCar.maPhuongTien}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Cập nhật xe thành công!");
        onSuccess();
      } else {
        const error = await response.text();
        alert("Cập nhật xe thất bại!\n" + error);
      }
    } catch (error) {
      console.error("Lỗi cập nhật xe:", error);
      alert("Lỗi kết nối!");
    }
  };

  if (!isOpen || !selectedCar) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>
          <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: "10px", color: "#ffc107" }} />
          Chỉnh Sửa Xe
        </h2>
        <div className={styles.formdetail}>
          <label htmlFor="editVin">Mã VIN *</label>
          <input
            id="editVin"
            type="text"
            value={selectedCar.vin}
            onChange={(e) => setSelectedCar({ ...selectedCar, vin: e.target.value })}
          />
        </div>
        <div className={styles.formdetail}>
          <label htmlFor="editBienSo">Biển số *</label>
          <input
            id="editBienSo"
            type="text"
            value={selectedCar.bienSo}
            onChange={(e) => setSelectedCar({ ...selectedCar, bienSo: e.target.value })}
          />
        </div>
        <div className={styles.formdetail}>
          <label htmlFor="editLoaiXe">Loại xe *</label>
          <input
            id="editLoaiXe"
            type="text"
            value={selectedCar.loaiXe}
            onChange={(e) => setSelectedCar({ ...selectedCar, loaiXe: e.target.value })}
          />
        </div>
        <div className={styles.modalActions}>
          <Button change type="button" onClick={handleSaveEdit}>
            <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: "8px" }} />
            Lưu Thay Đổi
          </Button>
          <Button
            white
            blackoutline
            type="button"
            onClick={onClose}
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditCarModal;
