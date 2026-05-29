package ut.edu.batteryservice.services;

import ut.edu.batteryservice.dtos.BatteryStatusDTO;

public interface IBatteryStatusService {

    // Cho phép truyền vào tramId (nullable)
    BatteryStatusDTO getBatteryStatusSummary(Long tramId);
}
