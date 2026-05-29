import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./Staff.module.css";

const StationSelector = ({ 
  selectedStation, 
  onStationChange, 
  disabled = false,
  placeholder = "Chọn trạm làm việc" 
}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách trạm từ API
  const fetchStations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
      }

      const response = await fetch('/api/station-service/tram', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi tải danh sách trạm: ${response.status}`);
      }

      const stationData = await response.json();
      console.log("Dữ liệu trạm từ API:", stationData);
      setStations(stationData);
    } catch (err) {
      console.error("Lỗi tải danh sách trạm:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleStationSelect = (e) => {
    const stationId = e.target.value;
    const selected = stations.find(station => station.maTram === parseInt(stationId));
    onStationChange(selected);
  };

  const handleRefresh = () => {
    fetchStations();
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
        <span>Đang tải danh sách trạm...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorMessage}>
          <span>Lỗi tải danh sách trạm: {error}</span>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stationSelector}>
      <div className={styles.selectorHeader}>
        <label className={styles.label}>
          <FontAwesomeIcon icon={faLocationDot} className={styles.labelIcon} />
          Trạm làm việc
        </label>
        <button 
          type="button"
          onClick={handleRefresh}
          className={styles.refreshBtn}
          title="Làm mới danh sách trạm"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSpinner} className={loading ? styles.spin : ''} />
        </button>
      </div>
      
      <select
        value={selectedStation?.maTram || ''}
        onChange={handleStationSelect}
        disabled={disabled || stations.length === 0}
        className={styles.select}
        required
      >
        <option value="">{placeholder}</option>
        {stations.map(station => (
          <option key={station.maTram} value={station.maTram}>
            {station.tenTram} - {station.diaChi}
            {station.trangThai !== 'Hoạt động' && ` (${station.trangThai})`}
          </option>
        ))}
      </select>

      {selectedStation && (
        <div className={styles.stationInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Địa chỉ:</span>
            <span>{selectedStation.diaChi}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số ĐT trạm:</span>
            <span>{selectedStation.soDT}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số pin tối đa:</span>
            <span>{selectedStation.soLuongPinToiDa}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Trạng thái:</span>
            <span className={
              selectedStation.trangThai === 'Hoạt động' ? styles.statusActive : styles.statusInactive
            }>
              {selectedStation.trangThai}
            </span>
          </div>
        </div>
      )}

      {stations.length === 0 && !loading && (
        <div className={styles.emptyState}>
          Không có trạm nào khả dụng
        </div>
      )}
    </div>
  );
};

export default StationSelector;