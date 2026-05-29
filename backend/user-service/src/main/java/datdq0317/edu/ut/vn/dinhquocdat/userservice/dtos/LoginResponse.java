package datdq0317.edu.ut.vn.dinhquocdat.userservice.dtos;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;

public class LoginResponse {
    private String token;
    private String role;
    private String email;
    private String soDienThoai;
    private Long userId;
    private String hoTen;

    public LoginResponse(String token, NguoiDung user) {
        this.token = token;
        this.role = user.getVaiTro();
        this.email = user.getEmail();
        this.soDienThoai = user.getSoDienThoai();
        this.userId = user.getMaNguoiDung();
        this.hoTen = user.getHoTen();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }
    // getters
}