package ut.edu.batteryservice.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ut.edu.batteryservice.models.LichSuPinTram;
import ut.edu.batteryservice.models.Pin;
import ut.edu.batteryservice.repositories.ILichSuPinTramRepository;

import java.util.List;

@Service
public class LichSuPinTramService implements ILichSuPinTramService {

    @Autowired
    private ILichSuPinTramRepository lichSuPinTramRepository;

    @Override
    public List<LichSuPinTram> findAll() {
        return lichSuPinTramRepository.findAll();
    }

    @Override
    public LichSuPinTram findById(Long id) {
        return lichSuPinTramRepository.findById(id).orElse(null);
    }

    @Transactional
    @Override
    public LichSuPinTram save(LichSuPinTram lichSuPinTram) {
        return lichSuPinTramRepository.save(lichSuPinTram);
    }

    @Transactional
    @Override
    public boolean deleteById(Long id) {
        if (!lichSuPinTramRepository.existsById(id)) {
            return false;
        }
        lichSuPinTramRepository.deleteById(id);
        return true;
    }

    @Transactional
    @Override
    public LichSuPinTram addLichSuPinTram(LichSuPinTram lichSuPinTram) {
        // có thể thêm logic kiểm tra trùng hoặc validate tại đây nếu cần
        return lichSuPinTramRepository.save(lichSuPinTram);
    }

    @Override
    public List<Pin> getAvailablePins(Long maTram, String loaiPin) {
        return lichSuPinTramRepository.findAvailablePinsByTramAndLoai(maTram, loaiPin);
    }
}
