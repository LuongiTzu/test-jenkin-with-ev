package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules;

import jakarta.persistence.*;


@Entity
@Table(name = "goidichvu")
public class GoiDichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maGoi;

    private String tenGoi;
    private String moTa;
    private Double gia;
    private Integer thoiGianDung;
    private Integer soLanDoi;

    public GoiDichVu() {
    }

    public GoiDichVu(Long maGoi, String tenGoi, String moTa, Double gia, Integer thoiGianDung, Integer soLanDoi) {
        this.maGoi = maGoi;
        this.tenGoi = tenGoi;
        this.moTa = moTa;
        this.gia = gia;
        this.thoiGianDung = thoiGianDung;
        this.soLanDoi = soLanDoi;
    }

    public Long getMaGoi() {
        return maGoi;
    }

    public void setMaGoi(Long maGoi) {
        this.maGoi = maGoi;
    }

    public String getTenGoi() {
        return tenGoi;
    }

    public void setTenGoi(String tenGoi) {
        this.tenGoi = tenGoi;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Double getGia() {
        return gia;
    }

    public void setGia(Double gia) {
        this.gia = gia;
    }

    public Integer getThoiGianDung() {
        return thoiGianDung;
    }

    public void setThoiGianDung(Integer thoiGianDung) {
        this.thoiGianDung = thoiGianDung;
    }

    public Integer getSoLanDoi() {
        return soLanDoi;
    }

    public void setSoLanDoi(Integer soLanDoi) {
        this.soLanDoi = soLanDoi;
    }
}