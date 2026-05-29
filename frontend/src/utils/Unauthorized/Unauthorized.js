// src/pages/Unauthorized/Unauthorized.js
import { Link } from "react-router";
import styles from "./Unauthorized.module.css";

function Unauthorized() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>403 - Truy cập bị từ chối</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>Về trang chủ</Link>
          <Link to="/dashboard" className={styles.btnSecondary}>Về dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;