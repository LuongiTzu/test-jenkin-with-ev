package ut.edu.batteryservice.dtos;

public class BatterySummaryDTO {
    private long totalBatteries;
    private long healthy;
    private long degraded;
    private long critical;

    public BatterySummaryDTO() {}

    public BatterySummaryDTO(long totalBatteries, long healthy, long degraded, long critical) {
        this.totalBatteries = totalBatteries;
        this.healthy = healthy;
        this.degraded = degraded;
        this.critical = critical;
    }

    public long getTotalBatteries() { return totalBatteries; }
    public void setTotalBatteries(long totalBatteries) { this.totalBatteries = totalBatteries; }

    public long getHealthy() { return healthy; }
    public void setHealthy(long healthy) { this.healthy = healthy; }

    public long getDegraded() { return degraded; }
    public void setDegraded(long degraded) { this.degraded = degraded; }

    public long getCritical() { return critical; }
    public void setCritical(long critical) { this.critical = critical; }
}
