package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.services;

import java.util.List;
import java.util.Map;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.dtos.LichSuDangKyGoiDTO;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.LichSuDangKyGoi;
public interface ILichSuDangKyGoiService {
    LichSuDangKyGoi themDangKyGoi(LichSuDangKyGoiDTO dto);
    LichSuDangKyGoi suaDangKyGoi(Long id, LichSuDangKyGoiDTO dto);
    boolean xoaDangKyGoi(Long id);
    List<LichSuDangKyGoi> danhSachDangKyGoi();
    LichSuDangKyGoi layDangKyGoiTheoId(Long id);
    boolean kiemTraTaiXeCoGoiConHan(Long maTaiXe);
    List<LichSuDangKyGoi> layLichSuTheoTaiXe(Long maTaiXe);
    LichSuDangKyGoi suaSoLanConLai(Long id, LichSuDangKyGoiDTO dto);
    Map<Long, Map<String, Long>> demSoLuongDangKyTheoGoi();
    boolean kiemTraGoiDangDuocSuDung(Long maGoi);
}
