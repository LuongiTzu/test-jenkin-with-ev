package datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;
import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.TaiXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITaiXeRepository extends JpaRepository<TaiXe, Long> {
    TaiXe findByNguoiDung_MaNguoiDung(Long maNguoiDung);
}
