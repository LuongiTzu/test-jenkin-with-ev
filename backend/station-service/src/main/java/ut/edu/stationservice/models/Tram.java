package ut.edu.stationservice.models;


import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tram")
public class Tram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_tram")
    private Long maTram;

    @Column(name = "ten_tram", nullable = false, length = 150)
    private String tenTram;

    @Column(name = "dia_chi", nullable = false, length = 255)
    private String diaChi;

    @Column(name = "kinh_do")
    private Double kinhDo; // Longitude

    @Column(name = "vi_do")
    private Double viDo; // Latitude

    @Column(name = "so_luong_pin_toi_da")
    private Integer soLuongPinToiDa;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDT;

    @Column(name = "trang_thai", length = 50)
    private String trangThai; // ví dụ: "Hoạt động", "Bảo trì", "Tạm dừng"

    // --- Constructors ---
    public Tram() {}

    public Tram(String tenTram, String diaChi, Double kinhDo, Double viDo,
                Integer soLuongPinToiDa, String soDT, String trangThai) {
        this.tenTram = tenTram;
        this.diaChi = diaChi;
        this.kinhDo = kinhDo;
        this.viDo = viDo;
        this.soLuongPinToiDa = soLuongPinToiDa;
        this.soDT = soDT;
        this.trangThai = trangThai;
    }

    // --- Getters & Setters ---
    public Long getMaTram() {
        return maTram;
    }

    public void setMaTram(Long maTram) {
        this.maTram = maTram;
    }

    public String getTenTram() {
        return tenTram;
    }

    public void setTenTram(String tenTram) {
        this.tenTram = tenTram;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public Double getKinhDo() {
        return kinhDo;
    }

    public void setKinhDo(Double kinhDo) {
        this.kinhDo = kinhDo;
    }

    public Double getViDo() {
        return viDo;
    }

    public void setViDo(Double viDo) {
        this.viDo = viDo;
    }

    public Integer getSoLuongPinToiDa() {
        return soLuongPinToiDa;
    }

    public void setSoLuongPinToiDa(Integer soLuongPinToiDa) {
        this.soLuongPinToiDa = soLuongPinToiDa;
    }

    public String getSoDT() {
        return soDT;
    }

    public void setSoDT(String soDT) {
        this.soDT = soDT;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
