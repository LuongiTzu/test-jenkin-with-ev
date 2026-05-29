    package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

    import java.util.List;

    import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.FcmToken;

    public interface IFcmTokenService {
        void luuToken(Long maNguoiDung, String vaiTro, String token);
        List<FcmToken> layTokenTheoNguoiDung(Long maNguoiDung);
        List<FcmToken> layTokenTheoRole(String vaiTro);

    }
