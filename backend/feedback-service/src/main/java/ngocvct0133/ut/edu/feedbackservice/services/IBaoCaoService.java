package ngocvct0133.ut.edu.feedbackservice.services;

import java.util.List;

import ngocvct0133.ut.edu.feedbackservice.modules.BaoCao;

public interface IBaoCaoService {

    BaoCao themBaoCao(BaoCao baoCao);

    boolean xoaBaoCao(Long id);

    BaoCao suaBaoCao(Long id, BaoCao baoCao);

    BaoCao layBaoCao(Long id);

    List<BaoCao> layTatCaBaoCao();

    // 💬 Admin phản hồi báo cáo (hoặc nhân viên xác nhận)
    BaoCao phanHoiBaoCao(Long id, String phanHoi);
}
