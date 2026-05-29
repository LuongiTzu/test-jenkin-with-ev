package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.INguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NguoiDungService implements INguoiDungService {

    @Autowired
    private INguoiDungRepository nguoiDungRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public NguoiDung dangKy(NguoiDung nguoiDung) {
        // Kiểm tra email tồn tại
        if (nguoiDungRepository.findByEmail(nguoiDung.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Kiểm tra số điện thoại tồn tại
        if (nguoiDungRepository.findBySoDienThoai(nguoiDung.getSoDienThoai()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        // HASH PASSWORD TRƯỚC KHI LƯU
        String encodedPassword = passwordEncoder.encode(nguoiDung.getMatKhau());
        nguoiDung.setMatKhau(encodedPassword);

        // SET ROLE LÀ ADMIN
        nguoiDung.setVaiTro("ADMIN");

        // Set ngày tạo nếu chưa có
        if (nguoiDung.getNgayTao() == null) {
            nguoiDung.setNgayTao(LocalDate.now());
        }

        return nguoiDungRepository.save(nguoiDung);
    }

    @Override
    public Optional<NguoiDung> timTheoEmail(String email) {
        return nguoiDungRepository.findByEmail(email);
    }

    @Override
    public Optional<NguoiDung> timTheoSoDienThoai(String soDienThoai) {
        return nguoiDungRepository.findBySoDienThoai(soDienThoai);
    }
}