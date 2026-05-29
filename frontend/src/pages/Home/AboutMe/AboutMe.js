import LinkButton from "../../../components/Shares/LinkButton/LinkButton";
import styles from "./AboutMe.module.css";
import vf3yellow from "../../../assets/vf3yellow.png";
import tramsac from "../../../assets/tramsac.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { verifyUserRole } from "../../../utils/verifyUserRole.js";

function AboutMe() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [maTaiXe, setMaTaiXe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const result = await verifyUserRole();
      
      if (result.success) {
        setIsLoggedIn(true);
        setUserRole(result.user.role);
        
        if (result.user.role === "TAIXE") {
          await layMaTaiXe(result.user.userId);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Lỗi khi verify user:", error);
      setIsLoggedIn(false);
    }
  };

  const layMaTaiXe = async (userId) => {
    const token = localStorage.getItem("token");
    
    if (!token || !userId) return;

    try {
      const res = await fetch(`/api/user-service/taixe/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const taiXeData = await res.json();
        setMaTaiXe(taiXeData.maTaiXe);
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã tài xế:", error);
    }
  };

  const handleFindStation = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng tính năng tìm trạm!");
      navigate("/login");
      return;
    }

    try {
      const result = await verifyUserRole();
      
      if (!result.success) {
        alert("Phiên đăng nhập không hợp lệ!");
        navigate("/login");
        return;
      }

      const realRole = result.user.role;
      
      if (realRole !== "TAIXE") {
        alert("Chức năng này chỉ dành cho tài xế!");
        return;
      }

      // Cho phép chuyển trang
      navigate("/dashboard/findstation");

    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.title}>
            Trạm Thay Pin EV Nhanh Chóng và Đáng Tin Cậy
          </span>
          <p className={styles.describe}>
            Bỏ qua thời gian chờ, thay pin ngay. Quay lại đường trong vòng chưa
            đầy 3 phút với công nghệ thay pin cách mạng của chúng tôi.
          </p>
          <div className={styles.action}>
            <button 
              className={`${styles.findStationBtn} ${styles.primary}`}
              onClick={handleFindStation}
            >
              Tìm trạm
            </button>
          </div>
          <div className={styles.statistical}>
            <div className={styles.box}>
              <span>10</span>
              <p>Trạm</p>
            </div>
            <div className={styles.box}>
              <span>10</span>
              <p>Tài xế</p>
            </div>
            <div className={styles.box}>
              <span>10</span>
              <p>Lần thay pin</p>
            </div>
          </div>
        </div>
        <div className={styles.imageHome}>
          <img src={tramsac} alt="Trạm sạc" className={styles.animation} />
          <img src={vf3yellow} alt="Ảnh trang chủ"  className={styles.imgprimary} />
        </div>
      </div>
    </div>
  );
}

export default AboutMe;