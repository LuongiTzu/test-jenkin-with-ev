import React from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBatteryFull,
  faLocationDot,
   faClock,
  faBolt,
  faUsers,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import styles from "./Overview.module.css";

function Overview() {
  // Dữ liệu biểu đồ doanh thu
  const revenueData = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Apr", revenue: 61000 },
    { month: "May", revenue: 58000 },
    { month: "Jun", revenue: 67000 },
  ];

  // Dữ liệu sức khỏe pin
  const batteryHealth = [
    { name: "90-100%", value: 145, color: "#22c55e" },
    { name: "70-89%", value: 87, color: "#f59e0b" },
    { name: "50-69%", value: 23, color: "#ef4444" },
    { name: "Below 50%", value: 8, color: "#991b1b" },
  ];

  // Dữ liệu KPI đầu trang
  const topKpi = [
    {
      title: "Tổng Doanh Thu",
      value: "$267.000",
      sub: "+12.5%",
      icon: faDollarSign,
      color: "#16a34a",
    },
    {
      title: "Tổng Lần Thay Pin",
      value: "12.847",
      sub: "+8.3%",
      icon: faBatteryFull,
      color: "#3b82f6",
    },
    {
      title: "Trạm Hoạt Động",
      value: "24",
      sub: "Tất Cả Trực Tuyến",
      icon: faLocationDot,
      color: "#a855f7",
    },
    {
      title: "Khách Hàng",
      value: "8.547",
      sub: "+156 mới",
      icon: faUser,
      color: "#f97316",
    },
  ];

  // Dữ liệu KPI nhỏ bên dưới
  const bottomKpi = [
    {
      value: "2.8min",
      label: "Thời Gian Thay Pin Trung Bình",
      color: "#3b82f6",
      icon: faClock,
    },
    {
      value: "99.9%",
      label: "Thời Gian Hoạt Động Hệ Thống",
      color: "#22c55e",
      icon: faBolt,
    },
    {
      value: "4.8/5",
      label: "Đánh Giá Khách Hàng",
      color: "#a855f7",
      icon: faUsers,
    },
    {
      value: "94.2%",
      label: "Hiệu Suất Pin",
      color: "#f97316",
      icon: faGaugeHigh,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        <FontAwesomeIcon icon={faArrowTrendUp} /> Tổng Quan
      </h1>

      {/* Thẻ KPI đầu trang */}
      <div className={styles.kpiGrid}>
        {topKpi.map((item, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiTitle}>{item.title}</p>
              <h2 className={styles.kpiValue}>{item.value}</h2>
              <p className={styles.kpiSub}>
                <span className={styles.kpiArrow}>↑</span> {item.sub}
              </p>
            </div>
            <div
              className={styles.kpiIcon}
              style={{ color: item.color, backgroundColor: item.color + "20" }}
            >
              <FontAwesomeIcon icon={item.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Biểu đồ */}
      <div className={styles.chartGrid}>
        {/* Biểu đồ doanh thu */}
        <div className={styles.chartCard}>
          <h3>Trends Doanh Thu</h3>
          <p>Doanh thu và số lượng thay pin hàng tháng</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="url(#colorRevenue)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ sức khỏe pin */}
        <div className={styles.chartCard}>
          <h3>Phân Phối Sức Khỏe Pin</h3>
          <p>Tình trạng hiện tại của bộ pin</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={batteryHealth}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
              >
                {batteryHealth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {batteryHealth.map((b, i) => (
              <div key={i} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: b.color }}
                ></span>
                <p>
                  {b.name}: {b.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI nhỏ bên dưới */}
      <div className={styles.bottomKpiGrid}>
  {bottomKpi.map((item, index) => (
    <div key={index} className={styles.bottomKpiCard}>
      <FontAwesomeIcon
        icon={item.icon}
        className={styles.bottomIcon}
        style={{ color: item.color }}
      />
      <h2 className={styles.bottomValue}>{item.value}</h2>
      <p className={styles.bottomLabel}>{item.label}</p>
    </div>
  ))}
</div>

    </div>
  );
}

export default Overview;
