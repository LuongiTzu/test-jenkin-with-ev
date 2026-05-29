import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './ServicePackages.module.css';

const EditPackageModal = ({ show, onClose, onUpdatePackage, loading, package: selectedPackage }) => {
  const [formData, setFormData] = useState({
    tenGoi: '',
    moTa: '',
    gia: '',
    thoiGianDung: '',
    soLanDoi: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedPackage) {
      setFormData({
        tenGoi: selectedPackage.tenGoi || '',
        moTa: selectedPackage.moTa || '',
        gia: selectedPackage.gia || '',
        thoiGianDung: selectedPackage.thoiGianDung || '',
        soLanDoi: selectedPackage.soLanDoi || ''
      });
    }
  }, [selectedPackage]);

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
    
    if (validateForm() && selectedPackage) {
      onUpdatePackage(selectedPackage.id, formData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!show || !selectedPackage) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh Sửa Gói Dịch Vụ</h3>
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
              <label htmlFor="edit-tenGoi">Tên Gói Dịch Vụ *</label>
              <input
                type="text"
                id="edit-tenGoi"
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
              <label htmlFor="edit-moTa">Mô Tả *</label>
              <textarea
                id="edit-moTa"
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
              <label htmlFor="edit-gia">Giá (VND) *</label>
              <input
                type="number"
                id="edit-gia"
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
              <label htmlFor="edit-thoiGianDung">Thời Gian Dùng (ngày) *</label>
              <input
                type="number"
                id="edit-thoiGianDung"
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
              <label htmlFor="edit-soLanDoi">Số Lần Đổi *</label>
              <input
                type="number"
                id="edit-soLanDoi"
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
              {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackageModal;