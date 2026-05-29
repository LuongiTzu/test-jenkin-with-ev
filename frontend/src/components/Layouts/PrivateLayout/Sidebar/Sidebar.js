import { Link } from "react-router";
import { useEffect, useState } from "react"; // THÊM

import styles from "./Sidebar.module.css";
import logo from "../../../../assets/logo/logo.svg";
import menu from "./menuConfig";

function Sidebar() {
  const [currentMenu, setCurrentMenu] = useState([]);

  // THÊM: Lấy role từ localStorage và map với menu
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    
    // Map role từ backend sang key trong menuConfig
    let roleKey = "staff"; // mặc định
    
    if (userRole === "TAIXE") roleKey = "driver";
    else if (userRole === "ADMIN") roleKey = "admin";
    else if (userRole === "NHANVIEN") roleKey = "staff";
    
    console.log("User Role:", userRole, "Menu Key:", roleKey); // Debug
    
    setCurrentMenu(menu[roleKey] || []);
  }, []);

  return (
    <nav className={styles.wrapper}>
      <div className={styles.brand}>
        <Link to="/">
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>
          <span>EVStation</span>
        </Link>
      </div>
      <div className={styles.content}>
        {currentMenu.map((obj, index) => (
          <Link key={index} to={obj.href} className={styles.active}>
            {obj.icon}
            {obj.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Sidebar;