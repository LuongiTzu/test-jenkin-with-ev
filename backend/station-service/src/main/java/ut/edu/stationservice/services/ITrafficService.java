package ut.edu.stationservice.services;

import java.util.List;
import java.util.Map;

public interface ITrafficService {
    List<Map<String, Object>> getTravelTimesForAllStations(double originLat, double originLng);
    Map<String, Object> getRouteDetail(double originLat, double originLng, long stationId);
}
