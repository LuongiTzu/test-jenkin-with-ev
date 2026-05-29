package ut.edu.stationservice.services;

import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ut.edu.stationservice.models.LichSuDatPin;
import ut.edu.stationservice.models.Tram;
import ut.edu.stationservice.repositories.ILichSuDatPinRepository;
import ut.edu.stationservice.repositories.ITramRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class LichSuDatPinService implements ILichSuDatPinService {
    private ILichSuDatPinRepository lichSuDatPinRepository;
    private ITramRepository tramRepository;
    private final RestTemplate restTemplate;

    public LichSuDatPinService(ILichSuDatPinRepository lichSuDatPinRepository, ITramRepository tramRepository, RestTemplate restTemplate) {
        this.lichSuDatPinRepository = lichSuDatPinRepository;
        this.tramRepository = tramRepository;
        this.restTemplate = restTemplate;
    }

    // 🟢 Lấy tất cả lịch sử đặt pin
    @Override
    public List<LichSuDatPin> findAll() {
        return lichSuDatPinRepository.findAll();
    }

    // 🟢 Lấy lịch sử theo ID
    @Override
    public LichSuDatPin findById(Long id) {
        return lichSuDatPinRepository.findById(id).orElse(null);
    }

    // 🟢 Lưu lịch sử (nếu cần save trực tiếp)
    @Transactional
    @Override
    public LichSuDatPin save(LichSuDatPin lichSuDatPin) {
        return lichSuDatPinRepository.save(lichSuDatPin);
    }

    // 🟢 Xóa lịch sử
    @Transactional
    @Override
    public boolean deleteById(Long id) {
        if (!lichSuDatPinRepository.existsById(id)) {
            return false;
        }
        lichSuDatPinRepository.deleteById(id);
        return true;
    }

    // 🧩 Nghiệp vụ: Đặt lịch đổi pin
    @Transactional
    @Override
    public LichSuDatPin datLich(Long maTaiXe, Long maTram, Long maXeGiaoDich, Long maPinDuocGiu) {

        // ❗ Kiểm tra trùng đơn chưa hoàn thành
        List<LichSuDatPin> lichChuaXong = lichSuDatPinRepository.findByMaTaiXe(maTaiXe)
                .stream()
                .filter(ls ->
                        (
                                "Chờ xác nhận".equalsIgnoreCase(ls.getTrangThaiXacNhan()) ||
                                        "Chưa đổi pin".equalsIgnoreCase(ls.getTrangThaiDoiPin())
                        )
                                && ls.getTram().getMaTram().equals(maTram)
                                && ls.getMaXeGiaoDich().equals(maXeGiaoDich)
                ).toList();

        if (!lichChuaXong.isEmpty()) {
            throw new RuntimeException("Bạn đang có đơn đổi pin chưa hoàn thành cùng một trạm.");
        }

        // ❗ Kiểm tra trạm có tồn tại không
        Tram tram = tramRepository.findById(maTram)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạm ID: " + maTram));

        // ❗ Kiểm tra FE có truyền mã pin không
        if (maPinDuocGiu == null) {
            throw new RuntimeException("Thiếu mã pin được giữ chỗ!");
        }

        // 🔥 Tạo mới lịch sử đặt pin
        LichSuDatPin lichSu = new LichSuDatPin();
        lichSu.setMaTaiXe(maTaiXe);
        lichSu.setTram(tram);
        lichSu.setNgayDat(LocalDateTime.now());
        lichSu.setTrangThaiXacNhan("Chờ xác nhận");
        lichSu.setTrangThaiDoiPin("Chưa đổi pin");
        lichSu.setMaXeGiaoDich(maXeGiaoDich);
        lichSu.setMaPinDuocGiu(maPinDuocGiu); // 🔥 LƯU PIN RANDOM

        return lichSuDatPinRepository.save(lichSu);
    }


    // 🧩 Nghiệp vụ: Cập nhật trạng thái lịch sử đặt pin
    @Transactional
    @Override
    public LichSuDatPin capNhatTrangThai(Long id, String trangThaiXacNhan, String trangThaiDoiPin, Long maGiaoDichDoiPin) {
        LichSuDatPin lichSu = lichSuDatPinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch sử đặt pin với ID: " + id));

        if (trangThaiXacNhan != null) lichSu.setTrangThaiXacNhan(trangThaiXacNhan);
        if (trangThaiDoiPin != null) lichSu.setTrangThaiDoiPin(trangThaiDoiPin);
        if (maGiaoDichDoiPin != null) {
            lichSu.setMaGiaoDichDoiPin(maGiaoDichDoiPin);
        }

        return lichSuDatPinRepository.save(lichSu);
    }

    // 🧩 Nghiệp vụ: Lấy tất cả lịch sử đặt pin theo mã tài xế
    @Override
    public List<LichSuDatPin> findByMaTaiXe(Long maTaiXe) {
        List<LichSuDatPin> ds = lichSuDatPinRepository.findByMaTaiXe(maTaiXe);

        return ds.stream()
                .filter(l ->
                        !"Hủy".equalsIgnoreCase(l.getTrangThaiXacNhan())
                                &&
                                (l.getTrangThaiDoiPin() == null
                                        || !"Hoàn thành".equalsIgnoreCase(l.getTrangThaiDoiPin()))
                )
                .toList();
    }

    @Override
    public List<LichSuDatPin> findByMaTram(Long maTram) {
        return lichSuDatPinRepository.findByTram_MaTram(maTram);
    }

    @Override
    public List<LichSuDatPin> findByMaTramAndTrangThai(Long maTram, String trangThaiXacNhan) {
        return lichSuDatPinRepository.findActiveQueueByTramAndStatus(maTram, trangThaiXacNhan);
    }

    @Scheduled(fixedRate = 60000) // chạy mỗi 1 phút
    @Transactional
    public void autoCancelExpiredBookings() {

        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);

        List<LichSuDatPin> ds = lichSuDatPinRepository
                .findByTrangThaiXacNhanAndNgayDatBefore("Chờ xác nhận", threshold);

        for (LichSuDatPin ls : ds) {

            Long pinId = ls.getMaPinDuocGiu();

            // Gọi battery-service để mở khóa pin
            restTemplate.patchForObject(
                    "http://gateway:8080/api/battery-service/pins/" + pinId + "/state",
                    Map.of(
                            "tinhTrang", "DAY",
                            "trangThaiSoHuu", "SAN_SANG"
                    ),
                    Void.class
            );


            ls.setTrangThaiXacNhan("Hủy");
            ls.setTrangThaiDoiPin("Quá hạn");

            lichSuDatPinRepository.save(ls);
        }
    }

    @Transactional
    @Override
    public void huyDon(Long id) {
        LichSuDatPin ls = lichSuDatPinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));

        ls.setTrangThaiXacNhan("Hủy");
        ls.setTrangThaiDoiPin("Tài xế hủy");

        lichSuDatPinRepository.save(ls);
    }

}
