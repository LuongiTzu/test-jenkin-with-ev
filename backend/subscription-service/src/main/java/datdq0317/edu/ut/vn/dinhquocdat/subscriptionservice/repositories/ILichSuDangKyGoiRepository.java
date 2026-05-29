package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.repositories;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.LichSuDangKyGoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ILichSuDangKyGoiRepository extends JpaRepository<LichSuDangKyGoi, Long> {
    List<LichSuDangKyGoi> findByMaTaiXe(Long maTaiXe);
}
