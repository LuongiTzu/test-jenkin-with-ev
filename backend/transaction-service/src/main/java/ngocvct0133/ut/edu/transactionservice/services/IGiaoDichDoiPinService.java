package ngocvct0133.ut.edu.transactionservice.services;

import ngocvct0133.ut.edu.transactionservice.modules.GiaoDichDoiPin;

import java.util.List;

public interface IGiaoDichDoiPinService {
    GiaoDichDoiPin themGiaoDichDoiPin(GiaoDichDoiPin doiPin);
    List<GiaoDichDoiPin> danhSachGiaoDichDoiPin();
    GiaoDichDoiPin layGiaoDichDoiPinTheoId(Long id);
    boolean xoaGiaoDichDoiPinTheoId(Long id);
    GiaoDichDoiPin suaGiaoDichDoiPinTheoId(Long id, GiaoDichDoiPin giaoDichDoiPin);
    List<GiaoDichDoiPin> layTheoTaiXe(Long maTaiXe);
    List<GiaoDichDoiPin> layTheoTram(Long maTram);
}
