from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import mysql.connector
from flask_cors import CORS
import os
from dotenv import load_dotenv
import random
import statistics
from collections import defaultdict
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_regression
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

app = Flask(__name__)
CORS(app)

# ======================= AI CONFIG =======================
AI_CONFIG = {
    'min_data_points': 5,
    'confidence_threshold': 0.75,
    'peak_sensitivity': 0.8
}

# ======================= DATABASE CONFIG =======================
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'mysql_report'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', 'root'),
    'database': os.getenv('MYSQL_DATABASE', 'report_service')
}

DW_CONFIG = {
    'host': os.getenv('DW_HOST', 'mysql-dw'),
    'user': os.getenv('DW_USER', 'root'),
    'password': os.getenv('DW_PASSWORD', 'root'),
    'database': os.getenv('DW_DATABASE', 'ev_dw_analytics')
}

def get_db_connection(config=DB_CONFIG):
    return mysql.connector.connect(**config)

# ======================= ADVANCED AI FUNCTIONS =======================
class EVStationAI:
    def __init__(self):
        self.demand_model = None
        self.scaler = StandardScaler()
        
    def prepare_advanced_features(self, station_data):
        """Chuẩn bị features AI nâng cao"""
        df = pd.DataFrame(station_data)
        
        # Đảm bảo kiểu dữ liệu đúng
        df['hour'] = df['gio_trong_ngay'].astype(int)
        df['weekday'] = df['thu_trong_tuan'].astype(int)
        df['is_weekend'] = df['weekday'].isin([1, 7]).astype(int)
        
        # Features temporal patterns
        df['time_of_day'] = 'other'
        df.loc[df['hour'].between(0, 6), 'time_of_day'] = 'night'
        df.loc[df['hour'].between(6, 12), 'time_of_day'] = 'morning'
        df.loc[df['hour'].between(12, 18), 'time_of_day'] = 'afternoon'
        df.loc[df['hour'].between(18, 24), 'time_of_day'] = 'evening'
        
        # Rolling features
        df = df.sort_values(['weekday', 'hour']).reset_index(drop=True)
        df['rolling_avg_3'] = df['so_giao_dich'].rolling(window=min(3, len(df)), min_periods=1).mean()
        df['transaction_trend'] = df['so_giao_dich'].diff().fillna(0)
        
        # One-hot encoding an toàn
        time_dummies = pd.get_dummies(df['time_of_day'], prefix='time')
        for col in ['time_night', 'time_morning', 'time_afternoon', 'time_evening']:
            if col not in time_dummies.columns:
                time_dummies[col] = 0
                
        df = pd.concat([df, time_dummies], axis=1)
        
        hourly_stats = df.groupby('hour')['so_giao_dich'].agg(['mean', 'std', 'max', 'min', 'count']).fillna(0)
        
        return df, hourly_stats
    
    def train_demand_model(self, station_data):
        """Huấn luyện mô hình dự báo nhu cầu"""
        if len(station_data) < AI_CONFIG['min_data_points']:
            print(f"Không đủ dữ liệu cho AI: {len(station_data)} < {AI_CONFIG['min_data_points']}")
            return None, 0.5
            
        try:
            df, hourly_stats = self.prepare_advanced_features(station_data)
            
            # Features cho training
            base_features = ['hour', 'weekday', 'is_weekend', 'rolling_avg_3', 'transaction_trend']
            time_features = ['time_morning', 'time_afternoon', 'time_evening', 'time_night']
            
            feature_columns = base_features + time_features
            available_features = [f for f in feature_columns if f in df.columns]
            
            if len(available_features) < 3:
                return None, 0.5
                
            X = df[available_features].fillna(0)
            y = df['so_giao_dich']
            
            # Feature selection
            if len(X) > 5:
                k = min(3, len(available_features))
                selector = SelectKBest(score_func=f_regression, k=k)
                X_selected = selector.fit_transform(X, y)
                selected_mask = selector.get_support()
                selected_features = [available_features[i] for i in range(len(available_features)) if selected_mask[i]]
                X_final = X[selected_features]
            else:
                X_final = X
                selected_features = available_features
            
            # Train model phù hợp với kích thước data
            if len(X_final) < 10:
                from sklearn.linear_model import LinearRegression
                model = LinearRegression()
                model_name = "AI_HồiQuyTuyếnTính"
            else:
                model = RandomForestRegressor(
                    n_estimators=50,
                    max_depth=8,
                    min_samples_split=3,
                    random_state=42
                )
                model_name = "AI_RừngNgẫuNhiên"
            
            model.fit(X_final, y)
            
            # Tính confidence score
            data_quality = min(1.0, len(station_data) / 40)
            model_complexity = 0.7 if model_name == "AI_RừngNgẫuNhiên" else 0.5
            
            confidence = 0.6 + (data_quality * 0.3) + (model_complexity * 0.1)
            
            return model, min(confidence, 0.92), selected_features, model_name
            
        except Exception as e:
            print(f"Lỗi huấn luyện AI: {e}")
            return None, 0.5, [], "Lỗi"
    
    def predict_demand(self, station_data, future_date):
        """Dự báo nhu cầu bằng AI"""
        if len(station_data) < AI_CONFIG['min_data_points']:
            return self._statistical_fallback(station_data)
        
        model_result = self.train_demand_model(station_data)
        if model_result[0] is None:
            return self._statistical_fallback(station_data)
        
        model, confidence, feature_columns, model_name = model_result
        
        try:
            future_weekday = future_date.weekday() + 1
            predictions = []
            
            recent_transactions = [r['so_giao_dich'] for r in station_data[-3:]]
            rolling_avg = np.mean(recent_transactions) if recent_transactions else 0
            trend = self._calculate_trend(station_data)
            
            for hour in range(24):
                features = {
                    'hour': hour,
                    'weekday': future_weekday,
                    'is_weekend': 1 if future_weekday in [1, 7] else 0,
                    'rolling_avg_3': rolling_avg,
                    'transaction_trend': trend,
                    'time_morning': 1 if 6 <= hour < 12 else 0,
                    'time_afternoon': 1 if 12 <= hour < 18 else 0,
                    'time_evening': 1 if 18 <= hour < 24 else 0,
                    'time_night': 1 if 0 <= hour < 6 else 0
                }
                
                X_pred_dict = {f: features[f] for f in feature_columns if f in features}
                X_pred = pd.DataFrame([X_pred_dict])
                
                for col in feature_columns:
                    if col not in X_pred.columns:
                        X_pred[col] = 0
                
                X_pred = X_pred[feature_columns]
                pred = max(0, float(model.predict(X_pred)[0]))
                predictions.append(pred)
            
            total_prediction = int(sum(predictions))
            
            historical_total = sum(r['so_giao_dich'] for r in station_data)
            avg_daily = historical_total / 7
            
            reasonable_min = int(avg_daily * 0.7)
            reasonable_max = int(avg_daily * 2.0)
            adjusted_prediction = max(reasonable_min, min(total_prediction, reasonable_max))
            
            return {
                'predicted_demand': adjusted_prediction,
                'confidence_score': round(confidence, 3),
                'hourly_predictions': predictions,
                'method': model_name
            }
            
        except Exception as e:
            print(f"Lỗi dự báo AI: {e}")
            return self._statistical_fallback(station_data)
    
    def detect_ai_peak_hours(self, station_data):
        """Phát hiện giờ cao điểm bằng AI"""
        if len(station_data) < 3:
            return self._statistical_peak_hours(station_data)
        
        try:
            df = pd.DataFrame(station_data)
            df['gio_trong_ngay'] = df['gio_trong_ngay'].astype(int)
            hourly_avg = df.groupby('gio_trong_ngay')['so_giao_dich'].mean().reset_index()
            
            if len(hourly_avg) < 2:
                return self._statistical_peak_hours(station_data)
            
            X = hourly_avg[['so_giao_dich']].values
            
            contamination = min(0.3, max(0.1, 2.0 / len(hourly_avg)))
            
            iso_forest = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=50
            )
            
            anomalies = iso_forest.fit_predict(X)
            
            peak_hours = []
            for i, anomaly in enumerate(anomalies):
                if anomaly == -1:
                    peak_hours.append(int(hourly_avg.iloc[i]['gio_trong_ngay']))
            
            return sorted(peak_hours) if peak_hours else self._statistical_peak_hours(station_data)
            
        except Exception as e:
            print(f"Lỗi phát hiện giờ cao điểm AI: {e}")
            return self._statistical_peak_hours(station_data)
    
    def _statistical_fallback(self, station_data):
        """Phương pháp dự phòng khi AI không khả dụng"""
        total = sum(r['so_giao_dich'] for r in station_data)
        days_covered = len(set((r['thu_trong_tuan'], r['gio_trong_ngay']) for r in station_data)) / 24
        days_covered = max(days_covered, 1)
        
        avg_daily = total / days_covered
        predicted = int(avg_daily * random.uniform(0.95, 1.15))
        
        return {
            'predicted_demand': predicted,
            'confidence_score': 0.65,
            'hourly_predictions': [],
            'method': 'PhươngPhápThốngKê'
        }
    
    def _statistical_peak_hours(self, station_data):
        """Phát hiện giờ cao điểm bằng thống kê"""
        hourly_data = defaultdict(list)
        for record in station_data:
            hour_int = int(record['gio_trong_ngay'])
            hourly_data[hour_int].append(record['so_giao_dich'])
        
        if not hourly_data:
            return []
            
        hourly_means = {hour: statistics.mean(values) for hour, values in hourly_data.items()}
        overall_mean = statistics.mean(hourly_means.values()) if hourly_means else 0
        
        peak_hours = []
        for hour, mean_val in hourly_means.items():
            if mean_val > overall_mean * 1.5:
                peak_hours.append(hour)
        
        return sorted(peak_hours)
    
    def _calculate_trend(self, station_data):
        """Tính toán xu hướng từ dữ liệu"""
        if len(station_data) < 2:
            return 0
        
        transactions = [r['so_giao_dich'] for r in station_data]
        try:
            x = np.arange(len(transactions))
            slope = np.polyfit(x, transactions, 1)[0]
            return slope
        except:
            return 0

