package ut.edu.stationservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ut.edu.stationservice.models.Tram;
import ut.edu.stationservice.services.ITramService;

@RestController
@RequestMapping("/api/station-service/tram")
public class TramController {

    private final ITramService tramService;

    public TramController(ITramService tramService) {
        this.tramService = tramService;
    }

    @GetMapping
    public ResponseEntity<List<Tram>> layDanhSachTram() {
        List<Tram> trams = tramService.findByTramId(null);
        return ResponseEntity.ok(trams);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tram> layTramTheoId(@PathVariable Long id) {
        Tram tram = tramService.findById(id);
        if (tram == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tram);
    }

    @PostMapping
    public ResponseEntity<?> themTram(@RequestBody Tram tram) {
        try {
            Tram newTram = tramService.addPin(tram);
            return ResponseEntity.ok(newTram);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<?> themNhieuTram(@RequestBody List<Tram> dsTram) {
        try {
            List<Tram> newTrams = tramService.addNhieuTram(dsTram);
            return ResponseEntity.ok(newTrams);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @PutMapping("/{id}")
    public ResponseEntity<?> suaTram(@PathVariable Long id, @RequestBody Tram tram) {
        try {
            tram.setMaTram(id);
            Tram updated = tramService.updatePin(tram);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaTram(@PathVariable Long id) {
        boolean deleted = tramService.deleteById(id);
        if (deleted) {
            return ResponseEntity.ok("Xóa trạm thành công!");
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy trạm cần xóa!");
        }
    }
}
