package ngocvct0133.ut.edu.feedbackservice.modules;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maDanhGia;

    private String noiDung;
    private int soSao;
    private LocalDate ngayDanhGia;

    private Long maLichDat;

    private Long maTram;

    public DanhGia() {}

    public DanhGia(Long maDanhGia, String noiDung, int soSao, LocalDate ngayDanhGia) {
        this.maDanhGia = maDanhGia;
        this.noiDung = noiDung;
        this.soSao = soSao;
        this.ngayDanhGia = ngayDanhGia;
    }

    public Long getMaDanhGia() { return maDanhGia; }
    public void setMaDanhGia(Long maDanhGia) { this.maDanhGia = maDanhGia; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public int getSoSao() { return soSao; }
    public void setSoSao(int soSao) { this.soSao = soSao; }

    public LocalDate getNgayDanhGia() { return ngayDanhGia; }
    public void setNgayDanhGia(LocalDate ngayDanhGia) { this.ngayDanhGia = ngayDanhGia; }

    public Long getMaLichDat() { return maLichDat; }
    public void setMaLichDat(Long maLichDat) { this.maLichDat = maLichDat; }

    public Long getMaTram() { return maTram; }
    public void setMaTram(Long maTram) { this.maTram = maTram; }
}
