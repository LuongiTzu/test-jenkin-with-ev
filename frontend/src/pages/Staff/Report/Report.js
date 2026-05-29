import React from "react";
import styles from "./Report.module.css";
import StatsHeader from "../components/StatsHeader/StatsHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faTriangleExclamation,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

// ===== MOCK DATA =====
// Sau này thay bằng API từ Spring Boot
const summary = {
  completed: 23,
  revenue: 575,
  avgSwapTimeMin: 2.5, // phút
  rating: 4.9,
};

const stationAlerts = [
  {
    id: 1,
    type: "warning", // warning | danger
    title: "Cảnh Báo Pin Năng Suất",
    description: "3 pin dưới 20% sức khỏe",
  },
  {
    id: 2,
    type: "danger",
    title: "Bảo Trì Cần Thiết",
    description: "Slot B1 cần kiểm tra",
  },
];

export default function Report() {
  const handleExport = () => {
    // Placeholder: sau này gọi API export file
    console.log("Export report clicked");
  };

  return (
    <div className={styles.container}>
      {/* Header xuống thấp hơn đường kẻ đầu trang */}
      <div className={styles.headerWrap}>
        <StatsHeader title="Báo Cáo" />
      </div>

      <div className={styles.grid}>
        {/* ====== TÓM TẮT CA LÀM ====== */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Tóm Tắt Ca Làm</h3>
            <p className={styles.subTitle}>Hiệu suất của bạn hôm nay</p>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span>Thay Pin Hoàn Thành:</span>
              <span className={styles.value}>{summary.completed}</span>
            </div>
            <div className={styles.row}>
              <span>Doanh Thu Được Tạo:</span>
              <span className={styles.value}>${summary.revenue}</span>
            </div>
            <div className={styles.row}>
              <span>Thời Gian Thay Pin Trung Bình:</span>
              <span className={styles.value}>{summary.avgSwapTimeMin} min</span>
            </div>
            <div className={styles.row}>
              <span>Đánh Giá Khách Hàng:</span>
              <span className={styles.value}>{summary.rating}/5</span>
            </div>
          </div>
            <div className={styles.exportWrapper}>
                <button className={styles.exportBtn} onClick={handleExport}>
                    <FontAwesomeIcon icon={faDownload} className={styles.btnIcon} />
                    Xuất Báo Cáo
                </button>
            </div>
        </section>

        {/* ====== CẢNH BÁO TRẠM ====== */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Cảnh Báo Trạm</h3>
            <p className={styles.subTitle}>Các vấn đề cần chú ý</p>
          </div>

          <div className={styles.alertList}>
            {stationAlerts.map((a) => (
              <div
                key={a.id}
                className={`${styles.alert} ${
                  a.type === "warning" ? styles.alertWarning : styles.alertDanger
                }`}
              >
                <div className={styles.alertIcon}>
                  <FontAwesomeIcon
                    icon={a.type === "warning" ? faTriangleExclamation : faCircleExclamation}
                  />
                </div>
                <div className={styles.alertBody}>
                  <div className={styles.alertTitle}>{a.title}</div>
                  <div className={styles.alertDesc}>{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
