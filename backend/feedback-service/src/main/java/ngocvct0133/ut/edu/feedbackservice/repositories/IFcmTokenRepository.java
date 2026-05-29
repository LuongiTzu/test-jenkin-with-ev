package ngocvct0133.ut.edu.feedbackservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ngocvct0133.ut.edu.feedbackservice.modules.FcmToken;

public interface IFcmTokenRepository extends JpaRepository<FcmToken, Long> {
    Optional<FcmToken> findFirstByMaNguoiDung(Long maNguoiDung);
    List<FcmToken> findByMaNguoiDung(Long maNguoiDung);
    Optional<FcmToken> findFirstByUserRole(String userRole);

}
