import { useEffect, useState, useMemo } from "react";
import { CarouselDiscount } from "@/components/home/CarouselDiscount";
import { CategoryList } from "@/components/home/CategoryList";
import { ProductImgCard } from "@/components/home/item-components/ProductImgCard";
import { TitleLine } from "@/components/home/item-components/TitleLine";
import ListProducts from "@/components/home/ListProducts";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import SaleBanner from "@/components/home/SaleBanner";
import SuggestionToday from "@/components/home/SuggestionToday";
import styles from './styles.module.css';
import { categoryService, type Category } from "@/services/category";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { productService, type ProductResponse } from "@/services/product";
import { brandService, type BrandResponse } from "@/services/brand";
import { percentagePromotionService } from "@/services/promotion"; // Import service
import { amountPromotionService } from "@/services/promotion";     // Import service
import { reviewService, type ReviewResponse } from "@/services/review";
import { Link } from "react-router-dom";

// Interface chung cho Promotion
export interface Promotion {
  id?: number;
  name: string;
  code: string;
  discountPercent?: number; // Chỉ cho PercentagePromotion
  discountAmount?: number;  // Chỉ cho AmountPromotion
  minOrderValue: number;
  startAt: string;
  endAt: string;
  quantity: number;
  isActive: boolean;
  createAt?: string;
  type: 'percentage' | 'amount'; // Phân biệt loại
}

interface Benefit {
  id: number;
  title: string;
  description: string;
  image: string;
}


