package datdq0317.edu.ut.vn.dinhquocdat.userservice.services;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${cache.user-ttl:300000}")
    private long userTtl;

    @Value("${cache.login-attempts-ttl:900000}")
    private long loginAttemptsTtl;

    // Lưu user BASIC info vào cache (tránh lỗi serialization)
    public void cacheUserBasicInfo(String soDienThoai, String hoTen, String vaiTro, Long maNguoiDung) {
        try {
            Map<String, Object> userBasicInfo = new HashMap<>();
            userBasicInfo.put("hoTen", hoTen);
            userBasicInfo.put("vaiTro", vaiTro);
            userBasicInfo.put("maNguoiDung", maNguoiDung);
            userBasicInfo.put("soDienThoai", soDienThoai);
            
            redisTemplate.opsForValue().set(
                "user:" + soDienThoai,
                userBasicInfo,
                userTtl,
                TimeUnit.MILLISECONDS
            );
            System.out.println("💾 Đã lưu user basic info vào cache: " + soDienThoai);
        } catch (Exception e) {
            System.out.println("❌ Lỗi lưu cache: " + e.getMessage());
        }
    }

    // Lấy user BASIC info từ cache
    public Map<String, Object> getCachedUserBasicInfo(String soDienThoai) {
        try {
            return (Map<String, Object>) redisTemplate.opsForValue().get("user:" + soDienThoai);
        } catch (Exception e) {
            System.out.println("❌ Lỗi đọc cache: " + e.getMessage());
            return null;
        }
    }

    // Xóa user details khỏi cache
    public void evictUserDetails(String soDienThoai) {
        redisTemplate.delete("user:" + soDienThoai);
    }

    // Quản lý login attempts (chống brute force)
    public void incrementLoginAttempts(String soDienThoai) {
        String key = "login_attempts:" + soDienThoai;
        Integer attempts = (Integer) redisTemplate.opsForValue().get(key);
        if (attempts == null) {
            attempts = 1;
        } else {
            attempts++;
        }
        redisTemplate.opsForValue().set(
                key,
                attempts,
                loginAttemptsTtl,
                TimeUnit.MILLISECONDS
        );
    }

    public int getLoginAttempts(String soDienThoai) {
        String key = "login_attempts:" + soDienThoai;
        Integer attempts = (Integer) redisTemplate.opsForValue().get(key);
        return attempts != null ? attempts : 0;
    }

    public void resetLoginAttempts(String soDienThoai) {
        redisTemplate.delete("login_attempts:" + soDienThoai);
    }

    // Blacklist token khi logout
    public void blacklistToken(String token, long expirationTime) {
        long ttl = expirationTime - System.currentTimeMillis();
        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                    "blacklist:" + token,
                    "true",
                    ttl,
                    TimeUnit.MILLISECONDS
            );
        }
    }

    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
    }
}