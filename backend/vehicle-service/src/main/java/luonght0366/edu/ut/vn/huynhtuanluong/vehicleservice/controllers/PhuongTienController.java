package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.controllers;

import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.dtos.PhuongTienDTO;
import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.modules.PhuongTien;
import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.services.IPhuongTienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/vehicle-service/vehicles")
public class PhuongTienController {

    @Autowired
    private IPhuongTienService phuongTienService;

    // Tạo phương tiện
    @PostMapping
    public ResponseEntity<PhuongTien> themPhuongTien(@RequestBody PhuongTienDTO dto) {
        try {
            PhuongTien v = phuongTienService.themPhuongTien(dto);
            // nếu bạn đặt context-path=/api thì location sẽ là /api/vehicle-service/vehicles/{id}
            return ResponseEntity.created(URI.create("/api/vehicle-service/vehicles/" + v.getMaPhuongTien())).body(v);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Danh sách phương tiện
    @GetMapping
    public ResponseEntity<List<PhuongTien>> danhSachPhuongTien() {
        return ResponseEntity.ok(phuongTienService.danhSachPhuongTien());
    }

    // Lấy theo ID
    @GetMapping("/{id}")
    public ResponseEntity<PhuongTien> layPhuongTienTheoId(@PathVariable Long id) {
        PhuongTien v = phuongTienService.layPhuongTienTheoId(id);
        if (v == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(v);
    }

    // Cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<PhuongTien> suaPhuongTien(@PathVariable Long id, @RequestBody PhuongTienDTO dto) {
        try {
            PhuongTien updated = phuongTienService.suaPhuongTien(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Xoá
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaPhuongTien(@PathVariable Long id) {
        boolean deleted = phuongTienService.xoaPhuongTien(id);
        if (deleted) return ResponseEntity.noContent().build();
        return ResponseEntity.badRequest().build();
    }

    // ===== THEO ĐỀ: Danh sách xe theo tài xế =====
    // GET /api/vehicle-service/vehicles/by-driver/{driverId}
    @GetMapping("/by-driver/{driverId}")
    public ResponseEntity<List<PhuongTien>> danhSachTheoTaiXe(@PathVariable("driverId") Long driverId) {
        return ResponseEntity.ok(phuongTienService.danhSachTheoTaiXe(driverId));
    }

    // Liên kết pin hiện tại của xe
    // POST /api/vehicle-service/vehicles/{id}/link-pin/{pinId}
    @PostMapping("/{id}/link-pin/{pinId}")
    public ResponseEntity<PhuongTien> lienKetPin(@PathVariable Long id, @PathVariable("pinId") Long pinId) {
        try {
            return ResponseEntity.ok(phuongTienService.lienKetPin(id, pinId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Huỷ liên kết pin hiện tại
    // POST /api/vehicle-service/vehicles/{id}/unlink-pin
    @PostMapping("/{id}/unlink-pin")
    public ResponseEntity<PhuongTien> huyLienKetPin(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(phuongTienService.huyLienKetPin(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
