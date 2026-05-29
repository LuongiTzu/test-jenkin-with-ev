package ut.edu.batteryservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ut.edu.batteryservice.models.Pin;
import ut.edu.batteryservice.services.IPinService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/battery-service/pins")
public class PinController {

    @Autowired
    private IPinService pinService;

    // 🟢 Thêm mới Pin
    @PostMapping
    public ResponseEntity<Pin> createPin(@RequestBody Pin pin) {
        try {
            return ResponseEntity.ok(pinService.createPinType(pin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 🟡 Cập nhật Pin theo ID
    @PutMapping("/{id}")
    public ResponseEntity<Pin> updatePin(@PathVariable Long id, @RequestBody Pin pin) {
        try {
            return ResponseEntity.ok(pinService.updatePinType(id, pin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PatchMapping("/{id}/state")
    public ResponseEntity<?> updatePinState(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String tinhTrang = body.get("tinhTrang");           // 🟢 thêm dòng này
            String trangThaiSoHuu = body.get("trangThaiSoHuu"); // 🟢 thêm dòng này

            Pin updated = pinService.updatePinState(id, tinhTrang, trangThaiSoHuu);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // 🔵 Lấy danh sách toàn bộ Pin
    @GetMapping
    public ResponseEntity<List<Pin>> getAllPins() {
        return ResponseEntity.ok(pinService.getAllPinTypes());
    }

    // 🟣 Lấy chi tiết Pin theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Pin> getPinById(@PathVariable Long id) {
        Pin pin = pinService.getPinTypeById(id);
        if (pin == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(pin);
    }

    // 🔴 Xóa Pin theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePin(@PathVariable Long id) {
        boolean deleted = pinService.deletePinType(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
