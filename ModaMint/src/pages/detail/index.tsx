// pages/product/ProductDetail.tsx
import { useState } from "react";
import { Button, Tabs, Badge, Space, Divider } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  MinusOutlined,
  PlusOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  RetweetOutlined,
} from "@ant-design/icons";

import ProductGallery from "../../components/product-image-gallery";
import RelatedProducts from "../../components/related-products";

export default function ProductDetail() {
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);

  return (
    <div className="bg-white m-[50px]">
      {/* Product Info Section */}
      <div className="max-w-6xl mx-auto p-6 flex md:flex-row gap-10">
        {/* Gallery */}
        <ProductGallery />

        {/* Product Details */}
        <div className="m-[30px] flex flex-col gap-6">
          <Badge.Ribbon text="Còn hàng" color="green">
            <h1 className="text-3xl font-bold text-gray-800">
              Mũ Lưỡi Trai Phối Màu Thêu Chữ P
            </h1>
          </Badge.Ribbon>

          <p className="text-4xl text-red-500 font-bold">268.000₫</p>
          <p className="text-gray-600">
            Với thiết kế đơn giản nhưng nổi bật, chiếc mũ này phù hợp với nhiều hoàn cảnh —
            từ đi dạo phố đến các chuyến du lịch.
          </p>

          {/* Quantity & Favorite */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Số lượng:</span>
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => setQty(Math.max(1, qty - 1))}
              />
              <span className="text-lg font-semibold">{qty}</span>
              <Button icon={<PlusOutlined />} onClick={() => setQty(qty + 1)} />
            </Space>

            <Button
              icon={
                fav ? (
                  <HeartFilled className="text-red-500" />
                ) : (
                  <HeartOutlined />
                )
              }
              onClick={() => setFav(!fav)}
            />
          </div>

          {/* Actions */}
          <Space>
            <Button size="large">Thêm vào giỏ</Button>
            <Button size="large" type="primary" danger>
              Mua ngay
            </Button>
          </Space>

          <Divider />

          {/* Features */}
          <Space direction="vertical" className="text-gray-700">
            <p>
              <SafetyCertificateOutlined /> Giao hàng toàn quốc – COD khi nhận
              hàng
            </p>
            <p>
              <TruckOutlined /> Miễn phí giao hàng – Theo chính sách
            </p>
            <p>
              <RetweetOutlined /> Đổi trả trong 7 ngày
            </p>
            <p>
              <ClockCircleOutlined /> Hỗ trợ 24/7
            </p>
          </Space>
        </div>
      </div>

      <Divider />

      {/* Tabs Section */}
      <div className="max-w-6xl mx-auto p-6">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Thông tin sản phẩm",
              children: <p>Chi tiết mô tả sản phẩm...Mũ Lưỡi Trai Phối Màu Thêu Chữ P là một phụ kiện thời trang độc đáo, mang đến sự kết hợp hoàn hảo giữa phong cách hiện đại và nét cá tính riêng biệt. Với thiết kế lưỡi trai truyền thống, chiếc mũ này giúp bảo vệ bạn khỏi ánh nắng mặt trời, đồng thời tạo điểm nhấn nổi bật cho trang phục của bạn. Điểm đặc biệt của chiếc mũ này chính là họa tiết thêu chữ "P" ở phần trước, mang đến vẻ đẹp đơn giản nhưng đầy ấn tượng, thể hiện phong cách mạnh mẽ và cá tính.

Mũ được phối màu tinh tế, tạo sự hài hòa giữa các tông màu, giúp dễ dàng kết hợp với nhiều bộ trang phục khác nhau. Từ áo thun, áo khoác, đến quần jean hay quần shorts, chiếc mũ này giúp bạn hoàn thiện phong cách thời trang đường phố, năng động mà không kém phần trẻ trung. Chất liệu vải cao cấp của mũ giúp thấm hút mồ hôi tốt, tạo cảm giác thoải mái khi sử dụng, đồng thời dễ dàng vệ sinh và bảo quản.

Phần dây điều chỉnh phía sau mũ giúp bạn dễ dàng điều chỉnh độ vừa vặn, mang lại sự thoải mái tối đa cho mọi kích cỡ vòng đầu. Mũ Lưỡi Trai Phối Màu Thêu Chữ P là sự lựa chọn lý tưởng cho những ai yêu thích phong cách thể thao, đường phố hoặc muốn thể hiện cá tính riêng biệt của mình.

Với thiết kế đơn giản nhưng nổi bật, chiếc mũ này phù hợp với nhiều hoàn cảnh, từ đi dạo phố, tham gia các hoạt động thể thao cho đến các chuyến du lịch hay những dịp gặp gỡ bạn bè. Đây sẽ là món phụ kiện không thể thiếu để bạn thể hiện phong cách thời trang và sự tự tin của bản thân.</p>,
            },
            {
              key: "2",
              label: "Chính sách đổi trả",
              children: <p>Đổi trả trong vòng 7 ngày nếu lỗi sản xuất.</p>,
            },
            {
              key: "3",
              label: "Đánh giá sản phẩm",
              children: <p>Chưa có đánh giá nào.</p>,
            },
          ]}
        />
      </div>

      <Divider />

      {/* Related Products */}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">
          SẢN PHẨM LIÊN QUAN
        </h2>
        <RelatedProducts />
      </div>
    </div>
  );
}
