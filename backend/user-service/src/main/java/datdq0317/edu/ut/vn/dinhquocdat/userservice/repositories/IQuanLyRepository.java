package datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IQuanLyRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByEmail(String email);
    Optional<NguoiDung> findBySoDienThoai(String soDienThoai);
    List<NguoiDung> findByVaiTro(String vaiTro);
}
