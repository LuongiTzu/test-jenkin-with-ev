package ut.edu.stationservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.edu.stationservice.dtos.DatLichRequest;
import ut.edu.stationservice.dtos.UpdateTrangThaiRequest;
import ut.edu.stationservice.models.LichSuDatPin;
import ut.edu.stationservice.services.ILichSuDatPinService;

import java.util.List;

@RestController
@RequestMapping("/api/station-service/dat-lich")
public class LichSuDatPinController {

    private final ILichSuDatPinService lichSuDatPinService;

    public LichSuDatPinController(ILichSuDatPinService lichSuDatPinService) {
        this.lichSuDatPinService = lichSuDatPinService;
    }

    // 🟢 Lấy toàn bộ lịch sử đặt pin
    @GetMapping
    public ResponseEntity<List<LichSuDatPin>> layTatCaLichSu() {
        List<LichSuDatPin> ds = lichSuDatPinService.findAll();
        return ResponseEntity.ok(ds);
    }

    // 🟢 Lấy lịch sử theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> layTheoId(@PathVariable Long id) {
        LichSuDatPin lichSu = lichSuDatPinService.findById(id);
        if (lichSu == null) {
            return ResponseEntity.status(404).body("❌ Không tìm thấy lịch sử đặt pin với ID: " + id);
        }
        return ResponseEntity.ok(lichSu);
    }

    // 🟢 Lấy lịch sử theo mã tài xế
    @GetMapping("/tai-xe/{maTaiXe}")
    public ResponseEntity<List<LichSuDatPin>> layTheoTaiXe(@PathVariable Long maTaiXe) {
        List<LichSuDatPin> ds = lichSuDatPinService.findByMaTaiXe(maTaiXe);
        return ResponseEntity.ok(ds);
    }

    // 🟢 Lấy danh sách đơn theo trạm
    @GetMapping("/tram/{maTram}")
    public ResponseEntity<List<LichSuDatPin>> layTheoTram(@PathVariable Long maTram) {
        return ResponseEntity.ok(lichSuDatPinService.findByMaTram(maTram));
    }

    // 🟢 Lấy danh sách đơn theo trạm + trạng thái (chờ xác nhận hoặc đã xác nhận)
    @GetMapping("/tram/{maTram}/trang-thai")
    public ResponseEntity<List<LichSuDatPin>> layTheoTramVaTrangThai(
            @PathVariable Long maTram,
            @RequestParam String trangThai
    ) {
        return ResponseEntity.ok(lichSuDatPinService.findByMaTramAndTrangThai(maTram, trangThai));
    }


    // 🟢 Đặt lịch đổi pin (người dùng đặt)
    @PostMapping
    public ResponseEntity<?> datLich(@RequestBody DatLichRequest req) {
        try {
            LichSuDatPin created = lichSuDatPinService.datLich(
                    req.getMaTaiXe(),
                    req.getMaTram(),
                    req.getMaXeGiaoDich(),
                    req.getMaPinDuocGiu() // 🔥 NEW
            );
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("❌ Lỗi khi đặt lịch: " + e.getMessage());
        }
    }


    // 🟢 Cập nhật trạng thái (Admin / tài xế xác nhận)
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatTrangThai(
            @PathVariable Long id,
            @RequestBody UpdateTrangThaiRequest req
    ) {
        try {
            LichSuDatPin updated = lichSuDatPinService.capNhatTrangThai(
                    id,
                    req.getTrangThaiXacNhan(),
                    req.getTrangThaiDoiPin(),
                    req.getMaGiaoDichDoiPin()
            );
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("❌ Lỗi cập nhật trạng thái: " + e.getMessage());
        }
    }

    // 🟢 Xóa lịch sử (nếu cần)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaLichSu(@PathVariable Long id) {
        boolean deleted = lichSuDatPinService.deleteById(id);
        if (deleted) {
            return ResponseEntity.ok("✅ Đã xóa lịch sử đặt pin ID: " + id);
        } else {
            return ResponseEntity.status(404).body("❌ Không tìm thấy lịch sử đặt pin để xóa");
        }
    }

    @PutMapping("/{id}/huy")
    public ResponseEntity<?> huyDon(@PathVariable Long id) {
        lichSuDatPinService.huyDon(id);
        return ResponseEntity.ok("Đã hủy");
    }
}