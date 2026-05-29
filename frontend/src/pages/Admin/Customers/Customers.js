import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBatteryFull,
  faLocationDot,
  faUsers,
  faFilter,
  faPlus,
  faRefresh,
  faEdit,
  faTrash,
  faPhone,
  faIdCard,
  faEnvelope,
  faHashtag
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Customers.module.css";
import AddDriverModal from "./AddDriverModal";
import EditDriverModal from "./EditDriverModal";

function Customers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverData, setDriverData] = useState({
    topKpi: [
      {
        title: "Tổng Tài Xế",
        value: "0",
        sub: "Đang tải...",
        color: "#16a34a",
        icon: faUsers,
      },
      {
        title: "Tài Xế Active",
        value: "0",
        sub: "Đang tải...",
        color: "#3b82f6",
        icon: faBatteryFull,
      },
      {
        title: "Trạm Hoạt Động",
        value: "24",
        sub: "Tất Cả Trực Tuyến",
        color: "#a855f7",
        icon: faLocationDot,
      },
      {
        title: "Tỷ Lệ Hoạt Động",
        value: "0%",
        sub: "Đang tải...",
        color: "#f97316",
        icon: faDollarSign,
      },
    ],
    driversList: [],
  });

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Load danh sách tài xế khi component mount
  useEffect(() => {
    fetchDriversList();
  }, []);

  const fetchDriversList = async () => {
    try {
      setListLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("Không tìm thấy token!");
        setListLoading(false);
        return;
      }

      console.log("Đang tải danh sách tài xế...");
      const response = await fetch('/api/user-service/taixe', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const taiXeList = await response.json();
        console.log("Dữ liệu tài xế từ API:", taiXeList);
        
        // Transform data từ API sang format hiển thị
        const transformedList = taiXeList.map(tx => ({
          id: tx.maTaiXe,
          maTaiXe: tx.maTaiXe,
          name: tx.nguoiDung?.hoTen || "Chưa có tên",
          email: tx.nguoiDung?.email || "Chưa có email",
          soDienThoai: tx.nguoiDung?.soDienThoai || "Chưa có SĐT",
          bangLaiXe: tx.bangLaiXe || "Chưa có bằng lái",
          ngaySinh: tx.nguoiDung?.ngaySinh || null,
          gioiTinh: tx.nguoiDung?.gioiTinh || "Chưa xác định"
        }));

        // Cập nhật KPI dựa trên dữ liệu thực
        updateKpiData(transformedList);

        setDriverData(prev => ({
          ...prev,
          driversList: transformedList
        }));
        
        console.log(`Đã tải ${transformedList.length} tài xế`);
      } else {
        console.error("Lỗi khi tải danh sách tài xế:", response.status);
        if (response.status === 403) {
          alert("Bạn không có quyền truy cập danh sách tài xế!");
        } else if (response.status === 401) {
          alert("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
        }
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối server! Vui lòng kiểm tra kết nối.");
    } finally {
      setListLoading(false);
    }
  };

  // Cập nhật KPI dựa trên dữ liệu thực
  const updateKpiData = (driversList) => {
    const totalDrivers = driversList.length;
    const activeDrivers = driversList.length;

    setDriverData(prev => ({
      ...prev,
      topKpi: [
        {
          ...prev.topKpi[0],
          value: totalDrivers.toString(),
          sub: `Tổng số tài xế`
        },
        {
          ...prev.topKpi[1],
          value: activeDrivers.toString(),
          sub: `Đang hoạt động`
        },
        {
          ...prev.topKpi[2],
          value: "24",
          sub: "Tất Cả Trực Tuyến"
        },
        {
          ...prev.topKpi[3],
          value: `${totalDrivers > 0 ? Math.round(activeDrivers/totalDrivers * 100) : 0}%`,
          sub: `Tỷ lệ hoạt động`
        },
      ]
    }));
  };

  // Hàm xử lý thêm tài xế mới
  const handleAddDriver = async (newDriverData) => {
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu gửi đi:", newDriverData);

      const requestData = {
        hoTen: newDriverData.hoTen,
        email: newDriverData.email,
        soDienThoai: newDriverData.soDienThoai,
        gioiTinh: newDriverData.gioiTinh || "NAM",
        matKhau: newDriverData.matKhau,
        ngaySinh: newDriverData.ngaySinh || null,
        bangLaiXe: newDriverData.bangLaiXe || ""
      };

      console.log("Đang gửi request thêm tài xế...");
      const response = await fetch('/api/user-service/taixe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const addedDriver = await response.json();
        console.log("Tài xế mới:", addedDriver);
        
        const newDriverItem = {
          id: addedDriver.maTaiXe,
          maTaiXe: addedDriver.maTaiXe,
          name: addedDriver.nguoiDung?.hoTen || addedDriver.hoTen,
          email: addedDriver.nguoiDung?.email || addedDriver.email,
          soDienThoai: addedDriver.nguoiDung?.soDienThoai || addedDriver.soDienThoai,
          bangLaiXe: addedDriver.bangLaiXe,
          ngaySinh: addedDriver.nguoiDung?.ngaySinh || addedDriver.ngaySinh,
          gioiTinh: addedDriver.nguoiDung?.gioiTinh || addedDriver.gioiTinh
        };

        setDriverData(prev => {
          const updatedList = [...prev.driversList, newDriverItem];
          updateKpiData(updatedList);
          return {
            ...prev,
            driversList: updatedList
          };
        });

        setShowAddModal(false);
        alert("Thêm tài xế thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);
        
        let errorMessage = "Lỗi khi thêm tài xế";
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thêm tài xế:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý sửa tài xế
  const handleEditDriver = async (id, driverData) => {
    setEditLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu cập nhật:", driverData);

      const requestData = {
        hoTen: driverData.hoTen,
        email: driverData.email,
        soDienThoai: driverData.soDienThoai,
        gioiTinh: driverData.gioiTinh,
        ngaySinh: driverData.ngaySinh || null,
        bangLaiXe: driverData.bangLaiXe || "",
        matKhau: driverData.matKhau || ""
      };

      console.log("Đang gửi request cập nhật tài xế...");
      const response = await fetch(`/api/user-service/taixe/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedDriver = await response.json();
        console.log("Tài xế đã cập nhật:", updatedDriver);
        
        setDriverData(prev => {
          const updatedList = prev.driversList.map(driver => 
            driver.id === id ? {
              ...driver,
              name: updatedDriver.nguoiDung?.hoTen || updatedDriver.hoTen,
              email: updatedDriver.nguoiDung?.email || updatedDriver.email,
              soDienThoai: updatedDriver.nguoiDung?.soDienThoai || updatedDriver.soDienThoai,
              bangLaiXe: updatedDriver.bangLaiXe,
              ngaySinh: updatedDriver.nguoiDung?.ngaySinh || updatedDriver.ngaySinh,
              gioiTinh: updatedDriver.nguoiDung?.gioiTinh || updatedDriver.gioiTinh
            } : driver
          );
          return {
            ...prev,
            driversList: updatedList
          };
        });

        setShowEditModal(false);
        setSelectedDriver(null);
        alert("Cập nhật thông tin tài xế thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);
        
        let errorMessage = "Lỗi khi cập nhật tài xế";
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tài xế:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài xế này?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          alert("Vui lòng đăng nhập lại!");
          return;
        }

        console.log("Đang xóa tài xế ID:", id);
        
        const response = await fetch(`/api/user-service/taixe/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const result = await response.text();
          console.log("Kết quả xóa:", result);
          
          const updatedList = driverData.driversList.filter(driver => driver.id !== id);
          setDriverData(prev => ({
            ...prev,
            driversList: updatedList
          }));

          updateKpiData(updatedList);
          alert("Xóa tài xế thành công!");
        } else {
          const errorText = await response.text();
          console.error("Lỗi chi tiết:", errorText);
          
          let errorMessage = "Không thể xóa tài xế";
          if (errorText) {
            errorMessage = errorText;
          }
          
          alert(`Lỗi: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Lỗi kết nối server! Vui lòng thử lại.");
      }
    }
  };

  // Hàm mở modal sửa
  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return "Invalid date";
    }
  };

  const refreshDriversList = () => {
    fetchDriversList();
  };

  return (
    <div className={styles.wrapper}>
      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {driverData.topKpi.map((item, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiTitle}>{item.title}</p>
              <h2 className={styles.kpiValue}>{item.value}</h2>
              <p className={styles.kpiSub}>{item.sub}</p>
            </div>
            <div
              className={styles.kpiIcon}
              style={{ color: item.color, backgroundColor: item.color + "20" }}
            >
              <FontAwesomeIcon icon={item.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Tài Xế</h2>
        <div className={styles.actions}>
          <button className={styles.filterBtn}>
            <FontAwesomeIcon icon={faFilter} /> Lọc
          </button>
          <button 
            className={styles.refreshBtn}
            onClick={refreshDriversList}
            title="Làm mới danh sách"
            disabled={listLoading}
          >
            <FontAwesomeIcon icon={faRefresh} className={listLoading ? styles.spin : ''} />
          </button>
          <button 
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm Tài Xế
          </button>
        </div>
      </div>

      {/* Drivers List */}
      <div className={styles.tableWrapper}>
        {listLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách tài xế...</p>
          </div>
        ) : driverData.driversList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>📭 Chưa có tài xế nào trong hệ thống</p>
            <button 
              className={styles.addBtn}
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Thêm tài xế đầu tiên
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Tài Xế</th>
                <th>Tài Xế</th>
                <th>Thông Tin Liên Hệ</th>
                <th>Bằng Lái Xe</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {driverData.driversList.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className={styles.driverId}>
                    
                      <span className={styles.idText}>{driver.maTaiXe}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{driver.name}</span>
                      {driver.ngaySinh && (
                        <p className={styles.customerEmail}>
                          Ngày sinh: {formatDate(driver.ngaySinh)}
                        </p>
                      )}
                      {driver.gioiTinh && driver.gioiTinh !== "Chưa xác định" && (
                        <p className={styles.customerEmail}>
                          Giới tính: {driver.gioiTinh === "NAM" ? "Nam" : driver.gioiTinh === "NU" ? "Nữ" : driver.gioiTinh}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div className={styles.contactItem}>
                        <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
                        <span>{driver.soDienThoai}</span>
                      </div>
                      <div className={styles.contactItem}>
                        <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
                        <span>{driver.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.plan}>{driver.bangLaiXe}</span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button 
                        className={styles.iconBtn}
                        title="Chỉnh sửa thông tin"
                        onClick={() => handleOpenEditModal(driver)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteDriver(driver.id)}
                        title="Xóa tài xế"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm Tài Xế */}
      <AddDriverModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDriver={handleAddDriver}
        loading={loading}
      />

      {/* Modal Sửa Tài Xế */}
      <EditDriverModal 
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDriver(null);
        }}
        onUpdateDriver={handleEditDriver}
        loading={editLoading}
        driver={selectedDriver}
      />
    </div>
  );
}

export default Customers;