package datdq0317.edu.ut.vn.dinhquocdat.userservice.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fcm_token")
public class FcmToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_nguoi_dung", nullable = false)
    private Long maNguoiDung;

    @Column(name = "vai_tro", nullable = false)
    private String vaiTro;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    private LocalDateTime ngayTao = LocalDateTime.now();

    public FcmToken() {}

    public FcmToken(Long maNguoiDung, String vaiTro, String token) {
        this.maNguoiDung = maNguoiDung;
        this.vaiTro = vaiTro;
        this.token = token;
        this.ngayTao = LocalDateTime.now();
    }

    // Getters & setters
    public Long getId() { return id; }
    public Long getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(Long maNguoiDung) { this.maNguoiDung = maNguoiDung; }
    public String getVaiTro() { return vaiTro; }
    public void setVaiTro(String vaiTro) { this.vaiTro = vaiTro; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
}
