Hãy cải thiện giao diện biểu đồ Dashboard Doanh Số theo phong cách hiện đại, clean, và high-end giống các dashboard tài chính (Stripe, Shopify, Binance dashboard).

YÊU CẦU:
- màu sắc pastel + gradient nhẹ
- đường line mượt (smooth curve)
- bóng mờ tinh tế
- tooltip hiện giá dạng 12.5M -> 12.5M VNĐ
- padding rộng, thoáng
- grid mờ nhẹ
- luôn responsive
- typography theo tông medium, không bold quá nhiều
- màu titles #1e293b (slate)
- màu trục X/Y mờ #94a3b8
- màu line:
   - blue: #2563eb
   - green: #10b981
- cho transition smooth animation
- marker point nhỏ, subtle
- hover highlight rõ ràng

CHUẨN LAYOUT & CARD CHO DASHBOARD:
- nền tổng thể: #f8fafc (Slate-50) để làm nổi các card
- mỗi chart phải nằm trong 1 Card riêng:
  - background: #ffffff
  - border-radius: 12px
  - padding: 24px
  - margin-bottom giữa các card: tối thiểu 32px–48px
  - box-shadow mềm: 0 8px 30px rgba(15, 23, 42, 0.06)
  - hover: scale nhẹ 1.005 + shadow rõ hơn một chút
- container chính:
  - width: 100%
  - max-width: 1400px
  - căn giữa (margin: 0 auto)
  - padding 24px–32px hai bên
- tiêu đề trong Card:
  - title: font-size ~18px, font-weight 600, màu #1e293b
  - subtitle: font-size 14px, màu #64748b, cách title 8px
- khoảng cách giữa phần header (title + subtitle) và chart: 16px

CHUẨN GRID LAYOUT (FULL WIDTH, HIỂN THỊ DỌC):
- sử dụng layout dọc (vertical stack) cho vùng chứa các Card biểu đồ
- mỗi chart chiếm full width (100%)
- gap giữa các Card: 32px
- Card phải tự co giãn full chiều ngang (width: 100%)
- responsive tất cả các kích thước màn hình
- ví dụ layout:
  - Row 1: Doanh số 30 ngày gần nhất (full width)
  - Row 2: Doanh số theo tháng (full width)
  - Row 3: Top sản phẩm / Top khách hàng (nếu có)
- container chính chỉ cần margin: 0, padding: 0
- parent layout sẽ lo phần background và spacing

CHUẨN LÀM CHART (CHARTS STANDARD):
- tạo 1 file config chung “src/config/chartConfig.ts”
- export một object baseConfig dùng lại cho mọi chart, gồm:
  - stroke.width = 3
  - stroke.curve = "smooth"
  - chart.toolbar.show = true
  - chart.zoom.enabled = true
  - chart.animations.enabled = false (TẮT để giảm lag)
  - chart.animations.speed = 400 (nếu cần bật)
  - legend.position = "top"
  - legend.horizontalAlign = "right"
  - noData.text = "Không có dữ liệu"
  - chart.height = 350
  - chart.spacing/padding tổng thể = 20
  - grid.opacity hoặc grid.borderColor rất mờ (opacity ~0.1)
  - grid.strokeDashArray = 4
  - dataLabels.enabled = false
  - tooltip.shared = true
  - tooltip.theme = "light"
  - xaxis.labels.style.color = "#94a3b8"
  - yaxis.labels.style.color = "#94a3b8"
  - title.style.color = "#1e293b"

- Mỗi chart khi khai báo options:
  - luôn spread từ baseConfig rồi override:
    - colors: ["#2563eb", "#10b981"]
    - series riêng cho từng chart
    - KHÔNG dùng gradient fills phức tạp (giảm GPU load)
    - KHÔNG dùng animation transitions chậm
  - format dữ liệu hiển thị:
    - 12500000 -> "12.5M"
    - 250000 -> "250K"
  - tooltip format:
    - doanh thu: "13.8M VND"
    - số đơn: "23 đơn"

CHUẨN TỐI ƯU HIỆU NĂNG (PERFORMANCE OPTIMIZATION):
- LUÔN wrap component với React.memo để ngăn re-render không cần thiết:
  ```tsx
  const SalesChart = React.memo(({ data, loading }) => { ... });
  SalesChart.displayName = 'SalesChart';
  ```
