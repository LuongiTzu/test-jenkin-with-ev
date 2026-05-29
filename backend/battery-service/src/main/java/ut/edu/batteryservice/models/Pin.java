package ut.edu.batteryservice.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Pin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_pin")
    private Long maPin;

    @Column(name = "loai_pin", nullable = false, length = 100)
    private String loaiPin;

    @Column(name = "dung_luong")
    private Double dungLuong; // đơn vị kWh hoặc Ah

    @Enumerated(EnumType.STRING)
    @Column(name = "tinh_trang", length = 50, nullable = false)
    private TinhTrang tinhTrang;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai_so_huu", length = 50, nullable = false)
    private TrangThaiSoHuu trangThaiSoHuu;

    @Column(name = "suc_khoe")
    private Double sucKhoe; // % sức khỏe pin

    @Column(name = "ngay_bao_duong_gan_nhat")
    private LocalDate ngayBaoDuongGanNhat;

    @Column(name = "ngay_nhap_kho")
    private LocalDate ngayNhapKho;

    // --- ENUMS ---
    public enum TinhTrang {
        DAY, DANG_SAC, BAO_TRI
    }

    public enum TrangThaiSoHuu {
        SAN_SANG, DANG_VAN_CHUYEN, DUOC_GIU_CHO, DANG_SU_DUNG, CHUA_SAN_SANG
    }

    // --- Constructors ---
    public Pin() {}

    public Pin(String loaiPin, Double dungLuong, TinhTrang tinhTrang, TrangThaiSoHuu trangThaiSoHuu,
               Double sucKhoe, LocalDate ngayBaoDuongGanNhat, LocalDate ngayNhapKho) {
        this.loaiPin = loaiPin;
        this.dungLuong = dungLuong;
        this.tinhTrang = tinhTrang;
        this.trangThaiSoHuu = trangThaiSoHuu;
        this.sucKhoe = sucKhoe;
        this.ngayBaoDuongGanNhat = ngayBaoDuongGanNhat;
        this.ngayNhapKho = ngayNhapKho;
    }

    // --- Getters & Setters ---
    public Long getMaPin() { return maPin; }
    public void setMaPin(Long maPin) { this.maPin = maPin; }

    public String getLoaiPin() { return loaiPin; }
    public void setLoaiPin(String loaiPin) { this.loaiPin = loaiPin; }

    public Double getDungLuong() { return dungLuong; }
    public void setDungLuong(Double dungLuong) { this.dungLuong = dungLuong; }

    public TinhTrang getTinhTrang() { return tinhTrang; }
    public void setTinhTrang(TinhTrang tinhTrang) { this.tinhTrang = tinhTrang; }

    public TrangThaiSoHuu getTrangThaiSoHuu() { return trangThaiSoHuu; }
    public void setTrangThaiSoHuu(TrangThaiSoHuu trangThaiSoHuu) { this.trangThaiSoHuu = trangThaiSoHuu; }

    public Double getSucKhoe() { return sucKhoe; }
    public void setSucKhoe(Double sucKhoe) { this.sucKhoe = sucKhoe; }

    public LocalDate getNgayBaoDuongGanNhat() { return ngayBaoDuongGanNhat; }
    public void setNgayBaoDuongGanNhat(LocalDate ngayBaoDuongGanNhat) { this.ngayBaoDuongGanNhat = ngayBaoDuongGanNhat; }

    public LocalDate getNgayNhapKho() { return ngayNhapKho; }
    public void setNgayNhapKho(LocalDate ngayNhapKho) { this.ngayNhapKho = ngayNhapKho; }
}
