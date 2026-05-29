import React, { useEffect, useState } from "react";
import styles from "./Transaction.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import StatsHeader from "../components/StatsHeader/StatsHeader";
import axios from "axios";

// ======================= ITEM =======================
function TransactionItem({ tx }) {
  const method = tx.phuongThucThanhToan?.toLowerCase() || "";
  const badgeClass =
    method === "package"
      ? `${styles.badge} ${styles.badgePrimary}`
      : method === "card"
        ? `${styles.badge} ${styles.badgeInfo}`
        : method === "cash"
          ? `${styles.badge} ${styles.badgeNeutral}`
          : `${styles.badge} ${styles.badgeQR}`;

  return (
    <div className={styles.item}>
      {/* LEFT */}
      <div className={styles.left}>
        <div className={styles.time}>
          {new Date(tx.ngayGiaoDich).toLocaleTimeString("vi-VN")}
        </div>
        <div className={badgeClass}>{tx.phuongThucThanhToan}</div>
      </div>

      {/* MID */}
      <div className={styles.middle}>
        {/* Tài xế */}
        <div className={styles.name}>
          #{tx.maTaiXe} — {tx.taiXeName}
        </div>

        {/* Pin */}
        <div className={styles.meta}>
          <span className={styles.muted}>pin đi:</span>&nbsp;{tx.maPinTra}
          &nbsp;→&nbsp;
          <span className={styles.muted}>pin đến:</span>&nbsp;{tx.maPinNhan}
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <div className={styles.amount}>
          {tx.thanhtien.toLocaleString("vi-VN")}₫
        </div>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faDollarSign} />
        </button>
      </div>
    </div>
  );
}

// ======================= MAIN =======================
export default function Transaction() {
  const [maTram, setMaTram] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LẤY MÃ TRẠM NHÂN VIÊN =================
  useEffect(() => {
    const fetchNhanVienInfo = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const res = await axios.get(
          `/api/user-service/nhanvien/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.maTram) {
          setMaTram(res.data.maTram);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy mã trạm:", err);
      }
    };

    fetchNhanVienInfo();
  }, []);

  // ================= LẤY GIAO DỊCH THEO TRẠM =================
  useEffect(() => {
    if (!maTram) return;

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1) Lấy danh sách giao dịch
        const res = await axios.get(
          `/api/transaction-service/giaodichdoipin/tram/${maTram}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rawList = res.data;

        // 2) Enrich thêm tên tài xế
        const enriched = await Promise.all(
          rawList.map(async (t) => {
            let taiXeName = "Không rõ";

            try {
              const txRes = await axios.get(
                `/api/user-service/taixe/${t.maTaiXe}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              taiXeName = txRes.data.nguoiDung.hoTen;
            } catch (err) {
              console.warn("⚠ Không lấy được tên tài xế:", err);
            }

            return {
              ...t,
              taiXeName,
              dateOnly: t.ngayGiaoDich.split("T")[0],
            };
          })
        );

        setList(enriched);

      } catch (err) {
        console.error("❌ Lỗi lấy giao dịch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [maTram]);

  // ================= GROUP BY DATE =================
  const grouped = Object.entries(
    list.reduce((groups, tx) => {
      if (!groups[tx.dateOnly]) groups[tx.dateOnly] = [];
      groups[tx.dateOnly].push(tx);
      return groups;
    }, {})
  ).sort(([a], [b]) => (a > b ? -1 : 1)); // ngày mới → cũ

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerWrap}>
        <StatsHeader title="Lịch Sử Giao Dịch" />
      </div>

      {/* Loading */}
      {loading && <p className={styles.noData}>Đang tải...</p>}

      {/* Empty */}
      {!loading && grouped.length === 0 && (
        <p className={styles.noData}>Chưa có giao dịch nào.</p>
      )}

      {/* History */}
      {!loading &&
        grouped.length > 0 &&
        grouped.map(([date, txs]) => (
          <section key={date} className={`${styles.card} ${styles.historyCard}`}>
            <div className={styles.dateLabel}>
              {new Date(date).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>

            <div className={styles.list}>
              {txs.map((tx) => (
                <TransactionItem key={tx.maGiaoDichDoiPin} tx={tx} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}