# ======================= INIT AI =======================
ev_ai = EVStationAI()

# ======================= ENHANCED ANALYSIS WITH AI =======================
def analyze_with_ai(station_data):
    """Phân tích nâng cao sử dụng AI"""
    if not station_data:
        return {
            'predicted_demand': 0,
            'peak_hours': [],
            'data_points': 0,
            'growth_trend': 0,
            'confidence_score': 0,
            'ai_method': 'KhôngCóDữLiệu'
        }
    
    tomorrow = datetime.now() + timedelta(days=1)
    prediction_result = ev_ai.predict_demand(station_data, tomorrow)
    
    peak_hours = ev_ai.detect_ai_peak_hours(station_data)
    
    growth_trend = calculate_ai_growth_trend(station_data)
    
    return {
        'predicted_demand': prediction_result['predicted_demand'],
        'peak_hours': peak_hours,
        'data_points': len(station_data),
        'growth_trend': growth_trend,
        'confidence_score': prediction_result['confidence_score'],
        'ai_method': prediction_result['method'],
        'hourly_predictions': prediction_result.get('hourly_predictions', [])
    }

def calculate_ai_growth_trend(station_data):
    """Tính xu hướng tăng trưởng bằng AI"""
    if len(station_data) < 4:
        return 0
    
    try:
        df = pd.DataFrame(station_data)
        df = df.sort_values(['thu_trong_tuan', 'gio_trong_ngay']).reset_index(drop=True)
        
        X = np.array(range(len(df))).reshape(-1, 1)
        y = df['so_giao_dich'].values
        
        trend = np.polyfit(X.flatten(), y, 1)[0]
        avg_transactions = np.mean(y)
        
        if avg_transactions == 0:
            return 0
            
        growth_percent = (trend / avg_transactions) * 100
        return round(min(max(growth_percent, -50), 100), 1)
        
    except:
        return 0

