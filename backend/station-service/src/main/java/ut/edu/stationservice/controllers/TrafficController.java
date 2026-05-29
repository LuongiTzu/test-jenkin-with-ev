package ut.edu.stationservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ut.edu.stationservice.services.ITrafficService;

@RestController
@RequestMapping("/api/station-service")
public class TrafficController {

    @Autowired
    private ITrafficService trafficService;

    // Lấy danh sách 5 trạm + scoring ITS
    @GetMapping("/realtime")
    public Object getAllRealtime(
            @RequestParam double originLat,
            @RequestParam double originLng
    ) {
        return trafficService.getTravelTimesForAllStations(originLat, originLng);
    }

    // Lấy route + multi-color + incidents cho từng trạm
    @GetMapping("/route-detail")
    public Object getRouteDetail(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam long stationId
    ) {
        return trafficService.getRouteDetail(originLat, originLng, stationId);
    }
}