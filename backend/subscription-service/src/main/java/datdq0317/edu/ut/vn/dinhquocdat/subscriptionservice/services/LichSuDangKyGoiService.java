package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.dtos.LichSuDangKyGoiDTO;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.GoiDichVu;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.LichSuDangKyGoi;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.repositories.IGoiDichVuRepository;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.repositories.ILichSuDangKyGoiRepository;
import jakarta.transaction.Transactional;
@Service
public class LichSuDangKyGoiService implements ILichSuDangKyGoiService {

    @Autowired
    private ILichSuDangKyGoiRepository lichSuDangKyGoiRepository;

    @Autowired
    private IGoiDichVuRepository goiDichVuRepository;

    @Override
    @Transactional
    public LichSuDangKyGoi themDangKyGoi(LichSuDangKyGoiDTO dto) {
        GoiDichVu goi = goiDichVuRepository.findById(dto.getMaGoi())
                .orElseThrow(() -> new RuntimeException("Gói dịch vụ không tồn tại"));

        LichSuDangKyGoi lichSu = new LichSuDangKyGoi();
        lichSu.setMaTaiXe(dto.getMaTaiXe());
        lichSu.setGoiDichVu(goi);

        // Tính toán các trường hệ thống
        LocalDate ngayBatDau = LocalDate.now();
        LocalDate ngayKetThuc = ngayBatDau.plusDays(goi.getThoiGianDung());
        Integer soLanConLai = goi.getSoLanDoi();

        lichSu.setNgayBatDau(ngayBatDau);
        lichSu.setNgayKetThuc(ngayKetThuc);
        lichSu.setSoLanConLai(soLanConLai);

        // Tự động xác định trạng thái
        lichSu.setTrangThai(xacDinhTrangThai(ngayKetThuc, soLanConLai));

        return lichSuDangKyGoiRepository.save(lichSu);
    }

    @Override
    @Transactional
    public LichSuDangKyGoi suaDangKyGoi(Long id, LichSuDangKyGoiDTO dto) {
        return lichSuDangKyGoiRepository.findById(id).map(ls -> {
            if (dto.getMaGoi() != null) {
                GoiDichVu goi = goiDichVuRepository.findById(dto.getMaGoi())
                        .orElseThrow(() -> new RuntimeException("Gói dịch vụ không tồn tại"));
                ls.setGoiDichVu(goi);
                ls.setNgayKetThuc(ls.getNgayBatDau().plusDays(goi.getThoiGianDung()));
                ls.setSoLanConLai(goi.getSoLanDoi());
            }

            if (dto.getMaTaiXe() != null)
                ls.setMaTaiXe(dto.getMaTaiXe());

            // Cập nhật trạng thái dựa trên điều kiện thực tế
            ls.setTrangThai(xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai()));

            return lichSuDangKyGoiRepository.save(ls);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch sử đăng ký gói"));
    }

    @Override
    @Transactional
    public LichSuDangKyGoi suaSoLanConLai(Long maTaiXe, LichSuDangKyGoiDTO dto) {

        // Lấy danh sách gói của tài xế
        List<LichSuDangKyGoi> list = lichSuDangKyGoiRepository.findByMaTaiXe(maTaiXe);

        if (list.isEmpty()) {
            throw new RuntimeException("Tài xế chưa đăng ký gói nào");
        }

        LocalDate today = LocalDate.now();
        LocalDate ngayGiaoDich = dto.getNgayGiaoDich() != null ? dto.getNgayGiaoDich() : today;

        // Lọc gói còn hạn
        List<LichSuDangKyGoi> goiValid = list.stream()
                .filter(ls -> ls.getNgayKetThuc() != null
                        && !ngayGiaoDich.isAfter(ls.getNgayKetThuc()) // giao dịch <= hạn
                        && ls.getSoLanConLai() != null
                        && ls.getSoLanConLai() > 0
                        && xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai()).equals("CON_HAN")
                )
                .sorted((a, b) -> b.getNgayBatDau().compareTo(a.getNgayBatDau())) // ưu tiên gói mới nhất
                .toList();

        if (goiValid.isEmpty()) {
            throw new RuntimeException("Không có gói hợp lệ để trừ lượt");
        }

        // Lấy gói mới nhất
        LichSuDangKyGoi goi = goiValid.get(0);

        // Trừ lượt
        goi.setSoLanConLai(goi.getSoLanConLai() - 1);

        // Cập nhật trạng thái
        goi.setTrangThai(
                xacDinhTrangThai(goi.getNgayKetThuc(), goi.getSoLanConLai())
        );

        // Lưu vào DB
        return lichSuDangKyGoiRepository.save(goi);
    }

