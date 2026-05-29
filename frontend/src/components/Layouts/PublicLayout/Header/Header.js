import { Link } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import styles from "./Header.module.css";
import logo from "../../../../assets/logo/logo.svg";
import LinkButton from "../../../Shares/LinkButton/LinkButton";
import { useEffect, useState } from "react";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    checkAuthStatus();
    
    // Kiểm tra mỗi 1 giây để bắt kịp thay đổi
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const hoTen = localStorage.getItem("hoTen");
    
    if (token && userRole) {
      setIsLoggedIn(true);
      setUserInfo({
        hoTen: hoTen,
        role: userRole
      });
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const getDashboardLink = () => {
    const role = localStorage.getItem("userRole");
    switch (role) {
      case "ADMIN":
        return "/dashboard/overview";
      case "TAIXE":
        return "/dashboard/findstation";
      case "NHANVIEN":
        return "/dashboard/transaction";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.brand}>
        <Link to="/">
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>
          <span>EV Station</span>
        </Link>
      </div>
      <nav className={styles.navbar}>
        <ScrollLink
          to="about-section"
          smooth={true}
          duration={600}
          offset={-80}
          spy={true}
        >
          Giới thiệu
        </ScrollLink>

        <ScrollLink
          to="price-section"
          smooth={true}
          duration={600}
          offset={-80}
          spy={true}
        >
          Bảng giá
        </ScrollLink>

        <ScrollLink
          to="feedback-section"
          smooth={true}
          duration={600}
          offset={-80}
          spy={true}
        >
          Đánh giá
        </ScrollLink>
      </nav>
      <div className={styles.actions}>
        {isLoggedIn ? (
          // ✅ CHỈ HIỆN "TRANG CÁ NHÂN" KHI ĐÃ ĐĂNG NHẬP
          <LinkButton to={getDashboardLink()} primary>
            Trang cá nhân
          </LinkButton>
        ) : (
          // ❌ HIỆN "ĐĂNG NHẬP/ĐĂNG KÝ" KHI CHƯA ĐĂNG NHẬP
          <>
            <LinkButton to="/login" text>
              Đăng nhập
            </LinkButton>
            <LinkButton to="/register" primary>
              Đăng ký
            </LinkButton>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;