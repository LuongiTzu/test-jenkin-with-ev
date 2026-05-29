package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import java.util.List;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.TaiXeDTO;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.TaiXeResponse;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.TaiXe;

public interface ITaiXeService {
    TaiXe themTaiXe(TaiXeDTO dto);
    List<TaiXe> danhSachTaiXe();
    TaiXe layTaiXeTheoId(Long id);
    boolean xoaTaiXe(Long id);
    TaiXe suaTaiXe(Long id, TaiXeDTO dto);
    TaiXeResponse layThongTinTaiXe(Long id);
    TaiXe layTaiXeTheoMaNguoiDung(Long maNguoiDung);

}
