package ut.edu.batteryservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ut.edu.batteryservice.models.Pin;

public interface IPinRepository extends JpaRepository<Pin, Long> {
    long countByTinhTrang(Pin.TinhTrang tinhTrang);
    long countByTrangThaiSoHuu(Pin.TrangThaiSoHuu trangThaiSoHuu);
}
