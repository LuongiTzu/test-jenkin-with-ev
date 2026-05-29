package ut.edu.stationservice.models;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "lich_su_dat_pin")
public class LichSuDatPin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_lich_su_dat")
    private Long maLichSuDat;

    @Column(name = "trang_thai_xac_nhan", length = 50)
    private String trangThaiXacNhan; // Ví dụ: "Đã xác nhận", "Chờ xác nhận", "Từ chối"

    @Column(name = "trang_thai_doi_pin", length = 50)
    private String trangThaiDoiPin; // Ví dụ: "Đang đổi", "Hoàn thành", "Chưa đổi"

    @Column(name = "ngay_dat")
    private LocalDateTime ngayDat; // Thời gian đặt lịch đổi pin

    // ===== Quan hệ tới Tài xế và Trạm =====
    @Column(name = "ma_tai_xe")
    private Long maTaiXe;

    @Column(name = "ma_pin_duoc_giu")
    private Long maPinDuocGiu;


    public Long getMaGiaoDichDoiPin() {
        return maGiaoDichDoiPin;
    }

    public void setMaGiaoDichDoiPin(Long maGiaoDichDoiPin) {
        this.maGiaoDichDoiPin = maGiaoDichDoiPin;
    }

    @Column(name = "ma_giao_dich_doi_pin")
    private Long maGiaoDichDoiPin;


    @Column(name = "ma_xe_giao_dich")
    private Long maXeGiaoDich;


    @ManyToOne
    @JoinColumn(name = "ma_tram", referencedColumnName = "ma_tram")
    private Tram tram;

    // ===== Constructors =====
    public LichSuDatPin() {}

    public LichSuDatPin(Long maLichSuDat, String trangThaiXacNhan, String trangThaiDoiPin, LocalDateTime ngayDat, Long maTaiXe, Long maGiaoDichDoiPin, Long maXeGiaoDich, Tram tram) {
        this.maLichSuDat = maLichSuDat;
        this.trangThaiXacNhan = trangThaiXacNhan;
        this.trangThaiDoiPin = trangThaiDoiPin;
        this.ngayDat = ngayDat;
        this.maTaiXe = maTaiXe;
        this.maGiaoDichDoiPin = maGiaoDichDoiPin;
        this.maXeGiaoDich = maXeGiaoDich;
        this.tram = tram;
    }

    // ===== Getters & Setters =====
    public Long getMaLichSuDat() {
        return maLichSuDat;
    }

    public void setMaLichSuDat(Long maLichSuDat) {
        this.maLichSuDat = maLichSuDat;
    }

    public String getTrangThaiXacNhan() {
        return trangThaiXacNhan;
    }

    public void setTrangThaiXacNhan(String trangThaiXacNhan) {
        this.trangThaiXacNhan = trangThaiXacNhan;
    }

    public String getTrangThaiDoiPin() {
        return trangThaiDoiPin;
    }

    public void setTrangThaiDoiPin(String trangThaiDoiPin) {
        this.trangThaiDoiPin = trangThaiDoiPin;
    }

    public LocalDateTime getNgayDat() {
        return ngayDat;
    }

    public void setNgayDat(LocalDateTime ngayDat) {
        this.ngayDat = ngayDat;
    }

    public Long getMaTaiXe() {
        return maTaiXe;
    }

    public void setMaTaiXe(Long maTaiXe) {
        this.maTaiXe = maTaiXe;
    }

    public Tram getTram() {
        return tram;
    }

    public void setTram(Tram tram) {
        this.tram = tram;
    }

    public Long getMaXeGiaoDich() {
        return maXeGiaoDich;
    }

    public void setMaXeGiaoDich(Long maXeGiaoDich) {
        this.maXeGiaoDich = maXeGiaoDich;
    }

    public Long getMaPinDuocGiu() {
        return maPinDuocGiu;
    }

    public void setMaPinDuocGiu(Long maPinDuocGiu) {
        this.maPinDuocGiu = maPinDuocGiu;
    }
}
