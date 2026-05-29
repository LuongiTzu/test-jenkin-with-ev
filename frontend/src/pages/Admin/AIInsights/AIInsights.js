import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBatteryFull,
  faLocationDot,
  faBrain,
  faLightbulb,
  faBolt,
  faChartLine,
  faClock,
  faSync,
  faArrowUp,
  faArrowDown,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import styles from "./AIInsights.module.css";

function AIInsights() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8080/api/report-service/predictions"
      );
      if (!response.ok) throw new Error("Failed to fetch predictions");
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIX: Kiểm tra undefined trước khi sử dụng .map()
  const allPeakHours = predictions.flatMap((pred) =>
    pred?.peak_hours &&
    Array.isArray(pred.peak_hours) &&
    pred.peak_hours_count > 0
      ? pred.peak_hours.map((hour) => ({ hour, station: pred.ma_tram }))
      : []
  );

  const peakHoursCount = allPeakHours.reduce((acc, { hour }) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const peakHoursData = Object.entries(peakHoursCount)
    .map(([hour, count]) => ({
      hour: `${hour}h`,
      stations: count,
      frequency: ((count / predictions.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.stations - a.stations)
    .slice(0, 8);

  // 🔥 TÍNH TOÁN TỪ DATA THỰC - ĐÃ THÊM KIỂM TRA
  const totalStations = predictions.length;
  const totalPredictedDemand = predictions.reduce(
    (sum, pred) => sum + (pred?.predicted_demand || 0),
    0
  );
  const avgConfidence =
    predictions.length > 0
      ? (
          (predictions.reduce(
            (sum, pred) => sum + (pred?.confidence_score || 0),
            0
          ) /
            predictions.length) *
          100
        ).toFixed(1)
      : 0;

  // Trạm có nhu cầu cao nhất - ĐÃ THÊM KIỂM TRA
  const topStation =
    predictions.length > 0
      ? predictions.reduce((max, pred) =>
          (pred?.predicted_demand || 0) > (max?.predicted_demand || 0)
            ? pred
            : max
        )
      : null;

  // Dữ liệu biểu đồ cột - TOP 5 trạm - ĐÃ THÊM KIỂM TRA
  const topStationsData = predictions
    .filter(
      (pred) => pred && pred.ma_tram && pred.predicted_demand !== undefined
    )
    .sort((a, b) => (b.predicted_demand || 0) - (a.predicted_demand || 0))
    .slice(0, 5)
    .map((pred) => ({
      name: `Trạm ${pred.ma_tram}`,
      demand: pred.predicted_demand || 0,
      confidence: pred.confidence_score || 0,
    }));

  // Dữ liệu phân bổ nhu cầu - ĐÃ THÊM KIỂM TRA
  const demandDistribution = predictions
    .filter(
      (pred) => pred && pred.ma_tram && pred.predicted_demand !== undefined
    )
    .map((pred) => ({
      name: `Trạm ${pred.ma_tram}`,
      value: pred.predicted_demand || 0,
      stationId: pred.ma_tram,
    }));

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
  ];

  const kpiData = [
    {
      title: "Tổng Lượt Đổi Pin",
      value: totalPredictedDemand.toString(),
      sub: "Dự báo ngày mai",
      color: "#3b82f6",
      icon: faBatteryFull,
    },
    {
      title: "Số Trạm",
      value: totalStations.toString(),
      sub: "Được dự báo",
      color: "#10b981",
      icon: faLocationDot,
    },
    {
      title: "Độ Tin Cậy AI",
      value: `${avgConfidence}%`,
      sub: "Trung bình",
      color: "#f59e0b",
      icon: faBrain,
    },
    {
      title: "Trạm Cao Nhất",
      value: topStation ? `Trạm ${topStation.ma_tram}` : "N/A",
      sub: topStation
        ? `${topStation.predicted_demand || 0} lượt`
        : "Không có data",
      color: "#ef4444",
      icon: faChartLine,
    },
  ];

  const getAIMethodIcon = (method) => {
    if (!method) return <span className={styles.aiBadge}>🤖 AI</span>;

    switch (method) {
      case "AI_RandomForest":
        return (
          <span
            className={styles.aiBadge}
            style={{ backgroundColor: "#10b98120", color: "#10b981" }}
          >
            🌲 RandomForest
          </span>
        );
      case "AI_LinearRegression":
        return (
          <span
            className={styles.aiBadge}
            style={{ backgroundColor: "#3b82f620", color: "#3b82f6" }}
          >
            📈 LinearRegression
          </span>
        );
      case "Statistical_Fallback":
        return (
          <span
            className={styles.aiBadge}
            style={{ backgroundColor: "#6b728020", color: "#6b7280" }}
          >
            📊 Statistical
          </span>
        );
      default:
        return <span className={styles.aiBadge}> </span>;
    }
  };

  const getGrowthIcon = (growth) => {
    if (growth === undefined || growth === null)
      return (
        <FontAwesomeIcon icon={faChartLine} style={{ color: "#6b7280" }} />
      );
    if (growth > 10)
      return <FontAwesomeIcon icon={faArrowUp} style={{ color: "#10b981" }} />;
    if (growth < -5)
      return (
        <FontAwesomeIcon icon={faArrowDown} style={{ color: "#ef4444" }} />
      );
    return <FontAwesomeIcon icon={faChartLine} style={{ color: "#6b7280" }} />;
  };

  // 🔥 FIX: Hàm hiển thị giờ cao điểm an toàn
  const renderPeakHours = (pred) => {
    if (
      !pred ||
      !pred.peak_hours ||
      !Array.isArray(pred.peak_hours) ||
      pred.peak_hours.length === 0
    ) {
      return null;
    }

    return (
      <div className={styles.peakHours}>
        <FontAwesomeIcon icon={faClock} />
        <span>
          {pred.peak_hours_count || pred.peak_hours.length} giờ cao điểm:{" "}
          {pred.peak_hours.map((h) => `${h}h`).join(", ")}
        </span>
      </div>
    );
  };

  // 🔥 FIX: Hàm hiển thị dự báo theo giờ an toàn
  const renderHourlyPredictions = (pred) => {
    if (
      !pred ||
      !pred.hourly_predictions ||
      !Array.isArray(pred.hourly_predictions) ||
      pred.hourly_predictions.length === 0
    ) {
      return null;
    }

    return (
      <div className={styles.hourlySection}>
        <h5> Dự Báo Theo Giờ</h5>
        <div className={styles.hourlyChart}>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart
              data={pred.hourly_predictions.map((value, hour) => ({
                hour,
                value: value || 0,
              }))}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                formatter={(value) => [
                  `${(value || 0).toFixed(1)} lượt`,
                  "Dự báo",
                ]}
                labelFormatter={(label) => `${label}h`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          <FontAwesomeIcon icon={faBrain} spin size="2x" />
          <p>Đang tải dự báo AI...</p>
          <small>AI đang phân tích dữ liệu và đưa ra dự báo thông minh</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>
          <p>Lỗi khi tải dữ liệu: {error}</p>
          <button onClick={fetchPredictions} className={styles.retryButton}>
            <FontAwesomeIcon icon={faSync} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Header với thông tin AI */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>
            <FontAwesomeIcon icon={faRobot} /> Phân Tích AI và Dự Báo Thông Minh
          </h2>
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.lastUpdated}>
            Cập nhật: {new Date().toLocaleTimeString("vi-VN")}
          </span>
          <button onClick={fetchPredictions} className={styles.refreshButton}>
            <FontAwesomeIcon icon={faSync} /> Cập nhật AI
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpiData.map((item, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <p className={styles.kpiTitle}>{item.title}</p>
              <h2 className={styles.kpiValue}>{item.value}</h2>
              <p className={styles.kpiSub}>{item.sub}</p>
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

      {/* Charts Grid */}
      <div className={styles.insightsGrid}>
        {/* Biểu đồ cột - Top 5 trạm */}
        <div className={styles.card}>
          <h3>Top 5 Trạm Có Nhu Cầu Cao Nhất </h3>
          <p>Dự báo AI theo số lượt đổi pin/ngày</p>
          {topStationsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topStationsData}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} lượt`, "Dự báo"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="demand"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Số lượt dự báo"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          )}
        </div>

        {/* Biểu đồ giờ cao điểm */}
        {/* <div className={styles.card}>
          <h3>Giờ Cao Điểm Phổ Biến</h3>
          <p>Số trạm có giờ cao điểm tương ứng</p>
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHoursData}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'stations') return [`${value} trạm`, 'Số trạm'];
                    return [`${value}%`, 'Tần suất'];
                  }}
                />
                <Bar 
                  dataKey="stations" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Số trạm"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>
              <p>Không có giờ cao điểm</p>
            </div>
          )}
        </div> */}

        {/* Biểu đồ phân bổ */}
        <div className={styles.card}>
          <h3>Phân Bổ Nhu Cầu Giữa Các Trạm</h3>
          <p>Tỷ lệ % dựa trên dự báo AI</p>
          {demandDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={demandDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {demandDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} lượt (${(
                      (value / totalPredictedDemand) *
                      100
                    ).toFixed(1)}%)`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>
              <p>Không có dữ liệu để hiển thị</p>
            </div>
          )}
        </div>

        {/* Thống kê AI Methods */}
        {/* <div className={styles.card}>
          <h3>Phương Pháp AI Được Sử Dụng</h3>
          <p>Phân bổ các thuật toán AI trong dự báo</p>
          <div className={styles.aiMethods}>
            {predictions.map((pred, index) => (
              <div key={pred?.ma_tram || index} className={styles.aiMethodItem}>
                <span>Trạm {pred?.ma_tram || 'N/A'}</span>
                {getAIMethodIcon(pred?.ai_method)}
                <span className={styles.confidenceValue}>
                  {((pred?.confidence_score || 0) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Recommendations với đầy đủ thông tin AI */}
      <div className={styles.recommendationsSection}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faLightbulb} /> Phân Tích Chi Tiết & Đề Xuất Từ
          AI
        </h3>
        {predictions.length > 0 ? (
          <div className={styles.recommendationsGrid}>
            {predictions.map((pred, index) => (
              <div
                key={pred?.ma_tram || index}
                className={styles.recommendationCard}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.stationInfo}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    <div>
                      <h4>Trạm {pred?.ma_tram || "N/A"}</h4>
                      <div className={styles.dataQuality}>
                        <span className={styles.qualityBadge}>
                          {pred?.data_quality === "HIGH"
                            ? "🟢"
                            : pred?.data_quality === "MEDIUM"
                            ? "🟡"
                            : "🔴"}
                          {pred?.data_quality || "UNKNOWN"}
                        </span>
                        {/* <span>• {pred?.data_points || 0} bản ghi</span> */}
                      </div>
                    </div>
                  </div>
                  <div className={styles.aiMeta}>
                    {getAIMethodIcon(pred?.ai_method)}
                    <span
                      className={styles.confidence}
                      style={{
                        backgroundColor:
                          (pred?.confidence_score || 0) > 0.8
                            ? "#10b98120"
                            : (pred?.confidence_score || 0) > 0.6
                            ? "#f59e0b20"
                            : "#ef444420",
                        color:
                          (pred?.confidence_score || 0) > 0.8
                            ? "#10b981"
                            : (pred?.confidence_score || 0) > 0.6
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {((pred?.confidence_score || 0) * 100).toFixed(1)}% tin
                      cậy
                    </span>
                  </div>
                </div>

                {/* Thông tin dự báo */}
                <div className={styles.predictionSection}>
                  <div className={styles.demand}>
                    <strong>{pred?.predicted_demand || 0}</strong>
                    <span>lượt dự báo/ngày</span>
                  </div>

                  <div className={styles.growthInfo}>
                    <span className={styles.growth}>
                      {getGrowthIcon(pred?.growth_trend)}
                      {pred?.growth_trend > 0 ? "+" : ""}
                      {pred?.growth_trend || 0}%
                    </span>
                    <span className={styles.historical}>
                      {pred?.total_historical_transactions || 0} giao dịch lịch
                      sử
                    </span>
                  </div>

                  {renderPeakHours(pred)}
                </div>

                {/* Insight AI */}
                <div className={styles.aiInsight}>
                  <FontAwesomeIcon
                    icon={faBrain}
                    className={styles.insightIcon}
                  />
                  <div className={styles.insightText}>
                    {(pred?.gemini_insight || "Không có insight từ AI")
                      .split("\n")
                      .filter(
                        (line) => !line.toLowerCase().includes("thuật toán")
                      )
                      .map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className={styles.recommendation}>
                  <FontAwesomeIcon icon={faBolt} className={styles.faBolt} />
                  <div className={styles.recommendationText}>
                    {(pred?.recommendation || "Không có khuyến nghị")
                      .split("\n")
                      .map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                  </div>
                </div>

                {renderHourlyPredictions(pred)}

                <div className={styles.predictionDate}>
                  <span>Dự báo AI cho: {pred?.predict_date || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noData}>
            <p>Không có đề xuất nào từ AI</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIInsights;
