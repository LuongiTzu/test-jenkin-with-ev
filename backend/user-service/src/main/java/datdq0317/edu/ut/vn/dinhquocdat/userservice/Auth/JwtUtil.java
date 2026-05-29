package datdq0317.edu.ut.vn.dinhquocdat.userservice.Auth;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "datdq0317VeryLongAndSecureSecretKeyForJWTTokenGeneration2024";
    public String getSecretKey() {
        return SECRET_KEY;
    }
    public String generateToken(String soDienThoai, String role) {
        return Jwts.builder()
                .claim("role", role)
                .setSubject(soDienThoai)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String extractSoDienThoai(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }

    public boolean isTokenValid(String token, String soDienThoai) {
        return soDienThoai.equals(extractSoDienThoai(token)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration()
                .before(new Date());
    }
    
    // XOÁ METHOD isTokenCompletelyValid - XỬ LÝ TRONG JwtFilter THAY VÌ Ở ĐÂY
}