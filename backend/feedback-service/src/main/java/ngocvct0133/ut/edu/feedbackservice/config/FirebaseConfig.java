package ngocvct0133.ut.edu.feedbackservice.config;

import java.io.InputStream;

import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Component
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // ✅ Load file từ classpath (resources/firebase/…)
            InputStream serviceAccount = getClass()
                    .getClassLoader()
                    .getResourceAsStream("firebase/ev-battery-swap-system-firebase-adminsdk-fbsvc-7a516a4c96.json");

            if (serviceAccount == null) {
                throw new RuntimeException("❌ Firebase config file NOT FOUND in classpath!");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully (classpath)");
            }
        } catch (Exception e) {
            System.out.println("❌ Error initializing Firebase: " + e.getMessage());
        }
    }
}
