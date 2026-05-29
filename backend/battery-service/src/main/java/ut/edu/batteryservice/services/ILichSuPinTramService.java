package ut.edu.batteryservice.services;

import ut.edu.batteryservice.models.LichSuPinTram;
import ut.edu.batteryservice.models.Pin;

import java.util.List;

public interface ILichSuPinTramService {
    List<LichSuPinTram> findAll();
    LichSuPinTram findById(Long id);
    LichSuPinTram save(LichSuPinTram lichSuPinTram);
    boolean deleteById(Long id);
    LichSuPinTram addLichSuPinTram(LichSuPinTram lichSuPinTram);
    List<Pin> getAvailablePins(Long maTram, String loaiPin);
}