def generate_ai_recommendation(station_id, analysis_result):
    """Tạo khuyến nghị thông minh bằng AI"""
    pred_demand = analysis_result['predicted_demand']
    peak_hours = analysis_result['peak_hours']
    confidence = analysis_result['confidence_score']
    growth = analysis_result['growth_trend']
    ai_method = analysis_result.get('ai_method', 'KhôngXácĐịnh')
    total_historical = analysis_result.get('total_historical_transactions', 0)
    
    # Xác định mức độ tin cậy
    if confidence > 0.8:
        trust_level = "ĐỘ TIN CẬY CAO"
    elif confidence > 0.65:
        trust_level = "ĐỘ TIN CẬY TRUNG BÌNH"
    else:
        trust_level = "ĐỘ TIN CẬY THẤP"
    
    # Phân loại trạm thông minh hơn
    if growth > 25 and len(peak_hours) >= 2:
        station_type = "TRẠM NÓNG - CẦN ƯU TIÊN"
        priority = "KHẨN CẤP"
        action = "MỞ RỘNG NGAY LẬP TỨC - THÊM TRẠM MỚI"
    elif growth > 15 or (pred_demand > 50 and total_historical > 40):
        station_type = "TRẠM PHÁT TRIỂN NHANH"
        priority = "CAO"
        action = "TĂNG CƯỜNG NHÂN SỰ & PIN DỰ TRỮ"
    elif growth < -15:
        station_type = "TRẠM CÓ DẤU HIỆU GIẢM"
        priority = "THEO DÕI"
        action = "PHÂN TÍCH NGUYÊN NHÂN & ĐIỀU CHỈNH"
    elif pred_demand < 10 and total_historical < 20:
        station_type = "TRẠM MỚI/ÍT SỬ DỤNG"
        priority = "THEO DÕI"
        action = "KHUYẾN KHÍCH SỬ DỤNG & QUẢNG BÁ"
    else:
        station_type = "TRẠM ỔN ĐỊNH"
        priority = "BÌNH THƯỜNG"
        action = "DUY TRÌ HIỆN TRẠNG"
    
    # Tạo insight với AI
    peak_str = ", ".join([f"{int(h)}h" for h in peak_hours]) if peak_hours else "không có"
    
    gemini_insight = (
        f"{trust_level}\n"
        f"{station_type} | Mức ưu tiên: {priority}\n"
        f"Dự báo: {pred_demand} lượt/ngày | Tăng trưởng: {growth}%\n"
        f"Giờ cao điểm: {peak_str}\n"
        f"Thuật toán: {ai_method}"
    )
    
    recommendation = (
        f"HÀNH ĐỘNG ĐỀ XUẤT:\n"
        f"{action}\n"
        f"Độ tin cậy AI: {confidence*100:.1f}%\n"
        f"Khuyến nghị hạ tầng: {get_infrastructure_recommendation(pred_demand, growth, total_historical)}"
    )
    
    return gemini_insight, recommendation

