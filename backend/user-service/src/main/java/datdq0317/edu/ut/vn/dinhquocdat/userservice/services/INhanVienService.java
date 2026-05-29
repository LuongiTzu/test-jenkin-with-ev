package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import java.util.List;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.NhanVienDTO;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;

public interface INhanVienService {
    NhanVien themNhanVien(NhanVienDTO dto);
    List<NhanVien> danhSachNhanVien();
    List<NhanVien> danhSachNhanVienTheoTram(Long maTram); // Thêm method mới này
    NhanVien layNhanVienTheoId(Long id);
    boolean xoaNhanVien(Long id);
    NhanVien suaNhanVien(Long id, NhanVienDTO dto);
    NhanVien layNhanVienTheoMaNguoiDung(Long maNguoiDung);
}