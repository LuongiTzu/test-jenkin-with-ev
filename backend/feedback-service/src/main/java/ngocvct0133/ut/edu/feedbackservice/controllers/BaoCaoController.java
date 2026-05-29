    package ngocvct0133.ut.edu.feedbackservice.controllers;

    import java.util.List;
    import java.util.Map;

    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.DeleteMapping;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.PutMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import ngocvct0133.ut.edu.feedbackservice.modules.BaoCao;
    import ngocvct0133.ut.edu.feedbackservice.services.IBaoCaoService;

    @RestController
    @RequestMapping("/api/feedback-service/baocao")
    public class BaoCaoController {

        private final IBaoCaoService baoCaoService;

        public BaoCaoController(IBaoCaoService baoCaoService) {
            this.baoCaoService = baoCaoService;
        }

        @GetMapping
        public ResponseEntity<List<BaoCao>> layTatCaBaoCao() {
            return ResponseEntity.ok(baoCaoService.layTatCaBaoCao());
        }

        @GetMapping("/{id}")
        public ResponseEntity<BaoCao> layBaoCao(@PathVariable Long id) {
            return ResponseEntity.ok(baoCaoService.layBaoCao(id));
        }

        @PostMapping
        public ResponseEntity<BaoCao> themBaoCao(@RequestBody BaoCao baoCao) {
            BaoCao saved = baoCaoService.themBaoCao(baoCao);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }

        @PutMapping("/{id}")
        public ResponseEntity<BaoCao> suaBaoCao(@PathVariable Long id, @RequestBody BaoCao baoCao) {
            return ResponseEntity.ok(baoCaoService.suaBaoCao(id, baoCao));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> xoaBaoCao(@PathVariable Long id) {
            boolean deleted = baoCaoService.xoaBaoCao(id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        }

        // 📨 Admin phản hồi
        @PutMapping("/{id}/phanhoi")
        public ResponseEntity<BaoCao> phanHoiBaoCao(@PathVariable Long id, @RequestBody Map<String, String> body) {
            String phanHoi = body.get("phanHoi");
            BaoCao updated = baoCaoService.phanHoiBaoCao(id, phanHoi);
            return ResponseEntity.ok(updated);
        }
    }
