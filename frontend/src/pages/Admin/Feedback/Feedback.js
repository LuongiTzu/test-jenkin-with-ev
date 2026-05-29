import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faTrash,
  faRefresh,
  faStarHalfAlt,
  faUser,
  faMapMarkerAlt,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Feedback.module.css";

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState({});
  const [drivers, setDrivers] = useState({});
  const [stationStats, setStationStats] = useState([]);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch("/api/feedback-service/danhgia", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const feedbacksData = await response.json();
        setFeedbacks(feedbacksData);
        
        await Promise.all([
          fetchStationsInfo(feedbacksData),
          fetchDriversInfo(feedbacksData),
          fetchStationStats(feedbacksData)
        ]);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationsInfo = async (feedbacksData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const stationIds = [...new Set(feedbacksData.map(fb => fb.maTram).filter(id => id))];
      const stationsMap = {};

      for (const stationId of stationIds) {
        const response = await fetch(`/api/station-service/tram/${stationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const stationData = await response.json();
          stationsMap[stationId] = stationData;
        }
      }
      setStations(stationsMap);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin trạm:", error);
    }
  };

  const fetchDriversInfo = async (feedbacksData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const driversMap = {};

      for (const feedback of feedbacksData) {
        if (feedback.maLichDat) {
          const transactionResponse = await fetch(`/api/transaction-service/giaodichdoipin/${feedback.maLichDat}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            const maTaiXe = transactionData.maTaiXe;

            if (maTaiXe) {
              const driverResponse = await fetch(`/api/user-service/taixe/info/${maTaiXe}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (driverResponse.ok) {
                const driverData = await driverResponse.json();
                driversMap[feedback.maDanhGia] = driverData;
              }
            }
          }
        }
      }
      setDrivers(driversMap);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài xế:", error);
    }
  };

  const fetchStationStats = async (feedbacksData) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      let stats = [];
      
      const systemResponse = await fetch("/api/feedback-service/danhgia/trung-binh-sao", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (systemResponse.ok) {
        const systemAvg = await systemResponse.json();
        stats.push({
          id: 'system',
          name: 'Toàn hệ thống',
          avgRating: systemAvg,
          feedbackCount: feedbacksData.length,
          type: 'system'
        });
      }

      const stationFeedbackCount = {};
      const stationRatingSum = {};

      feedbacksData.forEach(feedback => {
        if (feedback.maTram) {
          if (!stationFeedbackCount[feedback.maTram]) {
            stationFeedbackCount[feedback.maTram] = 0;
            stationRatingSum[feedback.maTram] = 0;
          }
          stationFeedbackCount[feedback.maTram]++;
          stationRatingSum[feedback.maTram] += feedback.soSao;
        }
      });

      Object.keys(stationFeedbackCount).forEach(stationId => {
        const avgRating = stationRatingSum[stationId] / stationFeedbackCount[stationId];
        const stationName = stations[stationId] ? stations[stationId].tenTram : `Trạm ${stationId}`;
        
        stats.push({
          id: stationId,
          name: stationName,
          avgRating: avgRating,
          feedbackCount: stationFeedbackCount[stationId],
          type: 'station'
        });
      });

      stats.sort((a, b) => b.avgRating - a.avgRating);
      setStationStats(stats);

    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa feedback này?")) {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`/api/feedback-service/danhgia/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setFeedbacks(prev => prev.filter(fb => fb.maDanhGia !== id));
          fetchFeedbacks();
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      if (rating >= starNumber) {
        return <FontAwesomeIcon key={index} icon={faStar} className={styles.starActive} />;
      } else if (rating >= starNumber - 0.5) {
        return <FontAwesomeIcon key={index} icon={faStarHalfAlt} className={styles.starActive} />;
      } else {
        return <FontAwesomeIcon key={index} icon={faStar} className={styles.starInactive} />;
      }
    });
  };

  const renderPreciseStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {Array.from({ length: fullStars }, (_, index) => (
          <FontAwesomeIcon key={`full-${index}`} icon={faStar} className={styles.starActive} />
        ))}
        {hasHalfStar && (
          <FontAwesomeIcon key="half" icon={faStarHalfAlt} className={styles.starActive} />
        )}
        {Array.from({ length: emptyStars }, (_, index) => (
          <FontAwesomeIcon key={`empty-${index}`} icon={faStar} className={styles.starInactive} />
        ))}
      </>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getUserName = (feedbackId) => {
    const driverInfo = drivers[feedbackId];
    if (driverInfo && driverInfo.hoTen) {
      return driverInfo.hoTen;
    }
    return "Ẩn danh";
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Quản Lý Đánh Giá & Phản Hồi</h2>
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.lastUpdated}>
            Cập nhật: {new Date().toLocaleTimeString("vi-VN")}
          </span>
          <button onClick={fetchFeedbacks} className={styles.refreshButton}>
            <FontAwesomeIcon icon={faRefresh} /> Cập nhật
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {stationStats.map((stat, index) => (
          <div key={stat.id} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiTitle}>{stat.name}</p>
              <h2 className={styles.kpiValue}>{stat.avgRating.toFixed(1)}</h2>
              <p className={styles.kpiSub}>{stat.feedbackCount} đánh giá</p>
            </div>
            <div className={styles.kpiIcon}>
              {renderPreciseStars(stat.avgRating)}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Grid */}
      <div className={styles.feedbackSection}>
        <h3 className={styles.sectionTitle}>Tất Cả Đánh Giá</h3>
        
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải đánh giá...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className={styles.feedbackGrid}>
            {feedbacks.map((feedback) => (
              <div key={feedback.maDanhGia} className={styles.feedbackCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userMeta}>
                      <div className={styles.userName}>{getUserName(feedback.maDanhGia)}</div>
                      <div className={styles.date}>
                        {formatDate(feedback.ngayDanhGia)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.rating}>
                    {renderStars(feedback.soSao)}
                    <span className={styles.ratingText}></span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.feedbackText}>{feedback.noiDung}</p>
                  
                  {feedback.maTram && stations[feedback.maTram] && (
                    <div className={styles.stationInfo}>
                      <div className={styles.stationName}>{stations[feedback.maTram].tenTram}</div>
                      <div className={styles.stationAddress}>{stations[feedback.maTram].diaChi}</div>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteFeedback(feedback.maDanhGia)}
                    title="Xóa đánh giá"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;