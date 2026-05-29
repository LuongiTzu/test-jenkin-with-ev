package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.NhanVienDTO;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.INguoiDungRepository;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.INhanVienRepository;
import jakarta.transaction.Transactional;

@Service
public class NhanVienService implements INhanVienService {

    @Autowired
    private INhanVienRepository nhanVienRepository;

    @Autowired
    private INguoiDungRepository nguoiDungRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Có thể inject TramServiceClient nếu cần validate trạm
    // @Autowired
    // private TramServiceClient tramServiceClient;

    @Transactional
    public NhanVien themNhanVien(NhanVienDTO dto) {
        // Kiểm tra email tồn tại
        nguoiDungRepository.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email đã tồn tại!");
        });

        // Kiểm tra số điện thoại tồn tại
        nguoiDungRepository.findBySoDienThoai(dto.getSoDienThoai()).ifPresent(u -> {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        });

        // Có thể thêm validation cho mã trạm ở đây
        // if (dto.getMaTram() != null) {
        //     boolean tramTonTai = tramServiceClient.kiemTraTramTonTai(dto.getMaTram());
        //     if (!tramTonTai) {
        //         throw new RuntimeException("Mã trạm không tồn tại!");
        //     }
        // }

        // Tạo người dùng mới
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setHoTen(dto.getHoTen());
        nguoiDung.setEmail(dto.getEmail());
        nguoiDung.setSoDienThoai(dto.getSoDienThoai());
        nguoiDung.setGioiTinh(dto.getGioiTinh());

        // HASH MẬT KHẨU TRƯỚC KHI LƯU
        String encodedPassword = passwordEncoder.encode(dto.getMatKhau());
        nguoiDung.setMatKhau(encodedPassword);

        nguoiDung.setNgaySinh(dto.getNgaySinh());
        nguoiDung.setNgayTao(LocalDate.now());
        nguoiDung.setVaiTro("NHANVIEN");
        nguoiDung = nguoiDungRepository.save(nguoiDung);

        // Tạo nhân viên mới
        NhanVien nv = new NhanVien();
        nv.setBangCap(dto.getBangCap());
        nv.setKinhNghiem(dto.getKinhNghiem());
        nv.setMaTram(dto.getMaTram()); // Thêm mã trạm
        nv.setNguoiDung(nguoiDung);

        return nhanVienRepository.save(nv);
    }

    @Override
    public NhanVien layNhanVienTheoMaNguoiDung(Long maNguoiDung) {
        return nhanVienRepository.findByNguoiDung_MaNguoiDung(maNguoiDung);
    }

    public List<NhanVien> danhSachNhanVien() {
        return nhanVienRepository.findAll();
    }

    // Thêm method để lấy nhân viên theo mã trạm
    public List<NhanVien> danhSachNhanVienTheoTram(Long maTram) {
        return nhanVienRepository.findByMaTram(maTram);
    }

    public NhanVien layNhanVienTheoId(Long id) {
        return nhanVienRepository.findById(id).orElse(null);
    }

    @Transactional
    @Override
    public boolean xoaNhanVien(Long id) {
        try {
            NhanVien nv = nhanVienRepository.findById(id).orElse(null);
            if (nv == null) {
                return false;
            }

            // Lấy thông tin người dùng trước khi xóa
            NguoiDung nd = nv.getNguoiDung();

            // Xóa nhân viên trước
            nhanVienRepository.delete(nv);

            // Sau đó xóa người dùng
            nguoiDungRepository.delete(nd);

            return true;
        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi để debug
            return false;
        }
    }

    @Transactional
    @Override
    public NhanVien suaNhanVien(Long id, NhanVienDTO dto) {
        return nhanVienRepository.findById(id).map(nv -> {
            nv.setBangCap(dto.getBangCap());
            nv.setKinhNghiem(dto.getKinhNghiem());
            nv.setMaTram(dto.getMaTram()); // Cập nhật mã trạm

            NguoiDung nd = nv.getNguoiDung();

            // Kiểm tra email trùng
            if (!nd.getEmail().equals(dto.getEmail())) {
                nguoiDungRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
                    if (!existing.getMaNguoiDung().equals(nd.getMaNguoiDung())) {
                        throw new RuntimeException("Email đã được sử dụng bởi người khác!");
                    }
                });
                nd.setEmail(dto.getEmail());
            }

            // Kiểm tra số điện thoại trùng
            if (!nd.getSoDienThoai().equals(dto.getSoDienThoai())) {
                nguoiDungRepository.findBySoDienThoai(dto.getSoDienThoai()).ifPresent(existing -> {
                    if (!existing.getMaNguoiDung().equals(nd.getMaNguoiDung())) {
                        throw new RuntimeException("Số điện thoại đã được sử dụng bởi người khác!");
                    }
                });
                nd.setSoDienThoai(dto.getSoDienThoai());
            }

            // Cập nhật thông tin cơ bản
            nd.setHoTen(dto.getHoTen());
            nd.setGioiTinh(dto.getGioiTinh());
            nd.setNgaySinh(dto.getNgaySinh());

            // Chỉ cập nhật mật khẩu nếu được cung cấp mật khẩu mới
            if (dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(dto.getMatKhau());
                nd.setMatKhau(encodedPassword);
            }

            nguoiDungRepository.save(nd);
            return nhanVienRepository.save(nv);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));
    }
}