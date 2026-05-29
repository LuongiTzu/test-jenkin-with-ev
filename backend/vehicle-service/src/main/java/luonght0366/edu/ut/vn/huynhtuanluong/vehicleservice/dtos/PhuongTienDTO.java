package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.dtos;

public class PhuongTienDTO {
    private String vin;
    private String bienSo;
    private String loaiXe;
    private Long maTaiXe;
    private Long maPin;

    public PhuongTienDTO() {}

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
