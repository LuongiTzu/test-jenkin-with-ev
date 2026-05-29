package ut.edu.batteryservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.edu.batteryservice.dtos.BatteryStatusDTO;
import ut.edu.batteryservice.services.IBatteryStatusService;

@RestController
@RequestMapping("/api/battery-service/status")
@CrossOrigin(origins = "*")
public class BatteryStatusController {

    @Autowired
    private IBatteryStatusService batteryStatusService;

    @GetMapping
    public ResponseEntity<BatteryStatusDTO> getBatteryStatusSummary(
            @RequestParam(required = false) Long tram
    ) {
        return ResponseEntity.ok(
                batteryStatusService.getBatteryStatusSummary(tram)
        );
    }
}
