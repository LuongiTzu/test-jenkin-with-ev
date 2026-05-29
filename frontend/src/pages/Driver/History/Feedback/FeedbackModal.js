import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faXmark,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FeedbackModal.module.css";

const RATING_COLORS = {
    1: "#EF4444",
    2: "#F59E0B",
    3: "#dbea08",
    4: "#84CC16",
    5: "#22C55E"
};

function FeedbackModal({
                           isOpen,
                           onClose,
                           transactionId,
                           stationName,
                           maTram,
                           onFeedbackSubmitted
                       }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return alert("Vui lòng chọn số sao đánh giá!");
        if (!comment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
        if (!maTram) return alert("Không thể xác định mã trạm!");

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");

            const feedbackData = {
                noiDung: comment,
                soSao: rating,
                ngayDanhGia: new Date().toISOString().split("T")[0],
                maLichDat: transactionId,
                maTram: maTram
            };

            const response = await fetch("/api/feedback-service/danhgia", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(feedbackData)
            });

            if (response.ok) {
                // 🔥 Lưu vào localStorage để FE biết giao dịch này đã đánh giá
                let rated = JSON.parse(localStorage.getItem("ratedTransactions") || "[]");
                if (!rated.includes(transactionId)) {
                    rated.push(transactionId);
                    localStorage.setItem("ratedTransactions", JSON.stringify(rated));
                }

                alert("✅ Đánh giá của bạn đã được gửi!");
                resetForm();
                onFeedbackSubmitted();
                onClose();
            } else {
                throw new Error("Gửi đánh giá thất bại");
            }

        } catch (error) {
            console.error("❌ Lỗi khi gửi đánh giá:", error);
            alert("❌ Có lỗi xảy ra, thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setComment("");
        setHoverRating(0);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                    <h2>Đánh Giá Dịch Vụ</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.transactionInfo}>
                        <h3>{stationName}</h3>
                        <p>Mã giao dịch: #{transactionId}</p>
                        <p>Mã trạm: <b>{maTram}</b></p>
                    </div>

                    <div className={styles.ratingSection}>
                        <label className={styles.sectionLabel}>Chất lượng dịch vụ:</label>

                        <div className={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        className={styles.starButton}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon
                                            icon={faStar}
                                            style={{ color: isActive ? RATING_COLORS[star] : "#D1D5DB" }}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        {rating > 0 ? (
                            <p className={styles.ratingText} style={{ color: RATING_COLORS[rating] }}>
                                {rating} sao – {
                                rating === 1 ? "Rất tệ" :
                                    rating === 2 ? "Tệ" :
                                        rating === 3 ? "Bình thường" :
                                            rating === 4 ? "Tốt" :
                                                "Rất tốt"
                            }
                            </p>
                        ) : (
                            <p className={styles.ratingText}>Chọn số sao để đánh giá</p>
                        )}

                    </div>

                    <div className={styles.commentSection}>
                        <label className={styles.sectionLabel}>Nhận xét của bạn:</label>
                        <textarea
                            className={styles.commentInput}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            disabled={isSubmitting}
                        />
                        <div className={styles.charCount}>{comment.length}/500 ký tự</div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} /> Hủy
                    </button>

                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang gửi..." : <>
                            <FontAwesomeIcon icon={faPaperPlane} /> Gửi đánh giá
                        </>}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default FeedbackModal;
