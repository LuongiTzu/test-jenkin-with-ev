package ut.edu.batteryservice.models;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LichSuPinTram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_lich_su_pin_tram")
    private Long maLichSuPinTram;

    @Column(name = "hanh_dong", nullable = false, length = 100)
    private String hanhDong;
    // Ví dụ: "Đưa pin vào trạm", "Lấy pin ra", "Kiểm tra", "Bảo dưỡng", v.v.

    @Column(name = "ngay_thay_doi")
    private LocalDateTime ngayThayDoi;
    // Dùng LocalDateTime để lưu cả ngày và giờ thay đổi

    @Column(name = "ma_pin")
    private Long maPin; // Khóa ngoại tham chiếu bảng Pin

    @Column(name = "ma_tram")
    private Long maTram; // Khóa ngoại tham chiếu bảng Tram

    // --- Constructors ---
    public LichSuPinTram() {}

    public LichSuPinTram(String hanhDong, LocalDateTime ngayThayDoi, Long maPin, Long maTram) {
        this.hanhDong = hanhDong;
        this.ngayThayDoi = ngayThayDoi;
        this.maPin = maPin;
        this.maTram = maTram;
    }

    // --- Getters & Setters ---
    public Long getMaLichSuPinTram() {
        return maLichSuPinTram;
    }

    public void setMaLichSuPinTram(Long maLichSuPinTram) {
        this.maLichSuPinTram = maLichSuPinTram;
    }

    public String getHanhDong() {
        return hanhDong;
    }

    public void setHanhDong(String hanhDong) {
        this.hanhDong = hanhDong;
    }

    public LocalDateTime getNgayThayDoi() {
        return ngayThayDoi;
    }

    public void setNgayThayDoi(LocalDateTime ngayThayDoi) {
        this.ngayThayDoi = ngayThayDoi;
    }

    public Long getMaPin() {
        return maPin;
    }

    public void setMaPin(Long maPin) {
        this.maPin = maPin;
    }

    public Long getMaTram() {
        return maTram;
    }

    public void setMaTram(Long maTram) {
        this.maTram = maTram;
    }
}
