package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;

import java.util.List;

public interface IQuanLyService {
    public NguoiDung themQuanLy(NguoiDung nguoiDung);
    public List<NguoiDung> danhSachQuanLy();
    public boolean xoaQuanLy(Long id);
    public NguoiDung suaThongTinQuanLy(Long id, NguoiDung nguoiDung);
    public NguoiDung layQuanLyBangId(Long id);
}
