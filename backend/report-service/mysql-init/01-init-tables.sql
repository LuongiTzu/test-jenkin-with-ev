CREATE DATABASE IF NOT EXISTS report_service;
USE report_service;

CREATE TABLE IF NOT EXISTS ai_demand_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ma_tram BIGINT,
    predict_date DATE,
    predict_hour TINYINT,
    predicted_demand INT,
    confidence_score DECIMAL(4,3),
    recommendation TEXT,
    gemini_insight TEXT,
    analysis_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   
);

CREATE TABLE IF NOT EXISTS prediction_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    accuracy_score DECIMAL(5,4),
    total_predictions INT,
    successful_predictions INT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);