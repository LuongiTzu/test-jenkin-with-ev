package ut.edu.batteryservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ut.edu.batteryservice.dtos.BatterySummaryDTO;
import ut.edu.batteryservice.models.Pin;
import ut.edu.batteryservice.repositories.IPinRepository;

import java.util.List;

@Service
public class BatterySummaryService implements IBatterySummaryService {

    @Autowired
    private IPinRepository pinRepository;

    @Override
    public BatterySummaryDTO getBatterySummary() {
        List<Pin> pins = pinRepository.findAll();

        long total = pins.size();
        long healthy = pins.stream().filter(p -> p.getSucKhoe() != null && p.getSucKhoe() > 90).count();
        long degraded = pins.stream().filter(p -> p.getSucKhoe() != null && p.getSucKhoe() >= 70 && p.getSucKhoe() <= 90).count();
        long critical = pins.stream().filter(p -> p.getSucKhoe() != null && p.getSucKhoe() < 70).count();

        return new BatterySummaryDTO(total, healthy, degraded, critical);
    }
}
