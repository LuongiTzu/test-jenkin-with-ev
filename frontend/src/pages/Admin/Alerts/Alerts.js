import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBatteryFull,
  faLocationDot,
  faUsers,
  faGear,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Alerts.module.css";
import axios from "axios";
import AlertDetailModal from "./modals/AlertDetailModal/AlertDetailModal";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to format time relative (simple version)
  const formatTime = (dateString) => {
    if (!dateString) return "";

    // Convert UTC -> local Vietnam time
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // +7h

    const now = new Date();
    const diffMs = now - localDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return `${Math.floor(diffHours / 24)} ngày trước`;
  };


  // Map backend status to alert type and icon
  const mapStatusToType = (status) => {
    switch (status) {
      case "MOI":
        return { type: "critical", icon: faTimesCircle };
      case "DANG_XU_LY":
        return { type: "warning", icon: faExclamationTriangle };
      case "DA_XU_LY":
        return { type: "info", icon: faCheckCircle };
      default:
        return { type: "info", icon: faCheckCircle };
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get("/api/feedback-service/baocao", { headers });

      // Transform data
      const newAlerts = res.data.map((item) => {
        const { type, icon } = mapStatusToType(item.trangThaiXuLy);
        return {
          id: item.maBaoCao,
          type: type,
          icon: icon,
          title: item.tieuDe,
          content: item.noiDung,
          rawStatus: item.trangThaiXuLy,
          time: formatTime(item.ngayTao),
          source: item.maTaiXe ? `Tài xế #${item.maTaiXe}` : "Hệ thống",
          originalData: item, // Store full original data for updates
        };
      });

      // Sort by newest first (assuming higher ID is newer or sort by time if needed)
      // Here we rely on the backend order or reverse it if needed. 
      // Let's reverse to show newest at top if backend returns chronological.
      setAlerts(newAlerts.reverse());
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Find the alert to get original data
      const alertToUpdate = alerts.find(a => a.id === id);
      if (!alertToUpdate) return;

      const payload = {
        ...alertToUpdate.originalData,
        trangThaiXuLy: newStatus
      };

      await axios.put(`/api/feedback-service/baocao/${id}`,
        payload,
        { headers }
      );

      // Update local state
      setAlerts(alerts.map(alert => {
        if (alert.id === id) {
          const { type, icon } = mapStatusToType(newStatus);
          return {
            ...alert,
            rawStatus: newStatus,
            type,
            icon,
            originalData: { ...alert.originalData, trangThaiXuLy: newStatus }
          };
        }
        return alert;
      }));

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const kpiData = [
    {
      title: "Tổng Doanh Thu",
      value: "$267.000",
      sub: "+12.5%",
      color: "#16a34a",
      icon: faDollarSign,
    },
    {
      title: "Tổng Lần Thay Pin",
      value: "12.847",
      sub: "+8.3%",
      color: "#3b82f6",
      icon: faBatteryFull,
    },
    {
      title: "Trạm Hoạt Động",
      value: "24",
      sub: "Tất cả trực tuyến",
      color: "#a855f7",
      icon: faLocationDot,
    },
    {
      title: "Khách Hàng",
      value: "8.547",
      sub: "+156 mới",
      color: "#f97316",
      icon: faUsers,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* 🔹 KPI Header */}
      <div className={styles.kpiGrid}>
        {kpiData.map((item, i) => (
          <div key={i} className={styles.kpiCard}>
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

      {/* 🔹 Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Cảnh Báo & Thông Báo Hệ Thống</h2>
        <div className={styles.actions}>
          <button className={styles.markAll}>Đánh dấu tất cả đã đọc</button>
          <button className={styles.settings}>
            <FontAwesomeIcon icon={faGear} /> Cài đặt cảnh báo
          </button>
        </div>
      </div>

      {/* 🔹 Danh sách cảnh báo */}
      <div className={styles.alertList}>
        {alerts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Không có thông báo nào.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertCard} ${styles[alert.type]}`}
            >
              <div className={styles.alertMain}>
                <FontAwesomeIcon
                  icon={alert.icon}
                  className={`${styles.alertIcon} ${styles[alert.type + "Icon"]}`}
                />
                <div className={styles.alertInfo}>
                  <p className={styles.alertTitle}>{alert.title}</p>
                  <span className={styles.alertMeta}>
                    {alert.time} • {alert.source}
                  </span>
                </div>
              </div>
              <div className={styles.alertActions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => handleViewDetails(alert)}
                >
                  Xem chi tiết
                </button>
                <button
                  className={styles.dismissBtn}
                  onClick={() => handleDismiss(alert.id)}
                >
                  Ẩn thông báo
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alert={selectedAlert}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default Alerts;
