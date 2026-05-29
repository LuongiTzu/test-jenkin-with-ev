import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import axios from "axios";

function Header({ onClickSidebar, onLogout }) {
  const [hoTen, setHoTen] = useState("");

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const storedName = localStorage.getItem("hoTen");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName) {
      setHoTen(storedName);
    } else if (storedEmail) {
      setHoTen(storedEmail);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/user-service/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("hoTen");
      sessionStorage.clear();

      if (onLogout) onLogout();
      window.location.href = "/login";
    }
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.left}>
        <FontAwesomeIcon icon={faBars} onClick={onClickSidebar} />
        <span className={styles.title}>Trang cá nhân</span>
      </div>

      <div className={styles.right}>
        {/* 👇 Hiển thị tên người dùng */}
        <p className={styles.userName}>{hoTen || "Người dùng"}</p>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;
