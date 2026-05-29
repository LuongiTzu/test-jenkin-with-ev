package datdq0317.edu.ut.vn.dinhquocdat.userservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import datdq0317.edu.ut.vn.dinhquocdat.userservice.models.NhanVien;
@Repository
public interface INhanVienRepository extends JpaRepository<NhanVien, Long> {
    List<NhanVien> findByMaTram(Long maTram);
    NhanVien findByNguoiDung_MaNguoiDung(Long maNguoiDung);
}