def get_infrastructure_recommendation(demand, growth, historical):
    """Đề xuất nâng cấp hạ tầng dựa trên AI"""
    if demand > 80 and growth > 20:
        return "ƯU TIÊN CAO: Xây trạm mới hoặc mở rộng lớn"
    elif demand > 50 or (growth > 15 and historical > 30):
        return "ƯU TIÊN TRUNG: Tăng số lượng pin, mở rộng nhỏ"
    elif demand < 15 and historical < 25:
        return "KHUYẾN KHÍCH: Tăng cường quảng bá dịch vụ"
    elif demand < 20 and growth < 0:
        return "THEO DÕI: Đánh giá hiệu quả hoạt động"
    else:
        return "DUY TRÌ: Vận hành ổn định"

def save_prediction_to_db(prediction_data):
    """Lưu dự đoán vào DB"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO ai_demand_predictions 
        (ma_tram, predict_date, predict_hour, predicted_demand, confidence_score, recommendation, gemini_insight, analysis_summary)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            prediction_data['ma_tram'],
            prediction_data['predict_date'],
            prediction_data['predict_hour'],
            prediction_data['predicted_demand'],
            prediction_data['confidence_score'],
            prediction_data['recommendation'],
            prediction_data['gemini_insight'],
            prediction_data['analysis_summary']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Lỗi lưu vào DB: {e}")
        return False

# ======================= API ENDPOINTS =======================
@app.route('/api/report-service/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'ev-battery-ai-api',
        'timestamp': datetime.now().isoformat(),
        'version': '3.1.0',
        'features': 'Real_AI_ML_Powered',
        'ai_models': 'RandomForest, LinearRegression, IsolationForest'
    })

@app.route('/api/report-service/ai-status', methods=['GET'])
def ai_status():
    """Kiểm tra trạng thái AI"""
    try:
        import sklearn
        import pandas as pd
        import numpy as np
        
        test_data = [
            {'gio_trong_ngay': 9, 'thu_trong_tuan': 1, 'so_giao_dich': 5},
            {'gio_trong_ngay': 10, 'thu_trong_tuan': 1, 'so_giao_dich': 8},
            {'gio_trong_ngay': 11, 'thu_trong_tuan': 1, 'so_giao_dich': 15},
            {'gio_trong_ngay': 9, 'thu_trong_tuan': 2, 'so_giao_dich': 6},
            {'gio_trong_ngay': 10, 'thu_trong_tuan': 2, 'so_giao_dich': 7},
            {'gio_trong_ngay': 11, 'thu_trong_tuan': 2, 'so_giao_dich': 12},
        ]
        
        analysis = analyze_with_ai(test_data)
        
        return jsonify({
            'ai_status': 'ACTIVE',
            'sklearn_version': sklearn.__version__,
            'pandas_version': pd.__version__,
            'numpy_version': np.__version__,
            'test_prediction': analysis['predicted_demand'],
            'test_confidence': analysis['confidence_score'],
            'test_peaks': analysis['peak_hours'],
            'test_method': analysis.get('ai_method', 'Unknown')
        })
        
    except Exception as e:
        return jsonify({
            'ai_status': 'ERROR',
            'error': str(e)
        })

@app.route('/api/report-service/summary', methods=['GET'])
def get_summary():
    try:
        conn = get_db_connection(DW_CONFIG)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(DISTINCT ma_tram) as total_stations FROM dw_ev_data")
        total_stations = cursor.fetchone()['total_stations']

        cursor.execute("SELECT COUNT(*) as today_transactions FROM dw_ev_data WHERE DATE(thoi_gian) = CURDATE()")
        today_transactions = cursor.fetchone()['today_transactions']

        cursor.execute("SELECT COUNT(*) as weekly_transactions FROM dw_ev_data WHERE thoi_gian >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")
        weekly_transactions = cursor.fetchone()['weekly_transactions']

        cursor.execute("""
            SELECT ma_tram, COUNT(*) as transaction_count
            FROM dw_ev_data 
            WHERE thoi_gian >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY ma_tram 
            ORDER BY transaction_count DESC 
            LIMIT 1
        """)
        top_station = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'total_stations': total_stations,
                'today_transactions': today_transactions,
                'weekly_transactions': weekly_transactions,
                'top_station': top_station,
                'last_updated': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report-service/stations', methods=['GET'])
def get_stations():
    try:
        conn = get_db_connection(DW_CONFIG)
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            ma_tram as station_id,
            COUNT(*) as total_transactions,
            AVG(so_giao_dich) as avg_daily_transactions,
            MAX(thoi_gian) as last_activity
        FROM dw_ev_data 
        WHERE thoi_gian >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY ma_tram
        ORDER BY total_transactions DESC
        """

        cursor.execute(query)
        stations = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'data': stations,
            'total': len(stations)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report-service/predictions', methods=['GET', 'POST'])
