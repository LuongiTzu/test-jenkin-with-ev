package ut.edu.batteryservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.edu.batteryservice.dtos.BatterySummaryDTO;
import ut.edu.batteryservice.services.IBatterySummaryService;

@RestController
@RequestMapping("/api/battery-service/summary")
public class BatterySummaryController {

    @Autowired
    private IBatterySummaryService batterySummaryService;

    @GetMapping
    public ResponseEntity<BatterySummaryDTO> getBatterySummary() {
        BatterySummaryDTO summary = batterySummaryService.getBatterySummary();
        return ResponseEntity.ok(summary);
    }
}
