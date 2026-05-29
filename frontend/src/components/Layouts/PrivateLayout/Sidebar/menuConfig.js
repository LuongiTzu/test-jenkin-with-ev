import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faBatteryFull,
  faClockRotateLeft,
  faCircleUser,
  faPhone,
  faGlobe,
  faChargingStation,
  faUsers,
  faUserTie,
  faComment,
  faBrain,
  faBoxesPacking,
  faGrip,
 
} from "@fortawesome/free-solid-svg-icons";
import { href } from "react-router";
const menu = {
    driver: [
      {
        title: "Tìm trạm",
        href: "/dashboard/findstation",
        icon: <FontAwesomeIcon icon={faLocationDot} />,
      },
      {
        title: "Thay pin",
        href: "/dashboard/changebattery",
        icon: <FontAwesomeIcon icon={faBatteryFull} />,
      },
      {
        title: "Lịch sử",
        href: "/dashboard/history",
        icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
      },
      {
        title: "Hồ sơ",
        href: "/dashboard/information",
        icon: <FontAwesomeIcon icon={faCircleUser} />,
      },
      {
        title: "Hổ trợ",
        href: "/dashboard/support",
        icon: <FontAwesomeIcon icon={faPhone} />,
      },
    ],
    admin: [
      {
        title: "Tổng quan",
        href: "/dashboard/overview",
        icon: <FontAwesomeIcon icon={faGlobe} />,
      },
      {
        title: "Trạm",
        href: "/dashboard/stations",
        icon: <FontAwesomeIcon icon={faChargingStation} />,
      },
      {
        title: "Pin",
        href: "/dashboard/batteries",
        icon: <FontAwesomeIcon icon={faBatteryFull} />,
      },
      {
        title: "Gói dịch vụ",
        href: "/dashboard/servicePackages",
        icon: <FontAwesomeIcon icon={faBoxesPacking} />,
      },
      {
        title: "Khách hàng",
        href: "/dashboard/customers",
        icon: <FontAwesomeIcon icon={faUserTie} />,
      },
      {
        title: "Nhân viên",
        href: "/dashboard/staff",
        icon: <FontAwesomeIcon icon={faUsers} />,
      },
      {
        title: "Thông tin AI",  
        href: "/dashboard/aiinsights",
        icon: <FontAwesomeIcon icon={faBrain} />,
      },
      {
        title: "Cảnh báo",
        href: "/dashboard/alerts",
        icon: <FontAwesomeIcon icon={faGrip} />,
      },
      {
        title: "Hồ sơ",
        href: "/dashboard/informationAdmin",
        icon: <FontAwesomeIcon icon={faCircleUser} />,
      },
      {
        title: "Đánh giá",
        href: "/dashboard/feedback",
        icon: <FontAwesomeIcon icon={faComment} />,
      },
      
    ],

    staff: [
      {
        title: "Quản lý hàng chờ",
        href: "/dashboard/queueManagement",
        icon: <FontAwesomeIcon icon={faGlobe} />,
      },
      {
        title: "Kho hàng",
        href: "/dashboard/inventory",
        icon: <FontAwesomeIcon icon={faChargingStation} />,
      },
      {
        title: "Giao dịch",
        href: "/dashboard/transaction",
        icon: <FontAwesomeIcon icon={faUserTie} />,
      },
      {
        title: "Báo cáo",
        href: "/dashboard/report",
        icon: <FontAwesomeIcon icon={faUsers} />,
      },
    ],
  }
  export default menu;