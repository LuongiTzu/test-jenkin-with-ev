package datdq0317.edu.ut.vn.dinhquocdat.userservice.models;

import jakarta.persistence.*;

@Entity
@Table(name="taixe")
public class TaiXe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long maTaiXe;
    private String bangLaiXe;
    @OneToOne
    @JoinColumn(name = "maNguoiDung",referencedColumnName = "maNguoiDung",nullable = false)
    private NguoiDung nguoiDung;

    public TaiXe() {
    }

    public TaiXe(Long maTaiXe, String bangLaiXe, NguoiDung nguoiDung) {
        this.maTaiXe = maTaiXe;
        this.bangLaiXe = bangLaiXe;
        this.nguoiDung = nguoiDung;
    }

    public Long getMaTaiXe() {
        return maTaiXe;
    }

    public void setMaTaiXe(Long maTaiXe) {
        this.maTaiXe = maTaiXe;
    }

    public String getBangLaiXe() {
        return bangLaiXe;
    }

    public void setBangLaiXe(String bangLaiXe) {
        this.bangLaiXe = bangLaiXe;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }
}
