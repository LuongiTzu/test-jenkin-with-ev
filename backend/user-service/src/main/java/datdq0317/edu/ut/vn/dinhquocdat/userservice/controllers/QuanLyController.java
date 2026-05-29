package datdq0317.edu.ut.vn.dinhquocdat.userservice.controllers;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.services.IQuanLyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-service/quanly")
public class QuanLyController {
    @Autowired
    private IQuanLyService quanLyService;

    @GetMapping
    public ResponseEntity<List<NguoiDung>> danhSachQuanLy() {
        List<NguoiDung> list = quanLyService.danhSachQuanLy();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> themQuanLy(@RequestBody NguoiDung nguoiDung) {
        try {
            NguoiDung created = quanLyService.themQuanLy(nguoiDung);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<NguoiDung> layQuanLyBangId(@PathVariable Long id) {
        NguoiDung nd = quanLyService.layQuanLyBangId(id);
        if (nd == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(nd);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> suaThongTinQuanLy(@PathVariable Long id, @RequestBody NguoiDung nguoiDung) {
        NguoiDung updated = quanLyService.suaThongTinQuanLy(id, nguoiDung);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaQuanLy(@PathVariable Long id) {
        boolean deleted = quanLyService.xoaQuanLy(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy người dùng để xóa");
        }
    }
}
