package ngocvct0133.ut.edu.feedbackservice.services;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpMethod;


@Service
public class AdminTokenService {

   public List<String> layTokenAdmin() {
    try {
        String url = "http://gateway:8080/api/user-service/fcm/admin";

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<List<String>> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<List<String>>() {}
                );

        List<String> tokenList = response.getBody();

        System.out.println("✅ Token ADMIN lấy được: " + tokenList);
        return tokenList != null ? tokenList : List.of();
    } catch (Exception e) {
        System.err.println("❌ Lỗi lấy token admin: " + e.getMessage());
        return List.of();
    }
}



    public List<String> layTokenTaiXe(Long maTaiXe) {
        try {
            String url = "http://gateway:8080/api/user-service/fcm/" + maTaiXe;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<List> response =
                restTemplate.getForEntity(url, List.class);

            List body = response.getBody();

            if (body == null || body.isEmpty()) {
                System.out.println("⚠️ Không có token tài xế #" + maTaiXe);
                return List.of();
            }

            List<String> tokenList = body.stream()
                .map(item -> ((java.util.LinkedHashMap)item).get("token").toString())
                .toList();

            System.out.println("✅ Token tài xế #" + maTaiXe + ": " + tokenList);
            return tokenList;
        } catch (Exception e) {
            System.err.println("❌ Lỗi lấy token tài xế: " + e.getMessage());
            return List.of();
        }
    }
}
