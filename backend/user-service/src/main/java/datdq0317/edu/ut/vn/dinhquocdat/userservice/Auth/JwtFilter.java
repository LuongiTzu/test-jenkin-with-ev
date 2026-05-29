package datdq0317.edu.ut.vn.dinhquocdat.userservice.Auth;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.services.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private RedisService redisService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String token = null;
        String soDienThoai = null;

        System.out.println("🔍 JwtFilter: Checking request to " + request.getRequestURI());

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("✅ JwtFilter: Token found");

            // 🔒 CHECK BLACKLIST FIRST
            if (redisService.isTokenBlacklisted(token)) {
                System.out.println("❌ JwtFilter: Token blacklisted");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token đã hết hiệu lực");
                return;
            }

            soDienThoai = jwtUtil.extractSoDienThoai(token);
            System.out.println("📱 JwtFilter: Extracted phone: " + soDienThoai);

            if (soDienThoai != null) {
                try {
                    CustomUserDetails userDetails;
                    
                    // 🚀 ƯU TIÊN LẤY TỪ CACHE TRƯỚC
                    System.out.println("🔎 JwtFilter: Checking cache for: " + soDienThoai);
                    Map<String, Object> cachedUser = redisService.getCachedUserBasicInfo(soDienThoai);
                    
                    if (cachedUser == null) {
                        System.out.println("❌ JwtFilter: Cache MISS - Querying database");
                        userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(soDienThoai);
                        
                        // Lưu basic info vào cache
                        System.out.println("💾 JwtFilter: Saving to cache: " + soDienThoai);
                        redisService.cacheUserBasicInfo(
                            soDienThoai,
                            userDetails.getHoTen(),
                            userDetails.getVaiTro(),
                            userDetails.getMaNguoiDung()
                        );
                    } else {
                        System.out.println("✅ JwtFilter: Cache HIT - Creating user from cache");
                        System.out.println("📝 Cached data: " + cachedUser);
                        userDetails = createUserDetailsFromCache(cachedUser);
                    }

                    // Kiểm tra token valid
                    boolean isTokenValid = jwtUtil.isTokenValid(token, soDienThoai);
                    System.out.println("🔐 JwtFilter: Token valid: " + isTokenValid);

                    if (isTokenValid) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("🎯 JwtFilter: Authentication SUCCESS");
                    } else {
                        System.out.println("❌ JwtFilter: Token INVALID");
                    }

                } catch (Exception e) {
                    System.out.println("💥 JwtFilter: ERROR - " + e.getMessage());
                    e.printStackTrace();
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Token verification failed");
                    return;
                }
            }
        } else {
            System.out.println("⚠️ JwtFilter: No Bearer token found");
        }
        chain.doFilter(request, response);
    }

    private CustomUserDetails createUserDetailsFromCache(Map<String, Object> cachedUser) {
        try {
            // Fix: Handle different number types from Redis
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
            
            System.out.println("👤 Creating UserDetails from cache: " + hoTen + " - " + vaiTro);
            
            return new CustomUserDetails(maNguoiDung, hoTen, soDienThoai, vaiTro);
        } catch (Exception e) {
            System.out.println("❌ Error creating UserDetails from cache: " + e.getMessage());
            throw e;
        }
    }
}