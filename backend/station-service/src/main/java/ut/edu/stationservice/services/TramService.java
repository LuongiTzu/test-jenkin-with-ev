package ut.edu.stationservice.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import ut.edu.stationservice.models.Tram;
import ut.edu.stationservice.repositories.ITramRepository;

@Service
public class TramService implements ITramService {

    @Autowired
    private ITramRepository tramRepository;

    @Transactional
    @Override
    public Tram addPin(Tram tram) {
        // Kiểm tra trùng tên trạm
        if (tramRepository.existsByTenTram(tram.getTenTram())) {
            throw new RuntimeException("Tên trạm đã tồn tại!");
        }
        return tramRepository.save(tram);
    }

    @Transactional
    @Override
    public Tram updatePin(Tram tram) {
        return tramRepository.findById(tram.getMaTram())
                .map(existing -> {
                    if (!existing.getTenTram().equals(tram.getTenTram())
                            && tramRepository.existsByTenTram(tram.getTenTram())) {
                        throw new RuntimeException("Tên trạm đã được sử dụng!");
                    }

                    existing.setTenTram(tram.getTenTram());
                    existing.setDiaChi(tram.getDiaChi());
                    existing.setKinhDo(tram.getKinhDo());
                    existing.setViDo(tram.getViDo());
                    existing.setSoLuongPinToiDa(tram.getSoLuongPinToiDa());
                    existing.setSoDT(tram.getSoDT());
                    existing.setTrangThai(tram.getTrangThai());
                    return tramRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm!"));
    }

    @Override
    public boolean deleteById(Long id) {
        if (!tramRepository.existsById(id)) return false;
        tramRepository.deleteById(id);
        return true;
    }

    @Override
    public List<Tram> findByTramId(Long tramId) {
        // Nếu cần tìm theo mã trạm — có thể thêm query custom sau
        return tramRepository.findAll();
    }

    @Override
    public Tram findById(Long id) {
        return tramRepository.findById(id).orElse(null);
    }

    @Transactional
    @Override
    public Tram save(Tram tram) {
        return tramRepository.save(tram);
    }

    @Override
    public List<Tram> addNhieuTram(List<Tram> dsTram) {
        return tramRepository.saveAll(dsTram);
    }
}
