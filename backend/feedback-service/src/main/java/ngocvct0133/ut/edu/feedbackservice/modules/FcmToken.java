package ngocvct0133.ut.edu.feedbackservice.modules;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fcm_tokens")
public class FcmToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Khóa ngoại logic trỏ sang user-service (theo ID)
    @Column(name = "ma_nguoi_dung", nullable = false)
    private Long maNguoiDung;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    @Column(name = "user_role")
    private String userRole;

    @Column(name = "created_at")
    private Long createdAt = System.currentTimeMillis();

    public FcmToken() {}

    public FcmToken(Long maNguoiDung, String token, String userRole) {
        this.maNguoiDung = maNguoiDung;
        this.token = token;
        this.userRole = userRole;
        this.createdAt = System.currentTimeMillis();
    }

    // Getters và Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(Long maNguoiDung) { this.maNguoiDung = maNguoiDung; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
