package datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.repositories;

import datdq0317.edu.ut.vn.dinhquocdat.subscriptionservice.modules.GoiDichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IGoiDichVuRepository extends JpaRepository<GoiDichVu, Long> {
    boolean existsByTenGoi(String tenGoi);
}