import { useEffect } from "react";
import axios from "axios";
import MapLeaflet from "../../../components/Map/MapLeaflet";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faBatteryEmpty } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import Button from "../../../components/Shares/Button/Button";
import styles from "./FindStation.module.css";
function FindStation() {
    // 🔹 Bước 1: Khai báo state để lưu vị trí người dùng
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [error, setError] = useState(null);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lưu xe đã chọn
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [selectedPinType, setSelectedPinType] = useState(null);
    const [pinAvailableByStation, setPinAvailableByStation] = useState({});

    const [selectedStationId, setSelectedStationId] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState("");


    const [routeDetail, setRouteDetail] = useState(null);

    const fetchRouteDetail = async (stationId) => {
        if (!location.lat || !location.lng) return;

        try {
            const res = await axios.get("/api/station-service/route-detail", {
                params: {
                    originLat: location.lat,
                    originLng: location.lng,
                    stationId: stationId
                }
            });

            setRouteDetail(res.data); // ⭐ Lưu để đẩy xuống MapLeaflet
            console.log("📌 Route detail:", res.data);

        } catch (err) {
            console.error("Lỗi route-detail:", err);
        }
    };


    const fetchITSRealtime = async (lat, lng) => {
        try {
            const res = await axios.get("/api/station-service/realtime", {
                params: { originLat: lat, originLng: lng }
            });

            const data = res.data;

            // GHÉP DỮ LIỆU ITS VÀ DỮ LIỆU TRẠM CŨ
            const merged = data.map(item => {
                const { route, ...old } = stations.find(s => s.id === item.stationId) || {};

                return {
                    ...old,                           // giữ nguyên address, status, battery
                    id: item.stationId,
                    name: item.stationName,
                    lat: item.lat,
                    lng: item.lng,
                    time: Math.ceil(item.matrixSummary?.travelTimeInSeconds / 60) + " phút",
                    distance: (item.matrixSummary?.lengthInMeters / 1000).toFixed(2) + " km",
                    route: item.route,
                    score: item.score,
                    isBest: item.best || false,
                    flow: item.trafficFlow,
                    incidents: item.trafficIncidents,
                };
            });

            setStations(merged);

        } catch (err) {
            console.error("Lỗi ITS:", err);
        }
    };

    // 🔹 Bước 2: Hàm xử lý khi nhấn "Sử dụng vị trí của tôi"
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Trình duyệt của bạn không hỗ trợ định vị.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                console.log("📍 Vị trí hiện tại:", latitude, longitude);

                setRouteDetail(null);
                // getDistances(latitude, longitude, stations);
                fetchITSRealtime(latitude, longitude);

            },
            (err) => {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Bạn đã từ chối quyền truy cập vị trí.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Không thể xác định vị trí hiện tại.");
                        break;
                    case err.TIMEOUT:
                        setError("Yêu cầu lấy vị trí quá thời gian cho phép.");
                        break;
                    default:
                        setError("Lỗi không xác định.");
                }
            }
        );
    };

    const fetchVehicles = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!userId) return;

        // 1) Lấy thông tin tài xế dựa trên userId
        const taiXeRes = await axios.get(`/api/user-service/taixe/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const taiXe = taiXeRes.data;
        if (!taiXe || !taiXe.maTaiXe) {
            alert("❌ Tài khoản này chưa đăng ký tài xế!");
            return;
        }

        const maTaiXe = taiXe.maTaiXe;

        try {
            const vehicleRes = await axios.get(`/api/vehicle-service/vehicles/by-driver/${maTaiXe}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const rawVehicles = vehicleRes.data || [];

            const enrichedVehicles = await Promise.all(
                rawVehicles.map(async (v) => {
                    try {
                        const pinRes = await axios.get(`/api/battery-service/pins/${v.maPin}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        return { ...v, pinInfo: pinRes.data };
                    } catch {
                        return { ...v, pinInfo: { loaiPin: "Không rõ", dungLuong: "?" } };
                    }
                })
            );

            setVehicles(enrichedVehicles);
            console.log("🚗 Danh sách xe:", enrichedVehicles);
        } catch (err) {
            console.error("Lỗi tải danh sách xe:", err);
            setVehicles([]);
        }
    };

    useEffect(() => {
        if (!selectedVehicleId) return;

        const vehicle = vehicles.find(v => v.maPhuongTien === Number(selectedVehicleId));
        setSelectedPinType(vehicle?.pinInfo?.loaiPin || null);

    }, [selectedVehicleId, vehicles]);

    useEffect(() => {
        const fetchPinCounts = async () => {
            if (!selectedPinType || stations.length === 0) return;

            const token = localStorage.getItem("token");

            const promises = stations.map(st =>
                axios.get(
                    `/api/battery-service/lichsu-pin-tram/${st.id}/available`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { loaiPin: selectedPinType }
                    }
                ).then(res => ({ id: st.id, count: res.data.length }))
                    .catch(() => ({ id: st.id, count: 0 }))
            );

            const results = await Promise.all(promises);

            const mapping = {};
            results.forEach(r => { mapping[r.id] = r.count });

            setPinAvailableByStation(mapping);
        };

        fetchPinCounts();
    }, [selectedPinType, stations]);


    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await axios.get("/api/station-service/tram");
                const formatted = res.data.map((st, idx) => ({
                    id: st.maTram || idx,
                    name: st.tenTram,
                    address: st.diaChi,
                    lat: parseFloat(st.viDo),
                    lng: parseFloat(st.kinhDo),
                    status: st.trangThai,
                    battery: st.soLuongPinToiDa || 0,
                }));
                setStations(formatted);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải danh sách trạm:", err);
                setError("Không thể tải danh sách trạm");
                setLoading(false);
            }
        };

        fetchStations();
        fetchVehicles();
    }, []);
    if (loading) return <p>Đang tải dữ liệu trạm...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;


    // 🔹 Hàm xử lý khi người dùng bấm "Đặt chỗ"
    // 🔹 Hàm xử lý khi người dùng bấm "Đặt chỗ"
    const handleBooking = async (stationId) => {
        if (!selectedVehicleId) return alert("⚠️ Vui lòng chọn xe!");

        try {
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");

            if (!userId || !token) {
                alert("⚠️ Bạn chưa đăng nhập. Vui lòng đăng nhập lại!");
                return;
            }

            // 1️⃣ Lấy thông tin tài xế
            const taiXeRes = await axios.get(`/api/user-service/taixe/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const taiXe = taiXeRes.data;
            if (!taiXe || !taiXe.maTaiXe) {
                alert("❌ Tài khoản này chưa đăng ký tài xế!");
                return;
            }

            const maTaiXe = taiXe.maTaiXe;

            // 2️⃣ Lấy danh sách pin phù hợp ở TRẠM đang đặt
            if (!selectedPinType) {
                alert("⚠️ Không xác định được loại pin của xe, vui lòng chọn lại xe!");
                return;
            }

            const pinsRes = await axios.get(
                `/api/battery-service/lichsu-pin-tram/${stationId}/available`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { loaiPin: selectedPinType },
                }
            );

            const availablePins = pinsRes.data || [];

            if (availablePins.length === 0) {
                alert("❌ Trạm này hiện không còn pin phù hợp, vui lòng chọn trạm khác!");
                return;
            }

            // 3️⃣ Random 1 cục pin trong danh sách
            const randomIndex = Math.floor(Math.random() * availablePins.length);
            const randomPin = availablePins[randomIndex];
            const randomPinId = randomPin.maPin;

            console.log("🎲 Pin được chọn ngẫu nhiên:", randomPin);

            // 4️⃣ Giữ chỗ pin đó (đổi trạng thái)
            await axios.patch(
                `/api/battery-service/pins/${randomPinId}/state`,
                {
                    tinhTrang: "DAY",
                    trangThaiSoHuu: "DUOC_GIU_CHO",
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 5️⃣ Gửi yêu cầu đặt lịch (thêm maPinDuocGiu)
            const body = {
                maTaiXe: maTaiXe,
                maTram: Number(stationId),
                maXeGiaoDich: Number(selectedVehicleId),
                maPinDuocGiu: randomPinId, // 🔥 NEW
            };

            const response = await axios.post("/api/station-service/dat-lich", body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ Đặt lịch thành công!");
            console.log("Kết quả:", response.data);
        } catch (error) {
            console.error("❌ Lỗi khi đặt lịch:", error);
            alert(error.response?.data || error.message);
        }
    };

    const filteredStations = stations.filter(st =>
        st.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        st.address.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <nav className={styles.wrapper}>
            <div className={styles.nearstation}>
                <div className={styles.header}>
                    <h1>Trạm gần đây</h1>
                    <p>Tìm và đặt chỗ các trạm đổi pin</p>
                </div>

                <div className={styles.map}>
                    <MapLeaflet
                        userLocation={location}
                        stations={stations}
                        selectedStationId={selectedStationId}
                        routeDetail={routeDetail}
                        onStationSelect={(id) => fetchRouteDetail(id)}   // thêm nè
                    />
                </div>

                {/* Chọn xe giao dịch */}
                <div style={{ marginTop: "12px" }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Chọn xe để đổi pin:
                    </label>

                    <select
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "15px"
                        }}
                        value={selectedVehicleId || ""}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                        <option value="" disabled>-- Chọn xe --</option>
                        {vehicles.map(v => (
                            <option key={v.maPhuongTien} value={v.maPhuongTien}>
                                {v.loaiXe} | {v.bienSo} | 🔋 {v.pinInfo?.loaiPin}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🔹 Nút gọi hàm lấy vị trí */}
                <Button order onClick={handleGetLocation}>
                    Sử dụng vị trí của tôi
                </Button>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
            <div className={styles.alreadystation}>
                <div className={styles.header}>
                    <h1>Trạm có sẵn</h1>
                    <div className={styles.filter}>
                        <div className={styles.input}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.faMagnifyingGlass} />
                            <input
                                type="text"
                                placeholder="Tìm trạm"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filteredStations.map((stations) => (
                    <div key={stations.id}
                        className={styles.station}
                        onClick={() => {
                            setSelectedStationId(stations.id);
                            fetchRouteDetail(stations.id);
                        }}
                    >
                        <div className={styles.local}>
                            <h3>{stations.name}</h3>
                            <p
                                className={`${styles.state} ${styles[
                                    stations.status === "Hoạt động"
                                        ? "open"
                                        : stations.status === "Bảo trì"
                                            ? "maintenance"
                                            : "offline"
                                ]}`}
                            >
                                {stations.status}
                            </p>
                        </div>
                        <p className={styles.address}>{stations.address}</p>
                        <div className={styles.information}>
                            <div className={styles.iconinfo}>
                                <FontAwesomeIcon icon={faBatteryEmpty} className={styles.faBatteryEmpty} />

                                <p>
                                    {!selectedVehicleId
                                        ? `${stations.battery} pin`
                                        : `${pinAvailableByStation[stations.id] ?? '...'} pin phù hợp`
                                    }
                                </p>
                            </div>
                            <div className={styles.iconinfo}>
                                <FontAwesomeIcon icon={faClock} className={styles.faClock} />
                                <p>{stations.time}</p>
                            </div>
                            <div className={styles.iconinfo}>
                                <FontAwesomeIcon icon={faLocationDot} className={styles.faLocation} />
                                <p>{stations.distance}</p>
                            </div>
                            <div className={styles.iconinfo}>
                                {stations.isBest && (
                                    <p className={styles.bestTag}><FontAwesomeIcon icon={faStar} className={styles.faStar} /> Tối ưu nhất</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.price}>
                            <p>{stations.price}</p>

                            <Button
                                order
                                className={stations.status === "Bảo trì" || stations.status === "offline" ? styles.disabledButton : ""}
                                disabled={stations.status === "Bảo trì" || stations.status === "offline"}
                                onClick={() => {
                                    if (stations.status === "Bảo trì" || stations.status === "offline") {
                                        alert("🚫 Trạm đang bảo trì hoặc ngừng hoạt động, không thể đặt chỗ!");
                                        return;
                                    }
                                    handleBooking(stations.id);
                                }}
                            >
                                {stations.status === "Bảo trì" || stations.status === "offline"
                                    ? "Không khả dụng"
                                    : "Đặt chỗ"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </nav >
    )

}
export default FindStation