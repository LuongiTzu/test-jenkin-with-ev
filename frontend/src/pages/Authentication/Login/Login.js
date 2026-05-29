import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import styles from "./Login.module.css";
import loginVinfast from "../../../assets/loginVinfast.jpg";
import { requestPermission } from "../../../firebase"; // 👈 THÊM DÒNG NÀY

function Login() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔄 Kiểm tra nếu đã login thì redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🎯 Điều hướng theo role
  const redirectByRole = (role) => {
    switch (role) {
      case "ADMIN":
        navigate("/dashboard/overview");
        break;
      case "TAIXE":
        navigate("/dashboard/findstation");
        break;
      case "NHANVIEN":
        navigate("/dashboard/transaction");
        break;
      case "USER":
        navigate("/dashboard");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Đang gọi API đăng nhập...");

      const res = await fetch("/api/user-service/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soDienThoai: formData.phone,
          matKhau: formData.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Đăng nhập thành công:", data);

      // 🧠 Lưu thông tin người dùng
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("hoTen", data.hoTen);

      // 🔥 Gọi Firebase để lấy FCM Token
      const fcmToken = await requestPermission();
      if (fcmToken) {
        console.log("📩 FCM token:", fcmToken);

        // Gửi FCM token lên backend để lưu
        await fetch("/api/user-service/fcm/update", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + data.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maNguoiDung: data.userId,
            vaiTro: data.role,
            token: fcmToken,
          }),
        });

        console.log("✅ FCM token đã được lưu thành công!");
      } else {
        console.warn("⚠️ Không lấy được FCM token");
      }

      setLoading(false);
      redirectByRole(data.role);
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.form}>
        <div className={styles.header}>
          <span>Chào Mừng Trở Lại</span>
          <p>Đăng nhập để truy cập tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <div className={styles.inputInfo}>
            <span>Số điện thoại</span>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại của bạn"
              disabled={loading}
            />
          </div>
          <div className={styles.inputInfo}>
            <span>Mật khẩu</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu của bạn"
              disabled={loading}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className={styles.transferRegistration}>
          <div className={styles.divider}>
            <span>------------- Hoặc -------------</span>
          </div>
          <span>
            Không có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
          </span>
        </div>
      </div>

      <div className={styles.imagesLogin}>
        <img
          src={loginVinfast}
          alt="Giao diện đăng nhập"
          className={styles.longinVin}
        />
      </div>
    </div>
  );
}

export default Login;
