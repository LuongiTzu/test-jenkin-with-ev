import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfAlt,
  faUser,
  faMapMarkerAlt,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Feedbacks.module.css";

function Feedbacks() {
  const [listFeedback, setListFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState({});
  const [drivers, setDrivers] = useState({});

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch('/api/feedback-service/danhgia', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setListFeedback(data);
        
        await Promise.all([
          fetchStationsInfo(data),
          fetchDriversInfo(data)
        ]);
      } else {
        console.error('Lỗi khi lấy danh sách feedback');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationsInfo = async (feedbacksData) => {
    try {
      const token = getAuthToken();
      const stationIds = [...new Set(feedbacksData.map(fb => fb.maTram).filter(id => id))];
      const stationsMap = {};

      for (const stationId of stationIds) {
        const response = await fetch(`/api/station-service/tram/${stationId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
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
      const driversMap = {};

      for (const feedback of feedbacksData) {
        if (feedback.maLichDat) {
          const transactionResponse = await fetch(`/api/transaction-service/giaodichdoipin/${feedback.maLichDat}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            const maTaiXe = transactionData.maTaiXe;

            if (maTaiXe) {
              const driverResponse = await fetch(`/api/user-service/taixe/info/${maTaiXe}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      if (rating >= starNumber) {
        return <FontAwesomeIcon key={index} icon={faStar} className={styles.starFilled} />;
      } else if (rating >= starNumber - 0.5) {
        return <FontAwesomeIcon key={index} icon={faStarHalfAlt} className={styles.starFilled} />;
      } else {
        return <FontAwesomeIcon key={index} icon={faStar} className={styles.starEmpty} />;
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getUserName = (feedbackId) => {
    const driverInfo = drivers[feedbackId];
    if (driverInfo && driverInfo.hoTen) {
      return driverInfo.hoTen;
    }
    return "Tài xế EV";
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Đang tải đánh giá...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Khách Hàng Nói Gì Về Chúng Tôi</span>
          <p>Tham gia cùng hàng nghìn tài xế EV hài lòng</p>
        </div>
        
        {listFeedback.length === 0 ? (
          <div className={styles.noFeedback}>
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </div>
        ) : (
          <div className={styles.swiperWrapper}>
            <Swiper
              modules={[Pagination]}
              spaceBetween={24}
              slidesPerView={3}
              pagination={{ clickable: true }}
              loop={listFeedback.length > 3}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className={styles.myswiper}
            >
              {listFeedback.map((item) => (
                <SwiperSlide key={item.maDanhGia} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.userInfo}>
                      <span className={styles.name}>{getUserName(item.maDanhGia)}</span>
                      <div className={styles.rating}>
                        {renderStars(item.soSao)}
                        <span className={styles.ratingText}></span>
                      </div>
                    </div>
                    <div className={styles.date}>
                      {formatDate(item.ngayDanhGia)}
                    </div>
                  </div>
                  
                  <p className={styles.contentFeedback}>{item.noiDung}</p>
                  
                  {item.maTram && stations[item.maTram] && (
                    <div className={styles.stationInfo}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{stations[item.maTram].tenTram} - {stations[item.maTram].diaChi}</span>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedbacks;