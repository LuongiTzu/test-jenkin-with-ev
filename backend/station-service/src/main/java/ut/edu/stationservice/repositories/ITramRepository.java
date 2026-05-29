package ut.edu.stationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ut.edu.stationservice.models.Tram;

public interface ITramRepository extends JpaRepository<Tram, Long> {
    boolean existsByTenTram(String tenTram);
}
