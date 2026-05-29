USE ev_dw_analytics;

-- Chỉ 1 bảng duy nhất để thu thập tất cả data
CREATE TABLE IF NOT EXISTS dw_ev_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Data chung
    ma_giao_dich BIGINT,
    ma_tai_xe BIGINT,
    ma_tram BIGINT,
    ma_pin BIGINT,
    thoi_gian DATETIME,
    
    -- Thông tin hành động
    loai_du_lieu ENUM('GIAO_DICH', 'LICH_SU_PIN'),
    hanh_dong VARCHAR(100),
    
    -- Thông tin giao dịch
    thanh_tien DECIMAL(10,2),
    phuong_thuc_thanh_toan VARCHAR(50),
    trang_thai VARCHAR(50),
    
    -- Dimensions cho AI
    gio_trong_ngay TINYINT,
    thu_trong_tuan TINYINT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_thoi_gian (thoi_gian),
    INDEX idx_ma_tram (ma_tram),
    INDEX idx_loai_du_lieu (loai_du_lieu),
    INDEX idx_gio (gio_trong_ngay)
);
