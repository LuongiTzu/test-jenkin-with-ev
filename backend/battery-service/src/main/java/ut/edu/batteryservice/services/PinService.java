package ut.edu.batteryservice.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ut.edu.batteryservice.models.Pin;
import ut.edu.batteryservice.repositories.IPinRepository;

import java.util.List;

@Service
public class PinService implements IPinService {

    @Autowired
    private IPinRepository pinRepository;

    @Override
    public List<Pin> getAllPinTypes() {
        return pinRepository.findAll();
    }

    @Override
    public Pin getPinTypeById(Long id) {
        return pinRepository.findById(id).orElse(null);
    }

    @Transactional
    @Override
    public Pin createPinType(Pin pin) {
        // ❌ Không còn validate rule nào
        return pinRepository.save(pin);
    }

    @Transactional
    @Override
    public Pin updatePinType(Long id, Pin pin) {
        return pinRepository.findById(id).map(existing -> {
            // ❌ Không gọi validatePinState nữa
            existing.setLoaiPin(pin.getLoaiPin());
            existing.setDungLuong(pin.getDungLuong());
            existing.setTinhTrang(pin.getTinhTrang());
            existing.setTrangThaiSoHuu(pin.getTrangThaiSoHuu());
            existing.setSucKhoe(pin.getSucKhoe());
            existing.setNgayBaoDuongGanNhat(pin.getNgayBaoDuongGanNhat());
            existing.setNgayNhapKho(pin.getNgayNhapKho());
            return pinRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy Pin cần cập nhật!"));
    }

    @Override
    @Transactional
    public Pin updatePinState(Long id, String tinhTrang, String trangThaiSoHuu) {
        return pinRepository.findById(id)
                .map(pin -> {

                    // Cập nhật tinhTrang nếu có
                    if (tinhTrang != null) {
                        try {
                            Pin.TinhTrang tt = Pin.TinhTrang.valueOf(tinhTrang);
                            pin.setTinhTrang(tt);
                        } catch (IllegalArgumentException e) {
                            throw new RuntimeException("Tinh trạng không hợp lệ!");
                        }
                    }

                    // Cập nhật trạng thái sở hữu nếu có
                    if (trangThaiSoHuu != null) {
                        try {
                            Pin.TrangThaiSoHuu ts = Pin.TrangThaiSoHuu.valueOf(trangThaiSoHuu);
                            pin.setTrangThaiSoHuu(ts);
                        } catch (IllegalArgumentException e) {
                            throw new RuntimeException("Trạng thái sở hữu không hợp lệ!");
                        }
                    }

                    return pinRepository.save(pin);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy pin!"));
    }



    @Transactional
    @Override
    public boolean deletePinType(Long id) {
        if (!pinRepository.existsById(id)) {
            return false;
        }
        pinRepository.deleteById(id);
        return true;
    }

    @Transactional
    @Override
    public Pin addPin(Pin pin) {
        // ❌ Không validate
        return pinRepository.save(pin);
    }
}
