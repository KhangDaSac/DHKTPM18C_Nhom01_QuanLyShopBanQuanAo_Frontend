import { CarouselDiscount } from "../../components/home/CarouselDiscount";
import { CategoryList } from "../../components/home/CategoryList";
import { ProductImgCard } from "../../components/home/item-components/ProductImgCard";
import { TitleLine } from "../../components/home/item-components/TitleLine";
import ListProducts from "../../components/home/ListProducts";
import { ReviewCarousel } from "../../components/home/ReviewCarousel";
import SaleBanner from "../../components/home/SaleBanner";
import SuggestionToday from "../../components/home/SuggestionToday";
import './style.css'

interface Promotion {
  id: number;
  discount: string;
  price: string;
  buttonText: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Benefit {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface Product {
  id: number;
  image: string;
  name: string;
  discount?: string;
  originalPrice: string;
  currentPrice: string;
  soldCount?: number;
}

interface Review {
  id: number;
  text: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
}
export default function Home() {
  const promotions: Promotion[] = [
    { id: 1, discount: '15%', price: '0.99K', buttonText: 'Xem ngay >' },
    { id: 2, discount: '25%', price: '10.49K', buttonText: 'Xem ngay >' },
    { id: 3, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
    { id: 4, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
    { id: 5, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
    { id: 6, discount: '+1 triệu', price: '1.99K', buttonText: 'Xem ngay >' },
  ];

  const categories: Category[] = [
    { id: 1, name: 'Áo Nữ', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 2, name: 'Quần Nữ', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 3, name: 'Váy Nữ', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 4, name: 'Áo Nam', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 5, name: 'Quần Nam', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 6, name: 'Phụ Kiện', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 7, name: 'Giày Nữ', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
    { id: 8, name: 'Túi Xách', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760199723/image_cate_1_wwqg84.webp' },
  ];

  const benefits: Benefit[] = [
    { id: 1, title: 'Giao hàng toàn quốc', description: 'Thanh toán khi nhận hàng', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760243357/icon_policy_1_m83jer.png' },
    { id: 2, title: 'Miễn phí đổi trả', description: 'Trong vòng 30 ngày', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760243357/icon_policy_1_m83jer.png' },
    { id: 3, title: 'Hỗ trợ 24/7', description: 'Tư vấn mọi lúc', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760243357/icon_policy_1_m83jer.png' },
    { id: 4, title: 'Ưu đãi thành viên', description: 'Giảm giá đặc biệt', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760243357/icon_policy_1_m83jer.png' },
  ];
  const sampleProducts: Product[] = [
    { id: 1, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo polo nam phông màu ND008', discount: '-25%', originalPrice: '600.000đ', currentPrice: '450.000đ', soldCount: 93 },
    { id: 2, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Váy liền phối màu', discount: '-28%', originalPrice: '800.000đ', currentPrice: '576.000đ', soldCount: 141 },
    { id: 3, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Phối Lã Cổ Đẳng Cấp', discount: '-17%', originalPrice: '700.000đ', currentPrice: '581.000đ', soldCount: 111 },
    { id: 4, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 145 },
    { id: 5, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    { id: 6, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    { id: 7, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 145 },
    { id: 8, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760247401/sp8-2-b6da4946-d566-436c-bb78-02b179755959_hskyox.webp', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    ];
      const tabs1 = ['Hàng mới về', 'Giá tốt', 'Tiết kiệm nhiều nhất', 'Demo'];
        const tabs2 = ['Phụ kiện nam', 'Phụ kiện nữ', 'Tất/vớ'];

    const reviews: Review[] = [
      {
        id: 1,
        text: "Tôi mới mua một bộ trang phục từ cửa hàng của họ và cảm thấy hoàn toàn hài lòng. Chất liệu vải rất mềm mại và thoáng khí, mặc lên rất dễ chịu cả ngày dài. Thiết kế cũng rất tinh tế và hiện đại, phù hợp với cả hướng thời trang những vẫn giữ được nét riêng biệt.",
        name: "Phương Ly",
        role: "Sinh viên",
        rating: 4,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
      },
      {
        id: 2,
        text: "Dịch vụ khách hàng tuyệt vời! Nhân viên tư vấn rất nhiệt tình và chuyên nghiệp. Sản phẩm đúng như mô tả, giao hàng nhanh chóng. Tôi chắc chắn sẽ quay lại mua sắm lần nữa và giới thiệu cho bạn bè.",
        name: "Minh Anh",
        role: "Nhân viên văn phòng",
        rating: 3,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
      },
      {
        id: 3,
        text: "Chất lượng sản phẩm vượt mong đợi với mức giá hợp lý. Đã mua nhiều lần và luôn hài lòng. Đóng gói cẩn thận, màu sắc và kích thước chính xác. Đây là địa chỉ mua sắm đáng tin cậy!",
        name: "Tuấn Kiệt",
        role: "Freelancer",
        rating: 2,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
      },
      {
        id: 4,
        text: "Mẫu mã đa dạng, luôn cập nhật xu hướng mới. Tôi đặc biệt thích phong cách thiết kế trẻ trung và năng động của shop. Chất vải thoải mái, không bị nhăn sau khi giặt. Rất đáng để thử!",
        name: "Thu Hà",
        role: "Giáo viên",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
      }
    ];
    
    const outstandingProducts: Product[] = [
    { id: 1, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo polo nam phông màu ND008', discount: '-25%', originalPrice: '600.000đ', currentPrice: '450.000đ', soldCount: 93 },
    { id: 2, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Váy liền phối màu', discount: '-28%', originalPrice: '800.000đ', currentPrice: '576.000đ', soldCount: 141 },
    { id: 3, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Phối Lã Cổ Đẳng Cấp', discount: '-17%', originalPrice: '700.000đ', currentPrice: '581.000đ', soldCount: 111 },
    { id: 4, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 145 },
    { id: 5, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    { id: 6, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    { id: 7, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 145 },
    { id: 8, image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760266518/image_album_1_avkisq.jpg', name: 'Áo Nữ Oversize Cát Bò Tinh Tế', discount: '-44%', originalPrice: '900.000đ', currentPrice: '486.000đ', soldCount: 0 },
    ];

  return (
    <div className="home-container">
      <SaleBanner benefits={benefits} />

      <CategoryList categories={categories} />

        <TitleLine title={"Dành riêng cho bạn"}/>
      <CarouselDiscount promotions={promotions} />

      <div className="list-products-container">
        <div className="list-header">
          <span className="preferential-timer">Ưu đãi đặc biệt</span>
          <h2 className='preferential-text'>00:00:00</h2>
          <ListProducts products={sampleProducts} itemsPerPage={4}/>
        </div>
      </div>

      <TitleLine title={"Gợi ý hôm nay"}/>
      <SuggestionToday products={sampleProducts} tabs={tabs1}/>

      <div className="container-img-banner">
        <div className="banner-large">
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_1_gkumu3.png" alt="Banner lớn" />
        </div>
        <div className="right-column">
            <div className="banner-medium">
                <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_2_f5bqdo.png" alt="Banner trung bình" />
            </div>
            <div className="bottom-row">
                <div className="banner-small">
                    <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_3_vq6xjz.png" alt="Banner nhỏ 1" />
                </div>
                <div className="banner-small">
                    <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_4_csi2jw.png" alt="Banner nhỏ 2" />
                </div>
            </div>
        </div>
      </div>

      <TitleLine title={"Bộ sưu tập nam"}/>
      <div className="male-collection">
          <ListProducts products={sampleProducts} itemsPerPage={2}/>
          <div className="container-male-img">
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760258514/img_product_banner_1_swjimu.webp" alt="" />
          </div>
      </div>

      <div className="event-home">
        <div className="">
          <img className="event-img-home" src="https://res.cloudinary.com/dkokkltme/image/upload/v1760261081/image_lookbook_1_ghrqxl.webp" alt="" />
        </div>
        <div className="text-event-container">
          <h1 className="event-title-home">ENCHANTING DRESS 2024</h1>
          <div className="event-content-home">
            <p>Khám phá bộ sưu tập mới nhất trong 20 ngày qua với những thiết kế thanh thoát và mềm mại. Nhũng hoa tiết hoa tươi sáng và chất liệu mịn màng sẽ mang đến sự quyến rũ và thoái mái cho mọi dịp.</p>
            <p>Tạo sự tươi mới bằng cách phối đồ cùng giày cao gót hoặc khăn lụa! Tùy thuộc vào sở thích của bạn.</p>
            <p>Trình bày buổi dạo phố một cách thanh lịch với những chiếc váy điệu đà được thiết kế tỉ mỉ, chất vải nhẹ nhàng, tạo cảm giác thoải mái, dễ chịu khi vận động, phù hợp với mọi lứa tuổi.</p>
            <p>Hãy để bộ sưu tập này làm nổi bật phong cách của bạn trong những dịp đặc biệt, tạo ấn tượng mạnh mẽ với mọi người.</p>
          </div>
          <button className="event-view-btn">Xem thêm</button>
        </div>
      </div>

      <TitleLine title={"Bộ sưu tập nữ"}/>
      <div className="male-collection">
          <ListProducts products={sampleProducts} itemsPerPage={2}/>
          <div className="container-male-img">
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760258514/img_product_banner_1_swjimu.webp" alt="" />
          </div>
      </div>

      <div className="blacfriday-event-home">
        <div className="containet-blackfriday">
          <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760262983/logo_ajhylk.png" alt="" />
        </div>
        <div>
        </div>
      </div>

      <TitleLine title={"Phụ kiện"}/>
      <SuggestionToday products={sampleProducts} tabs={tabs2}/>

      <div className="estimate-home">
        <div className="estimate-container">
          <div className="estimate-img">
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760263866/img_mini_review_t8drmo.webp" alt="" />
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760263866/img_mini_review_t8drmo.webp" alt="" />
          </div>
          <ReviewCarousel reviews={reviews}/>
        </div>
      </div>

      <TitleLine title={"Sản phẩm nổi bậc"}/>
      <div className="outstanding-container">
        {
          outstandingProducts.map(
            p => <ProductImgCard key={p.id} imageUrl={p.image}/>
          )
        }
      </div>
    </div>
  );
}