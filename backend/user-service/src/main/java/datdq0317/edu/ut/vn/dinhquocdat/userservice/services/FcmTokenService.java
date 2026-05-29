package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.FcmToken;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.IFcmTokenRepository;

@Service
public class FcmTokenService implements IFcmTokenService {

    @Autowired
    private IFcmTokenRepository tokenRepo;

   @Override
    public void luuToken(Long maNguoiDung, String vaiTro, String token) {
    Optional<FcmToken> existingOpt = tokenRepo.findFirstByMaNguoiDung(maNguoiDung);

    if (existingOpt.isPresent()) {
        FcmToken existing = existingOpt.get();
        existing.setToken(token);
        existing.setVaiTro(vaiTro);
        existing.setNgayTao(LocalDateTime.now());
        tokenRepo.save(existing);
        System.out.println("✅ Đã cập nhật token cho người dùng " + maNguoiDung);
    } else {
        tokenRepo.save(new FcmToken(maNguoiDung, vaiTro, token));
        System.out.println("🆕 Tạo mới token cho người dùng " + maNguoiDung);
    }
}



    @Override
    public List<FcmToken> layTokenTheoNguoiDung(Long maNguoiDung) {
        return tokenRepo.findByMaNguoiDung(maNguoiDung);
    }
    
@GetMapping("/admin")
public List<String> layDanhSachTokenAdmin() {
    return tokenRepo.findByVaiTro("ADMIN")
            .stream()
            .map(FcmToken::getToken)
            .collect(Collectors.toList());
}
    @Override
    public List<FcmToken> layTokenTheoRole(String vaiTro) {
        return tokenRepo.findByVaiTro(vaiTro);
    }



}
