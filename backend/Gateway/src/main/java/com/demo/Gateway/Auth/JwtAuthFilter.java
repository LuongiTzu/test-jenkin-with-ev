//package com.demo.Gateway.Auth;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.cloud.gateway.filter.GatewayFilter;
//import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.stereotype.Component;
//import org.springframework.util.AntPathMatcher;
//
//@Component
//public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {
//
//    @Override
//    public GatewayFilter apply(Config config) {
//        return (exchange, chain) -> {
//            ServerHttpRequest request = exchange.getRequest();
//            String path = request.getURI().getPath();
//
//            System.out.println("🎯 [GATEWAY] Request to: " + path);
//
//            // 🚨 TẠM THỜI CHO PHÉP TẤT CẢ REQUEST
//            System.out.println("✅ [GATEWAY] Allowing all requests for now");
//            return chain.filter(exchange);
//        };
//    }
//
//    public static class Config {
//    }
//}