def get_predictions():
    """Tạo dự đoán bằng AI thực sự"""
    try:
        if request.method == 'POST':
            data = request.json or []
            save_to_db = True
        else:
            conn = get_db_connection(DW_CONFIG)
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    ma_tram,
                    HOUR(thoi_gian) as gio_trong_ngay,
                    DAYOFWEEK(thoi_gian) as thu_trong_tuan,
                    COUNT(*) as so_giao_dich
                FROM dw_ev_data 
                WHERE thoi_gian >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY ma_tram, HOUR(thoi_gian), DAYOFWEEK(thoi_gian)
                ORDER BY ma_tram, thu_trong_tuan, gio_trong_ngay
            """)
            data = cursor.fetchall()
            cursor.close()
            conn.close()
            save_to_db = False

        stations_data = {}
        for record in data:
            stations_data.setdefault(record['ma_tram'], []).append(record)

        predictions = []
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

        for station_id, station_data in stations_data.items():
            analysis_result = analyze_with_ai(station_data)
            
            analysis_result['total_historical_transactions'] = sum(record['so_giao_dich'] for record in station_data)
            
            gemini_insight, recommendation = generate_ai_recommendation(
                station_id, analysis_result
            )

            # Chuyển đổi chất lượng dữ liệu sang tiếng Việt
            if len(station_data) > 15:
                data_quality_vi = "CAO"
            elif len(station_data) > 8:
                data_quality_vi = "TRUNG BÌNH"
            else:
                data_quality_vi = "THẤP"

            analysis_summary = (
                f"PHÂN TÍCH AI | {analysis_result['data_points']} bản ghi | "
                f"{len(analysis_result['peak_hours'])} giờ cao điểm | "
                f"Độ tin cậy: {analysis_result['confidence_score']*100:.1f}%"
            )

            station_prediction = {
                'ma_tram': station_id,
                'predict_date': tomorrow,
                'predict_hour': 0,
                'predicted_demand': analysis_result['predicted_demand'],
                'confidence_score': analysis_result['confidence_score'],
                'recommendation': recommendation,
                'gemini_insight': gemini_insight,
                'analysis_summary': analysis_summary,
                'growth_trend': analysis_result['growth_trend'],
                'peak_hours_count': len(analysis_result['peak_hours']),
                'data_quality': data_quality_vi,
                'total_historical_transactions': analysis_result['total_historical_transactions'],
                'ai_method': analysis_result.get('ai_method', 'KhôngXácĐịnh'),
                'hourly_predictions': analysis_result.get('hourly_predictions', [])
            }

            if save_to_db:
                save_prediction_to_db(station_prediction)

            predictions.append(station_prediction)

        return jsonify(predictions)
    except Exception as e:
        print("LỖI AI:", e)
        return jsonify({'error': str(e)}), 500

# ======================= MAIN =======================
if __name__ == '__main__':
    print("=== EV BATTERY AI API (REAL AI - FIXED) STARTED === nè")
    print("📍 Port: 8089")
    print("🔗 Health: http://localhost:8089/api/report-service/health")
    print("🧠 AI Status: http://localhost:8089/api/report-service/ai-status")
    print("🚀 Predictions: http://localhost:8089/api/report-service/predictions")
    print("📚 Features: Fixed AI, Better Error Handling, Improved Accuracy")
    app.run(host='0.0.0.0', port=8089, debug=True)