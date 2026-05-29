//package com.demo.Gateway.config;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import org.springframework.web.server.WebFilter;
//import org.springframework.web.server.WebFilterChain;
//import reactor.core.publisher.Mono;
//
//import javax.crypto.SecretKey;
//
//@Component
//public class JwtAuthenticationFilter implements GlobalFilter {
//
//    private final String SECRET_KEY = "datdq0317VeryLongAndSecureSecretKeyForJWTTokenGeneration2024";
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
//        String path = exchange.getRequest().getPath().toString();
//        String method = exchange.getRequest().getMethod().name();
//
//        System.out.println("🔍 [GATEWAY] " + method + " " + path);
//
//        // Bỏ qua xác thực cho các route auth và preflight requests
//        if (path.contains("/auth/") || "OPTIONS".equals(method)) {
//            System.out.println("✅ [GATEWAY] Bypass JWT for: " + path);
//            return chain.filter(exchange);
//        }
//
//        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            System.out.println("❌ [GATEWAY] No Authorization header or invalid format");
//            System.out.println("   Available headers: " + exchange.getRequest().getHeaders().keySet());
//            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//            return exchange.getResponse().setComplete();
//        }
//
//        String token = authHeader.substring(7);
//        System.out.println("🔐 [GATEWAY] Token received: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
//
//        try {
//            // Test với cả 2 cách decode
//            boolean isValid = validateTokenMethod1(token) || validateTokenMethod2(token);
//
//            if (!isValid) {
//                System.out.println("❌ [GATEWAY] Token validation failed");
//                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//                return exchange.getResponse().setComplete();
//            }
//
//            System.out.println("✅ [GATEWAY] Token is valid, forwarding request");
//
//            // Thêm thông tin user vào header
//            ServerWebExchange mutatedExchange = exchange.mutate()
//                    .request(builder -> builder
//                            .header("X-User-Id", "test-user")
//                            .header("X-User-Role", "USER")
//                    )
//                    .build();
//
//            return chain.filter(mutatedExchange);
//
//        } catch (Exception e) {
//            System.out.println("❌ [GATEWAY] Token validation error: " + e.getMessage());
//            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//            return exchange.getResponse().setComplete();
//        }
//    }
//
//    private boolean validateTokenMethod1(String token) {
//        try {
//            SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
//            Jwts.parserBuilder()
//                    .setSigningKey(key)
//                    .build()
//                    .parseClaimsJws(token);
//            System.out.println("✅ Method 1 - Token valid");
//            return true;
//        } catch (Exception e) {
//            System.out.println("❌ Method 1 failed: " + e.getMessage());
//            return false;
//        }
//    }
//
//    private boolean validateTokenMethod2(String token) {
//        try {
//            Jwts.parserBuilder()
//                    .setSigningKey(SECRET_KEY.getBytes())
//                    .build()
//                    .parseClaimsJws(token);
//            System.out.println("✅ Method 2 - Token valid");
//            return true;
//        } catch (Exception e) {
//            System.out.println("❌ Method 2 failed: " + e.getMessage());
//            return false;
//        }
//    }
//}