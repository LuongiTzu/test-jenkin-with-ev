package luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.repositories;

import luonght0366.edu.ut.vn.huynhtuanluong.vehicleservice.modules.PhuongTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPhuongTienRepository extends JpaRepository<PhuongTien, Long> {
    List<PhuongTien> findAllByMaTaiXe(Long maTaiXe);
    boolean existsByVinOrBienSo(String vin, String bienSo);

    // Bỏ qua bản ghi có id = maPhuongTien (dùng khi update)
    boolean existsByVinOrBienSoAndMaPhuongTienNot(String vin, String bienSo, Long maPhuongTien);
}

