// components/CarManagement/Modals/ReplacePinModal.js
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../../components/Shares/Button/Button";
import styles from "../CarManagement.module.css";
import { faExchangeAlt, faBatteryFull } from "@fortawesome/free-solid-svg-icons";

function ReplacePinModal({ isOpen, car, onClose, onSuccess }) {
  const [loadingModels, setLoadingModels] = useState(false);
  const [uniqueModels, setUniqueModels] = useState([]);
  
  const [newPinForCar, setNewPinForCar] = useState({
    selectedPinType: "",
    loaiPin: "",
    dungLuongPin: "",
    sucKhoePin: "100",
  });

  // Hàm lấy danh sách model pin từ server
  const loadUniqueModels = async () => {
    const token = localStorage.getItem("token");
    setLoadingModels(true);
    try {
      const pinsRes = await fetch("/api/battery-service/pins", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (pinsRes.ok) {
        const pinsData = await pinsRes.json();
        
        const uniqModels = [];
        const seen = new Set();
        pinsData.forEach((p) => {
          const model = (p.loaiPin ?? p.loai_pin ?? "").trim();
          if (model && !seen.has(model)) {
            seen.add(model);
            uniqModels.push({
              loaiPin: model,
              dungLuong: p.dungLuong ?? p.dung_luong ?? "",
            });
          }
        });
        setUniqueModels(uniqModels);
      } else {
        console.error("Lỗi tải danh sách model pin");
        setUniqueModels([]);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi tải model pin:", err);
      setUniqueModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Hàm xử lý khi chọn loại pin
  const handleReplacePinTypeChange = (selectedType) => {
    if (selectedType) {
      const found = uniqueModels.find((m) => m.loaiPin === selectedType);
      if (found) {
        setNewPinForCar((prev) => ({
          ...prev,
          selectedPinType: selectedType,
          loaiPin: found.loaiPin,
          dungLuongPin: found.dungLuong.toString(),
        }));
      } else {
        setNewPinForCar((prev) => ({
          ...prev,
          selectedPinType: selectedType,
          loaiPin: selectedType,
          dungLuongPin: "",
        }));
      }
    } else {
      setNewPinForCar((prev) => ({
        ...prev,
        selectedPinType: selectedType,
        loaiPin: "",
        dungLuongPin: "",
      }));
    }
  };

  // Thay pin (tạo pin mới và gán vào xe)
  const handleReplacePin = async () => {
    if (!car || !newPinForCar.selectedPinType) {
      alert("Vui lòng chọn loại pin mới!");
      return;
    }

    if (!newPinForCar.sucKhoePin || newPinForCar.sucKhoePin < 0 || newPinForCar.sucKhoePin > 100) {
      alert("Vui lòng nhập sức khỏe pin từ 0-100%!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // 1. Nếu có pin cũ, xóa pin cũ trước
      if (car.maPin) {
        await fetch(`/api/battery-service/pins/${car.maPin}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 2. Tạo pin mới
      const pinPayload = {
        loaiPin: newPinForCar.loaiPin,
        dungLuong: newPinForCar.dungLuongPin ? parseFloat(newPinForCar.dungLuongPin) : 0,
        tinhTrang: "DAY",
        trangThaiSoHuu: "DANG_SU_DUNG",
        sucKhoe: newPinForCar.sucKhoePin ? parseFloat(newPinForCar.sucKhoePin) : 100,
        ngayNhapKho: new Date().toISOString().split("T")[0],
        ngayBaoDuongGanNhat: new Date().toISOString().split("T")[0],
      };

      const createPinResponse = await fetch("/api/battery-service/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pinPayload),
      });

      if (!createPinResponse.ok) {
        throw new Error("Tạo pin mới thất bại");
      }

      const newPin = await createPinResponse.json();

      // 3. Gán pin mới vào xe
      const updateCarResponse = await fetch(
        `/api/vehicle-service/vehicles/${car.maPhuongTien}/link-pin/${newPin.maPin}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (updateCarResponse.ok) {
        alert("Thay pin thành công!");
        onSuccess();
      } else {
        throw new Error("Gán pin mới thất bại");
      }
    } catch (error) {
      console.error("Lỗi thay pin:", error);
      alert("Thay pin thất bại: " + error.message);
    }
  };

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setNewPinForCar({
        selectedPinType: "",
        loaiPin: "",
        dungLuongPin: "",
        sucKhoePin: "100",
      });
      loadUniqueModels();
    }
  }, [isOpen]);

  if (!isOpen || !car) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>
          <FontAwesomeIcon icon={faExchangeAlt} style={{ marginRight: "10px", color: "#17a2b8" }} />
          {car.maPin ? "Thay Pin" : "Thêm Pin"} cho {car.loaiXe}
        </h2>

        <div className={styles.sectionDivider}>
          <h4>
            <FontAwesomeIcon icon={faBatteryFull} style={{ marginRight: "8px", color: "#28a745" }} />
            Thông tin Pin Mới
          </h4>
          <p className={styles.note}>Chọn loại pin để tự động điền thông tin</p>
        </div>

        <div className={styles.formdetail}>
          <label htmlFor="replacePinType">Loại pin *</label>
          <input
            list="modelListReplace"
            id="replacePinType"
            value={newPinForCar.selectedPinType}
            onChange={(e) => handleReplacePinTypeChange(e.target.value)}
            placeholder="Nhập hoặc chọn model có sẵn"
          />
          <datalist id="modelListReplace">
            {uniqueModels.map((model) => (
              <option key={model.loaiPin} value={model.loaiPin} />
            ))}
          </datalist>
          {loadingModels && <small>Đang tải danh sách model...</small>}
        </div>

        <div className={styles.formdetail}>
          <label htmlFor="replaceLoaiPin">Thông số pin</label>
          <input
            id="replaceLoaiPin"
            type="text"
            value={newPinForCar.loaiPin}
            onChange={(e) => setNewPinForCar({ ...newPinForCar, loaiPin: e.target.value })}
            placeholder="Loại pin sẽ tự động điền khi chọn model"
            className={newPinForCar.selectedPinType && uniqueModels.find(m => m.loaiPin === newPinForCar.selectedPinType) ? styles.readonlyInput : ""}
            readOnly={!!(newPinForCar.selectedPinType && uniqueModels.find(m => m.loaiPin === newPinForCar.selectedPinType))}
          />
        </div>

        <div className={styles.formdetail}>
          <label htmlFor="replaceDungLuongPin">Dung lượng pin (kWh)</label>
          <input
            id="replaceDungLuongPin"
            type="number"
            value={newPinForCar.dungLuongPin}
            onChange={(e) => setNewPinForCar({ ...newPinForCar, dungLuongPin: e.target.value })}
            placeholder="Dung lượng sẽ tự động điền khi chọn model"
            className={newPinForCar.selectedPinType && uniqueModels.find(m => m.loaiPin === newPinForCar.selectedPinType) ? styles.readonlyInput : ""}
            readOnly={!!(newPinForCar.selectedPinType && uniqueModels.find(m => m.loaiPin === newPinForCar.selectedPinType))}
          />
        </div>

        <div className={styles.formdetail}>
          <label htmlFor="replaceSucKhoePin">Sức khỏe pin (%) *</label>
          <input
            id="replaceSucKhoePin"
            type="number"
            min="0"
            max="100"
            step="1"
            value={newPinForCar.sucKhoePin}
            onChange={(e) => setNewPinForCar({ ...newPinForCar, sucKhoePin: e.target.value })}
            placeholder="Nhập từ 0-100%"
          />
          <div className={styles.rangeInfo}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button
            change
            type="button"
            onClick={handleReplacePin}
            disabled={!newPinForCar.selectedPinType}
          >
            <FontAwesomeIcon icon={faExchangeAlt} style={{ marginRight: "8px" }} />
            {car.maPin ? "Thay Pin" : "Thêm Pin"}
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

export default ReplacePinModal;