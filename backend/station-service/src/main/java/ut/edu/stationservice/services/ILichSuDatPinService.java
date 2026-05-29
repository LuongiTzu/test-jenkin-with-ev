package ut.edu.stationservice.services;

import ut.edu.stationservice.models.LichSuDatPin;
import ut.edu.stationservice.models.Tram;

import java.util.List;

public interface ILichSuDatPinService {
    // CRUD cơ bản
    LichSuDatPin findById(Long id);
    List<LichSuDatPin> findAll();
    boolean deleteById(Long id);
    LichSuDatPin save(LichSuDatPin lichSuDatPin);

    // Nghiệp vụ chính
    LichSuDatPin datLich(Long maTaiXe, Long maTram, Long maXeGiaoDich, Long maPinDuocGiu);     // Đặt lịch mới
    LichSuDatPin capNhatTrangThai(Long id, String trangThaiXacNhan, String trangThaiDoiPin, Long maGiaoDichDoiPin); // Cập nhật trạng thái
    List<LichSuDatPin> findByMaTaiXe(Long maTaiXe);      // Lọc lịch sử theo tài xế
    List<LichSuDatPin> findByMaTram(Long maTram);
    List<LichSuDatPin> findByMaTramAndTrangThai(Long maTram, String trangThaiXacNhan);
    public void huyDon(Long id);
}
