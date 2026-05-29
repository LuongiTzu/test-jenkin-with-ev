package ut.edu.stationservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ut.edu.stationservice.models.Tram;
import ut.edu.stationservice.repositories.ITramRepository;

import java.util.*;

@Service
public class TrafficService implements ITrafficService {

    @Value("${tomtom.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ITramRepository tramRepository;

    // 🟦 Haversine (km)
    private static final double EARTH_RADIUS = 6371.0;

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.pow(Math.sin(dLon / 2), 2)
                * Math.cos(lat1) * Math.cos(lat2);

        return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a));
    }

    // khoảng cách từ 1 điểm tới 1 đoạn thẳng (trên mặt cầu, nhưng xài gần đúng là được)
    private double pointToSegmentDistance(
            double lat, double lng,
            double lat1, double lng1,
            double lat2, double lng2
    ) {
        double A = lat - lat1;
        double B = lng - lng1;
        double C = lat2 - lat1;
        double D = lng2 - lng1;

        double dot = A * C + B * D;
        double lenSq = C * C + D * D;
        double param = lenSq == 0 ? -1 : (dot / lenSq);

        double xx, yy;

        if (param < 0 || lenSq == 0) {
            xx = lat1;
            yy = lng1;
        } else if (param > 1) {
            xx = lat2;
            yy = lng2;
        } else {
            xx = lat1 + param * C;
            yy = lng1 + param * D;
        }

        return haversine(lat, lng, xx, yy); // km
    }

    // ===================== TRAFFIC FLOW =====================
    // Lấy mức độ kẹt xe tại 1 điểm
    private Map<String, Object> getTrafficFlow(double lat, double lng) {
        String url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
                + "?point=" + lat + "," + lng
                + "&key=" + apiKey;

        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();
    }

    // incident này có nằm “gần” tuyến đường không?
    @SuppressWarnings("unchecked")
    private boolean isIncidentOnRoute(Map<String, Object> incident, List<Map<String, Object>> routePoints) {

        if (routePoints == null || routePoints.size() < 2) return false;

        // TomTom incidents v5: geometry.coordinates[0] = [lon, lat]
        Map<String, Object> geometry = (Map<String, Object>) incident.get("geometry");
        if (geometry == null) return false;

        Object coordsObj = geometry.get("coordinates");
        if (!(coordsObj instanceof List<?> coordsList) || coordsList.isEmpty()) return false;

        Object firstPointObj = coordsList.get(0);
        if (!(firstPointObj instanceof List<?> posList) || posList.size() < 2) return false;

        double lng = ((Number) posList.get(0)).doubleValue();
        double lat = ((Number) posList.get(1)).doubleValue();

        // duyệt từng đoạn trên polyline
        for (int i = 0; i < routePoints.size() - 1; i++) {
            Map<String, Object> p1 = routePoints.get(i);
            Map<String, Object> p2 = routePoints.get(i + 1);

            double lat1 = ((Number) p1.get("latitude")).doubleValue();
            double lng1 = ((Number) p1.get("longitude")).doubleValue();
            double lat2 = ((Number) p2.get("latitude")).doubleValue();
            double lng2 = ((Number) p2.get("longitude")).doubleValue();

            double d = pointToSegmentDistance(lat, lng, lat1, lng1, lat2, lng2);

            if (d <= 0.05) { // <= 50m
                return true;
            }
        }
        return false;
    }

    // ===================== INCIDENTS =====================
    // Lấy danh sách tai nạn / sửa đường / cấm đường quanh 1 khu vực nhỏ
    private Map<String, Object> getTrafficIncidents(double lat, double lng) {

        double delta = 0.01; // ~1km bán kính
        double minLat = lat - delta;
        double maxLat = lat + delta;
        double minLng = lng - delta;
        double maxLng = lng + delta;

        String url = "https://api.tomtom.com/traffic/services/5/incidentDetails"
                + "?bbox=" + minLng + "," + minLat + "," + maxLng + "," + maxLat
                + "&key=" + apiKey;

        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();
    }

    // ===================== MATRIX ROUTING (LEVEL 3) =====================
    /**
     * Gọi Matrix Routing API: 1 origin (người dùng) → N destinations (các trạm).
     * Trả về map: stationId -> { travelTimeInSeconds, lengthInMeters }
     */
    @SuppressWarnings("unchecked")
    private Map<Long, Map<String, Object>> getMatrixSummaries(
            double originLat,
            double originLng,
            List<Tram> stations
    ) {

        if (stations.isEmpty()) return Collections.emptyMap();

        String url = "https://api.tomtom.com/routing/matrix/2"
                + "?key=" + apiKey; // v2 không dùng &traffic=true, traffic nằm trong options

        // ====== BODY THEO MATRIX V2 ======
        Map<String, Object> body = new HashMap<>();

        // 1 origin = vị trí hiện tại
        Map<String, Object> originPoint = new HashMap<>();
        originPoint.put("latitude", originLat);
        originPoint.put("longitude", originLng);

        Map<String, Object> originWrapper = new HashMap<>();
        originWrapper.put("point", originPoint);

        body.put("origins", List.of(originWrapper));

        // Destinations = các trạm
        List<Map<String, Object>> destinations = new ArrayList<>();
        for (Tram st : stations) {
            Map<String, Object> pt = new HashMap<>();
            pt.put("latitude", st.getViDo());
            pt.put("longitude", st.getKinhDo());

            Map<String, Object> wrapper = new HashMap<>();
            wrapper.put("point", pt);

            destinations.add(wrapper);
        }
        body.put("destinations", destinations);

        // options: dùng live traffic + departAt=now
        Map<String, Object> options = new HashMap<>();
        options.put("traffic", "live");   // hoặc "historical"
        options.put("departAt", "now");   // hợp lệ với traffic=live
        body.put("options", options);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body);

        Map<String, Object> matrixResponse = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();

        Map<Long, Map<String, Object>> result = new HashMap<>();
        if (matrixResponse == null) return result;

        // ====== V2: PARSE "data" CHỨ KHÔNG PHẢI "matrix" ======
        Object dataObj = matrixResponse.get("data");
        if (!(dataObj instanceof List<?> dataList)) {
            return result;
        }

        // Với 1 origin, mỗi phần tử trong data tương ứng 1 destination (theo index)
        for (Object entryObj : dataList) {
            if (!(entryObj instanceof Map<?, ?> entryRaw)) continue;

            Map<String, Object> entry = (Map<String, Object>) entryRaw;

            // destinationIndex = index trong danh sách stations
            Object destIdxObj = entry.get("destinationIndex");
            if (!(destIdxObj instanceof Number destIdxNumber)) continue;

            int destIndex = destIdxNumber.intValue();
            if (destIndex < 0 || destIndex >= stations.size()) continue;

            Object routeSummaryObj = entry.get("routeSummary");
            if (!(routeSummaryObj instanceof Map<?, ?> routeSummaryRaw)) continue;

            Map<String, Object> routeSummary = (Map<String, Object>) routeSummaryRaw;

            Number travelTimeSec = (Number) routeSummary.getOrDefault("travelTimeInSeconds", 0);
            Number lengthMeters = (Number) routeSummary.getOrDefault("lengthInMeters", 0);

            Map<String, Object> summary = new HashMap<>();
            summary.put("travelTimeInSeconds", travelTimeSec.doubleValue());
            summary.put("lengthInMeters", lengthMeters.doubleValue());

            Tram st = stations.get(destIndex);
            result.put(st.getMaTram(), summary);
        }

        return result;
    }

    // ===================== SCORING ITS LEVEL 3 =====================
    /**
     * Tính điểm ITS cho một trạm dựa trên:
     *  - Thời gian di chuyển (phút)
     *  - Quãng đường (km)
     *  - Số vụ incident NẰM TRÊN TUYẾN ĐƯỜNG
     * Score càng thấp càng tốt.
     */
    @SuppressWarnings("unchecked")
    private double computeScore(
            Map<String, Object> matrixSummary,
            Map<String, Object> incidentData,
            List<Map<String, Object>> routePoints
    ) {
        if (matrixSummary == null) return Double.MAX_VALUE;

        double travelTimeSec = ((Number) matrixSummary
                .getOrDefault("travelTimeInSeconds", 0)).doubleValue();
        double lengthMeters = ((Number) matrixSummary
                .getOrDefault("lengthInMeters", 0)).doubleValue();

        double timeMinutes = travelTimeSec / 60.0;
        double distanceKm = lengthMeters / 1000.0;

        int incidentOnRoute = 0;

        if (incidentData != null && routePoints != null && routePoints.size() >= 2) {
            Object incidentsObj = incidentData.get("incidents");
            if (incidentsObj instanceof List<?> list) {
                for (Object obj : list) {
                    Map<String, Object> incident = (Map<String, Object>) obj;

                    if (isIncidentOnRoute(incident, routePoints)) {
                        incidentOnRoute++;  // chỉ cộng khi đúng trên tuyến đường
                    }
                }
            }
        }

        return timeMinutes * 0.7
                + distanceKm * 0.2
                + incidentOnRoute * 5.0;  // chỉ cộng cho incident trên route
    }

    // ===================== MAIN LOGIC =====================
    @Override
    public List<Map<String, Object>> getTravelTimesForAllStations(double originLat, double originLng) {

        List<Tram> stations = tramRepository.findAll();

        // 1. Sắp xếp theo khoảng cách đường chim bay
        stations.sort(Comparator.comparingDouble(
                st -> haversine(originLat, originLng, st.getViDo(), st.getKinhDo())
        ));

        // 2. Chỉ lấy 5 trạm gần nhất VÀ đang hoạt động
        List<Tram> nearestStations = stations.stream()
                .filter(st -> {
                    String s = st.getTrangThai();
                    return s != null && s.equalsIgnoreCase("Hoạt động");
                })
                .limit(5)
                .toList();


        if (nearestStations.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Gọi Matrix Routing API cho 5 trạm (ITS Level 3)
        Map<Long, Map<String, Object>> matrixSummaries =
                getMatrixSummaries(originLat, originLng, nearestStations);

        List<Map<String, Object>> results = new ArrayList<>();

        // 4. Với từng trạm: lấy route chi tiết + flow + incidents + score
        for (Tram st : nearestStations) {

            Map<String, Object> item = new HashMap<>();
            // ---------- ROUTE CHI TIẾT (draw trên map) ----------
            String routeUrl =
                    "https://api.tomtom.com/routing/1/calculateRoute/"
                            + originLat + "," + originLng + ":"
                            + st.getViDo() + "," + st.getKinhDo()
                            + "/json"
                            + "?key=" + apiKey
                            + "&traffic=true";

            Map<String, Object> routeData = restTemplate.exchange(
                    routeUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            ).getBody();

            // Lấy polyline points từ routeData: routes[0].legs[0].points
            List<Map<String, Object>> routePoints = Collections.emptyList();
            if (routeData != null) {
                Object routesObj = routeData.get("routes");
                if (routesObj instanceof List<?> routesList && !routesList.isEmpty()) {
                    Map<String, Object> route0 = (Map<String, Object>) routesList.get(0);
                    Object legsObj = route0.get("legs");
                    if (legsObj instanceof List<?> legsList && !legsList.isEmpty()) {
                        Map<String, Object> leg0 = (Map<String, Object>) legsList.get(0);
                        Object pointsObj = leg0.get("points");
                        if (pointsObj instanceof List<?> pts && !pts.isEmpty()) {
                            routePoints = (List<Map<String, Object>>) (List<?>) pts;
                        }
                    }
                }
            }

            // ---------- FLOW (kẹt xe) ----------
            Map<String, Object> flowData = getTrafficFlow(st.getViDo(), st.getKinhDo());

            // ---------- INCIDENTS (tai nạn / sửa đường) ----------
            Map<String, Object> incidentData = getTrafficIncidents(st.getViDo(), st.getKinhDo());

            // ---------- MATRIX SUMMARY ----------
            Map<String, Object> matrixSummary = matrixSummaries.get(st.getMaTram());

            // ---------- SCORE ITS ----------
            double score = computeScore(matrixSummary, incidentData, routePoints);

            // ---------- GOM TẤT CẢ LẠI ----------
            item.put("stationId", st.getMaTram());
            item.put("stationName", st.getTenTram());
            item.put("lat", st.getViDo());
            item.put("lng", st.getKinhDo());
            item.put("route", routeData);
            item.put("trafficFlow", flowData);
            item.put("trafficIncidents", incidentData);
            item.put("matrixSummary", matrixSummary);
            item.put("score", score);

            results.add(item);
        }

        // 5. Sắp xếp theo score (trạm tốt nhất lên đầu)
        results.sort(Comparator.comparingDouble(
                item -> ((Number) item.get("score")).doubleValue()
        ));

        // 6. Gắn cờ trạm tối ưu nhất
        if (!results.isEmpty()) {
            results.get(0).put("best", true);
        }

        return results;
    }


    @Override
    public Map<String, Object> getRouteDetail(double originLat, double originLng, long stationId) {

        Tram st = tramRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        // ===================== 1. Lấy ROUTE =====================
        String routeUrl =
                "https://api.tomtom.com/routing/1/calculateRoute/"
                        + originLat + "," + originLng + ":"
                        + st.getViDo() + "," + st.getKinhDo()
                        + "/json"
                        + "?key=" + apiKey
                        + "&traffic=true"
                        + "&maxAlternatives=2"
                        + "&computeTravelTimeFor=all";


        Map<String, Object> routeData = restTemplate.exchange(
                routeUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();

        // Extract polyline points
        List<Map<String, Object>> points = new ArrayList<>();
        if (routeData != null) {
            Object routesObj = routeData.get("routes");
            if (routesObj instanceof List<?> list && !list.isEmpty()) {
                Map<String, Object> route0 = (Map<String, Object>) list.get(0);
                Object legsObj = route0.get("legs");
                if (legsObj instanceof List<?> legs && !legs.isEmpty()) {
                    Map<String, Object> leg0 = (Map<String, Object>) legs.get(0);
                    Object pts = leg0.get("points");
                    if (pts instanceof List<?> pList) {
                        points = (List<Map<String, Object>>) pts;
                    }
                }
            }
        }

        // ===================== 2. Sampling 15 điểm =====================
        int sampleCount = Math.min(9, points.size());
        List<Map<String, Object>> sampled = new ArrayList<>();

        for (int i = 0; i < sampleCount; i++) {
            int idx = (int) Math.round((double) i / (sampleCount - 1) * (points.size() - 1));
            sampled.add(points.get(idx));
        }

// ===================== 3. Gọi Flow API 15 lần =====================
        List<Double> trafficRatios = new ArrayList<>();

        for (Map<String, Object> p : sampled) {
            double lat = ((Number) p.get("latitude")).doubleValue();
            double lng = ((Number) p.get("longitude")).doubleValue();

            Map<String, Object> flow = getTrafficFlow(lat, lng);

            double ratio = 1.0;

            if (flow != null) {
                Map<String, Object> fsData =
                        (Map<String, Object>) flow.get("flowSegmentData");

                if (fsData != null) {
                    double current = ((Number) fsData.getOrDefault("currentSpeed", 1)).doubleValue();
                    double free = ((Number) fsData.getOrDefault("freeFlowSpeed", 1)).doubleValue();

                    ratio = (free > 0) ? current / free : 1.0;
                }
            }

            trafficRatios.add(ratio);
        }

        // ===================== 4. Ghép lại thành coloredSegments =====================
        List<Map<String, Object>> coloredSegments = new ArrayList<>();

        for (int i = 0; i < sampleCount - 1; i++) {
            Map<String, Object> p1 = sampled.get(i);
            Map<String, Object> p2 = sampled.get(i + 1);

            double ratio = trafficRatios.get(i);
            String color;

            if (ratio < 0.4) color = "red";
            else if (ratio < 0.7) color = "orange";
            else color = "green";

            Map<String, Object> seg = new HashMap<>();
            seg.put("startLat", p1.get("latitude"));
            seg.put("startLng", p1.get("longitude"));
            seg.put("endLat", p2.get("latitude"));
            seg.put("endLng", p2.get("longitude"));
            seg.put("color", color);

            coloredSegments.add(seg);
        }

        // ===================== 5. Lấy incidents quanh trạm (không tốn nhiều) =====================
        Map<String, Object> incidents =
                getTrafficIncidents(st.getViDo(), st.getKinhDo());

        // ===================== 6. Trả về JSON cho FE =====================
        Map<String, Object> result = new HashMap<>();
        result.put("stationId", stationId);
        result.put("stationName", st.getTenTram());
        result.put("lat", st.getViDo());
        result.put("lng", st.getKinhDo());
        result.put("coloredSegments", coloredSegments);
        result.put("incidents", incidents);
        result.put("route", routeData);

        // ===================== 7. Lấy các tuyến đường thay thế =====================
        List<Map<String,Object>> alternatives = new ArrayList<>();

        Object routesObj = routeData.get("routes");
        if (routesObj instanceof List<?> routes && routes.size() > 1) {

            // Bắt đầu từ index 1 vì index 0 là route chính
            for (int i = 1; i < routes.size(); i++) {

                Map<String, Object> r = (Map<String, Object>) routes.get(i);
                Map<String, Object> alt = new HashMap<>();

                // summary
                Map<String,Object> summary = (Map<String,Object>) r.get("summary");
                alt.put("time", summary.get("travelTimeInSeconds"));
                alt.put("distance", summary.get("lengthInMeters"));

                // polyline points: routes[i].legs[0].points
                Object legsObj = r.get("legs");
                if (legsObj instanceof List<?> legs && !legs.isEmpty()) {
                    Map<String,Object> leg0 = (Map<String,Object>) legs.get(0);
                    Object pts = leg0.get("points");

                    if (pts instanceof List<?> ptsList) {
                        alt.put("points", ptsList);
                    }
                }

                alternatives.add(alt);
            }
        }

        result.put("alternatives", alternatives);


        return result;
    }
}