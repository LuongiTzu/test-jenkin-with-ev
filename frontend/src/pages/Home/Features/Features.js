import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faBoltLightning,
  faBatteryFull,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Features.module.css";
import vinfastLuxSa from "../../../assets/vinfastLuxSa.png";
function Features() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Tính năng mạnh mẽ</span>
          <p>
            EV Station mang đến cho bạn lợi thế với các công cụ tiên tiến được
            thiết kế dành cho cả người mới bắt đầu và nhà giao dịch chuyên
            nghiệp.
          </p>
        </div>
        <div className={styles.content}>
          <div className={styles.card}>
            <FontAwesomeIcon
              icon={faBoltLightning}
              className={styles.faBoltLightning}
            />
            <span>Đổi Pin Nhanh Chóng</span>
            <p>
              Thay pin chỉ trong 1–2 phút tại trạm đổi pin tự động – không cần
              chờ sạc, sẵn sàng tiếp tục hành trình ngay lập tức.
            </p>
          </div>

          <div className={styles.card}>
            <FontAwesomeIcon
              icon={faBatteryFull}
              className={styles.faBatteryFull}
            />
            <span>Pin Luôn Ở Trạng Thái Tốt Nhất</span>
            <p>
              Hệ thống quản lý pin thông minh đảm bảo mỗi viên pin được bảo
              dưỡng, kiểm tra và cân bằng trước khi bạn sử dụng.
            </p>
          </div>

          <div className={styles.card}>
            <FontAwesomeIcon
              icon={faLocationDot}
              className={styles.faLocationDot}
            />
            <span>Mạng Lưới Rộng Khắp</span>
            <p>
              Hơn 30 trạm đổi pin trên toàn quốc và đang tiếp tục mở rộng tại
              các thành phố, trung tâm thương mại và tuyến giao thông trọng
              điểm.
            </p>
          </div>

          <div className={styles.card}>
            <FontAwesomeIcon
              icon={faUserShield}
              className={styles.faUserShield}
            />
            <span>An Toàn & Đảm Bảo</span>
            <p>
              Quy trình đổi pin tự động, đạt chuẩn an toàn điện, cùng hệ thống
              theo dõi thời gian thực giúp bạn an tâm trên mọi hành trình.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Features;
