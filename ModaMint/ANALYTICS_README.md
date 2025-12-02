# Analytics Dashboard - ModaMint

## 📊 Overview

Enhanced dashboard with 7 tabs including advanced analytics charts using ApexCharts.

## 🎯 Features

### Existing Tabs
1. **Tổng quan** - Overview with statistics cards and recent activities
2. **Tất cả sản phẩm** - Complete product listing with filters

### New Analytics Tabs
3. **Doanh số** - Sales Analytics
   - Daily sales line chart (30 days)
   - Monthly sales bar chart (12 months)
   - Revenue and order tracking

4. **Sản phẩm bán chạy** - Top Selling Products
   - Horizontal bar chart for top 10 best sellers
   - Total sold quantity statistics
   - Revenue breakdown

5. **Tồn kho** - Inventory Analytics
   - Bar chart: Stock per product
   - Donut chart: Inventory distribution by category
   - Category-based analysis

6. **Biến thể** - Variant Matrix
   - Heatmap: Quantity by Color × Size
   - Visual representation of stock levels
   - Color-coded inventory status

7. **Trạng thái đơn hàng** - Order Status
   - Pie chart for order distribution
   - Status breakdown statistics
   - Completion rate tracking

## 🛠️ Technical Stack

- **React 18** + **TypeScript**
- **ApexCharts** - Data visualization
- **Ant Design** - UI components
- **Tailwind CSS** - Styling
- **Custom Hooks** - Data management

## 📁 Project Structure

```
src/
├── dashboard/
│   ├── components/
│   │   ├── SalesAnalytics.tsx
│   │   ├── TopSellingProducts.tsx
│   │   ├── InventoryAnalytics.tsx
│   │   ├── VariantMatrix.tsx
│   │   └── OrderStatusChart.tsx
│   └── index.tsx
├── services/
│   └── analytics/
│       └── index.ts
└── hooks/
    └── useAnalytics.ts
```

## 🔌 API Endpoints

The analytics service connects to the following endpoints:

```typescript
GET /api/orders/stats/daily?days=30
GET /api/orders/stats/monthly?months=12
GET /api/products/top-selling?limit=10
GET /api/products/inventory
GET /api/products/inventory/by-category
GET /api/variants/matrix
GET /api/orders/status-summary
```

## 🎨 Features

### Auto-fallback to Mock Data
If backend APIs are not yet implemented, the system automatically falls back to realistic mock data for testing and demo purposes.

### Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Ant Design grid system
- Adaptive chart sizing

### Interactive Charts
- Zoom capabilities
- Tooltips with detailed information
- Export functionality (PNG, SVG, CSV)
- Real-time data updates

### Loading States
- Skeleton loaders
- Spin indicators
- Error boundaries
- Graceful error handling

## 🚀 Usage

### Basic Implementation

The dashboard is automatically available at `/dashboard` route with all 7 tabs.

### Custom Hook

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const {
    dailySales,
    monthlySales,
    salesLoading,
    salesError,
    refetchSales
} = useAnalytics();
```

### Components

```typescript
import SalesAnalytics from './components/SalesAnalytics';

<SalesAnalytics
    dailySales={dailySales}
    monthlySales={monthlySales}
    loading={salesLoading}
    error={salesError}
/>
```

## 🎯 Chart Configuration

### Sales Chart (Line + Bar)
- Dual Y-axis for revenue and orders
- Smooth curves
- Responsive tooltips
- Time-based X-axis

### Inventory Donut Chart
- Center label showing total
- Percentage distribution
- Color-coded categories
- Interactive legend

### Heatmap Matrix
- Color scale: Red (low) → Green (high)
- 5-tier intensity levels
- Cell data labels
- Size × Color matrix

### Order Status Pie Chart
- Percentage labels
- Distinct colors per status
- Click-to-expand segments
- Bottom legend

## 📊 Mock Data

All analytics components include built-in mock data generators:

```typescript
private getMockDailySales(days: number): DailySalesData[]
private getMockMonthlySales(months: number): MonthlySalesData[]
private getMockTopSellingProducts(limit: number): TopSellingProduct[]
private getMockInventoryData(): InventoryData[]
private getMockVariantMatrix(): VariantMatrixData[]
private getMockOrderStatusSummary(): OrderStatusSummary[]
```

## 🔄 Data Flow

```
Component → useAnalytics Hook → analyticsService → API/Mock Data → Chart Rendering
```

## 🎨 Styling

Charts inherit theme colors:
- Primary: `#1677ff`
- Success: `#52c41a`
- Warning: `#faad14`
- Error: `#f5222d`
- Purple: `#722ed1`

## 📱 Responsive Breakpoints

- xs: < 576px
- sm: ≥ 576px
- md: ≥ 768px
- lg: ≥ 992px
- xl: ≥ 1200px

## 🔧 Customization

### Adding New Charts

1. Create component in `dashboard/components/`
2. Add data types to `services/analytics/index.ts`
3. Implement API method in `analyticsService`
4. Add to `useAnalytics` hook
5. Create new tab in `dashboard/index.tsx`

### Modifying Chart Options

```typescript
const chartOptions: ApexOptions = {
    chart: {
        type: 'line',
        height: 350
    },
    // ... customize options
};
```

## 🐛 Error Handling

All components include:
- Try-catch blocks
- Error state management
- User-friendly error messages
- Automatic retry mechanisms
- Fallback to mock data

## 🎉 Benefits

✅ **No Backend Changes Required** - Works with existing API structure
✅ **Mock Data Included** - Test without backend implementation
✅ **Fully Typed** - Complete TypeScript support
✅ **Responsive** - Works on all devices
✅ **Clean Architecture** - Separation of concerns
✅ **Reusable Components** - Easy to extend and maintain
✅ **Interactive** - Rich user experience with ApexCharts

## 📝 Notes

- All APIs return mock data if backend endpoints are not implemented
- Charts automatically adjust to container size
- Tab state is preserved during navigation
- Loading states prevent layout shift
- Error boundaries catch and display errors gracefully

## 🔮 Future Enhancements

- [ ] Real-time data updates via WebSocket
- [ ] Custom date range selection
- [ ] Data export to Excel/PDF
- [ ] Comparison mode (year-over-year)
- [ ] Drill-down capabilities
- [ ] Custom chart templates
- [ ] Dashboard customization UI

---

**Built with ❤️ for ModaMint Dashboard**
