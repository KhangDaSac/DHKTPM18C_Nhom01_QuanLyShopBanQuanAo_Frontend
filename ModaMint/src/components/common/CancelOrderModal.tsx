import React, { useState } from 'react';
import styles from './CancelOrderModal.module.css';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderCode: string;
}

const CANCEL_REASONS = [
  'Muốn thay đổi địa chỉ giao hàng',
  'Muốn thay đổi sản phẩm trong đơn hàng',
  'Tìm được giá tốt hơn ở nơi khác',
  'Đặt nhầm sản phẩm',
  'Không còn nhu cầu mua hàng',
  'Thời gian giao hàng quá lâu',
  'Lý do khác',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Lý do khác' 
      ? customReason.trim() 
      : selectedReason;

    if (!finalReason) {
      alert('Vui lòng chọn hoặc nhập lý do hủy đơn');
      return;
    }

    onConfirm(finalReason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <div className={styles.modal_overlay} onClick={handleClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2>Hủy đơn hàng #{orderCode}</h2>
          <button className={styles.close_btn} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.modal_body}>
          <p className={styles.modal_description}>
            Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng:
          </p>

          <div className={styles.reasons_list}>
            {CANCEL_REASONS.map((reason) => (
              <label key={reason} className={styles.reason_item}>
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Lý do khác' && (
            <div className={styles.custom_reason}>
              <label htmlFor="customReason">Nhập lý do của bạn:</label>
              <textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Vui lòng mô tả lý do hủy đơn..."
                rows={4}
                maxLength={500}
              />
              <small>{customReason.length}/500 ký tự</small>
            </div>
          )}
        </div>

        <div className={styles.modal_footer}>
          <button className={styles.btn_cancel} onClick={handleClose}>
            Đóng
          </button>
          <button 
            className={styles.btn_confirm} 
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'Lý do khác' && !customReason.trim())}
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
};