    @Override
    public List<LichSuDangKyGoi> danhSachDangKyGoi() {
        List<LichSuDangKyGoi> list = lichSuDangKyGoiRepository.findAll();
        // Cập nhật trạng thái tự động khi lấy danh sách
        list.forEach(ls -> {
            String trangThaiMoi = xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai());
            if (!trangThaiMoi.equals(ls.getTrangThai())) {
                ls.setTrangThai(trangThaiMoi);
                lichSuDangKyGoiRepository.save(ls);
            }
        });
        return list;
    }

    @Override
    public LichSuDangKyGoi layDangKyGoiTheoId(Long id) {
        return lichSuDangKyGoiRepository.findById(id).map(ls -> {
            String trangThaiMoi = xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai());
            if (!trangThaiMoi.equals(ls.getTrangThai())) {
                ls.setTrangThai(trangThaiMoi);
                lichSuDangKyGoiRepository.save(ls);
            }
            return ls;
        }).orElse(null);
    }

    @Override
    public boolean xoaDangKyGoi(Long id) {
        try {
            lichSuDangKyGoiRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Kiểm tra tài xế có gói dịch vụ còn hạn không
     */
    @Override
    public boolean kiemTraTaiXeCoGoiConHan(Long maTaiXe) {
        List<LichSuDangKyGoi> lichSu = lichSuDangKyGoiRepository.findByMaTaiXe(maTaiXe);
        LocalDate now = LocalDate.now();

        return lichSu.stream().anyMatch(ls ->
                ls.getNgayKetThuc() != null &&
                        ls.getNgayKetThuc().isAfter(now) &&
                        ls.getSoLanConLai() != null &&
                        ls.getSoLanConLai() > 0
        );
    }

    /**
     * Lấy lịch sử đăng ký theo mã tài xế
     */
    @Override
    public List<LichSuDangKyGoi> layLichSuTheoTaiXe(Long maTaiXe) {
        List<LichSuDangKyGoi> list = lichSuDangKyGoiRepository.findByMaTaiXe(maTaiXe);
        // Cập nhật trạng thái tự động khi lấy danh sách
        list.forEach(ls -> {
            String trangThaiMoi = xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai());
            if (!trangThaiMoi.equals(ls.getTrangThai())) {
                ls.setTrangThai(trangThaiMoi);
                lichSuDangKyGoiRepository.save(ls);
            }
        });
        return list;
    }

    /**
     * Hàm xác định trạng thái dựa vào hạn và số lần còn lại
     */
    private String xacDinhTrangThai(LocalDate ngayKetThuc, Integer soLanConLai) {
        if (ngayKetThuc == null || soLanConLai == null)
            return "KHONG_XAC_DINH";

        LocalDate now = LocalDate.now();

        if (now.isAfter(ngayKetThuc) || soLanConLai <= 0)
            return "HET_HAN";

        return "CON_HAN";
    }
    @Override
public Map<Long, Map<String, Long>> demSoLuongDangKyTheoGoi() {
    List<LichSuDangKyGoi> allRecords = lichSuDangKyGoiRepository.findAll();
    
    // Cập nhật trạng thái cho tất cả records trước khi đếm
    allRecords.forEach(ls -> {
        String trangThaiMoi = xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai());
        if (!trangThaiMoi.equals(ls.getTrangThai())) {
            ls.setTrangThai(trangThaiMoi);
            lichSuDangKyGoiRepository.save(ls);
        }
    });
    
    // Nhóm theo mã gói và đếm theo trạng thái
    return allRecords.stream()
            .collect(Collectors.groupingBy(
                ls -> ls.getGoiDichVu().getMaGoi(),
                Collectors.groupingBy(
                    LichSuDangKyGoi::getTrangThai,
                    Collectors.counting()
                )
            ));
}


@Override
public boolean kiemTraGoiDangDuocSuDung(Long maGoi) {
    List<LichSuDangKyGoi> dangKyCuaGoi = lichSuDangKyGoiRepository.findAll().stream()
            .filter(ls -> ls.getGoiDichVu().getMaGoi().equals(maGoi))
            .collect(Collectors.toList());
    
    // Cập nhật trạng thái
    dangKyCuaGoi.forEach(ls -> {
        String trangThaiMoi = xacDinhTrangThai(ls.getNgayKetThuc(), ls.getSoLanConLai());
        if (!trangThaiMoi.equals(ls.getTrangThai())) {
            ls.setTrangThai(trangThaiMoi);
            lichSuDangKyGoiRepository.save(ls);
        }
    });
    
    // Kiểm tra nếu có ít nhất 1 đăng ký còn hạn
    return dangKyCuaGoi.stream()
            .anyMatch(ls -> "CON_HAN".equals(ls.getTrangThai()));
}
}