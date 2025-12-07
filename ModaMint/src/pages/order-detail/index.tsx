// src/pages/OrderDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@/services/order';
import { reviewService } from '@/services/review';
import { ProductReviewModal } from '@/components/detail/ProductReviewForm'; // ← Modal mới
import { CancelOrderModal } from '@/components/common/CancelOrderModal';
import { toast } from 'react-toastify';
import type { OrderDetailResponse } from '@/services/order';
import type { ReviewResponse } from '@/services/review';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './style.module.css';
import { useAuth } from '@/contexts/authContext';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerReviews, setCustomerReviews] = useState<Record<number, ReviewResponse | null>>({});
  const [cancelModal, setCancelModal] = useState(false);

  const { user } = useAuth();
  const customerId = user?.id || '';

  // Modal state - chỉ 1 modal duy nhất
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId: number;
    orderItemId: number;
    existingReview: ReviewResponse | null;
  }>({
    isOpen: false,
    productId: 0,
    orderItemId: 0,
    existingReview: null,
  });

  // Mở modal (tạo mới hoặc sửa)
  const openReviewModal = (productId: number, orderItemId: number, review: ReviewResponse | null = null) => {
    setModalState({
      isOpen: true,
      productId,
      orderItemId,
      existingReview: review,
    });
  };

  // Đóng modal
  const closeReviewModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Khi đánh giá thành công → reload review của item đó
  const handleReviewSuccess = (orderItemId: number) => {
    reviewService.getReviewsByOrderItemId(orderItemId).then(res => {
      if (res.success && res.data) {
        const ownReview = res.data.find(r => r.customerId === customerId);
        setCustomerReviews(prev => ({ ...prev, [orderItemId]: ownReview || null }));
      }
    });
    closeReviewModal();
  };

  // Dịch trạng thái đơn hàng
  const getOrderStatusDisplay = (status: string): { text: string; color: string } => {
    switch (status) {
      case 'PENDING': return { text: 'Chờ xác nhận', color: styles.statusPending };
      case 'PREPARING': return { text: 'Đang chuẩn bị hàng', color: styles.statusProcessing };
      case 'ARRIVED_AT_LOCATION': return { text: 'Hàng đã về kho', color: styles.statusProcessing };
      case 'SHIPPED': return { text: 'Đang giao hàng', color: styles.statusShipping };
      case 'DELIVERED': return { text: 'Đã giao hàng', color: styles.statusSuccess };
      case 'CANCELLED': return { text: 'Đã hủy', color: styles.statusCancelled };
      case 'RETURNED': return { text: 'Đã hoàn trả', color: styles.statusReturned };
      default: return { text: status, color: styles.statusDefault };
    }
  };

  const canReview = order?.orderStatus === 'DELIVERED';

  const handleCancelOrder = () => {
    setCancelModal(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!order || !id) return;

    try {
      const result = await orderService.cancelOrder(Number(id), customerId, reason);
      if (result.success) {
        toast.success('Đã hủy đơn hàng thành công');
        // Reload order data
        const updatedOrder = await orderService.getOrderDetailById(Number(id));
        if (updatedOrder.success && updatedOrder.data) {
          setOrder(updatedOrder.data);
        }
      } else {
        toast.error(result.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      toast.error('Lỗi khi hủy đơn hàng');
      console.error('Cancel order error:', error);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });

  // Fetch chi tiết đơn hàng + đánh giá
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      const result = await orderService.getOrderDetailById(Number(id));
      if (result.success && result.data) {
        setOrder(result.data);

        // Chỉ load đánh giá nếu đã giao hàng
        if (result.data.orderStatus === 'DELIVERED') {
          const reviewPromises = result.data.orderItems
            .filter(item => item.id)
            .map(item =>
              reviewService.getReviewsByOrderItemId(item.id!).then(res => ({
                orderItemId: item.id!,
                review: res.success && res.data
                  ? res.data.find(r => r.customerId === customerId) || null
                  : null,
              }))
            );

          const reviews = await Promise.all(reviewPromises);
          const reviewMap = reviews.reduce((acc, { orderItemId, review }) => {
            acc[orderItemId] = review;
            return acc;
          }, {} as Record<number, ReviewResponse | null>);

          setCustomerReviews(reviewMap);
        }
      } else {
        setError(result.message || 'Không tìm thấy đơn hàng');
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id, customerId]);

  if (loading) return <div className={styles.loading}>Đang tải chi tiết đơn hàng...</div>;
  if (error || !order) return <div className={styles.error}>Lỗi: {error}</div>;

  const statusInfo = getOrderStatusDisplay(order.orderStatus);

  return (
    <div className={styles.order_detail_page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/">Trang chủ</Link> →{' '}
        <Link to="/profile/order">Đơn hàng của tôi</Link> →{' '}
        <span>Đơn hàng #{order.orderCode}</span>
      </div>

      <h1 className={styles.page_title}>Chi tiết đơn hàng</h1>

      {/* Header */}
      <div className={styles.order_header}>
        <div>
          <h2>Mã đơn hàng: <strong>#{order.orderCode}</strong></h2>
          <p>Ngày đặt: {formatDate(order.createAt)}</p>
        </div>
        <div className={`${styles.status} ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className={styles.order_items_section}>
        <h3>Sản phẩm trong đơn hàng</h3>
        {order.orderItems.map((item) => (
          <div key={item.id} className={styles.order_item_card}>
            <div className={styles.item_image}>
              <img
                src={item.productVariantImage || 'https://via.placeholder.com/150?text=No+Image'}
                alt={item.productVariantName}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
            </div>

            <div className={styles.item_details}>
              <h4>{item.productVariantName}</h4>
              <p className={styles.item_attrs}>
                Màu: {item.color} | Size: {item.size}
              </p>
              <p className={styles.item_price}>
                {formatPrice(item.unitPrice)} × {item.quantity} →{' '}
                <strong>{formatPrice(item.lineTotal)}</strong>
              </p>

              {/* Nút đánh giá */}
              {canReview && (
                <div className={styles.review_section}>
                  {customerReviews[item.id!] ? (
                    <div className={styles.reviewed_controls}>
                      <span className={styles.reviewed_tag}>Đã đánh giá</span>
                      <button
                        onClick={() => openReviewModal(item.productId, item.id!, customerReviews[item.id!]!)}
                        className={styles.edit_review_btn}
                      >
                        Sửa đánh giá
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openReviewModal(item.productId, item.id!, null)}
                      className={styles.write_review_btn}
                    >
                      Viết đánh giá
                    </button>
                  )}
                </div>
              )}

              {!canReview && (
                <p className={styles.review_disabled}>
                  Bạn có thể đánh giá sản phẩm sau khi nhận hàng thành công.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tóm tắt thanh toán */}
      <div className={styles.summary_section}>
        <div className={styles.summary_block}>
          <h3>Tóm tắt thanh toán</h3>
          <div className={styles.summary_row}>
            <span>Tạm tính</span>
            <span>{formatPrice(order.subTotal)}</span>
          </div>
          {order.promotionValue > 0 && (
            <div className={styles.summary_row}>
              <span>Giảm giá</span>
              <span className={styles.discount}>-{formatPrice(order.promotionValue)}</span>
            </div>
          )}
          <div className={styles.summary_row_total}>
            <strong>Tổng cộng</strong>
            <strong className={styles.total_price}>{formatPrice(order.totalAmount)}</strong>
          </div>
          <div className={styles.summary_row}>
            <span>Phương thức</span>
            <span>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Nút quay lại và hủy đơn */}
      <div className={styles.actions}>
        <Link to="/profile/order" className={styles.back_btn}>
          Quay lại danh sách đơn hàng
        </Link>
        {order.orderStatus === 'PENDING' && (
          <button onClick={handleCancelOrder} className={styles.cancel_btn}>
            Hủy đơn hàng
          </button>
        )}
      </div>

      {/* Modal đánh giá - chỉ render 1 lần duy nhất */}
      <ProductReviewModal
        isOpen={modalState.isOpen}
        onClose={closeReviewModal}
        productId={modalState.productId}
        customerId={customerId}
        orderItemId={modalState.orderItemId}
        existingReview={modalState.existingReview}
        onSuccess={() => handleReviewSuccess(modalState.orderItemId)}
      />

      {/* Modal hủy đơn */}
      <CancelOrderModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleConfirmCancel}
        orderCode={order?.orderCode || ''}
      />
    </div>
  );
};

export default OrderDetailPage;