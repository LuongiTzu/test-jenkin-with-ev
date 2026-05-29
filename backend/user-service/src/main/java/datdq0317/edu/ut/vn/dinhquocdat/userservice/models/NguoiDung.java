package datdq0317.edu.ut.vn.dinhquocdat.userservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name="nguoidung")
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maNguoiDung;

    private String hoTen;
    @Column(unique = true)
    private String email;
    @Column(nullable = false, unique = true)
    private String soDienThoai;
    private String gioiTinh;
    @Column(nullable = false)
    private String matKhau;
    private LocalDate ngaySinh;
    private LocalDate ngayTao;
    private String vaiTro;
    @OneToOne(mappedBy = "nguoiDung")
    @JsonIgnore
    private TaiXe taiXe;

    public TaiXe getTaiXe() {
        return taiXe;
    }

    public void setTaiXe(TaiXe taiXe) {
        this.taiXe = taiXe;
    }

    public NguoiDung(Long maNguoiDung, String hoTen, String email, String soDienThoai, String gioiTinh, String matKhau, LocalDate ngaySinh, LocalDate ngayTao, String vaiTro, TaiXe taiXe) {
        this.maNguoiDung = maNguoiDung;
        this.hoTen = hoTen;
        this.email = email;
        this.soDienThoai = soDienThoai;
        this.gioiTinh = gioiTinh;
        this.matKhau = matKhau;
        this.ngaySinh = ngaySinh;
        this.ngayTao = ngayTao;
        this.vaiTro = vaiTro;
        this.taiXe = taiXe;
    }

    public NguoiDung() {
    }


    public Long getMaNguoiDung() {
        return maNguoiDung;
    }

    public void setMaNguoiDung(Long maNguoiDung) {
        this.maNguoiDung = maNguoiDung;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(String gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(LocalDate ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    public LocalDate getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDate ngayTao) {
        this.ngayTao = ngayTao;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }
}
