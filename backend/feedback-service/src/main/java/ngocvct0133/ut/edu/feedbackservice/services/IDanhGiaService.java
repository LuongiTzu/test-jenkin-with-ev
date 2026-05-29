package ngocvct0133.ut.edu.feedbackservice.services;

import ngocvct0133.ut.edu.feedbackservice.modules.DanhGia;

import java.util.List;

public interface IDanhGiaService {
    DanhGia themDanhGia(DanhGia danhGia);
    boolean xoaDanhGia(Long id);
    DanhGia suaDanhGia(Long id, DanhGia danhGia);

    DanhGia layDanhGia(Long id);
    List<DanhGia> layTatCaDanhSach();

    // ⭐ API mới
    double tinhTrungBinhSaoTheoTram(Long maTram);
    double tinhTrungBinhSaoToanHeThong();
}
