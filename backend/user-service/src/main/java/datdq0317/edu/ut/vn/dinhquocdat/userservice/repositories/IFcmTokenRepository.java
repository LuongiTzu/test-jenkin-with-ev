package datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.FcmToken;

public interface IFcmTokenRepository extends JpaRepository<FcmToken, Long> {
    Optional<FcmToken> findFirstByMaNguoiDung(Long maNguoiDung);
    
    // 🔹 Lấy tất cả token của 1 người dùng (dành cho GET /fcm/{id})
    List<FcmToken> findByMaNguoiDung(Long maNguoiDung);
    List<FcmToken> findByVaiTro(String vaiTro);

}
