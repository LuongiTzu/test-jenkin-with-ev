package ngocvct0133.ut.edu.feedbackservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ngocvct0133.ut.edu.feedbackservice.modules.BaoCao;

public interface IBaoCaoRepository extends JpaRepository<BaoCao,Long> {
    // 📌 Lấy báo cáo theo tài xế
    List<BaoCao> findByMaTaiXe(Long maTaiXe);

    // 📌 Lấy báo cáo theo trạm
    List<BaoCao> findByMaTram(Long maTram);

    // 📌 Lấy báo cáo theo loại phản hồi
    List<BaoCao> findByLoaiPhanHoi(String loaiPhanHoi);
}
