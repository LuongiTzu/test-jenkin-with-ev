package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.controllers;

import java.util.List;
import java.util.Map;

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

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.dtos.LichSuDangKyGoiDTO;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.LichSuDangKyGoi;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.services.ILichSuDangKyGoiService;

@RestController
@RequestMapping("/api/subscription-service/lichsudangkygoi")
public class LichSuDangKyGoiController {

    @Autowired
    private ILichSuDangKyGoiService lichSuDangKyGoiService;

    @PostMapping
    public ResponseEntity<LichSuDangKyGoi> them(@RequestBody LichSuDangKyGoiDTO dto) {
        // kiểm tra đầu vào tối giản
        if (dto.getMaTaiXe() == null || dto.getMaGoi() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            LichSuDangKyGoi lichSu = lichSuDangKyGoiService.themDangKyGoi(dto);
            return ResponseEntity.ok(lichSu);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichSuDangKyGoi> sua(@PathVariable Long id, @RequestBody LichSuDangKyGoiDTO dto) {
        return ResponseEntity.ok(lichSuDangKyGoiService.suaDangKyGoi(id, dto));
    }

    @PutMapping("/giaodich/{id}")
    public ResponseEntity<LichSuDangKyGoi> suaSoLanConLai(@PathVariable Long id, @RequestBody LichSuDangKyGoiDTO dto) {
        return ResponseEntity.ok(lichSuDangKyGoiService.suaSoLanConLai(id, dto));
    }

    @GetMapping
    public ResponseEntity<List<LichSuDangKyGoi>> danhSach() {
        return ResponseEntity.ok(lichSuDangKyGoiService.danhSachDangKyGoi());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LichSuDangKyGoi> layTheoId(@PathVariable Long id) {
        LichSuDangKyGoi lichSu = lichSuDangKyGoiService.layDangKyGoiTheoId(id);
        if (lichSu == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(lichSu);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoa(@PathVariable Long id) {
        boolean deleted = lichSuDangKyGoiService.xoaDangKyGoi(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.badRequest().build();
    }
    @GetMapping("/taixe/{maTaiXe}/kiemtra")
    public ResponseEntity<Map<String, Boolean>> kiemTraGoiConHan(@PathVariable Long maTaiXe) {
        boolean coGoiConHan = lichSuDangKyGoiService.kiemTraTaiXeCoGoiConHan(maTaiXe);
        return ResponseEntity.ok(Map.of("coGoiConHan", coGoiConHan));
    }

    @GetMapping("/taixe/{maTaiXe}")
    public ResponseEntity<List<LichSuDangKyGoi>> layLichSuTheoTaiXe(@PathVariable Long maTaiXe) {
        List<LichSuDangKyGoi> lichSu = lichSuDangKyGoiService.layLichSuTheoTaiXe(maTaiXe);
        return ResponseEntity.ok(lichSu);
    }
    @GetMapping("/thongke/theogoicuoc")
public ResponseEntity<Map<Long, Map<String, Long>>> thongKeDangKyTheoGoi() {
    try {
        Map<Long, Map<String, Long>> thongKe = lichSuDangKyGoiService.demSoLuongDangKyTheoGoi();
        return ResponseEntity.ok(thongKe);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}

@GetMapping("/kiemtrasudung/{maGoi}")
public ResponseEntity<Map<String, Boolean>> kiemTraGoiDangDuocSuDung(@PathVariable Long maGoi) {
    try {
        boolean dangDuocSuDung = lichSuDangKyGoiService.kiemTraGoiDangDuocSuDung(maGoi);
        return ResponseEntity.ok(Map.of("dangDuocSuDung", dangDuocSuDung));
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}
}