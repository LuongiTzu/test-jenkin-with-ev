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
  faExchangeAlt,
  faTimes,
  faHashtag
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Staff.module.css";
import AddStaffModal from "./AddStaffModal";
import EditStaffModal from "./EditStaffModal";
import StationSelector from "./StationSelector";

function Staff() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeStationModal, setShowChangeStationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [changeStationLoading, setChangeStationLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [staffData, setStaffData] = useState({
    topKpi: [
      {
        title: "Tổng Nhân Viên",
        value: "0",
        sub: "Đang tải...",
        color: "#16a34a",
        icon: faUsers,
      },
      {
        title: "Nhân Viên Active",
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
        title: "Hiệu Suất TB",
        value: "0%",
        sub: "Đang tải...",
        color: "#f97316",
        icon: faDollarSign,
      },
    ],
    staffList: [],
  });

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Lấy danh sách trạm
  const fetchStations = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("Không tìm thấy token!");
        return;
      }

      console.log("Đang tải danh sách trạm...");
      const response = await fetch('/api/station-service/tram', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stationData = await response.json();
        console.log("Dữ liệu trạm từ API:", stationData);
        setStations(stationData);
        return stationData; // Trả về dữ liệu để sử dụng
      } else {
        console.error("Lỗi khi tải danh sách trạm:", response.status);
        return [];
      }
    } catch (err) {
      console.error("Lỗi tải danh sách trạm:", err);
      return [];
    }
  };

  // Hàm helper để lấy thông tin trạm từ mã trạm
  const getStationInfo = (maTram, stationsList = stations) => {
    if (!maTram) return { 
      name: "Chưa phân công", 
      fullInfo: "Chưa phân công",
      address: "Không xác định",
      soDT: "Không có"
    };
    
    const station = stationsList.find(s => s.maTram === maTram);
    console.log("Tìm trạm với mã:", maTram, "Kết quả:", station);
    
    if (station) {
      return {
        name: station.tenTram,
        fullInfo: `${station.tenTram}`,
        address: station.diaChi,
        soDT: station.soDT,
        trangThai: station.trangThai
      };
    }
    return {
      name: `Trạm ${maTram}`,
      fullInfo: `Trạm ${maTram}`,
      address: "Không xác định",
      soDT: "Không có",
      trangThai: "Không xác định"
    };
  };

  // Load danh sách nhân viên và trạm khi component mount
  useEffect(() => {
    const loadData = async () => {
      const stationsData = await fetchStations();
      await fetchStaffList(stationsData);
    };
    loadData();
  }, []);

  const fetchStaffList = async (stationsData = null) => {
    try {
      setListLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("Không tìm thấy token!");
        setListLoading(false);
        return;
      }

      console.log("Đang tải danh sách nhân viên...");
      const response = await fetch('/api/user-service/nhanvien', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const nhanVienList = await response.json();
        console.log("Dữ liệu nhân viên từ API:", nhanVienList);
        
        // Sử dụng stationsData nếu có, hoặc lấy từ state
        const stationsToUse = stationsData || stations;
        
        // Transform data từ API sang format hiển thị
        const transformedList = nhanVienList.map(nv => {
          const stationInfo = getStationInfo(nv.maTram, stationsToUse);
          console.log(`Nhân viên ${nv.maNhanVien} - Mã trạm: ${nv.maTram}`, stationInfo);
          
          return {
            id: nv.maNhanVien,
            maNhanVien: nv.maNhanVien, // Thêm mã nhân viên
            name: nv.nguoiDung?.hoTen || "Chưa có tên",
            role: getRoleFromData(nv),
            station: stationInfo.fullInfo, // Chỉ hiển thị tên trạm
            stationName: stationInfo.name,
            stationAddress: stationInfo.address,
            stationSoDT: stationInfo.soDT,
            stationTrangThai: stationInfo.trangThai,
            initials: getInitials(nv.nguoiDung?.hoTen || "NV"),
            email: nv.nguoiDung?.email || "Chưa có email",
            soDienThoai: nv.nguoiDung?.soDienThoai || "Chưa có SĐT",
            bangCap: nv.bangCap || "Chưa có bằng cấp",
            kinhNghiem: nv.kinhNghiem || "Chưa có kinh nghiệm",
            ngaySinh: nv.nguoiDung?.ngaySinh || null,
            gioiTinh: nv.nguoiDung?.gioiTinh || "Chưa xác định",
            maTram: nv.maTram
          };
        });

        // Cập nhật KPI dựa trên dữ liệu thực
        updateKpiData(transformedList);

        setStaffData(prev => ({
          ...prev,
          staffList: transformedList
        }));
        
        console.log(`Đã tải ${transformedList.length} nhân viên`);
      } else {
        console.error("Lỗi khi tải danh sách nhân viên:", response.status);
        if (response.status === 403) {
          alert("Bạn không có quyền truy cập danh sách nhân viên!");
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
  const updateKpiData = (staffList) => {
    const totalStaff = staffList.length;
    const activeStaff = staffList.length;

    setStaffData(prev => ({
      ...prev,
      topKpi: [
        {
          ...prev.topKpi[0],
          value: totalStaff.toString(),
          sub: `Tổng số nhân viên`
        },
        {
          ...prev.topKpi[1],
          value: activeStaff.toString(),
          sub: `Đang hoạt động`
        },
        {
          ...prev.topKpi[2],
          value: "24",
          sub: "Tất Cả Trực Tuyến"
        },
        {
          ...prev.topKpi[3],
          value: `${totalStaff > 0 ? Math.round(activeStaff/totalStaff * 100) : 0}%`,
          sub: `Tỷ lệ hoạt động`
        },
      ]
    }));
  };

  // Hàm xử lý thêm nhân viên mới
  const handleAddStaff = async (newStaffData) => {
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu gửi đi:", newStaffData);

      const requestData = {
        hoTen: newStaffData.hoTen,
        email: newStaffData.email,
        soDienThoai: newStaffData.soDienThoai,
        gioiTinh: newStaffData.gioiTinh || "NAM",
        matKhau: newStaffData.matKhau,
        ngaySinh: newStaffData.ngaySinh || null,
        bangCap: newStaffData.bangCap || "",
        kinhNghiem: newStaffData.kinhNghiem || "",
        maTram: newStaffData.maTram
      };

      console.log("Đang gửi request thêm nhân viên...");
      const response = await fetch('/api/user-service/nhanvien', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const addedStaff = await response.json();
        console.log("Nhân viên mới:", addedStaff);
        
        const stationInfo = getStationInfo(addedStaff.maTram);
        const newStaffItem = {
          id: addedStaff.maNhanVien,
          maNhanVien: addedStaff.maNhanVien, // Thêm mã nhân viên
          name: addedStaff.nguoiDung?.hoTen || addedStaff.hoTen,
          role: "Nhân viên",
          station: stationInfo.fullInfo,
          stationName: stationInfo.name,
          stationAddress: stationInfo.address,
          stationSoDT: stationInfo.soDT,
          stationTrangThai: stationInfo.trangThai,
          initials: getInitials(addedStaff.nguoiDung?.hoTen || addedStaff.hoTen),
          email: addedStaff.nguoiDung?.email || addedStaff.email,
          soDienThoai: addedStaff.nguoiDung?.soDienThoai || addedStaff.soDienThoai,
          bangCap: addedStaff.bangCap,
          kinhNghiem: addedStaff.kinhNghiem,
          ngaySinh: addedStaff.nguoiDung?.ngaySinh || addedStaff.ngaySinh,
          gioiTinh: addedStaff.nguoiDung?.gioiTinh || addedStaff.gioiTinh,
          maTram: addedStaff.maTram
        };

        setStaffData(prev => {
          const updatedList = [...prev.staffList, newStaffItem];
          updateKpiData(updatedList);
          return {
            ...prev,
            staffList: updatedList
          };
        });

        setShowAddModal(false);
        alert("Thêm nhân viên thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);
        
        let errorMessage = "Lỗi khi thêm nhân viên";
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý sửa nhân viên - GIỮ NGUYÊN MÃ TRẠM
  const handleEditStaff = async (id, staffData) => {
    setEditLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu cập nhật:", staffData);

      // Tạo request data với mã trạm từ selectedStaff
      const requestData = {
        hoTen: staffData.hoTen,
        email: staffData.email,
        soDienThoai: staffData.soDienThoai,
        gioiTinh: staffData.gioiTinh,
        ngaySinh: staffData.ngaySinh || null,
        bangCap: staffData.bangCap || "",
        kinhNghiem: staffData.kinhNghiem || "",
        maTram: selectedStaff?.maTram // QUAN TRỌNG: Giữ nguyên mã trạm cũ
      };

      // Nếu có mật khẩu mới, thêm vào request
      if (staffData.matKhau) {
        requestData.matKhau = staffData.matKhau;
      }

      console.log("Đang gửi request cập nhật nhân viên...");
      const response = await fetch(`/api/user-service/nhanvien/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedStaff = await response.json();
        console.log("Nhân viên đã cập nhật:", updatedStaff);
        
        const stationInfo = getStationInfo(updatedStaff.maTram);
        
        // Cập nhật danh sách
        setStaffData(prev => {
          const updatedList = prev.staffList.map(staff => 
            staff.id === id ? {
              ...staff,
              name: updatedStaff.nguoiDung?.hoTen || updatedStaff.hoTen,
              email: updatedStaff.nguoiDung?.email || updatedStaff.email,
              soDienThoai: updatedStaff.nguoiDung?.soDienThoai || updatedStaff.soDienThoai,
              bangCap: updatedStaff.bangCap,
              kinhNghiem: updatedStaff.kinhNghiem,
              ngaySinh: updatedStaff.nguoiDung?.ngaySinh || updatedStaff.ngaySinh,
              gioiTinh: updatedStaff.nguoiDung?.gioiTinh || updatedStaff.gioiTinh,
              maTram: updatedStaff.maTram,
              station: stationInfo.fullInfo,
              stationName: stationInfo.name,
              stationAddress: stationInfo.address,
              stationSoDT: stationInfo.soDT,
              stationTrangThai: stationInfo.trangThai,
              initials: getInitials(updatedStaff.nguoiDung?.hoTen || updatedStaff.hoTen)
            } : staff
          );
          return {
            ...prev,
            staffList: updatedList
          };
        });

        setShowEditModal(false);
        setSelectedStaff(null);
        alert("Cập nhật thông tin nhân viên thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);
        
        let errorMessage = "Lỗi khi cập nhật nhân viên";
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          alert("Vui lòng đăng nhập lại!");
          return;
        }

        const response = await fetch(`/api/user-service/nhanvien/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const updatedList = staffData.staffList.filter(staff => staff.id !== id);
          setStaffData(prev => ({
            ...prev,
            staffList: updatedList
          }));

          updateKpiData(updatedList);
          alert("Xóa nhân viên thành công!");
        } else {
          const errorText = await response.text();
          alert("Lỗi khi xóa nhân viên: " + errorText);
        }
      } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        alert("Lỗi kết nối server!");
      }
    }
  };

  // Hàm mở modal sửa
  const handleOpenEditModal = (staff) => {
    setSelectedStaff(staff);
    setShowEditModal(true);
  };

  // Hàm mở modal thay đổi trạm
  const handleOpenChangeStationModal = (staff) => {
    setSelectedStaff(staff);
    // Tìm thông tin trạm hiện tại từ danh sách stations
    const currentStation = stations.find(s => s.maTram === staff.maTram);
    setSelectedStation(currentStation || null);
    setShowChangeStationModal(true);
  };

  // Hàm xử lý thay đổi trạm
  const handleChangeStation = async () => {
    if (!selectedStaff || !selectedStation) return;
    
    setChangeStationLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const requestData = {
        hoTen: selectedStaff.name,
        email: selectedStaff.email,
        soDienThoai: selectedStaff.soDienThoai,
        gioiTinh: selectedStaff.gioiTinh,
        ngaySinh: selectedStaff.ngaySinh || null,
        bangCap: selectedStaff.bangCap || "",
        kinhNghiem: selectedStaff.kinhNghiem || "",
        maTram: selectedStation.maTram
      };

      console.log("Đang cập nhật trạm cho nhân viên...");
      const response = await fetch(`/api/user-service/nhanvien/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const updatedStaff = await response.json();
        console.log("Nhân viên đã cập nhật trạm:", updatedStaff);
        
        const stationInfo = getStationInfo(updatedStaff.maTram);
        
        setStaffData(prev => {
          const updatedList = prev.staffList.map(staff => 
            staff.id === selectedStaff.id ? {
              ...staff,
              maTram: updatedStaff.maTram,
              station: stationInfo.fullInfo,
              stationName: stationInfo.name,
              stationAddress: stationInfo.address,
              stationSoDT: stationInfo.soDT,
              stationTrangThai: stationInfo.trangThai
            } : staff
          );
          return {
            ...prev,
            staffList: updatedList
          };
        });

        setShowChangeStationModal(false);
        setSelectedStaff(null);
        setSelectedStation(null);
        alert("Thay đổi trạm thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);
        
        let errorMessage = "Lỗi khi thay đổi trạm";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạm:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setChangeStationLoading(false);
    }
  };

  // Hàm xử lý chọn trạm trong modal
  const handleStationChange = (station) => {
    setSelectedStation(station);
  };

  // Hàm helper để xác định các giá trị từ dữ liệu API
  const getRoleFromData = (nv) => {
    const role = nv.nguoiDung?.vaiTro;
    switch(role) {
      case "NHANVIEN": return "Nhân viên";
      case "QUANLY": return "Quản lý";
      case "ADMIN": return "Quản trị viên";
      default: return "Nhân viên";
    }
  };

  const getInitials = (name) => {
    if (!name || name === "Chưa có tên") return "NV";
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const refreshStaffList = () => {
    fetchStations().then(stationsData => {
      fetchStaffList(stationsData);
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {staffData.topKpi.map((item, index) => (
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
        <h2 className={styles.title}>Quản Lý Nhân Viên</h2>
        <div className={styles.headerActions}>
          <button className={styles.filterBtn}>
            <FontAwesomeIcon icon={faFilter} /> Lọc
          </button>
          <button 
            className={styles.refreshBtn}
            onClick={refreshStaffList}
            title="Làm mới danh sách"
            disabled={listLoading}
          >
            <FontAwesomeIcon icon={faRefresh} className={listLoading ? styles.spin : ''} />
          </button>
          <button 
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm Nhân Viên
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className={styles.staffList}>
        {listLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách nhân viên...</p>
          </div>
        ) : staffData.staffList.length === 0 ? (
          <div className={styles.emptyState}>
            Không có nhân viên nào
          </div>
        ) : (
          staffData.staffList.map((staff) => (
            <div key={staff.id} className={styles.staffCard}>
              <div className={styles.staffLeft}>
                <div className={styles.staffHeader}>
                  <div className={styles.staffId}>
        
                    <span className={styles.idText}>{staff.maNhanVien}</span>
                  </div>
                </div>
                <div className={styles.staffInfo}>
                    <h4 className={styles.staffName}>{staff.name}</h4>
                  <p className={styles.station}>{staff.station}</p>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
                      <span>{staff.soDienThoai}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FontAwesomeIcon icon={faLocationDot} className={styles.contactIcon} />
                      <span>{staff.stationAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.staffRight}>
                <div className={styles.actionButtons}>
                  <button 
                    className={`${styles.iconBtn} ${styles.changeStationBtn}`}
                    title="Thay đổi trạm làm việc"
                    onClick={() => handleOpenChangeStationModal(staff)}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                  </button>
                  <button 
                    className={styles.iconBtn}
                    title="Chỉnh sửa thông tin"
                    onClick={() => handleOpenEditModal(staff)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteStaff(staff.id)}
                    title="Xóa nhân viên"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Thêm Nhân Viên */}
      <AddStaffModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStaff={handleAddStaff}
        loading={loading}
      />

      {/* Modal Sửa Nhân Viên */}
      <EditStaffModal 
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStaff(null);
        }}
        onUpdateStaff={handleEditStaff}
        loading={editLoading}
        staff={selectedStaff}
      />

      {/* Modal Thay đổi Trạm */}
      {showChangeStationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thay Đổi Trạm Làm Việc</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowChangeStationModal(false);
                  setSelectedStaff(null);
                  setSelectedStation(null);
                }}
                disabled={changeStationLoading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalForm}>
              <div className={styles.staffInfoSection}>
                <h4>Nhân viên: {selectedStaff?.name}</h4>
                <p>Mã nhân viên: {selectedStaff?.maNhanVien}</p>
                <p>Trạm hiện tại: {selectedStaff?.station}</p>
              </div>

              <div className={styles.stationSection}>
                <StationSelector
                  selectedStation={selectedStation}
                  onStationChange={handleStationChange}
                  disabled={changeStationLoading}
                  placeholder="Chọn trạm mới cho nhân viên"
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowChangeStationModal(false);
                    setSelectedStaff(null);
                    setSelectedStation(null);
                  }}
                  disabled={changeStationLoading}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className={styles.saveBtn}
                  onClick={handleChangeStation}
                  disabled={changeStationLoading || !selectedStation}
                >
                  {changeStationLoading ? "Đang cập nhật..." : "Thay Đổi Trạm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;