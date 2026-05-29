package ut.edu.stationservice.dtos;

public class DatLichRequest {
    private Long maTaiXe;
    private Long maTram;
    private Long maXeGiaoDich;
    private Long maPinDuocGiu;

    public Long getMaTaiXe() { return maTaiXe; }
    public void setMaTaiXe(Long maTaiXe) { this.maTaiXe = maTaiXe; }
    public Long getMaTram() { return maTram; }
    public void setMaTram(Long maTram) { this.maTram = maTram; }

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