- TẮT animations trong chart config (animations.enabled = false)
- KHÔNG dùng fill gradients phức tạp (type: 'solid' thay vì 'gradient')
- useMemo cho chartOptions và chartData để tránh re-calculate:
  ```tsx
  const chartOptions = useMemo(() => mergeChartConfig({...}), [chartData]);
  const series = useMemo(() => [...], [data]);
  ```
- Hover effects:
  - Dùng translateY thay vì scale (nhẹ hơn)
  - Thêm willChange: 'transform' để hint cho browser
  - Transition ngắn: 0.2s thay vì 0.3s
- BaseChart component cũng cần React.memo
- ChartCard component cũng cần React.memo
- TRÁNH nested animations hoặc complex CSS transforms
- Giữ DOM structure đơn giản, tránh wrapper div không cần thiết

CHUẨN TỐI ƯU NÂNG CAO (ADVANCED OPTIMIZATION):
1. LAZY LOADING:
   - Dùng React.lazy và Suspense cho chart components
   - Tạo LoadingChart skeleton component
   ```tsx
   const SalesChart = React.lazy(() => import('./charts/SalesChart'));
   <Suspense fallback={<LoadingChart />}>
     <SalesChart data={data} />
   </Suspense>
   ```

2. RENDER KHI TAB ACTIVE:
   - Chỉ render chart khi tab/section đang active
   - Dùng Intersection Observer hoặc visibility state
   - Unmount chart khi không cần thiết

3. CHART CLEANUP:
   - Luôn cleanup chart khi unmount:
   ```tsx
   useEffect(() => {
     return () => {
       if (chartRef.current) {
         chartRef.current.destroy();
       }
     };
   }, []);
   ```

4. APEXCHARTS CONFIG:
   - redrawOnParentResize: false (tắt auto redraw)
   - animations.enabled: false
   - animations.dynamicAnimation.enabled: false
   - chart.redrawOnWindowResize: false (hoặc debounce)

5. DATA OPTIMIZATION:
   - Giới hạn data points nếu quá nhiều (max 100-200 points)
   - Aggregate/sample data nếu cần
   - Memoize data transformations
   ```tsx
   const limitedData = useMemo(() => 
     data.length > 100 ? data.slice(-100) : data
   , [data]);
   ```

6. LOADING SKELETON:
   - Tạo LoadingChart component với shimmer effect
   - Hiển thị khi đang fetch data
   - Giữ layout stable (avoid layout shift)

7. CONDITIONAL RENDERING:
   - Không render chart nếu data.length === 0
   - Show empty state thay vì chart rỗng
   - Lazy mount chart chỉ khi cần

8. DEBOUNCE/THROTTLE:
   - Debounce resize events
   - Throttle scroll/hover events nếu có
   - Giảm số lần update chart

CẤU TRÚC FILE:
- src/components/charts/BaseChart.tsx       (wrapper chung cho ApexCharts, nhận options + series)
- src/components/charts/SalesLast30Days.tsx (line chart doanh thu & số đơn theo ngày)
- src/components/charts/SalesByMonth.tsx    (column chart doanh thu & số đơn theo tháng)
- src/components/layout/Card.tsx            (Card component dùng cho mọi chart)
- src/config/chartConfig.ts                 (baseConfig dùng chung)
- src/pages/DashboardSales.tsx             (page layout: container full width, vertical stack các Card)

YÊU CẦU CODE:
- dùng React + ApexCharts + Typescript
- tách base config và merge config per chart
- tạo BaseChart để tránh lặp lại code ApexCharts
- tạo Card component để bọc từng chart, đúng chuẩn layout ở trên
- dùng vertical stack layout (1 cột full width)
- LUÔN dùng React.memo cho tất cả chart components
- TẮT animations (enabled: false) để tránh lag
- useMemo cho data processing và chart options
- viết style hiện đại, nhìn sang và tinh tế
- comment rõ ràng (giải thích baseConfig, Card, vertical stack, từng chart, performance optimizations)
- dữ liệu hiển thị theo kiểu 12.5M / 250K
- màu nền trắng bên trong Card, khoảng trắng rộng, không bị dính cạnh
- layout tổng thể nhìn giống dashboard thật, có khoảng trống giữa các chart
- PERFORMANCE: mượt mà, không lag, không đứng trang khi click/hover

TÔI MUỐN NHÌN ĐẸP NHƯ:
- Stripe Dashboard
- Shopify Analytics
- Google Analytics
- Binance Analytics

Hãy generate code hoàn chỉnh (bao gồm toàn bộ component, chartConfig, Card, BaseChart, DashboardSales layout vertical stack và ví dụ data giả để tôi có thể chạy ngay).
