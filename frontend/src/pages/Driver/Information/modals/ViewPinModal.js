// components/CarManagement/Modals/ViewPinModal.js
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../CarManagement.module.css";
import { faBatteryFull, faGaugeHigh, faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";

function ViewPinModal({ isOpen, pinData, onClose, onSuccess }) {
  const [pinHealthEdit, setPinHealthEdit] = useState(100);

  useEffect(() => {
    if (pinData) {
      setPinHealthEdit(pinData.sucKhoe || 100);
    }
  }, [pinData]);

  // Cập nhật phần trăm pin
  const handleUpdatePinHealth = async () => {
    if (!pinData) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/battery-service/pins/${pinData.maPin}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...pinData,
          sucKhoe: pinHealthEdit
        })
      });

      if (response.ok) {
        alert("Cập nhật sức khỏe pin thành công!");
        onSuccess();
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error('Lỗi cập nhật pin:', error);
      alert("Lỗi kết nối!");
    }
  };

  if (!isOpen || !pinData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            <FontAwesomeIcon icon={faBatteryFull} style={{marginRight: '10px', color: '#28a745'}} />
            Thông Tin Pin
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.main}>
          <div className={styles.customerCard}>
            <h3>Thông Tin Xe</h3>
            <div className={styles.infoGrid}>
              <div><strong>Xe:</strong> {pinData.carInfo?.loaiXe}</div>
              <div><strong>VIN:</strong> {pinData.carInfo?.vin}</div>
              <div><strong>Biển số:</strong> {pinData.carInfo?.bienSo}</div>
              <div><strong>Mã Pin:</strong> {pinData.maPin}</div>
            </div>
          </div>

          <div className={styles.pinGrid}>
            <div className={`${styles.pinCard} ${styles.pinInfoCard}`}>
              <h4>Thông số Pin</h4>
              <div className={styles.pinDetails}>
                <p><strong>Loại pin:</strong> {pinData.loaiPin}</p>
                <p><strong>Dung lượng:</strong> {pinData.dungLuong} kWh</p>
              </div>
            </div>
          </div>

          <div className={styles.healthEditSection}>
            <h4>
              <FontAwesomeIcon icon={faGaugeHigh} style={{marginRight: '8px', color: '#ff6b35'}} />
              Chỉnh Sửa Sức Khỏe Pin
            </h4>
            
            <div className={styles.healthSlider}>
              <label htmlFor="pinHealth">Sức khỏe pin: <strong>{pinHealthEdit}%</strong></label>
              <input
                id="pinHealth"
                type="range"
                min="0"
                max="100"
                step="1"
                value={pinHealthEdit}
                onChange={(e) => setPinHealthEdit(parseInt(e.target.value))}
                className={styles.healthRange}
              />
              <div className={styles.rangeLabels}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className={styles.healthIndicator}>
              <div 
                className={styles.healthBar}
                style={{width: `${pinHealthEdit}%`}}
                data-health={pinHealthEdit}
              ></div>
            </div>

            <div className={styles.healthStatus}>
              {pinHealthEdit >= 80 && <span className={styles.statusGood}>🟢 Pin tốt</span>}
              {pinHealthEdit >= 50 && pinHealthEdit < 80 && <span className={styles.statusFair}>🟡 Pin trung bình</span>}
              {pinHealthEdit >= 20 && pinHealthEdit < 50 && <span className={styles.statusPoor}>🟠 Pin yếu</span>}
              {pinHealthEdit < 20 && <span className={styles.statusCritical}>🔴 Pin cần thay thế</span>}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Đóng</button>
          <button className={styles.primaryBtn} onClick={handleUpdatePinHealth}>
            <FontAwesomeIcon icon={faPenToSquare} style={{marginRight: '8px'}} />
            Cập Nhật Sức Khỏe
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewPinModal;