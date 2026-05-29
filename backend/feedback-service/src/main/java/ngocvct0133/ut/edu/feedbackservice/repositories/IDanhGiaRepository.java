package ngocvct0133.ut.edu.feedbackservice.repositories;

import ngocvct0133.ut.edu.feedbackservice.modules.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDanhGiaRepository extends JpaRepository<DanhGia, Long> {

    List<DanhGia> findByMaTram(Long maTram);
}
