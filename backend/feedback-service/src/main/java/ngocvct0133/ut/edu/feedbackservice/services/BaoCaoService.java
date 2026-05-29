package ngocvct0133.ut.edu.feedbackservice.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ngocvct0133.ut.edu.feedbackservice.modules.BaoCao;
import ngocvct0133.ut.edu.feedbackservice.repositories.IBaoCaoRepository;

@Service
public class BaoCaoService implements IBaoCaoService {

    @Autowired
    private IBaoCaoRepository baoCaoRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AdminTokenService adminTokenService; // ✅ lấy token admin từ user-service


    // 🆕 1️⃣ Thêm báo cáo mới (Tài xế gửi đến Admin)
    @Override
    public BaoCao themBaoCao(BaoCao baoCao) {

        baoCao.setTrangThaiXuLy("Chờ xử lý");
        BaoCao saved = baoCaoRepository.save(baoCao);

        // 🔔 Gửi thông báo cho ADMIN khi có báo cáo mới
        String title = "📢 Báo cáo mới từ tài xế #" + baoCao.getMaTaiXe();
        String body  = baoCao.getTieuDe();

        try {
            List<String> adminTokens = adminTokenService.layTokenAdmin();

            adminTokens.forEach(token -> {
                notificationService.sendNotification(token, title, body);
            });

        } catch (Exception e) {
            System.out.println("⚠️ Lỗi khi gửi thông báo đến Admin: " + e.getMessage());
        }

        return saved;
    }


    // 🗑️ 2️⃣ Xóa báo cáo
    @Override
    public boolean xoaBaoCao(Long id) {
        if (!baoCaoRepository.existsById(id)) return false;
        baoCaoRepository.deleteById(id);
        return true;
    }


    // ✏️ 3️⃣ Sửa báo cáo (trước khi admin xử lý)
    @Override
    public BaoCao suaBaoCao(Long id, BaoCao baoCao) {
        BaoCao sua = baoCaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy báo cáo có ID = " + id));

        sua.setNoiDung(baoCao.getNoiDung());
        sua.setTieuDe(baoCao.getTieuDe());
        sua.setTrangThaiXuLy(baoCao.getTrangThaiXuLy());
        sua.setPhanHoi(baoCao.getPhanHoi());

        return baoCaoRepository.save(sua);
    }


    // 🔍 4️⃣ Lấy báo cáo theo ID
    @Override
    public BaoCao layBaoCao(Long id) {
        return baoCaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy báo cáo có ID = " + id));
    }


    // 📋 5️⃣ Lấy toàn bộ danh sách báo cáo
    @Override
    public List<BaoCao> layTatCaBaoCao() {
        return baoCaoRepository.findAll();
    }


    // 💬 6️⃣ Admin phản hồi báo cáo (gửi notify ngược lại cho tài xế)
    @Override
    public BaoCao phanHoiBaoCao(Long id, String phanHoi) {

        BaoCao bc = baoCaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy báo cáo có ID = " + id));

        bc.setPhanHoi(phanHoi);
        bc.setTrangThaiXuLy("Đã phản hồi");
        BaoCao updated = baoCaoRepository.save(bc);

        try {
            // ✅ Gọi sang user-service lấy token của tài xế
            List<String> driverTokens =
                    adminTokenService.layTokenTaiXe(bc.getMaTaiXe()); // bạn tạo thêm hàm này trong AdminTokenService

            driverTokens.forEach(token -> {
                notificationService.sendNotification(
                        token,
                        "📩 Phản hồi từ Admin",
                        "Báo cáo \"" + bc.getTieuDe() + "\" đã được phản hồi."
                );
            });

        } catch (Exception e) {
            System.out.println("❌ Lỗi gửi thông báo phản hồi: " + e.getMessage());
        }

        return updated;
    }
}
