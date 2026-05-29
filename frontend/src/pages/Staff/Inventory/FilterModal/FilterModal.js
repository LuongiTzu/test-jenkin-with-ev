import React, { useEffect, useState } from "react";
import styles from "./FilterModal.module.css";

export default function FilterModal({ current, onClose, onApply }) {
    const [local, setLocal] = useState(current);
    const [models, setModels] = useState([]);

    useEffect(() => {
        setLocal(current);
    }, [current]);

    // --- Fetch tất cả pin rồi lọc loại pin duy nhất ---
    const fetchModels = async () => {
        try {
            const res = await fetch("/api/battery-service/pins");
            if (!res.ok) throw new Error("Không thể tải danh sách pin");
            const data = await res.json();

            // Lấy danh sách model pin duy nhất
            const uniqueModels = [
                ...new Set(
                    data.map((p) => p.loaiPin ?? p.loai_pin).filter(Boolean)
                ),
            ];
            setModels(uniqueModels);
        } catch (err) {
            console.error("⚠️ Lỗi tải model pin:", err);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    // --- Toggle trạng thái ---
    function toggleStatus(s) {
        setLocal((l) => {
            const next = l.status.includes(s)
                ? l.status.filter((x) => x !== s)
                : [...l.status, s];
            return { ...l, status: next };
        });
    }

    function updateModel(v) {
        setLocal((l) => ({ ...l, model: v }));
    }

    function updateMinCap(v) {
        setLocal((l) => ({ ...l, minCap: v === "" ? null : Number(v) }));
    }

    function updateMaxCap(v) {
        setLocal((l) => ({ ...l, maxCap: v === "" ? null : Number(v) }));
    }

    function updateMinHealth(v) {
        setLocal((l) => ({ ...l, minHealth: v === "" ? null : Number(v) }));
    }

    function updateMaxHealth(v) {
        setLocal((l) => ({ ...l, maxHealth: v === "" ? null : Number(v) }));
    }

    const capValid =
        (local.minCap == null || local.minCap >= 0) &&
        (local.maxCap == null || local.maxCap >= 0) &&
        (local.minCap == null ||
            local.maxCap == null ||
            local.maxCap >= local.minCap);

    const healthValid =
        (local.minHealth == null || local.minHealth >= 0) &&
        (local.maxHealth == null || local.maxHealth <= 100) &&
        (local.minHealth == null ||
            local.maxHealth == null ||
            local.maxHealth >= local.minHealth);

    const canApply = capValid && healthValid;

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains(styles.overlay)) onClose();
    };

    function resetFilters() {
        onApply({
            status: [],
            model: "",
            minCap: null,
            maxCap: null,
            minHealth: null,
            maxHealth: null,
        });
    }

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>Bộ lọc Pin</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {/* ========= LỌC TÌNH TRẠNG PIN ========= */}
                    <h4>Tình trạng Pin</h4>
                    <div className={styles.checkboxRow}>
                        {["đầy", "đang sạc", "bảo trì"].map((s) => (
                            <label key={s}>
                                <input
                                    type="checkbox"
                                    checked={local.status.includes(s)}
                                    onChange={() => toggleStatus(s)}
                                />
                                {` ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                            </label>
                        ))}
                    </div>

                    {/* ========= LỌC MODEL PIN ========= */}
                    <div className={styles.formRow}>
                        <label>Model Pin</label>
                        <select
                            value={local.model}
                            onChange={(e) => updateModel(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {models.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ========= LỌC DUNG LƯỢNG ========= */}
                    <h4>Dung lượng (kWh)</h4>
                    <div className={styles.filterRow}>
                        <div className={styles.formRow}>
                            <label>Tối thiểu</label>
                            <input
                                type="number"
                                value={local.minCap ?? ""}
                                onChange={(e) => updateMinCap(e.target.value)}
                                placeholder="VD: 4.5"
                            />
                        </div>
                        <div className={styles.formRow}>
                            <label>Tối đa</label>
                            <input
                                type="number"
                                value={local.maxCap ?? ""}
                                onChange={(e) => updateMaxCap(e.target.value)}
                                placeholder="VD: 7.5"
                            />
                        </div>
                    </div>

                    {/* ========= LỌC SỨC KHỎE ========= */}
                    <h4>Sức khỏe (%)</h4>
                    <div className={styles.filterRow}>
                        <div className={styles.formRow}>
                            <label>Tối thiểu</label>
                            <input
                                type="number"
                                value={local.minHealth ?? ""}
                                onChange={(e) => updateMinHealth(e.target.value)}
                                placeholder="VD: 70"
                            />
                        </div>
                        <div className={styles.formRow}>
                            <label>Tối đa</label>
                            <input
                                type="number"
                                value={local.maxHealth ?? ""}
                                onChange={(e) => updateMaxHealth(e.target.value)}
                                placeholder="VD: 100"
                            />
                        </div>
                    </div>

                    {/* ========= VALIDATION ========= */}
                    {(!capValid || !healthValid) && (
                        <small className={styles.inputError}>
                            ⚠️ Giá trị không hợp lệ (phải ≥ 0, và Tối đa ≥ Tối thiểu)
                        </small>
                    )}
                </div>

                {/* ========= FOOTER ========= */}
                <div className={styles.modalFooter}>
                    <button className={styles.ghostBtn} onClick={resetFilters}>
                        Xóa lọc
                    </button>
                    <button className={styles.secondaryBtn} onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => canApply && onApply(local)}
                        disabled={!canApply}
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}
