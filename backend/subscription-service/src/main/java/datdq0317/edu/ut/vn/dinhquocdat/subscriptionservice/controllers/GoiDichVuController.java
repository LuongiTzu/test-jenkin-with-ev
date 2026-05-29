package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.controllers;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.GoiDichVu;
import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.services.IGoiDichVuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-service/goidichvu")
public class GoiDichVuController {

    @Autowired
    private IGoiDichVuService goiDichVuService;

    @GetMapping("/public")
    public ResponseEntity<String> publicTest() {
        return ResponseEntity.ok("Public OK");
    }
    @PostMapping
    public ResponseEntity<GoiDichVu> themGoi(@RequestBody GoiDichVu goi) {
        try {
            return ResponseEntity.ok(goiDichVuService.themGoi(goi));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoiDichVu> suaGoi(@PathVariable Long id, @RequestBody GoiDichVu goi) {
        try {
            return ResponseEntity.ok(goiDichVuService.suaGoi(id, goi));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<List<GoiDichVu>> danhSachGoi() {
        return ResponseEntity.ok(goiDichVuService.danhSachGoi());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoiDichVu> layGoiTheoId(@PathVariable Long id) {
        GoiDichVu g = goiDichVuService.layGoiTheoId(id);
        if (g == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(g);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaGoi(@PathVariable Long id) {
        boolean deleted = goiDichVuService.xoaGoi(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
