import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./PrivateLayout.module.css";

function PrivateLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 760);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
      if (window.innerWidth < 760) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const SidebarToggle = () => setIsOpen((prev) => !prev);

  const handleOverlayClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.sidebar} ${isOpen ? styles.show : styles.hide}`}
      >
        <Sidebar />
      </div>

      {isOpen && isMobile && (
        <div className={styles.overlay} onClick={handleOverlayClick}></div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <Header onClickSidebar={SidebarToggle} />
        </div>
        <div className={styles.main}>
          <Main>
            <Outlet />
          </Main>
        </div>
      </div>
    </div>
  );
}

export default PrivateLayout;
