package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;

import java.util.List;
import java.util.Optional;

public interface INguoiDungService {
    NguoiDung dangKy(NguoiDung nguoiDung);
    Optional<NguoiDung> timTheoEmail(String email);
    Optional<NguoiDung> timTheoSoDienThoai(String soDienThoai);
}
