package ut.edu.batteryservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ut.edu.batteryservice.models.LichSuPinTram;
import ut.edu.batteryservice.models.Pin;

import java.util.List;

public interface ILichSuPinTramRepository extends JpaRepository<LichSuPinTram, Long> {

    @Query("""
        SELECT p 
        FROM Pin p 
        WHERE p.maPin IN (
            SELECT ls.maPin 
            FROM LichSuPinTram ls 
            WHERE ls.maTram = :maTram
        )
        AND p.tinhTrang = ut.edu.batteryservice.models.Pin$TinhTrang.DAY
        AND p.trangThaiSoHuu = ut.edu.batteryservice.models.Pin$TrangThaiSoHuu.SAN_SANG
        AND p.loaiPin = :loaiPin
        """)
    List<Pin> findAvailablePinsByTramAndLoai(
            @Param("maTram") Long maTram,
            @Param("loaiPin") String loaiPin
    );

    // ✔ Chỉ giữ 1 hàm — không duplicate
    LichSuPinTram findTopByMaPinOrderByNgayThayDoiDesc(Long maPin);
}
