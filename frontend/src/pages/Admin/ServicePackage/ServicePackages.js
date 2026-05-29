import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faCalendarDays,
  faRepeat,
  faListCheck,
  faFilter,
  faPlus,
  faRefresh,
  faEdit,
  faTrash,
  faClock,
  faExchangeAlt,
  faBox,
  faUsers,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ServicePackages.module.css";
import AddPackageModal from "./AddPackageModal";
import EditPackageModal from "./EditPackageModal";

function ServicePackages() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageStats, setPackageStats] = useState({}); // Thống kê đăng ký theo gói
  const [packageData, setPackageData] = useState({
    topKpi: [
      {
        title: "Tổng Gói Dịch Vụ",
        value: "0",
        sub: "Đang tải...",
        color: "#16a34a",
        icon: faListCheck,
      },
      {
        title: "Gói Đang Hoạt Động",
        value: "0",
        sub: "Đang tải...",
        color: "#3b82f6",
        icon: faBox,
      },
      {
        title: "Thời Gian TB",
        value: "0 ngày",
        sub: "Trung bình các gói",
        color: "#a855f7",
        icon: faClock,
      },
      {
        title: "Số Lần Đổi TB",
        value: "0 lần",
        sub: "Trung bình các gói",
        color: "#f97316",
        icon: faExchangeAlt,
      },
    ],
    packagesList: [],
  });

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Load danh sách gói dịch vụ và thống kê khi component mount
  useEffect(() => {
    fetchPackagesList();
    fetchPackageStats();
  }, []);

  const fetchPackagesList = async () => {
    try {
      setListLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.error("Không tìm thấy token!");
        setListLoading(false);
        return;
      }

      console.log("Đang tải danh sách gói dịch vụ...");
      const response = await fetch("/api/subscription-service/goidichvu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const packagesList = await response.json();
        console.log("Dữ liệu gói dịch vụ từ API:", packagesList);

        // Transform data từ API sang format hiển thị
        const transformedList = packagesList.map((pkg) => ({
          id: pkg.maGoi,
          tenGoi: pkg.tenGoi || "Chưa có tên",
          moTa: pkg.moTa || "Chưa có mô tả",
          gia: pkg.gia || 0,
          thoiGianDung: pkg.thoiGianDung || 0,
          soLanDoi: pkg.soLanDoi || 0,
        }));

        // Cập nhật KPI dựa trên dữ liệu thực
        updateKpiData(transformedList);

        setPackageData((prev) => ({
          ...prev,
          packagesList: transformedList,
        }));

        console.log(`Đã tải ${transformedList.length} gói dịch vụ`);
      } else {
        console.error("Lỗi khi tải danh sách gói dịch vụ:", response.status);
        if (response.status === 403) {
          alert("Bạn không có quyền truy cập danh sách gói dịch vụ!");
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

  // Lấy thống kê đăng ký theo gói
  const fetchPackageStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch("/api/subscription-service/lichsudangkygoi/thongke/theogoicuoc", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const stats = await response.json();
        console.log("Thống kê đăng ký theo gói:", stats);
        setPackageStats(stats);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    }
  };

  // Cập nhật KPI dựa trên dữ liệu thực
  const updateKpiData = (packagesList) => {
    const totalPackages = packagesList.length;
    const activePackages = packagesList.length; // Tất cả đều active
    const avgDuration =
      packagesList.length > 0
        ? Math.round(
            packagesList.reduce((sum, pkg) => sum + pkg.thoiGianDung, 0) /
              packagesList.length
          )
        : 0;
    const avgExchanges =
      packagesList.length > 0
        ? Math.round(
            packagesList.reduce((sum, pkg) => sum + pkg.soLanDoi, 0) /
              packagesList.length
          )
        : 0;

    setPackageData((prev) => ({
      ...prev,
      topKpi: [
        {
          ...prev.topKpi[0],
          value: totalPackages.toString(),
          sub: `Tổng số gói dịch vụ`,
        },
        {
          ...prev.topKpi[1],
          value: activePackages.toString(),
          sub: `Đang hoạt động`,
        },
        {
          ...prev.topKpi[2],
          value: `${avgDuration} ngày`,
          sub: "Thời gian sử dụng trung bình",
        },
        {
          ...prev.topKpi[3],
          value: `${avgExchanges} lần`,
          sub: `Số lần đổi trung bình`,
        },
      ],
    }));
  };

  // Hàm xử lý thêm gói dịch vụ mới
  const handleAddPackage = async (newPackageData) => {
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu gửi đi:", newPackageData);

      const requestData = {
        tenGoi: newPackageData.tenGoi,
        moTa: newPackageData.moTa,
        gia: parseInt(newPackageData.gia),
        thoiGianDung: parseInt(newPackageData.thoiGianDung),
        soLanDoi: parseInt(newPackageData.soLanDoi),
      };

      console.log("Đang gửi request thêm gói dịch vụ...");
      const response = await fetch("/api/subscription-service/goidichvu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const addedPackage = await response.json();
        console.log("Gói dịch vụ mới:", addedPackage);

        const newPackageItem = {
          id: addedPackage.maGoi,
          tenGoi: addedPackage.tenGoi,
          moTa: addedPackage.moTa,
          gia: addedPackage.gia,
          thoiGianDung: addedPackage.thoiGianDung,
          soLanDoi: addedPackage.soLanDoi,
        };

        setPackageData((prev) => {
          const updatedList = [...prev.packagesList, newPackageItem];
          updateKpiData(updatedList);
          return {
            ...prev,
            packagesList: updatedList,
          };
        });

        // Refresh thống kê sau khi thêm
        fetchPackageStats();
        
        setShowAddModal(false);
        alert("Thêm gói dịch vụ thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);

        let errorMessage = "Lỗi khi thêm gói dịch vụ";

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thêm gói dịch vụ:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý sửa gói dịch vụ
  const handleEditPackage = async (id, packageData) => {
    setEditLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("Dữ liệu cập nhật:", packageData);

      const requestData = {
        tenGoi: packageData.tenGoi,
        moTa: packageData.moTa,
        gia: parseInt(packageData.gia),
        thoiGianDung: parseInt(packageData.thoiGianDung),
        soLanDoi: parseInt(packageData.soLanDoi),
      };

      console.log("Đang gửi request cập nhật gói dịch vụ...");
      const response = await fetch(
        `/api/subscription-service/goidichvu/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedPackage = await response.json();
        console.log("Gói dịch vụ đã cập nhật:", updatedPackage);

        setPackageData((prev) => {
          const updatedList = prev.packagesList.map((pkg) =>
            pkg.id === id
              ? {
                  ...pkg,
                  tenGoi: updatedPackage.tenGoi,
                  moTa: updatedPackage.moTa,
                  gia: updatedPackage.gia,
                  thoiGianDung: updatedPackage.thoiGianDung,
                  soLanDoi: updatedPackage.soLanDoi,
                }
              : pkg
          );
          updateKpiData(updatedList);
          return {
            ...prev,
            packagesList: updatedList,
          };
        });

        // Refresh thống kê sau khi sửa
        fetchPackageStats();
        
        setShowEditModal(false);
        setSelectedPackage(null);
        alert("Cập nhật thông tin gói dịch vụ thành công!");
      } else {
        const errorText = await response.text();
        console.error("Chi tiết lỗi từ server:", errorText);

        let errorMessage = "Lỗi khi cập nhật gói dịch vụ";

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        alert("Lỗi: " + errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật gói dịch vụ:", error);
      alert("Lỗi kết nối server! Vui lòng thử lại.");
    } finally {
      setEditLoading(false);
    }
  };

  // Hàm xử lý xóa gói dịch vụ
  const handleDeletePackage = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói dịch vụ này?")) {
      try {
        const token = getAuthToken();
        if (!token) {
          alert("Vui lòng đăng nhập lại!");
          return;
        }

        console.log("Đang xóa gói dịch vụ ID:", id);

        const response = await fetch(
          `/api/subscription-service/goidichvu/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (response.ok) {
          const result = await response.text();
          console.log("Kết quả xóa:", result);

          const updatedList = packageData.packagesList.filter(
            (pkg) => pkg.id !== id
          );
          setPackageData((prev) => ({
            ...prev,
            packagesList: updatedList,
          }));

          // Cập nhật thống kê sau khi xóa
          fetchPackageStats();
          updateKpiData(updatedList);
          alert("Xóa gói dịch vụ thành công!");
        } else {
          const errorText = await response.text();
          console.error("Lỗi chi tiết:", errorText);

          let errorMessage = "Không thể xóa gói dịch vụ";
          if (errorText) {
            // Hiển thị thông báo lỗi từ server
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
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
  const handleOpenEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowEditModal(true);
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy thống kê cho một gói cụ thể
  const getPackageStats = (packageId) => {
    const stats = packageStats[packageId];
    if (!stats) {
      return { conHan: 0, hetHan: 0, total: 0 };
    }
    
    return {
      conHan: stats.CON_HAN || 0,
      hetHan: stats.HET_HAN || 0,
      total: (stats.CON_HAN || 0) + (stats.HET_HAN || 0)
    };
  };

  const refreshPackagesList = () => {
    fetchPackagesList();
    fetchPackageStats();
  };

  return (
    <div className={styles.wrapper}>
      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {packageData.topKpi.map((item, index) => (
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
        <h2 className={styles.title}>Quản Lý Gói Dịch Vụ</h2>
        <div className={styles.actions}>
          <button className={styles.filterBtn}>
            <FontAwesomeIcon icon={faFilter} /> Lọc
          </button>
          <button
            className={styles.refreshBtn}
            onClick={refreshPackagesList}
            title="Làm mới danh sách"
            disabled={listLoading}
          >
            <FontAwesomeIcon
              icon={faRefresh}
              className={listLoading ? styles.spin : ""}
            />
          </button>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm Gói Dịch Vụ
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className={styles.packagesGridWrapper}>
        {listLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách gói dịch vụ...</p>
          </div>
        ) : packageData.packagesList.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <p>Chưa có gói dịch vụ nào trong hệ thống</p>
            <button
              className={styles.addBtn}
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Thêm gói dịch vụ đầu tiên
            </button>
          </div>
        ) : (
          <div className={styles.packagesGrid}>
            {packageData.packagesList.map((pkg) => {
              const stats = getPackageStats(pkg.id);
              
              return (
                <div key={pkg.id} className={styles.packageCard}>
                  <div className={styles.cardHeader}>
                    
                    <div className={styles.packageTitle}>
                      <div className={styles.packageIcon}>
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                      <h3>{pkg.tenGoi}</h3>
                      
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.packageDescription}>{pkg.moTa}</p>

                    <div className={styles.features}>
                      <div className={styles.feature}>
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className={styles.featureIcon}
                        />
                        <span className={styles.featureLabel}>Thời gian:</span>
                        <span className={styles.featureValue}>
                          {pkg.thoiGianDung} ngày
                        </span>
                      </div>
                      <div className={styles.feature}>
                        <FontAwesomeIcon
                          icon={faExchangeAlt}
                          className={styles.featureIcon}
                        />
                        <span className={styles.featureLabel}>Số lần đổi:</span>
                        <span className={styles.featureValue}>
                          {pkg.soLanDoi} lần
                        </span>
                      </div>
                      <div className={styles.feature}>
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className={styles.featureIcon}
                        />
                        <span className={styles.featureLabel}>Giá:</span>
                        <span className={styles.featureValue}>
                          {formatCurrency(pkg.gia)}
                        </span>
                      </div>
                    </div>

                    {/* Thống kê đăng ký */}
                    <div className={styles.usageStats}>
                      <div className={styles.statItem}>
                        <FontAwesomeIcon 
                          icon={faUsers} 
                          className={styles.statIcon} 
                        />
                        <span className={styles.statLabel}>Tổng đăng ký:</span>
                        <span className={styles.statValue}>{stats.total}</span>
                      </div>
                      <div className={styles.statItem}>
                        <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className={`${styles.statIcon} ${styles.activeStat}`} 
                        />
                        <span className={styles.statLabel}>Còn hạn:</span>
                        <span className={styles.statValue}>{stats.conHan}</span>
                      </div>
                      <div className={styles.statItem}>
                        <FontAwesomeIcon 
                          icon={faTimesCircle} 
                          className={`${styles.statIcon} ${styles.expiredStat}`} 
                        />
                        <span className={styles.statLabel}>Hết hạn:</span>
                        <span className={styles.statValue}>{stats.hetHan}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenEditModal(pkg)}
                      title="Chỉnh sửa gói dịch vụ"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      <span>Sửa</span>
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeletePackage(pkg.id)}
                      title="Xóa gói dịch vụ"
                      disabled={stats.conHan > 0} // Vô hiệu hóa nếu có người dùng còn hạn
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Xóa</span>
                    </button>
                  </div>

                  {/* Hiển thị cảnh báo nếu có người dùng còn hạn */}
                  {/* {stats.conHan > 0 && (
                    <div className={styles.usageWarning}>
                      ⚠️ Đang có {stats.conHan} người sử dụng gói này
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Thêm Gói Dịch Vụ */}
      <AddPackageModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddPackage={handleAddPackage}
        loading={loading}
      />

      {/* Modal Sửa Gói Dịch Vụ */}
      <EditPackageModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPackage(null);
        }}
        onUpdatePackage={handleEditPackage}
        loading={editLoading}
        package={selectedPackage}
      />
    </div>
  );
}

export default ServicePackages;