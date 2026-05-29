package ngocvct0133.ut.edu.transactionservice.services;

import ngocvct0133.ut.edu.transactionservice.modules.GiaoDichDoiPin;
import ngocvct0133.ut.edu.transactionservice.repositories.IGiaoDichDoiPinRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GiaoDichDoiPinService implements IGiaoDichDoiPinService {

    private final IGiaoDichDoiPinRepository giaoDichDoiPinRepository;

    public GiaoDichDoiPinService(IGiaoDichDoiPinRepository giaoDichDoiPinRepository) {
        this.giaoDichDoiPinRepository = giaoDichDoiPinRepository;
    }

    @Override
    public GiaoDichDoiPin themGiaoDichDoiPin(GiaoDichDoiPin doiPin) {
        return giaoDichDoiPinRepository.save(doiPin);
    }

    @Override
    public List<GiaoDichDoiPin> danhSachGiaoDichDoiPin() {
        return giaoDichDoiPinRepository.findAll();
    }

    @Override
    public GiaoDichDoiPin layGiaoDichDoiPinTheoId(Long id) {
        return giaoDichDoiPinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GiaoDichDoiPin not found with id: " + id));
    }

    @Override
    public boolean xoaGiaoDichDoiPinTheoId(Long id) {
        if (!giaoDichDoiPinRepository.existsById(id)) {
            return false;
        }
        giaoDichDoiPinRepository.deleteById(id);
        return true;
    }

    @Override
    public GiaoDichDoiPin suaGiaoDichDoiPinTheoId(Long id, GiaoDichDoiPin giaoDichDoiPin) {
        GiaoDichDoiPin suaGiaoDich = giaoDichDoiPinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GiaoDichDoiPin not found with id: " + id));

        suaGiaoDich.setTrangThaiGiaoDich(giaoDichDoiPin.getTrangThaiGiaoDich());
        suaGiaoDich.setPhuongThucThanhToan(giaoDichDoiPin.getPhuongThucThanhToan());
        suaGiaoDich.setThanhtien(giaoDichDoiPin.getThanhtien());
        suaGiaoDich.setNgayGiaoDich(giaoDichDoiPin.getNgayGiaoDich());

        return giaoDichDoiPinRepository.save(suaGiaoDich);
    }
    @Override
    public List<GiaoDichDoiPin> layTheoTaiXe(Long maTaiXe) {
        return giaoDichDoiPinRepository.findByMaTaiXe(maTaiXe)
                .stream()
                .filter(gd -> "Đã hoàn thành".equalsIgnoreCase(gd.getTrangThaiGiaoDich()))
                .toList();
    }

    @Override
    public List<GiaoDichDoiPin> layTheoTram(Long maTram) {
        return giaoDichDoiPinRepository.findByMaTram(maTram)
                .stream()
                .filter(gd -> "Đã hoàn thành".equalsIgnoreCase(gd.getTrangThaiGiaoDich()))
                .toList();
    }

}

