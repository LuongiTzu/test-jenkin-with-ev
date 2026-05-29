package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.modules;

import jakarta.persistence.*;

@Entity
@Table(name = "phuongtien")
public class PhuongTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maPhuongTien;

    @Column(nullable = false, unique = true, length = 50)
    private String vin;

    @Column(nullable = false, unique = true, length = 20)
    private String bienSo;

    @Column(nullable = false, length = 40)
    private String loaiXe;

    // Khóa ngoại tham chiếu sang tài xế (service user)
    @Column(nullable = false)
    private Long maTaiXe;

    // Khóa ngoại tham chiếu sang pin (service pin)
    @Column
    private Long maPin;

    // ===== Constructor =====
    public PhuongTien() {
    }

    public PhuongTien(Long maPhuongTien, String vin, String bienSo, String loaiXe, Long maTaiXe, Long maPin) {
        this.maPhuongTien = maPhuongTien;
        this.vin = vin;
        this.bienSo = bienSo;
        this.loaiXe = loaiXe;
        this.maTaiXe = maTaiXe;
        this.maPin = maPin;
    }

    // ===== Getter / Setter =====

    public Long getMaPhuongTien() {
        return maPhuongTien;
    }

    public void setMaPhuongTien(Long maPhuongTien) {
        this.maPhuongTien = maPhuongTien;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getBienSo() {
        return bienSo;
    }

    public void setBienSo(String bienSo) {
        this.bienSo = bienSo;
    }

    public String getLoaiXe() {
        return loaiXe;
    }

    public void setLoaiXe(String loaiXe) {
        this.loaiXe = loaiXe;
    }

    public Long getMaTaiXe() {
        return maTaiXe;
    }

    public void setMaTaiXe(Long maTaiXe) {
        this.maTaiXe = maTaiXe;
    }

    public Long getMaPin() {
        return maPin;
    }

    public void setMaPin(Long maPin) {
        this.maPin = maPin;
    }
}
