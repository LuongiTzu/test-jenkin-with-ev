package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.services;

import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.dtos.PhuongTienDTO;
import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.modules.PhuongTien;

import java.util.List;

public interface IPhuongTienService {
    PhuongTien themPhuongTien(PhuongTienDTO dto);
    List<PhuongTien> danhSachPhuongTien();
    PhuongTien layPhuongTienTheoId(Long id);
    boolean xoaPhuongTien(Long id);
    PhuongTien suaPhuongTien(Long id, PhuongTienDTO dto);

    // Theo đề: quản lý danh sách xe của tài xế + liên kết pin hiện tại
    List<PhuongTien> danhSachTheoTaiXe(Long maTaiXe);
    PhuongTien lienKetPin(Long maPhuongTien, Long maPin);
    PhuongTien huyLienKetPin(Long maPhuongTien);
}
