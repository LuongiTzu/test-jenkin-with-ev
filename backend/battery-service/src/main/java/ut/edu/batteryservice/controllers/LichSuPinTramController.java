package ut.edu.batteryservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.edu.batteryservice.models.LichSuPinTram;
import ut.edu.batteryservice.models.Pin;
import ut.edu.batteryservice.services.ILichSuPinTramService;

import java.util.List;

@RestController
@RequestMapping("/api/battery-service/lichsu-pin-tram")
public class LichSuPinTramController {

    @Autowired
    private ILichSuPinTramService lichSuPinTramService;

    // 🟢 Thêm mới lịch sử pin - trạm
    @PostMapping
    public ResponseEntity<LichSuPinTram> createLichSu(@RequestBody LichSuPinTram lichSuPinTram) {
        try {
            return ResponseEntity.ok(lichSuPinTramService.addLichSuPinTram(lichSuPinTram));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 🟡 Cập nhật lịch sử theo ID
    @PutMapping("/{id}")
    public ResponseEntity<LichSuPinTram> updateLichSu(
            @PathVariable Long id,
            @RequestBody LichSuPinTram lichSuPinTram
    ) {
        try {
            LichSuPinTram existing = lichSuPinTramService.findById(id);
            if (existing == null) return ResponseEntity.notFound().build();

            // Ghi đè dữ liệu
            existing.setHanhDong(lichSuPinTram.getHanhDong());
            existing.setNgayThayDoi(lichSuPinTram.getNgayThayDoi());
            existing.setMaPin(lichSuPinTram.getMaPin());
            existing.setMaTram(lichSuPinTram.getMaTram());

            return ResponseEntity.ok(lichSuPinTramService.save(existing));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 🔵 Lấy toàn bộ lịch sử
    @GetMapping
    public ResponseEntity<List<LichSuPinTram>> getAllLichSu() {
        return ResponseEntity.ok(lichSuPinTramService.findAll());
    }

    // 🟣 Lấy lịch sử theo ID
    @GetMapping("/{id}")
    public ResponseEntity<LichSuPinTram> getLichSuById(@PathVariable Long id) {
        LichSuPinTram lichSu = lichSuPinTramService.findById(id);
        if (lichSu == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(lichSu);
    }

    // 🔴 Xóa lịch sử theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLichSu(@PathVariable Long id) {
        boolean deleted = lichSuPinTramService.deleteById(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/{maTram}/available")
    public ResponseEntity<List<Pin>> getAvailablePinsByTramAndLoai(
            @PathVariable Long maTram,
            @RequestParam String loaiPin
    ) {
        List<Pin> result = lichSuPinTramService.getAvailablePins(maTram, loaiPin);
        return ResponseEntity.ok(result);
    }
}
