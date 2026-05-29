// components/CarManagement/CarManagement.js
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../components/Shares/Button/Button";
import styles from "./CarManagement.module.css";
import {
  faCarSide,
  faBatteryFull,
  faPenToSquare,
  faTrash,
  faPlus,
  faCarBattery,
  faBolt,
  faExchangeAlt,
  faEye
} from "@fortawesome/free-solid-svg-icons";

// Import các component modal
import AddCarModal from "./modals/AddCarModal";
import EditCarModal from "./modals/EditCarModal";
import ReplacePinModal from "./modals/ReplacePinModal";
import ViewPinModal from "./modals/ViewPinModal";
import RemovePinConfirmModal from "./modals/RemovePinConfirmModal";
import DeleteCarConfirmModal from "./modals/DeleteCarConfirmModal";

function CarManagement({ maTaiXe }) { // Nhận maTaiXe từ props
  // ==== STATE QUẢN LÝ ====
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDeleteConfirm, setIsOpenDeleteConfirm] = useState(false);
  const [isOpenPinManagement, setIsOpenPinManagement] = useState(false);
  const [isOpenReplacePin, setIsOpenReplacePin] = useState(false);
  const [isOpenViewPin, setIsOpenViewPin] = useState(false);
  
  const [carToDelete, setCarToDelete] = useState(null);
  const [selectedCarForPin, setSelectedCarForPin] = useState(null);
  const [selectedPinForView, setSelectedPinForView] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  
  const [carList, setCarList] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // Load danh sách xe từ backend - sử dụng maTaiXe
  const loadCarList = async () => {
    const token = localStorage.getItem("token");
    
    if (!token || !maTaiXe) {
      console.error("Không tìm thấy token hoặc mã tài xế");
      setLoadingCars(false);
      return;
    }

    setLoadingCars(true);
    try {
      // Sửa: Load xe theo mã tài xế thay vì userId
      const response = await fetch(`/api/vehicle-service/vehicles/by-driver/${maTaiXe}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCarList(data);
      } else {
        console.error("Lỗi tải danh sách xe");
        setCarList([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi tải xe:", error);
      setCarList([]);
    } finally {
      setLoadingCars(false);
    }
  };

  // Load dữ liệu khi component mount hoặc khi maTaiXe thay đổi
  useEffect(() => {
    if (maTaiXe) {
      loadCarList();
    }
  }, [maTaiXe]);

  // ==== HÀM MỞ MODAL ====
  const openAdd = () => {
    setIsOpenAdd(true);
  };

  const openEdit = (car) => {
    setSelectedCar({ ...car });
    setIsOpenEdit(true);
  };

  const openReplacePin = (car) => {
    setSelectedCarForPin(car);
    setIsOpenReplacePin(true);
  };

  const openViewPin = async (car) => {
    if (!car.maPin) {
      alert("Xe này chưa có pin!");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/battery-service/pins/${car.maPin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const pinData = await response.json();
        setSelectedPinForView({
          ...pinData,
          carInfo: car
        });
        setIsOpenViewPin(true);
      } else {
        alert("Không thể tải thông tin pin!");
      }
    } catch (error) {
      console.error('Lỗi tải thông tin pin:', error);
      alert("Lỗi kết nối!");
    }
  };

  const openDeleteConfirm = (car) => {
    setCarToDelete(car);
    setIsOpenDeleteConfirm(true);
  };

  // ==== RENDER ====
  return (
    <div className={styles.cardetail}>
      <div className={styles.header}>
        <h1>Xe Của Tôi</h1>
        <p>Quản lý xe và pin đã đăng ký</p>
      </div>

      {!maTaiXe ? (
        <div>Đang tải thông tin tài xế...</div>
      ) : loadingCars ? (
        <div>Đang tải danh sách xe...</div>
      ) : carList.length === 0 ? (
        <div className={styles.noCars}>Chưa có xe nào được đăng ký</div>
      ) : (
        carList.map((car) => (
          <div key={car.maPhuongTien} className={styles.carname}>
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faCarSide} className={styles.faCarSide} />
              <div className={styles.namevin}>
                <p className={styles.name}>{car.loaiXe}</p>
                <p className={styles.vin}>VIN: {car.vin}</p>
                <p className={styles.vin}>Biển số: {car.bienSo}</p>
                {car.maPin ? (
                  <div className={styles.pinInfo}>
                    <FontAwesomeIcon icon={faBatteryFull} className={styles.batteryIcon} />
                    <span>Pin: #{car.maPin} (Sức khỏe: {car.pinInfo?.sucKhoe || 'N/A'}%)</span>
                  </div>
                ) : (
                  <div className={styles.pinInfo}>
                    <span className={styles.noPin}>Chưa có pin</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.carActions}>
              {/* Nút Xem Pin - chỉ hiển thị khi có pin */}
              {car.maPin && (
                <Button
                  icon
                  aria-label={`Xem pin của ${car.loaiXe}`}
                  type="button"
                  onClick={() => openViewPin(car)}
                  title="Xem pin"
                >
                  <FontAwesomeIcon icon={faEye} className={styles.iconbutton} />
                </Button>
              )}

              {/* Nút Thay Pin - chỉ hiển thị khi có pin */}
              {car.maPin && (
                <Button
                  icon
                  aria-label={`Thay pin cho ${car.loaiXe}`}
                  type="button"
                  onClick={() => openReplacePin(car)}
                  title="Thay pin"
                >
                  <FontAwesomeIcon icon={faExchangeAlt} className={styles.iconbutton} />
                </Button>
              )}

              {/* Nút Tháo Pin - chỉ hiển thị khi có pin */}
              {car.maPin && (
                <Button
                  icon
                  aria-label={`Tháo pin khỏi ${car.loaiXe}`}
                  type="button"
                  onClick={() => {
                    setSelectedCarForPin(car);
                    setIsOpenPinManagement(true);
                  }}
                  title="Tháo pin"
                >
                  <FontAwesomeIcon icon={faCarBattery} className={styles.iconbutton} />
                </Button>
              )}

              {/* Nút Thêm Pin - chỉ hiển thị khi không có pin */}
              {!car.maPin && (
                <Button
                  icon
                  aria-label={`Thêm pin cho ${car.loaiXe}`}
                  type="button"
                  onClick={() => openReplacePin(car)}
                  title="Thêm pin"
                >
                  <FontAwesomeIcon icon={faBolt} className={styles.iconbutton} />
                </Button>
              )}

              <Button
                icon
                aria-label={`Chỉnh sửa ${car.loaiXe}`}
                type="button"
                onClick={() => openEdit(car)}
                title="Sửa xe"
              >
                <FontAwesomeIcon icon={faPenToSquare} className={styles.iconbutton} />
              </Button>

              <Button
                icon
                aria-label={`Xóa ${car.loaiXe}`}
                type="button"
                onClick={() => openDeleteConfirm(car)}
                title="Xóa xe"
              >
                <FontAwesomeIcon icon={faTrash} className={styles.iconbutton} />
              </Button>
            </div>
          </div>
        ))
      )}
      
      <Button white outline type="button" onClick={openAdd} disabled={!maTaiXe}>
        <FontAwesomeIcon icon={faPlus} style={{ marginRight: "8px" }} />
        Thêm xe mới + Pin
      </Button>

      {/* Các Modal Component */}
      <AddCarModal
        isOpen={isOpenAdd}
        maTaiXe={maTaiXe} // Truyền maTaiXe vào modal
        onClose={() => setIsOpenAdd(false)}
        onSuccess={() => {
          setIsOpenAdd(false);
          loadCarList();
        }}
      />

      <EditCarModal
        isOpen={isOpenEdit}
        car={selectedCar}
        onClose={() => setIsOpenEdit(false)}
        onSuccess={() => {
          setIsOpenEdit(false);
          loadCarList();
        }}
      />

      <ReplacePinModal
        isOpen={isOpenReplacePin}
        car={selectedCarForPin}
        onClose={() => setIsOpenReplacePin(false)}
        onSuccess={() => {
          setIsOpenReplacePin(false);
          loadCarList();
        }}
      />

      <ViewPinModal
        isOpen={isOpenViewPin}
        pinData={selectedPinForView}
        onClose={() => setIsOpenViewPin(false)}
        onSuccess={() => {
          setIsOpenViewPin(false);
          loadCarList();
        }}
      />

      <RemovePinConfirmModal
        isOpen={isOpenPinManagement}
        car={selectedCarForPin}
        onClose={() => setIsOpenPinManagement(false)}
        onSuccess={() => {
          setIsOpenPinManagement(false);
          loadCarList();
        }}
      />

      <DeleteCarConfirmModal
        isOpen={isOpenDeleteConfirm}
        car={carToDelete}
        onClose={() => setIsOpenDeleteConfirm(false)}
        onSuccess={() => {
          setIsOpenDeleteConfirm(false);
          loadCarList();
        }}
      />
    </div>
  );
}

export default CarManagement;