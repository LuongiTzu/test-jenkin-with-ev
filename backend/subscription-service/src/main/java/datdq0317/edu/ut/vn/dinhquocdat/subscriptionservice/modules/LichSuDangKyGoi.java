package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "lichsudangkygoi")
public class LichSuDangKyGoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maLichSuDangKyGoi;

    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private Integer soLanConLai;
    private String trangThai;

    private Long maTaiXe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maGoi", referencedColumnName = "maGoi")
    private GoiDichVu goiDichVu;

    public LichSuDangKyGoi() {
    }

    public LichSuDangKyGoi(Long maLichSuDangKyGoi, LocalDate ngayBatDau, LocalDate ngayKetThuc, Integer soLanConLai, String trangThai, Long maTaiXe, GoiDichVu goiDichVu) {
        this.maLichSuDangKyGoi = maLichSuDangKyGoi;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.soLanConLai = soLanConLai;
        this.trangThai = trangThai;
        this.maTaiXe = maTaiXe;
        this.goiDichVu = goiDichVu;
    }

    public Long getMaLichSuDangKyGoi() {
        return maLichSuDangKyGoi;
    }

    public void setMaLichSuDangKyGoi(Long maLichSuDangKyGoi) {
        this.maLichSuDangKyGoi = maLichSuDangKyGoi;
    }

    public LocalDate getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDate ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDate getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDate ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public Integer getSoLanConLai() {
        return soLanConLai;
    }

    public void setSoLanConLai(Integer soLanConLai) {
        this.soLanConLai = soLanConLai;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Long getMaTaiXe() {
        return maTaiXe;
    }

    public void setMaTaiXe(Long maTaiXe) {
        this.maTaiXe = maTaiXe;
    }

    public GoiDichVu getGoiDichVu() {
        return goiDichVu;
    }

    public void setGoiDichVu(GoiDichVu goiDichVu) {
        this.goiDichVu = goiDichVu;
    }
}