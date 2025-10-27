import React, { useState } from 'react';
import { Package, RefreshCcw, Star } from 'lucide-react';

// Import file CSS Module
import styles from './styles.module.css';
import { ProductReview } from './ReviewProduct';


const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({ // Sửa state
    info: false,
    policy: false,
    reviews: false
  });

  const tabsData = [
    {
      id: 'info',
      title: 'Thông tin chung',
      icon: <Package size={20} />,
      shortDescription: `Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.

Sản phẩm của chúng tôi được tuyển chọn kỹ lưỡng từ các nhà cung cấp uy tín, đảm bảo chất lượng và an toàn cho người tiêu dùng.`,
      fullDescription: `Chào mừng bạn đến với cửa hàng của chúng tôi! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.

Sản phẩm của chúng tôi được tuyển chọn kỹ lưỡng từ các nhà cung cấp uy tín, đảm bảo chất lượng và an toàn cho người tiêu dùng.

🏪 VỀ CỬA HÀNG:
• Thành lập từ năm 2020
• Hơn 10,000 khách hàng hài lòng
• Giao hàng toàn quốc
• Hỗ trợ 24/7

📦 CAM KẾT:
• Sản phẩm chính hãng 100%
• Giá cả cạnh tranh nhất thị trường
• Đóng gói cẩn thận, giao hàng nhanh chóng
• Bảo hành theo chính sách nhà sản xuất

💝 ƯU ĐÃI ĐẶC BIỆT:
• Miễn phí vận chuyển cho đơn hàng trên 500,000đ
• Tích điểm thành viên - đổi quà hấp dẫn
• Khuyến mãi mỗi tuần`,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
    },
    {
      id: 'policy',
      title: 'Chính sách đổi trả',
      icon: <RefreshCcw size={20} />,
      shortDescription: `Chúng tôi chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện sau:
• Sản phẩm còn nguyên tem, mác, chưa qua sử dụng
• Có đầy đủ hóa đơn, phiếu bảo hành`,
      fullDescription: `CHÍNH SÁCH ĐỔI TRẢ HÀNG

🔄 THỜI GIAN ĐỔI TRẢ:
• Trong vòng 7 ngày kể từ ngày nhận hàng
• Áp dụng cho tất cả sản phẩm trừ hàng khuyến mãi đặc biệt

✅ ĐIỀU KIỆN ĐỔI TRẢ:
• Sản phẩm còn nguyên tem, mác, nhãn hiệu
• Chưa qua sử dụng, không có dấu hiệu hư hỏng
• Còn đầy đủ phụ kiện, quà tặng kèm theo (nếu có)
• Có hóa đơn mua hàng hoặc phiếu bảo hành

📋 QUY TRÌNH ĐỔI TRẢ:
1. Liên hệ bộ phận CSKH qua hotline hoặc email
2. Cung cấp thông tin đơn hàng và lý do đổi trả
3. Đóng gói sản phẩm cẩn thận
4. Gửi hàng về địa chỉ của chúng tôi
5. Nhận sản phẩm mới hoặc hoàn tiền trong 5-7 ngày

💰 PHI ĐỔI TRẢ:
• Miễn phí nếu lỗi từ nhà sản xuất
• Khách hàng chịu phí vận chuyển nếu đổi ý
• Hoàn 100% tiền nếu sản phẩm lỗi

📞 LIÊN HỆ HỖ TRỢ:
• Hotline: 1900 xxxx
• Email: support@example.com
• Thời gian: 8:00 - 22:00 hàng ngày`,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
    },
    {
      id: 'reviews',
      title: 'Đánh giá sản phẩm',
      icon: <Star size={20} />,
      shortDescription: `Xem đánh giá và nhận xét từ khách hàng đã mua sản phẩm.`,
      fullDescription: ``,
      hideExpandButton: true
    }
  ];

  const currentTab = tabsData.find(tab => tab.id === activeTab);
  const isExpanded = currentTab ? expanded[currentTab.id] : false; // Sửa logic

  const toggleExpand = () => {
    if (currentTab) { // Thêm kiểm tra
      setExpanded(prev => ({
        ...prev,
        [activeTab]: !prev[activeTab]
      }));
    }
  };

  return (
    <div className={styles.product_tabs}>
      {/* Tabs Header */}
      <div className={styles.product_tabs_header}>
        {tabsData.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.product_tabs_button} ${
              activeTab === tab.id ? styles.product_tabs_button_active : ''
            }`}
          >
            <span className={styles.product_tabs_icon}>{tab.icon}</span>
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.product_tabs_content_wrapper}>
        {currentTab && currentTab.id !== 'reviews' && (
          <div className={styles.product_tabs_content}>
            {/* Description */}
            <div className={styles.product_tabs_description}>
              {isExpanded ? currentTab.fullDescription : currentTab.shortDescription}
            </div>

            {/* Image - Only show when expanded */}
            {isExpanded && currentTab.image && (
              <div className={styles.product_tabs_image_wrapper}>
                <img
                  src={currentTab.image}
                  alt={currentTab.title}
                  className={styles.product_tabs_image}
                />
              </div>
            )}

            {/* View More Button */}
            {!currentTab.hideExpandButton && (
              <div className={styles.product_tabs_expand_wrapper}>
                <button
                  onClick={toggleExpand}
                  className={styles.product_tabs_expand_button}
                >
                  {isExpanded ? '⬆ Thu gọn' : '⬇ Xem thêm'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product Review Component */}
        {currentTab && currentTab.id === 'reviews' && (
          <ProductReview productId={1} customerId={'1'} orderItemId={1} />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;