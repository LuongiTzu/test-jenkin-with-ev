package datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos;

public class LoginRequest {
    private String soDienThoai;
    private String matKhau;

    // Constructor rỗng
    public LoginRequest() {}

    // Constructor có tham số
    public LoginRequest(String soDienThoai, String matKhau) {
        this.soDienThoai = soDienThoai;
        this.matKhau = matKhau;
    }

    // Getters and Setters
    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }
}