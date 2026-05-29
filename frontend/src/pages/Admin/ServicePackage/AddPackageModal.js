import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './ServicePackages.module.css';

const AddPackageModal = ({ show, onClose, onAddPackage, loading }) => {
  const [formData, setFormData] = useState({
    tenGoi: '',
    moTa: '',
    gia: '',
    thoiGianDung: '',
    soLanDoi: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenGoi.trim()) {
      newErrors.tenGoi = 'Tên gói dịch vụ là bắt buộc';
    }

    if (!formData.moTa.trim()) {
      newErrors.moTa = 'Mô tả là bắt buộc';
    }

    if (!formData.gia || formData.gia <= 0) {
      newErrors.gia = 'Giá phải lớn hơn 0';
    }

    if (!formData.thoiGianDung || formData.thoiGianDung <= 0) {
      newErrors.thoiGianDung = 'Thời gian dùng phải lớn hơn 0';
    }

    if (!formData.soLanDoi || formData.soLanDoi < 0) {
      newErrors.soLanDoi = 'Số lần đổi không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddPackage(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      tenGoi: '',
      moTa: '',
      gia: '',
      thoiGianDung: '',
      soLanDoi: ''
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Thêm Gói Dịch Vụ Mới</h3>
          <button 
            className={styles.closeBtn} 
            onClick={handleClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tenGoi">Tên Gói Dịch Vụ *</label>
              <input
                type="text"
                id="tenGoi"
                name="tenGoi"
                value={formData.tenGoi}
                onChange={handleChange}
                className={errors.tenGoi ? styles.errorInput : ''}
                disabled={loading}
                placeholder="Nhập tên gói dịch vụ"
              />
              {errors.tenGoi && <span className={styles.errorText}>{errors.tenGoi}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="moTa">Mô Tả *</label>
              <textarea
                id="moTa"
                name="moTa"
                value={formData.moTa}
                onChange={handleChange}
                className={errors.moTa ? styles.errorInput : ''}
                disabled={loading}
                rows="3"
                placeholder="Nhập mô tả gói dịch vụ"
              />
              {errors.moTa && <span className={styles.errorText}>{errors.moTa}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="gia">Giá (VND) *</label>
              <input
                type="number"
                id="gia"
                name="gia"
                value={formData.gia}
                onChange={handleChange}
                className={errors.gia ? styles.errorInput : ''}
                disabled={loading}
                placeholder="Nhập giá gói dịch vụ"
                min="0"
              />
              {errors.gia && <span className={styles.errorText}>{errors.gia}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="thoiGianDung">Thời Gian Dùng (ngày) *</label>
              <input
                type="number"
                id="thoiGianDung"
                name="thoiGianDung"
                value={formData.thoiGianDung}
                onChange={handleChange}
                className={errors.thoiGianDung ? styles.errorInput : ''}
                disabled={loading}
                placeholder="Số ngày sử dụng"
                min="1"
              />
              {errors.thoiGianDung && <span className={styles.errorText}>{errors.thoiGianDung}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="soLanDoi">Số Lần Đổi *</label>
              <input
                type="number"
                id="soLanDoi"
                name="soLanDoi"
                value={formData.soLanDoi}
                onChange={handleChange}
                className={errors.soLanDoi ? styles.errorInput : ''}
                disabled={loading}
                placeholder="Số lần được đổi xe"
                min="0"
              />
              {errors.soLanDoi && <span className={styles.errorText}>{errors.soLanDoi}</span>}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading}
            >
              {loading ? 'Đang thêm...' : 'Thêm Gói Dịch Vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackageModal;