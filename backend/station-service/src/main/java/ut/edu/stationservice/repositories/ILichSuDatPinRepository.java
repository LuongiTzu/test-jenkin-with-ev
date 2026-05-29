package ut.edu.stationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ut.edu.stationservice.models.LichSuDatPin;

import java.time.LocalDateTime;
import java.util.List;

public interface ILichSuDatPinRepository extends JpaRepository<LichSuDatPin,Long> {
    List<LichSuDatPin> findByMaTaiXe(Long maTaiXe);
    List<LichSuDatPin> findByTram_MaTramAndTrangThaiXacNhan(Long maTram, String trangThaiXacNhan);
    List<LichSuDatPin> findByTram_MaTram(Long maTram);
    @Query("SELECT l FROM LichSuDatPin l " +
            "WHERE l.tram.maTram = :maTram " +
            "AND l.trangThaiXacNhan = :trangThaiXacNhan " +
            "AND l.trangThaiDoiPin <> 'Hoàn thành'")
    List<LichSuDatPin> findActiveQueueByTramAndStatus(
            @Param("maTram") Long maTram,
            @Param("trangThaiXacNhan") String trangThaiXacNhan
    );
    List<LichSuDatPin> findByTrangThaiXacNhanAndNgayDatBefore(
            String trangThaiXacNhan,
            LocalDateTime before);


}