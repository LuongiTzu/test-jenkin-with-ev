import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagramSquare,
  faSquareFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faBuilding, faPhoneVolume } from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets/logo/logo.svg";
import styles from "./Footer.module.css";
function Footer() {
  return (
    <footer className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.item}>
            <div className={styles.brand}>
              <Link to="/">
                <div className={styles.logo}>
                  <img src={logo} alt="logo" />
                </div>
                <span className={styles.nameBrand}>VinNhot</span>
              </Link>
            </div>
            <div className={styles.introduce}>
              Cách mạng hóa năng lượng EV với các trạm thay pin nhanh chóng,
              đáng tin cậy.
            </div>
            <div className={styles.socialItem}>
              <a href="https://github.com/tienvybui05/ev-battery-swap-system">
                <FontAwesomeIcon
                  icon={faSquareFacebook}
                  className={styles.iconFb}
                />
              </a>
              <a href="https://github.com/tienvybui05/ev-battery-swap-system">
                <FontAwesomeIcon
                  icon={faInstagramSquare}
                  className={styles.iconIng}
                />{" "}
              </a>
            </div>
          </div>
          <div className={styles.item}>
            <h4>Dịch vụ</h4>
            <Link to="/">Thay pin</Link>
            <Link to="/">Tìm trạm</Link>
            <Link to="/">Gói đăng ký</Link>
            <Link to="/">Giải pháp doanh nghiệp</Link>
          </div>
          <div className={styles.item}>
            <h4>Hổ trợ</h4>
            <Link to="/">Trum tâm trợ giúp</Link>
            <Link to="/">Câu hỏi thường gặp</Link>
            <Link to="/">Liên hệ hổ trợ</Link>
            <Link to="/">Cứu hộ đường bộ</Link>
          </div>
          <div className={styles.item}>
            <h4>Liên hệ</h4>
            <div>
              <FontAwesomeIcon icon={faBuilding}  className={styles.faBuilding}/>
              <span>
                Tòa FPT, số 10 Phạm Văn Bạch, Phường Dịch Vọng, Quận Cầu Giấy,
                Hà Nội, Việt Nam
              </span>
            </div>
            <div>
              <FontAwesomeIcon icon={faPhoneVolume}  className={styles.faPhoneVolume}/>
              <span>
                1900.633.331 hoặc 077.567.6116 8h30-21h thứ 2 - thứ 6,
                8h30-11h30 thứ 7
              </span>
            </div>
          </div>
        </div>
        <div className={styles.reserved}>
          <a href="https://github.com/tienvybui05/ev-battery-swap-system">
            Bản quyền thuộc @Nhóm phá
          </a>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
