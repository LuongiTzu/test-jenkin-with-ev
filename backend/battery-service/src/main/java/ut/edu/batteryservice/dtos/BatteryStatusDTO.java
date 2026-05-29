package ut.edu.batteryservice.dtos;

public class BatteryStatusDTO {

    private long tongSoPin;
    private long day;       // pin đầy
    private long dangSac;   // pin đang sạc
    private long baoTri;    // pin đang bảo trì

    public BatteryStatusDTO() {}

    public BatteryStatusDTO(long tongSoPin, long day, long dangSac, long baoTri) {
        this.tongSoPin = tongSoPin;
        this.day = day;
        this.dangSac = dangSac;
        this.baoTri = baoTri;
    }

    public long getTongSoPin() {
        return tongSoPin;
    }

    public void setTongSoPin(long tongSoPin) {
        this.tongSoPin = tongSoPin;
    }

    public long getDay() {
        return day;
    }

    public void setDay(long day) {
        this.day = day;
    }

    public long getDangSac() {
        return dangSac;
    }

    public void setDangSac(long dangSac) {
        this.dangSac = dangSac;
    }

    public long getBaoTri() {
        return baoTri;
    }

    public void setBaoTri(long baoTri) {
        this.baoTri = baoTri;
    }
}
