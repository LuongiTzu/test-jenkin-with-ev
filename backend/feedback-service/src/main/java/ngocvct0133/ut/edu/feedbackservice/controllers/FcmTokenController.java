package ngocvct0133.ut.edu.feedbackservice.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ngocvct0133.ut.edu.feedbackservice.services.IFcmTokenService;

@RestController
@RequestMapping("/api/feedback-service/fcm")
public class FcmTokenController {

    @Autowired
    private IFcmTokenService tokenService;

    @PostMapping("/update")
    public String updateToken(@RequestBody Map<String, String> body) {
        Long maNguoiDung = Long.valueOf(body.get("maNguoiDung"));
        String token = body.get("token");
        String role = body.get("role");

        tokenService.saveToken(maNguoiDung, role, token);
        return "✅ Token đã được lưu/cập nhật cho người dùng " + maNguoiDung;
    }

    @GetMapping("/{id}")
    public Object getToken(@PathVariable("id") Long id) {
        return tokenService.getTokenByMaNguoiDung(id);
    }
}
