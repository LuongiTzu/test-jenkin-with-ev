package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.services;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.GoiDichVu;

import java.util.List;

public interface IGoiDichVuService {
    GoiDichVu themGoi(GoiDichVu goi);
    GoiDichVu suaGoi(Long id, GoiDichVu goi);
    boolean xoaGoi(Long id);
    List<GoiDichVu> danhSachGoi();
    GoiDichVu layGoiTheoId(Long id);
}
