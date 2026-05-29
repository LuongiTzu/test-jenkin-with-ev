package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.services;

import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.dtos.PhuongTienDTO;
import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.modules.PhuongTien;
import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.repositories.IPhuongTienRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhuongTienService implements IPhuongTienService {

    @Autowired
    private IPhuongTienRepository phuongTienRepository;

    @Transactional
    @Override
    public PhuongTien themPhuongTien(PhuongTienDTO dto) {

        // Kiểm tra trùng VIN hoặc Biển số
        if (phuongTienRepository.existsByVinOrBienSo(dto.getVin(), dto.getBienSo())) {
            throw new RuntimeException("VIN hoặc Biển số đã tồn tại!");
        }

        PhuongTien v = new PhuongTien();
        v.setVin(dto.getVin());
        v.setBienSo(dto.getBienSo());
        v.setLoaiXe(dto.getLoaiXe());
        v.setMaTaiXe(dto.getMaTaiXe());
        v.setMaPin(dto.getMaPin()); // có thể null

        return phuongTienRepository.save(v);
    }

    @Override
    public List<PhuongTien> danhSachPhuongTien() {
        return phuongTienRepository.findAll();
    }

    @Override
    public PhuongTien layPhuongTienTheoId(Long id) {
        return phuongTienRepository.findById(id).orElse(null);
    }

    @Override
    public boolean xoaPhuongTien(Long id) {
        try {
            phuongTienRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    @Override
    public PhuongTien suaPhuongTien(Long id, PhuongTienDTO dto) {
        return phuongTienRepository.findById(id).map(v -> {
            // Nếu người dùng muốn đổi VIN/biển số – kiểm tra trùng
            boolean doiVin = dto.getVin() != null && !dto.getVin().equals(v.getVin());
            boolean doiBienSo = dto.getBienSo() != null && !dto.getBienSo().equals(v.getBienSo());
            if (doiVin || doiBienSo) {
                if (phuongTienRepository.existsByVinOrBienSo(
                        doiVin ? dto.getVin() : v.getVin(),
                        doiBienSo ? dto.getBienSo() : v.getBienSo()
                )) {
                    // Có thể refine để bỏ qua bản ghi hiện tại nếu cần,
                    // nhưng với yêu cầu cơ bản thì thông báo trùng là đủ:
                    throw new RuntimeException("VIN hoặc Biển số đã được sử dụng!");
                }
            }

            if (dto.getVin() != null) v.setVin(dto.getVin());
            if (dto.getBienSo() != null) v.setBienSo(dto.getBienSo());
            if (dto.getLoaiXe() != null) v.setLoaiXe(dto.getLoaiXe());
            if (dto.getMaTaiXe() != null) v.setMaTaiXe(dto.getMaTaiXe());
            // maPin để dành cho 2 API riêng: liên kết / huỷ liên kết
            return phuongTienRepository.save(v);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện!"));
    }

    // ================== Theo đề: quản lý danh sách xe theo tài xế ==================

    @Override
    public List<PhuongTien> danhSachTheoTaiXe(Long maTaiXe) {
        return phuongTienRepository.findAllByMaTaiXe(maTaiXe);
    }

    @Transactional
    @Override
    public PhuongTien lienKetPin(Long maPhuongTien, Long maPin) {
        PhuongTien v = phuongTienRepository.findById(maPhuongTien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện!"));
        v.setMaPin(maPin);
        return phuongTienRepository.save(v);
    }

    @Transactional
    @Override
    public PhuongTien huyLienKetPin(Long maPhuongTien) {
        PhuongTien v = phuongTienRepository.findById(maPhuongTien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện!"));
        v.setMaPin(null);
        return phuongTienRepository.save(v);
    }
}
