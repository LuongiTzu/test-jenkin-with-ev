package datdq0317.edu.ut.vn.dinhquocdat.userservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "nhanvien")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maNhanVien;

    private String bangCap;
    private String kinhNghiem;
    
    // Thêm mã trạm - lưu trữ ID tham chiếu đến service khác
    private Long maTram;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maNguoiDung", referencedColumnName = "maNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    public NhanVien() {
    }

    public NhanVien(Long maNhanVien, String bangCap, String kinhNghiem, Long maTram, NguoiDung nguoiDung) {
        this.maNhanVien = maNhanVien;
        this.bangCap = bangCap;
        this.kinhNghiem = kinhNghiem;
        this.maTram = maTram;
        this.nguoiDung = nguoiDung;
    }

    // Getter và Setter
    public Long getMaNhanVien() {
        return maNhanVien;
    }

    public void setMaNhanVien(Long maNhanVien) {
        this.maNhanVien = maNhanVien;
    }

    public String getBangCap() {
        return bangCap;
    }

    public void setBangCap(String bangCap) {
        this.bangCap = bangCap;
    }

    public String getKinhNghiem() {
        return kinhNghiem;
    }

    public void setKinhNghiem(String kinhNghiem) {
        this.kinhNghiem = kinhNghiem;
    }

    public Long getMaTram() {
        return maTram;
    }

    public void setMaTram(Long maTram) {
        this.maTram = maTram;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }
}