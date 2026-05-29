package datdq0317.edu.ut.vn.dinhquocdat.userservice.controllers;

import java.util.List;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.TaiXeDTO;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos.TaiXeResponse;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.TaiXe;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.services.ITaiXeService;

@RestController
@RequestMapping("/api/user-service/taixe")
public class TaiXeController {

    @Autowired
    private ITaiXeService taiXeService;

    @PostMapping
    public ResponseEntity<TaiXe> themTaiXe(@RequestBody TaiXeDTO dto) {
        TaiXe tx = taiXeService.themTaiXe(dto);
        return ResponseEntity.ok(tx);
    }

    @GetMapping
    public ResponseEntity<List<TaiXe>> danhSachTaiXe() {
        return ResponseEntity.ok(taiXeService.danhSachTaiXe());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiXe> layTaiXeTheoId(@PathVariable Long id) {
        TaiXe tx = taiXeService.layTaiXeTheoId(id);
        if (tx == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<TaiXe> layTaiXeTheoMaNguoiDung(@PathVariable Long id) {
        try {
            TaiXe tx = taiXeService.layTaiXeTheoMaNguoiDung(id);
            if (tx == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> suaTaiXe(@PathVariable Long id, @RequestBody TaiXeDTO dto) {
        try {
            TaiXe updated = taiXeService.suaTaiXe(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

   @DeleteMapping("/{id}")
public ResponseEntity<?> xoaTaiXe(@PathVariable Long id) {
    try {
        boolean deleted = taiXeService.xoaTaiXe(id);
        if (deleted) {
            return ResponseEntity.ok().body("Xóa tài xế thành công");
        } else {
            return ResponseEntity.badRequest().body("Không tìm thấy tài xế để xóa");
        }
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Lỗi khi xóa tài xế: " + e.getMessage());
    }
}
@GetMapping("/info/{id}")
public ResponseEntity<TaiXeResponse> layThongTinTaiXe(@PathVariable Long id) {
    TaiXeResponse response = taiXeService.layThongTinTaiXe(id);
    return ResponseEntity.ok(response);
}

}
