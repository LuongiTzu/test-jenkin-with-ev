package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.IQuanLyRepository;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.INguoiDungRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class QuanLyService implements IQuanLyService {

    @Autowired
    private IQuanLyRepository quanLyRepository;

    @Autowired
    private INguoiDungRepository nguoiDungRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Thêm quản lý mới
     */
    @Transactional
    @Override
    public NguoiDung themQuanLy(NguoiDung nguoiDung) {
        // Kiểm tra email tồn tại
        nguoiDungRepository.findByEmail(nguoiDung.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email đã tồn tại!");
        });

        // Kiểm tra số điện thoại tồn tại
        nguoiDungRepository.findBySoDienThoai(nguoiDung.getSoDienThoai()).ifPresent(u -> {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        });

        // Mã hoá mật khẩu
        String encodedPassword = passwordEncoder.encode(nguoiDung.getMatKhau());
        nguoiDung.setMatKhau(encodedPassword);

        nguoiDung.setNgayTao(LocalDate.now());
        nguoiDung.setVaiTro("ADMIN");

        return quanLyRepository.save(nguoiDung);
    }

    /**
     * Lấy danh sách quản lý
     */
    @Override
    public List<NguoiDung> danhSachQuanLy() {
        return quanLyRepository.findByVaiTro("ADMIN");
    }

    /**
     * Xoá quản lý theo ID
     */
    @Transactional
    @Override
    public boolean xoaQuanLy(Long id) {
        try {
            if (!quanLyRepository.existsById(id)) {
                return false;
            }
            quanLyRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sửa thông tin quản lý
     */
    @Transactional
    @Override
    public NguoiDung suaThongTinQuanLy(Long id, NguoiDung nguoiDungMoi) {
        return quanLyRepository.findById(id).map(nd -> {

            // Kiểm tra email trùng
            if (!nd.getEmail().equals(nguoiDungMoi.getEmail())) {
                nguoiDungRepository.findByEmail(nguoiDungMoi.getEmail()).ifPresent(existing -> {
                    if (!existing.getMaNguoiDung().equals(nd.getMaNguoiDung())) {
                        throw new RuntimeException("Email đã được sử dụng bởi người khác!");
                    }
                });
                nd.setEmail(nguoiDungMoi.getEmail());
            }

            // Kiểm tra số điện thoại trùng
            if (!nd.getSoDienThoai().equals(nguoiDungMoi.getSoDienThoai())) {
                nguoiDungRepository.findBySoDienThoai(nguoiDungMoi.getSoDienThoai()).ifPresent(existing -> {
                    if (!existing.getMaNguoiDung().equals(nd.getMaNguoiDung())) {
                        throw new RuntimeException("Số điện thoại đã được sử dụng bởi người khác!");
                    }
                });
                nd.setSoDienThoai(nguoiDungMoi.getSoDienThoai());
            }

            // Cập nhật thông tin cá nhân
            nd.setHoTen(nguoiDungMoi.getHoTen());
            nd.setGioiTinh(nguoiDungMoi.getGioiTinh());
            nd.setNgaySinh(nguoiDungMoi.getNgaySinh());

            // Cập nhật mật khẩu (nếu có nhập mới)
            if (nguoiDungMoi.getMatKhau() != null && !nguoiDungMoi.getMatKhau().trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(nguoiDungMoi.getMatKhau());
                nd.setMatKhau(encodedPassword);
            }

            // Vai trò luôn là ADMIN
            nd.setVaiTro("ADMIN");

            return quanLyRepository.save(nd);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy quản lý!"));
    }

    /**
     * Lấy quản lý theo ID
     */
    @Override
    public NguoiDung layQuanLyBangId(Long id) {
        return quanLyRepository.findById(id).orElse(null);
    }
}
