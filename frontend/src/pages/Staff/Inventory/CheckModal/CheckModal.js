import React, { useEffect, useMemo, useState } from "react";
import styles from "./CheckModal.module.css";

export default function CheckModal({ open, onClose, onDone }) {
    const [loading, setLoading] = useState(true);
    const [pins, setPins] = useState([]);
    const [stations, setStations] = useState([]);
    const [oldHealth, setOldHealth] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [allowedTinhTrangOptions, setAllowedTinhTrangOptions] = useState(["đầy", "đang sạc", "bảo trì"]);

    const [form, setForm] = useState({
        maPin: "",
        loaiPin: "",
        dungLuong: "",
        newTinhTrang: "đầy",
        newSucKhoe: "",
        maTram: "",
        ngayNhapKho: "",
        ngayBaoDuongGanNhat: "",
        logNote: "",
        trangThaiSoHuu: "",
        oldTinhTrang: "",
    });

    const token = localStorage.getItem("token");

    // 🟢 Load dữ liệu Pin & Trạm
    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                setLoading(true);
                const [pinsRes, tramRes] = await Promise.all([
                    fetch("/api/battery-service/pins", {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }),
                    fetch("/api/station-service/tram", {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }),
                ]);

                const pinsData = pinsRes.ok ? await pinsRes.json() : [];
                const tramData = tramRes.ok ? await tramRes.json() : [];

                setPins(pinsData);

                // 🔹 Loại bỏ trạm trùng tên
                const uniq = [];
                const seen = new Set();
                tramData.forEach((t) => {
                    const name = (t.tenTram ?? t.ten_tram ?? "").trim();
                    if (name && !seen.has(name)) {
                        uniq.push(t);
                        seen.add(name);
                    }
                });
                setStations(uniq);
            } catch (err) {
                console.error("⚠️ Lỗi load dữ liệu:", err);
                setPins([]);
                setStations([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open]);

    // 🟢 Lọc pin đang sử dụng hoặc vận chuyển
    const eligiblePins = useMemo(() => {
        return pins.filter((p) => {
            const s = (p.trangThaiSoHuu ?? p.trang_thai_so_huu ?? "").toUpperCase();
            return s === "DANG_SU_DUNG" || s === "DANG_VAN_CHUYEN";
        });
    }, [pins]);

    // 🔹 Khi chọn pin → điền thông tin + giới hạn rule ô “Tình trạng mới”
    function handleSelectPin(id) {
        const p = pins.find((x) => Number(x.maPin ?? x.ma_pin) === Number(id));
        if (!p) return;

        const trangThaiSoHuu = p.trangThaiSoHuu ?? p.trang_thai_so_huu ?? "";
        const oldTinhTrang = (p.tinhTrang ?? p.tinh_trang ?? "").toUpperCase();

        let options = ["đầy", "đang sạc", "bảo trì"];
        let defaultTinhTrang = "đầy";

        // ⚙️ Rule cho pin đang vận chuyển
        if (trangThaiSoHuu.toUpperCase() === "DANG_VAN_CHUYEN") {
            if (oldTinhTrang === "DAY") {
                options = ["đầy", "bảo trì"];
                defaultTinhTrang = "đầy";
            } else if (oldTinhTrang === "DANG_SAC") {
                options = ["đang sạc", "bảo trì"];
                defaultTinhTrang = "đang sạc";
            } else if (oldTinhTrang === "BAO_TRI") {
                options = ["bảo trì"];
                defaultTinhTrang = "bảo trì";
            }
        }

        // ⚙️ Rule cho pin đang sử dụng
        else if (trangThaiSoHuu.toUpperCase() === "DANG_SU_DUNG") {
            options = ["đang sạc", "bảo trì"];
            defaultTinhTrang = "đang sạc";
        }

        setAllowedTinhTrangOptions(options);

        setForm((f) => ({
            ...f,
            maPin: id,
            loaiPin: p?.loaiPin ?? p?.loai_pin ?? "",
            dungLuong: p?.dungLuong ?? p?.dung_luong ?? "",
            ngayNhapKho: p?.ngayNhapKho ?? p?.ngay_nhap_kho ?? "",
            ngayBaoDuongGanNhat:
                p?.ngayBaoDuongGanNhat ?? p?.ngay_bao_duong_gan_nhat ?? "",
            trangThaiSoHuu,
            oldTinhTrang,
            newTinhTrang: defaultTinhTrang,
            logNote:
                trangThaiSoHuu?.toUpperCase() === "DANG_SU_DUNG"
                    ? "Trả pin sau khi sử dụng"
                    : trangThaiSoHuu?.toUpperCase() === "DANG_VAN_CHUYEN"
                        ? "Hoàn tất vận chuyển pin về trạm"
                        : "",
        }));
        setOldHealth(Number(p?.sucKhoe ?? p?.suc_khoe ?? 100));
    }

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const healthValue = Number(form.newSucKhoe);
    const invalidHealth =
        isNaN(healthValue) ||
        healthValue < 0 ||
        healthValue > 100 ||
        (oldHealth !== null && healthValue > oldHealth);

    const canSubmit =
        form.maPin &&
        form.maTram &&
        form.newTinhTrang &&
        form.newSucKhoe !== "" &&
        !invalidHealth;

    const tinhTrangMap = {
        "đầy": "DAY",
        "đang sạc": "DANG_SAC",
        "bảo trì": "BAO_TRI",
    };

    // 🔹 Submit
    async function handleSubmit() {
        try {
            const pinId = form.maPin;
            const currentDate = new Date().toISOString().split("T")[0];

            const oldPin = pins.find(
                (p) => Number(p.maPin ?? p.ma_pin) === Number(pinId)
            );
            if (!oldPin) throw new Error("Không tìm thấy thông tin pin hiện tại");

            const oldTrangThaiSoHuu =
                oldPin.trangThaiSoHuu ?? oldPin.trang_thai_so_huu ?? "SAN_SANG";
            const newTinhTrangEnum = tinhTrangMap[form.newTinhTrang];

            let newTrangThaiSoHuu = oldTrangThaiSoHuu;
            const isVanChuyen = ["DANG_VAN_CHUYEN"].includes(oldTrangThaiSoHuu);
            const isSuDung = ["DANG_SU_DUNG"].includes(oldTrangThaiSoHuu);

            // 🧩 Rule xử lý trạng thái sở hữu
            if (isVanChuyen) {
                if (newTinhTrangEnum === "DAY") newTrangThaiSoHuu = "SAN_SANG";
                else newTrangThaiSoHuu = "CHUA_SAN_SANG";
            } else if (isSuDung) {
                newTrangThaiSoHuu = "CHUA_SAN_SANG";
            }

            const pinUpdate = {
                maPin: oldPin.maPin ?? oldPin.ma_pin,
                loaiPin: form.loaiPin || oldPin.loaiPin || oldPin.loai_pin,
                dungLuong: form.dungLuong || oldPin.dungLuong || oldPin.dung_luong,
                tinhTrang: newTinhTrangEnum,
                trangThaiSoHuu: newTrangThaiSoHuu,
                sucKhoe: Number(form.newSucKhoe || oldPin.sucKhoe || oldPin.suc_khoe || 100),
                ngayBaoDuongGanNhat: oldPin.ngayBaoDuongGanNhat || oldPin.ngay_bao_duong_gan_nhat || null,
                ngayNhapKho: currentDate,
            };

            // 🟢 PUT cập nhật pin
            const res1 = await fetch(`/api/battery-service/pins/${pinId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(pinUpdate),
            });
            if (!res1.ok) throw new Error("Cập nhật pin thất bại");

            // 🟢 POST lịch sử pin – trạm
            const historyBody = {
                hanhDong:
                    form.logNote?.trim() ||
                    `Trả pin từ trạng thái ${form.trangThaiSoHuu || "chưa xác định"}`,
                maPin: Number(form.maPin),
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

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onDone?.();
                onClose?.();
            }, 1500);
        } catch (err) {
            console.error("❌", err);
            alert("❌ Lỗi: " + err.message);
        }
    }

    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            onClick={(e) =>
                e.target.classList.contains(styles.overlay) && onClose?.()
            }
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Ghi nhận pin trả về trạm</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <>
                            {/* 1️⃣ Chọn pin */}
                            <div className={styles.formRow}>
                                <label>Chọn pin (đang sử dụng hoặc đang vận chuyển)</label>
                                <select
                                    value={form.maPin}
                                    onChange={(e) => handleSelectPin(e.target.value)}
                                >
                                    <option value="">-- Chọn --</option>
                                    {eligiblePins.map((p) => {
                                        const id = p.maPin ?? p.ma_pin;
                                        const sohuu =
                                            (p.trangThaiSoHuu ?? p.trang_thai_so_huu ?? "")
                                                .toLowerCase()
                                                .replaceAll("_", " ");
                                        return (
                                            <option key={id} value={id}>
                                                {`Pin ${id} | ${p.loaiPin ?? p.loai_pin ?? ""} (${p.dungLuong ?? p.dung_luong ?? ""} kWh) — ${sohuu}`}
                                            </option>
                                        );
                                    })}
                                </select>

                                {form.trangThaiSoHuu && (
                                    <small className={styles.note}>
                                        ⚙️ Pin đang ở trạng thái sở hữu:{" "}
                                        <strong>
                                            {form.trangThaiSoHuu.toLowerCase().replaceAll("_", " ")}
                                        </strong>
                                    </small>
                                )}
                            </div>

                            {/* 2️⃣ Chọn trạm */}
                            <div className={styles.formRow}>
                                <label>Chọn trạm</label>
                                <select
                                    value={form.maTram}
                                    onChange={(e) => update("maTram", e.target.value)}
                                >
                                    <option value="">-- Chọn --</option>
                                    {stations.map((t) => {
                                        const id = t.maTram ?? t.ma_tram;
                                        const name = t.tenTram ?? t.ten_tram ?? `Trạm ${id}`;
                                        return (
                                            <option key={id} value={id}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* 3️⃣ Model + Dung lượng */}
                            <div className={styles.twoCols}>
                                <div className={styles.formRow}>
                                    <label>Model</label>
                                    <input value={form.loaiPin} readOnly />
                                </div>
                                <div className={styles.formRow}>
                                    <label>Dung lượng (kWh)</label>
                                    <input value={form.dungLuong} readOnly />
                                </div>
                            </div>

                            {/* 4️⃣ Sức khỏe + Tình trạng */}
                            <div className={styles.twoCols}>
                                <div className={styles.formRow}>
                                    <label>% Sức khỏe (0–100)</label>
                                    <input
                                        type="number"
                                        value={form.newSucKhoe}
                                        onChange={(e) => update("newSucKhoe", e.target.value)}
                                        placeholder="VD: 88"
                                        min="0"
                                        max={oldHealth ?? 100}
                                        className={invalidHealth ? styles.inputError : ""}
                                    />
                                    {oldHealth !== null && (
                                        <small className={styles.note}>
                                            Sức khỏe không được vượt quá {oldHealth}%
                                        </small>
                                    )}
                                </div>
                                <div className={styles.formRow}>
                                    <label>Tình trạng mới</label>
                                    <select
                                        value={form.newTinhTrang}
                                        onChange={(e) => update("newTinhTrang", e.target.value)}
                                    >
                                        {allowedTinhTrangOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 5️⃣ Ngày nhập kho + bảo dưỡng */}
                            <div className={styles.twoCols}>
                                <div className={styles.formRow}>
                                    <label>Ngày nhập kho (mới)</label>
                                    <input
                                        value={new Date().toISOString().split("T")[0]}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <label>Lần bảo dưỡng gần nhất</label>
                                    <input
                                        value={form.ngayBaoDuongGanNhat || "—"}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* 6️⃣ Ghi chú lịch sử */}
                            <div className={styles.formRow}>
                                <label>Ghi chú lịch sử</label>
                                <input
                                    type="text"
                                    placeholder="VD: Pin trả sau khi sử dụng, kiểm tra OK..."
                                    value={form.logNote}
                                    onChange={(e) => update("logNote", e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleSubmit}
                        disabled={!canSubmit || loading}
                    >
                        Xác nhận
                    </button>
                </div>

                {showSuccess && <div className={styles.toast}>✅ Cập nhật thành công!</div>}
            </div>
        </div>
    );
}
