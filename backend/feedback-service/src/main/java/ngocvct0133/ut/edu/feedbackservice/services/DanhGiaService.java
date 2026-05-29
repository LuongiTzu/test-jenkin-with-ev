package ngocvct0133.ut.edu.feedbackservice.services;

import jakarta.transaction.Transactional;
import ngocvct0133.ut.edu.feedbackservice.modules.DanhGia;
import ngocvct0133.ut.edu.feedbackservice.repositories.IDanhGiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DanhGiaService implements IDanhGiaService {

    private final IDanhGiaRepository danhGiaRepository;

    public DanhGiaService(IDanhGiaRepository danhGiaRepository) {
        this.danhGiaRepository = danhGiaRepository;
    }

    @Transactional
    @Override
    public DanhGia themDanhGia(DanhGia danhGia) {
        return danhGiaRepository.save(danhGia);
    }

    @Transactional
    @Override
    public boolean xoaDanhGia(Long id) {
        if (!danhGiaRepository.existsById(id)) return false;
        danhGiaRepository.deleteById(id);
        return true;
    }

    @Override
    public DanhGia suaDanhGia(Long id, DanhGia danhGia) {
        DanhGia existing = danhGiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        existing.setNoiDung(danhGia.getNoiDung());
        existing.setSoSao(danhGia.getSoSao());
        existing.setNgayDanhGia(danhGia.getNgayDanhGia());
        existing.setMaTram(danhGia.getMaTram());

        return danhGiaRepository.save(existing);
    }

    @Override
    public DanhGia layDanhGia(Long id) {
        return danhGiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
    }

    @Override
    public List<DanhGia> layTatCaDanhSach() {
        return danhGiaRepository.findAll();
    }

    // ⭐ Trung bình sao theo trạm
    @Override
    public double tinhTrungBinhSaoTheoTram(Long maTram) {
        List<DanhGia> list = danhGiaRepository.findByMaTram(maTram);
        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToInt(DanhGia::getSoSao)
                .average()
                .orElse(0);
    }

    // ⭐ Trung bình sao toàn hệ thống
    @Override
    public double tinhTrungBinhSaoToanHeThong() {
        List<DanhGia> list = danhGiaRepository.findAll();
        if (list.isEmpty()) return 0;

        return list.stream()
                .mapToInt(DanhGia::getSoSao)
                .average()
                .orElse(0);
    }
}
