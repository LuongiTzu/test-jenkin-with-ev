package datdq0317.edu.ut.vn.dinhquocdat.userservice.Auth;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories.INguoiDungRepository;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.services.RedisService;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private INguoiDungRepository nguoiDungRepository;

    @Autowired
    private RedisService redisService;

    @Override
    public UserDetails loadUserByUsername(String soDienThoai) throws UsernameNotFoundException {
        // Thử lấy từ cache trước
        // 🚨 SỬA TÊN METHOD Ở ĐÂY:
        java.util.Map<String, Object> cachedUser = redisService.getCachedUserBasicInfo(soDienThoai);
        if (cachedUser != null) {
            System.out.println("✅ Lấy user từ cache: " + soDienThoai);
            // Tạo CustomUserDetails từ cached data
            return createUserDetailsFromCache(cachedUser);
        }

        System.out.println("🔍 Query database user: " + soDienThoai);
        
        // Nếu không có trong cache, query database
        NguoiDung user = nguoiDungRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với SĐT: " + soDienThoai));
        
        CustomUserDetails userDetails = new CustomUserDetails(user);
        
        // Lưu vào cache
        redisService.cacheUserBasicInfo(
            soDienThoai,
            userDetails.getHoTen(),
            userDetails.getVaiTro(), 
            userDetails.getMaNguoiDung()
        );
        System.out.println("💾 Lưu user vào cache: " + soDienThoai);
        
        return userDetails;
    }

    // Thêm method để tạo UserDetails từ cache
    private CustomUserDetails createUserDetailsFromCache(java.util.Map<String, Object> cachedUser) {
        try {
            Object maNguoiDungObj = cachedUser.get("maNguoiDung");
            Long maNguoiDung;
            
            if (maNguoiDungObj instanceof Integer) {
                maNguoiDung = ((Integer) maNguoiDungObj).longValue();
            } else if (maNguoiDungObj instanceof Long) {
                maNguoiDung = (Long) maNguoiDungObj;
            } else {
                maNguoiDung = Long.parseLong(maNguoiDungObj.toString());
            }
            
            String hoTen = (String) cachedUser.get("hoTen");
            String soDienThoai = (String) cachedUser.get("soDienThoai");
            String vaiTro = (String) cachedUser.get("vaiTro");
            
            // Tạo đối tượng tạm thời từ cached data
            // Cần tạo constructor mới trong CustomUserDetails
            return new CustomUserDetails(maNguoiDung, hoTen, soDienThoai, vaiTro);
        } catch (Exception e) {
            System.out.println("❌ Error creating UserDetails from cache: " + e.getMessage());
            throw new RuntimeException("Lỗi tạo UserDetails từ cache");
        }
    }
}