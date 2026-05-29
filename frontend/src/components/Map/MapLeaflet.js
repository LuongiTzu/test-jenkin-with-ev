import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const userIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [32, 32],
});

const stationIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
});

const incidentIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/caution.png",
  iconSize: [28, 28],
});

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (!coords || coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [coords]);
  return null;
}

function MapLeaflet({ userLocation, stations, selectedStationId, routeDetail, onStationSelect }) {

  const [baseRouteCoords, setBaseRouteCoords] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const markerRefs = useRef({});

  const [hideAltPopup, setHideAltPopup] = useState({});

  useEffect(() => {
    window.altClosePopup = (index) => {
      setHideAltPopup(prev => ({ ...prev, [index]: true }));
    };
  }, []);


  // decode TomTom
  const decodePolyline = (points) =>
    points.map((p) => [p.latitude, p.longitude]);

  // const handleStationClick = (st) => {
  //   if (!st.route?.routes?.length) return;

  //   const leg = st.route.routes[0].legs[0];
  //   const coords = decodePolyline(leg.points);

  //   setBaseRouteCoords(coords);
  //   setIncidents(st.incidents?.incidents || []);
  // };
  const handleStationClick = (st) => {
    if (onStationSelect) {
      onStationSelect(st.id); // gọi API lấy routeDetail
    }

    // mở popup như cũ
    const marker = markerRefs.current[st.id];
    if (marker) marker.openPopup();
  };

  // auto chọn trạm từ danh sách
  useEffect(() => {
    if (!selectedStationId) return;

    const st = stations.find((s) => s.id === selectedStationId);
    if (st) {
      handleStationClick(st);

      const marker = markerRefs.current[st.id];
      if (marker) marker.openPopup();
    }
  }, [selectedStationId, stations]);

  if (!userLocation.lat) {
    return <p>Chưa có vị trí hiện tại</p>;
  }

  let finalCoords = [];

  // 1️⃣ Tuyến chính từ routeDetail
  if (routeDetail?.route?.routes?.[0]?.legs?.[0]?.points) {
    finalCoords = decodePolyline(routeDetail.route.routes[0].legs[0].points);
  }
  // 2️⃣ Nếu không có thì dùng route từ trạm
  else {
    finalCoords = baseRouteCoords || [];
  }


  // 3️⃣ Gộp cả tuyến thay thế để FitBounds
  if (routeDetail?.alternatives?.length > 0) {
    routeDetail.alternatives.forEach((alt) => {
      if (alt.points) {
        const altCoords = alt.points.map(p => [p.latitude, p.longitude]);
        finalCoords = [...finalCoords, ...altCoords];
      }
    });
  }



  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: "350px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {Array.isArray(finalCoords) && finalCoords.length > 0 && (
        <FitBounds coords={finalCoords} />
      )}


      {/* Marker người dùng */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>Bạn đang ở đây</Popup>
      </Marker>



      {/* Marker các trạm */}
      {stations.map((st) => (
        <Marker
          key={st.id}
          position={[st.lat, st.lng]}
          icon={stationIcon}
          ref={(el) => (markerRefs.current[st.id] = el)}
          eventHandlers={{
            click: () => handleStationClick(st),
          }}
        >
          <Popup>
            <strong>{st.name}</strong>
            <br />
            🚗 {st.distance}
            <br />
            ⏱ {st.time}
          </Popup>
        </Marker>
      ))}

      {/* Route nhiều màu — lấy từ routeDetail */}
      {routeDetail?.coloredSegments?.length > 0 &&
        routeDetail.coloredSegments.map((seg, idx) => (
          <Polyline
            key={idx}
            positions={[
              [seg.startLat, seg.startLng],
              [seg.endLat, seg.endLng],
            ]}
            color={seg.color}
            weight={4}                 // nhỏ hơn đường chính
            opacity={0.9}
            lineCap="round"            // để nối mép mượt
            lineJoin="round"           // tránh gãy khúc
          />
        ))
      }

      {/* 🟦 Tuyến đường thay thế (Alternative Routes) + Popup */}
      {routeDetail?.alternatives?.length > 0 &&
        routeDetail.alternatives.map((alt, idx) => {
          const coords = alt.points?.map(p => [p.latitude, p.longitude]);
          if (!coords) return null;

          const colors = ["#888", "#AA44FF"];
          const color = colors[idx] || "#888";

          const midIndex = Math.floor(coords.length / 2);
          const midPoint = coords[midIndex];

          return (
            <React.Fragment key={"alt-" + idx}>
              <Polyline
                positions={coords}
                color={color}
                weight={5}
                opacity={0.75}
                dashArray="8 8"
              />

              {/* Popup chỉ hiện nếu chưa bị đóng */}
              {!hideAltPopup[idx] && (
                <Marker
                  position={midPoint}
                  icon={L.divIcon({
                    html: `
                <div style="
                    background:white;
                    padding:4px 6px;
                    border-radius:6px;
                    border:1px solid #ccc;
                    font-size:11px;
                    box-shadow:0 2px 6px rgba(0,0,0,0.2);
                    white-space:nowrap;
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                ">
                  🔄 PA ${idx + 1}: ${Math.ceil(alt.time / 60)} phút - ${(alt.distance / 1000).toFixed(1)} km
                  
                  <button 
                    onclick="window.altClosePopup(${idx})"
                    style="
                      border:none;
                      background:none;
                      font-weight:bold;
                      cursor:pointer;
                      margin-left:4px;
                      font-size:12px;
                    "
                  >✕</button>
                </div>
              `,
                    className: "alt-popup",
                  })}
                />
              )}
            </React.Fragment>
          );
        })
      }


      {/* Nếu chưa có coloredSegments -> vẽ route đơn màu */}
      {routeDetail?.route?.routes?.[0]?.legs?.[0]?.points && (
        <Polyline
          positions={routeDetail.route.routes[0].legs[0].points.map(p => [p.latitude, p.longitude])}
          color="blue"
          weight={6}
          opacity={0.85}
        />
      )}

      {/* Incidents */}
      {(() => {
        const incidentList =
          routeDetail?.incidents?.incidents ||
          routeDetail?.incidents ||
          incidents ||
          [];

        return Array.isArray(incidentList)
          ? incidentList.map((inc, index) =>
            inc.geometry?.coordinates?.length > 0 ? (
              <Marker
                key={index}
                position={[
                  inc.geometry.coordinates[0][1],
                  inc.geometry.coordinates[0][0],
                ]}
                icon={incidentIcon}
              >
                <Popup>⚠ Sự cố giao thông gần khu vực này</Popup>
              </Marker>
            ) : null
          )
          : null;
      })()}
    </MapContainer>
  );
}

export default MapLeaflet;