export default function Home() {
  const benefits: Benefit[] = [
    { id: 1, title: 'Giao hàng toàn quốc', description: 'Thanh toán khi nhận hàng', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1765116041/icon_policy_3_znpuhy.webp' },
    { id: 2, title: 'Miễn phí đổi trả', description: 'Trong vòng 30 ngày', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1765116041/icon_policy_2_emzmwo.webp' },
    { id: 3, title: 'Hỗ trợ 24/7', description: 'Tư vấn mọi lúc', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1760243357/icon_policy_1_m83jer.png' },
    { id: 4, title: 'Ưu đãi thành viên', description: 'Giảm giá đặc biệt', image: 'https://res.cloudinary.com/dkokkltme/image/upload/v1765116041/icon_policy_2_emzmwo.webp' },
  ];


  const TTABS_TODAY = [
    'Hàng mới về',
    'Hàng mới cập nhật',
    'Còn ít hàng',
    'Còn nhiều hàng'
  ];

  // State cho dữ liệu
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [randomProducts, setRandomProducts] = useState<ProductResponse[]>([]);
  const [worstSelling, setWorstSelling] = useState<ProductResponse[]>([]);
  const [maleProducts, setMaleProducts] = useState<ProductResponse[]>([]);
  const [femaleProducts, setFemaleProducts] = useState<ProductResponse[]>([]);
  const [topBrandsProducts, setTopBrandsProducts] = useState<ProductResponse[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductResponse[]>([]);
  const [outstandingProducts, setOutstandingProducts] = useState<ProductResponse[]>([]);
  const [topBrands, setTopBrands] = useState<BrandResponse[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]); // State mới cho promotions
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useMemo cho tabs2 từ topBrands
  const tabs2 = useMemo(() => {
    if (topBrands.length > 0) {
      return topBrands
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        .slice(0, 5)
        .map(brand => brand.name);
    }
    return []; // Trả về mảng rỗng nếu không có data
  }, [topBrands]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
      const [
        topCats,
        randomRes,
        worstRes,
        maleRes,
        femaleRes,
        topBrandsRes,
        bestSellingRes,
        brandsRes,
        percentageRes,
        amountRes,
        latestReviewsRes, // Thêm mới
      ] = await Promise.all([
        categoryService.getTop8ActiveCategoriesByProductCount(),
        productService.getTop20RandomActiveProducts(),
        productService.getTop10WorstSellingProducts(),
        productService.getTop10MaleCategoryProducts(),
        productService.getTop10FemaleCategoryProducts(),
        productService.getProductsFromTop5Brands(),
        productService.getTop10BestSellingProducts(),
        brandService.getActiveBrands(),
        percentagePromotionService.getActive(),
        amountPromotionService.getActive(),
        reviewService.getLatest10Reviews(), // Gọi API
      ]);

        if (topCats.code === 1000) setTopCategories(topCats.result);
        if (randomRes.success) setRandomProducts(randomRes.data || []);
        if (worstRes.success) setWorstSelling(worstRes.data || []);
        if (maleRes.success) setMaleProducts(maleRes.data || []);
        if (femaleRes.success) setFemaleProducts(femaleRes.data || []);
        if (topBrandsRes.success) setTopBrandsProducts(topBrandsRes.data || []);
        if (bestSellingRes.success) {
          const products = bestSellingRes.data || [];
          setBestSellingProducts(products);
          setOutstandingProducts(products.slice(0, 8));
        }
          setTopBrands(brandsRes.result);
        if (latestReviewsRes.success) {
          setReviews(latestReviewsRes.data || []);
        } else {
          console.warn("Lỗi lấy đánh giá:", latestReviewsRes.message);
          setReviews([]);
        }

        // Hợp nhất 2 loại promotions thành 1 mảng chung
        // The backend /active endpoints should already return active items.
        // Be defensive here: accept different response shapes and treat undefined isActive as active.
        const percentageArray = Array.isArray(percentageRes) ? percentageRes : ((percentageRes as any)?.result ?? []);
        const amountArray = Array.isArray(amountRes) ? amountRes : ((amountRes as any)?.result ?? []);

        if (!Array.isArray(percentageArray) || !Array.isArray(amountArray)) {
          console.warn('Unexpected promotion response shapes', { percentageRes, amountRes });
        }

        const percentagePromos: Promotion[] = (percentageArray || []).map((p: any) => ({
          ...p,
          type: 'percentage' as const,
        }));
        const amountPromos: Promotion[] = (amountArray || []).map((p: any) => ({
          ...p,
          type: 'amount' as const,
        }));
        const allPromotions = [...percentagePromos, ...amountPromos]
          .filter(p => p.isActive ?? true) // treat undefined as active
          .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()) // Sắp xếp theo startAt mới nhất
          .slice(0, 6); // Giới hạn 6 promotions cho carousel
        setPromotions(allPromotions);

      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu");
        console.error("Lỗi fetch dữ liệu:", err);
        setPromotions([]); // Fallback: mảng rỗng nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  return (
    <div className={styles.home_container}>
      <SaleBanner benefits={benefits} />

      <CategoryList categories={topCategories} />

      <TitleLine title="Khuyến mãi tuyệt vời" />
      <CarouselDiscount promotions={promotions} /> {/* Đổ dữ liệu thật */}

      {/* Sản phẩm bán ít nhất */}
      <div className={styles.list_products_container}>
        <div className={styles.list_header}>
          <span className={styles.preferential_timer}>Sản phẩm đặc biệt</span>
          <CountdownTimer durationInSeconds={24 * 60 * 60} />
          <ListProducts products={worstSelling} itemsPerPage={4} />
        </div>
      </div>

      {/* Gợi ý hôm nay - 20 sản phẩm ngẫu nhiên */}
      <TitleLine title="Gợi ý hôm nay" />
      <SuggestionToday products={randomProducts} tabs={TTABS_TODAY} />

      <div className={styles.container_img_banner}>
        <div className={styles.banner_large}>
          <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_1_gkumu3.png" alt="Banner lớn" />
        </div>
        <div className={styles.right_column}>
          <div className={styles.banner_medium}>
            <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_2_f5bqdo.png" alt="Banner trung bình" />
          </div>
          <div className={styles.bottom_row}>
            <div className={styles.banner_small}>
              <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_3_vq6xjz.png" alt="Banner nhỏ 1" />
            </div>
            <div className={styles.banner_small}>
              <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760249412/img_banner_4_csi2jw.png" alt="Banner nhỏ 2" />
            </div>
          </div>
        </div>
      </div>

      {/* Bộ sưu tập nam */}
      <TitleLine title="Bộ sưu tập nam" />
      <div className={styles.male_collection}>
        <ListProducts products={maleProducts} itemsPerPage={2} />
        <div className={styles.container_male_img}>
          <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760258514/img_product_banner_1_swjimu.webp" alt="" />
        </div>
      </div>

      <div className={styles.event_home}>
        <div>
          <img className={styles.event_img_home} src="https://res.cloudinary.com/dkokkltme/image/upload/v1760261081/image_lookbook_1_ghrqxl.webp" alt="" />
        </div>
        <div className={styles.text_event_container}>
          <h1 className={styles.event_title_home}>ENCHANTING DRESS 2024</h1>
          <div className={styles.event_content_home}>
            <p>Khám phá bộ sưu tập mới nhất trong 20 ngày qua với những thiết kế thanh thoát và mềm mại...</p>
            <p>Tạo sự tươi mới bằng cách phối đồ cùng giày cao gót hoặc khăn lụa!...</p>
            <p>Trình bày buổi dạo phố một cách thanh lịch với những chiếc váy điệu đà...</p>
            <p>Hãy để bộ sưu tập này làm nổi bật phong cách của bạn...</p>
          </div>
          <button className={styles.event_view_btn}><Link to="/news">Xem thêm</Link></button>
        </div>
      </div>

      {/* Bộ sưu tập nữ */}
      <TitleLine title="Bộ sưu tập nữ" />
      <div className={styles.male_collection}>
        <ListProducts products={femaleProducts} itemsPerPage={2} />
        <div className={styles.container_male_img}>
          <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1762794109/img_product_banner_2_vgpxku.webp" alt="" />
        </div>
      </div>

      <div className={styles.blacfriday_event_home}>
        <div className={styles.containet_blackfriday}>
          <img src="https://res.cloudinary.com/dkokkltme/image/upload/v1760262983/logo_ajhylk.png" alt="" />
        </div>
      </div>

      {/* Nhãn hàng tiêu biểu - tabs từ top 5 brands */}
      <TitleLine title="Nhãn hàng tiêu biểu" />
      {tabs2.length > 0 ? (
        <SuggestionToday products={topBrandsProducts} tabs={tabs2} />
      ) : (
        <p>Đang tải nhãn hàng...</p> // Fallback nếu tabs2 rỗng
      )}

      <div className={styles.estimate_home}>
        <div className={styles.estimate_container}>
          <ReviewCarousel reviews={reviews} />
        </div>
      </div>

      <TitleLine title="Sản phẩm nổi bật" />
      <div className={styles.outstanding_container}>
        {outstandingProducts.map((p) => (
          <ProductImgCard key={p.id} imageUrl={p.images?.[0]} productId={p.id} />
        ))}
      </div>
    </div>
  );
}