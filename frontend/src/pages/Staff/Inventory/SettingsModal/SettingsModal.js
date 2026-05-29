// SettingsModal.jsx
import React, { useEffect, useState } from "react";
import styles from "./SettingsModal.module.css";

export default function SettingsModal({ slot, onClose, onApply }) {
    const [tramList, setTramList] = useState([]);
    const [oldHealth, setOldHealth] = useState(slot.health ?? 100);
    const [initialTram, setInitialTram] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        tinhTrang: (slot.status || "đầy").toLowerCase(), // đầy | đang sạc | bảo trì
        trangThaiSoHuu: "sẵn sàng",                      // tự cập nhật theo tinhTrang
        sucKhoe: slot.health || 100,
        ngayBaoDuongGanNhat: slot.lastMaintenance || "",
        ngayNhapKho: slot.importDate || new Date().toISOString().split("T")[0], // ✅ khôi phục ô ngày nhập kho
        loaiPin: slot.type || "Không rõ",
        dungLuong: slot.capacity || 0,
        maTram: "",
        tramName: slot.title?.split("–")[1]?.trim() || "Chưa xác định",
        hanhDong: "",
    });

    const token = localStorage.getItem("token");

    /* 🔹 Lấy danh sách trạm */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/station-service/tram", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error("Lỗi tải danh sách trạm");
                const data = await res.json();
                setTramList(data);

                const current = data.find(
                    (t) => t.tenTram === form.tramName || t.maTram === slot.maTram
                );
                if (current) {
                    setForm((f) => ({
                        ...f,
                        maTram: current.maTram,
                        tramName: current.tenTram,
                    }));
                    setInitialTram(current.maTram);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* 🔹 Khi đổi tình trạng => cập nhật trạng thái sở hữu */
    useEffect(() => {
        let newTrangThai = "chưa sẵn sàng";
        if (form.tinhTrang === "đầy") newTrangThai = "sẵn sàng";
        else if (form.tinhTrang === "bảo trì" || form.tinhTrang === "đang sạc")
            newTrangThai = "chưa sẵn sàng";
        setForm((f) => ({ ...f, trangThaiSoHuu: newTrangThai }));
    }, [form.tinhTrang]);

    /* 🔹 Kiểm tra lỗi từng trường (khôi phục validation + viền đỏ) */
    const validate = (field, value) => {
        let message = "";
        const today = new Date().toISOString().split("T")[0];

        if (field === "sucKhoe") {
            const v = Number(value);
            if (isNaN(v) || v < 0 || v > 100 || v > oldHealth) {
                message = `Giá trị phải trong khoảng 0–${oldHealth}%`;
            }
        }

        if (field === "ngayBaoDuongGanNhat") {
            if (value && value > today) message = "Không được chọn ngày trong tương lai";
        }

        if (field === "ngayNhapKho") { // ✅ validate ngày nhập kho không vượt quá hôm nay
            if (value && value > today) message = "Ngày nhập kho không được vượt quá hôm nay";
        }

        if (field === "hanhDong" && tramChanged && !String(value || "").trim()) {
            message = "Vui lòng nhập hành động";
        }

        return message;
    };

    const tramChanged =
        form.maTram && String(form.maTram) !== String(initialTram);

    /* 🔹 Khi user thay đổi field */
    const handleChange = (field, value) => {
        setForm((prev) => {
            const updated = { ...prev };

            if (field === "maTram") {
                const selected = tramList.find(
                    (t) => String(t.maTram) === String(value)
                );
                if (selected) {
                    updated.maTram = selected.maTram;
                    updated.tramName = selected.tenTram ?? `Trạm ${selected.maTram}`;
                }
            } else {
                updated[field] = value;
            }

            const msg = validate(field, value);
            setErrors((err) => ({ ...err, [field]: msg }));
            return updated;
        });
    };

    /* 🔹 Submit cập nhật */
    const handleSubmit = async () => {
        // Re-validate all
        const newErrors = {};
        Object.keys(form).forEach((k) => {
            const msg = validate(k, form[k]);
            if (msg) newErrors[k] = msg;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            const pinId = String(slot.id).split(":")[0];

            const tinhTrangMap = {
                "đầy": "DAY",
                "đang sạc": "DANG_SAC",
                "bảo trì": "BAO_TRI",
            };
            const trangThaiSoHuuMap = {
                "sẵn sàng": "SAN_SANG",
                "chưa sẵn sàng": "CHUA_SAN_SANG",
            };

            const pinUpdate = {
                loaiPin: form.loaiPin,
                dungLuong: form.dungLuong,
                tinhTrang: tinhTrangMap[form.tinhTrang],
                trangThaiSoHuu: trangThaiSoHuuMap[form.trangThaiSoHuu],
                sucKhoe: Number(form.sucKhoe),
                ngayBaoDuongGanNhat: form.ngayBaoDuongGanNhat || null,
                ngayNhapKho: form.ngayNhapKho || null, // ✅ gửi cùng ngày nhập kho
            };

            const res1 = await fetch(`/api/battery-service/pins/${pinId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(pinUpdate),
            });
            if (!res1.ok) throw new Error("Cập nhật pin thất bại");

            if (tramChanged) {
                const historyBody = {
                    hanhDong:
                        (form.hanhDong || "").trim() || "Di chuyển pin sang trạm khác",
                    maPin: Number(pinId),
                    maTram: Number(form.maTram),
                    ngayThayDoi: new Date().toISOString(),
                };

                const res2 = await fetch("/api/battery-service/lichsu-pin-tram", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(historyBody),
                });
                if (!res2.ok) throw new Error("Ghi lịch sử thất bại");
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onApply?.();
            }, 1200);
        } catch (err) {
            alert("❌ " + err.message);
            console.error(err);
        }
    };

    if (loading)
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <p>🔄 Đang tải dữ liệu...</p>
                </div>
            </div>
        );

    /* ===== JSX ===== */
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Cài đặt Pin – {slot.title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {/* 🔹 Tình trạng mới */}
                    <div className={styles.formGroup}>
                        <label>Tình trạng mới</label>
                        <select
                            value={form.tinhTrang}
                            onChange={(e) => handleChange("tinhTrang", e.target.value)}
                            className={styles.input}
                        >
                            <option value="đầy">Đầy</option>
                            <option value="đang sạc">Đang sạc</option>
                            <option value="bảo trì">Bảo trì</option>
                        </select>
                    </div>

                    {/* 🔹 Trạng thái sở hữu (readonly, tự tính) */}
                    <div className={styles.formGroup}>
                        <label>Trạng thái sở hữu</label>
                        <input
                            type="text"
                            value={form.trangThaiSoHuu}
                            readOnly
                            className={styles.input}
                        />
                    </div>

                    {/* 🔹 Đổi trạm tạm thời không dùng*/}
                    {/*<div className={styles.formGroup}>
                        <label>Đổi trạm</label>
                        <select
                            value={form.maTram}
                            onChange={(e) => handleChange("maTram", e.target.value)}
                            className={`${styles.input} ${errors.maTram ? styles.errorInput : ""}`}
                        >
                            <option value={form.maTram}>
                                Trạm hiện tại: {form.tramName}
                            </option>
                            {tramList
                                .filter((t) => t.tenTram !== form.tramName)
                                .map((t) => (
                                    <option key={t.maTram} value={t.maTram}>
                                        {t.tenTram ?? `Trạm ${t.maTram}`}
                                    </option>
                                ))}
                        </select>
                        {errors.maTram && (
                            <small className={styles.errorMsg}>{errors.maTram}</small>
                        )}
                    </div>*/}

                    {/* 🔹 Nếu đổi trạm thì yêu cầu nhập hành động + hiện ngày thay đổi */}
                    {tramChanged && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Hành động</label>
                                <input
                                    type="text"
                                    value={form.hanhDong}
                                    onChange={(e) => handleChange("hanhDong", e.target.value)}
                                    placeholder="VD: Di chuyển pin sang trạm khác"
                                    className={`${styles.input} ${errors.hanhDong ? styles.errorInput : ""}`}
                                />
                                {errors.hanhDong && (
                                    <small className={styles.errorMsg}>{errors.hanhDong}</small>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Ngày thay đổi</label>
                                <input
                                    type="date"
                                    value={new Date().toISOString().split("T")[0]}
                                    readOnly
                                    className={styles.input}
                                />
                            </div>
                        </>
                    )}

                    {/* 🔹 % Sức khỏe (giữ validation + viền đỏ) */}
                    <div className={styles.formGroup}>
                        <label>% Sức khỏe</label>
                        <input
                            type="number"
                            value={form.sucKhoe}
                            onChange={(e) => handleChange("sucKhoe", Number(e.target.value))}
                            className={`${styles.input} ${errors.sucKhoe ? styles.errorInput : ""}`}
                        />
                        {errors.sucKhoe && (
                            <small className={styles.errorMsg}>{errors.sucKhoe}</small>
                        )}
                    </div>

                    {/* 🔹 Ngày bảo dưỡng gần nhất (giữ validation + viền đỏ) */}
                    <div className={styles.formGroup}>
                        <label>Ngày bảo dưỡng gần nhất</label>
                        <input
                            type="date"
                            value={form.ngayBaoDuongGanNhat || ""}
                            onChange={(e) => handleChange("ngayBaoDuongGanNhat", e.target.value)}
                            className={`${styles.input} ${errors.ngayBaoDuongGanNhat ? styles.errorInput : ""}`}
                        />
                        {errors.ngayBaoDuongGanNhat && (
                            <small className={styles.errorMsg}>{errors.ngayBaoDuongGanNhat}</small>
                        )}
                    </div>

                    {/* 🔹 Ngày nhập kho (khôi phục + validation + viền đỏ) */}
                    <div className={styles.formGroup}>
                        <label>Ngày nhập kho</label>
                        <input
                            type="date"
                            value={form.ngayNhapKho || ""}
                            onChange={(e) => handleChange("ngayNhapKho", e.target.value)}
                            className={`${styles.input} ${errors.ngayNhapKho ? styles.errorInput : ""}`}
                        />
                        {errors.ngayNhapKho && (
                            <small className={styles.errorMsg}>{errors.ngayNhapKho}</small>
                        )}
                    </div>

                    {showSuccess && (
                        <div className={styles.successMsg}>✔️ Cập nhật thành công</div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Hủy
                    </button>
                    <button className={styles.primaryBtn} onClick={handleSubmit}>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
