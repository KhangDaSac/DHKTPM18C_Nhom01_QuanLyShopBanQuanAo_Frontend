# 📊 Customer Analytics Tab - Complete Documentation

## ✅ Implementation Summary

Successfully added a new **"Khách hàng"** (Customer) analytics tab to the dashboard with 4 customer-related ApexCharts, following the same architecture pattern as the existing analytics tabs.

---

## 📁 Files Created

### 1. **Service Layer**
- **`src/services/customer/analytics.ts`** (173 lines)
  - TypeScript interfaces for all data types
  - 4 API service functions with mock data fallbacks
  - Mock data generators for testing

### 2. **Custom Hook**
- **`src/dashboard/hooks/useCustomerAnalytics.ts`** (127 lines)
  - Centralized data management hook
  - Handles loading/error states for all charts
  - Provides refetch functions

### 3. **Chart Components** (4 files)
- **`src/dashboard/components/CustomerNewDailyChart.tsx`** (108 lines)
  - Line chart showing new customers over 30 days
  
- **`src/dashboard/components/CustomerSegmentationDonut.tsx`** (98 lines)
  - Donut chart for customer segmentation (New/Returning/VIP)
  
- **`src/dashboard/components/CustomerTopSpendersChart.tsx`** (112 lines)
  - Horizontal bar chart for top 10 spending customers
  
- **`src/dashboard/components/CustomerAnalyticsTab.tsx`** (148 lines)
  - Main tab component with 4 KPI cards + 3 charts

### 4. **Integration**
- **`src/dashboard/index.tsx`** (modified)
  - Added new tab to existing dashboard
  - Imported CustomerAnalyticsTab component

---

## 🎨 UI Layout

### Tab Structure: **"Khách hàng"**

```
┌─────────────────────────────────────────────────────────────┐
│  Row 1: KPI Cards (4 cards in grid)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Tổng số │ │   Mới    │ │  Hoạt    │ │  Không   │      │
│  │ khách hàng│ │ trong    │ │  động    │ │ hoạt động│      │
│  │          │ │  tháng   │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Row 2: Charts (2 charts side-by-side)                     │
│  ┌──────────────────────┐ ┌──────────────────────┐        │
│  │ Khách hàng mới       │ │ Phân loại khách hàng │        │
│  │ (Line Chart)         │ │ (Donut Chart)        │        │
│  │                      │ │                      │        │
│  └──────────────────────┘ └──────────────────────┘        │
│                                                             │
│  Row 3: Top Spenders (Full width)                          │
│  ┌───────────────────────────────────────────────┐        │
│  │ Top 10 khách hàng chi tiêu cao nhất           │        │
│  │ (Horizontal Bar Chart)                         │        │
│  │                                                │        │
│  └───────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Charts & Data

### 1️⃣ **KPI Cards** (4 cards)

**API Endpoint:** `GET /api/customers/summary`

**Response Schema:**
```typescript
{
  totalCustomers: number;      // Tổng số khách hàng
  newThisMonth: number;         // Khách hàng mới trong tháng
  activeCustomers: number;      // Khách hàng đang hoạt động
  inactiveCustomers: number;    // Khách hàng không hoạt động
}
```

**Sample Data:**
```json
{
  "totalCustomers": 1520,
  "newThisMonth": 120,
  "activeCustomers": 865,
  "inactiveCustomers": 655
}
```

**UI Features:**
- Gradient backgrounds (blue, green, purple, gray)
- Icons from lucide-react (Users, UserPlus, UserCheck, UserX)
- Loading skeleton animations
- Responsive grid layout

---

### 2️⃣ **New Customers Daily** (Line Chart)

**API Endpoint:** `GET /api/customers/new/daily?days=30`

**Response Schema:**
```typescript
{
  dates: string[];           // Array of dates ["2025-01-01", "2025-01-02", ...]
  newCustomers: number[];    // Array of customer counts [10, 15, 8, ...]
}
```

**Chart Features:**
- Smooth curve line chart
- 30-day time period
- Interactive zoom & pan
- Formatted date tooltips (DD/MM/YYYY)
- Markers on data points
- Responsive x-axis labels

---

### 3️⃣ **Customer Segmentation** (Donut Chart)

**API Endpoint:** `GET /api/customers/segmentation`

**Response Schema:**
```typescript
{
  new: number;         // Percentage of new customers
  returning: number;   // Percentage of returning customers
  vip: number;         // Percentage of VIP customers
}
```

**Sample Data:**
```json
{
  "new": 35,
  "returning": 55,
  "vip": 10
}
```

**Chart Features:**
- Color-coded segments (green, blue, orange)
- Center total display
- Percentage labels on segments
- Interactive legend at bottom
- Donut hole with summary stats

---

### 4️⃣ **Top Spenders** (Horizontal Bar Chart)

**API Endpoint:** `GET /api/customers/top-spenders?limit=10`

**Response Schema:**
```typescript
Array<{
  name: string;         // Customer name
  totalSpent: number;   // Total amount spent (VND)
}>
```

**Sample Data:**
```json
[
  { "name": "Nguyễn Văn A", "totalSpent": 12500000 },
  { "name": "Trần Thị B", "totalSpent": 9800000 }
]
```

**Chart Features:**
- Horizontal bars sorted by spending
- VND currency formatting (e.g., "12.500.000₫")
- Purple gradient bars
- Compact labels (e.g., "12.5M")
- Data labels showing exact amounts

---

## 🔧 Technical Implementation

### Architecture Pattern

```
Services (API + Mock Data)
    ↓
Custom Hook (useCustomerAnalytics)
    ↓
Components (Charts + Tab Container)
    ↓
Dashboard Integration
```

### TypeScript Interfaces

```typescript
export interface CustomerSummary {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export interface CustomerNewDaily {
  dates: string[];
  newCustomers: number[];
}

export interface CustomerSegmentation {
  new: number;
  returning: number;
  vip: number;
}

export interface CustomerTopSpender {
  name: string;
  totalSpent: number;
}
```

### Service Functions

All service functions follow the same pattern:
1. Try to fetch from API
2. If API returns valid data → return it
3. If API fails or returns no data → return mock data
4. Log warnings for debugging

```typescript
async getCustomerSummary(): Promise<CustomerSummary>
async getNewCustomersDaily(days: number): Promise<CustomerNewDaily>
async getCustomerSegmentation(): Promise<CustomerSegmentation>
async getTopSpenders(limit: number): Promise<CustomerTopSpender[]>
```

### Custom Hook API

```typescript
const {
  // Data
  summary,
  newCustomersDaily,
  segmentation,
  topSpenders,
  
  // Loading states
  summaryLoading,
  newCustomersLoading,
  segmentationLoading,
  topSpendersLoading,
  
  // Error states
  summaryError,
  newCustomersError,
  segmentationError,
  topSpendersError,
  
  // Refetch functions
  refetchSummary,
  refetchNewCustomers,
  refetchSegmentation,
  refetchTopSpenders,
  refetchAll,
} = useCustomerAnalytics();
```

---

## 🎯 Features

✅ **Fully Responsive**
- Mobile-first design
- Grid layout adapts to screen size
- Charts resize automatically

✅ **Loading States**
- Skeleton loaders for cards
- Animated placeholders for charts
- Smooth transitions

✅ **Error Handling**
- Graceful fallback to mock data
- Error messages displayed in charts
- Console warnings for debugging

✅ **Mock Data**
- Realistic Vietnamese names
- Random but consistent data
- Available when backend APIs not ready

✅ **Professional Styling**
- Matches existing dashboard theme
- Gradient cards with icons
- Consistent color scheme
- Rounded corners and shadows

✅ **Interactive Charts**
- Zoom and pan on line chart
- Click to view image groups
- Hover tooltips with formatted data
- Responsive legends

---

## 🚀 Usage

### Development (with mock data)
The tab works immediately with mock data - no backend required for testing!

### Production (with real API)
When backend APIs are ready:
1. Ensure endpoints match the schema
2. Charts automatically switch from mock to real data
3. No code changes needed

### Adding to Dashboard

The tab is already integrated! Access it via:
```
Dashboard → Tabs → "Khách hàng"
```

Tab order:
1. Tổng quan
2. Tất cả sản phẩm
3. Doanh số
4. Sản phẩm bán chạy
5. Tồn kho
6. Biến thể
7. Trạng thái đơn hàng
8. **Khách hàng** ← NEW!

---

## 📊 Dependencies

All dependencies already installed:
- `react-apexcharts` - Chart library
- `apexcharts` - Core charting engine
- `lucide-react` - Icons for KPI cards
- `@ant-design/icons` - Additional icons
- `antd` - UI components

---

## 🔄 API Integration Checklist

When implementing backend APIs:

- [ ] `GET /api/customers/summary`
  - Returns: `CustomerSummary` object
  - Format: `ApiResponse<CustomerSummary>`

- [ ] `GET /api/customers/new/daily?days=30`
  - Returns: `CustomerNewDaily` object
  - Format: `ApiResponse<CustomerNewDaily>`

- [ ] `GET /api/customers/segmentation`
  - Returns: `CustomerSegmentation` object
  - Format: `ApiResponse<CustomerSegmentation>`

- [ ] `GET /api/customers/top-spenders?limit=10`
  - Returns: Array of `CustomerTopSpender`
  - Format: `ApiResponse<CustomerTopSpender[]>`

All APIs should follow your existing `ApiResponse<T>` pattern:
```typescript
{
  success: boolean;
  message?: string;
  result: T;
}
```

---

## 🎨 Customization

### Colors
KPI Cards gradients defined in `CustomerAnalyticsTab.tsx`:
- Total Customers: `from-blue-500 to-blue-600`
- New This Month: `from-green-500 to-green-600`
- Active: `from-purple-500 to-purple-600`
- Inactive: `from-gray-500 to-gray-600`

Chart colors defined in each component:
- Line: `#3b82f6` (blue)
- Donut: `['#10b981', '#3b82f6', '#f59e0b']` (green, blue, orange)
- Bar: `#8b5cf6` (purple)

### Time Period
Change the 30-day period in `useCustomerAnalytics.ts`:
```typescript
const data = await customerAnalyticsService.getNewCustomersDaily(30); // Change this number
```

### Top Spenders Limit
Change the limit in `useCustomerAnalytics.ts`:
```typescript
const data = await customerAnalyticsService.getTopSpenders(10); // Change this number
```

---

## 🐛 Troubleshooting

**Charts not showing?**
- Check console for API errors (should see warnings)
- Verify mock data is being used
- Check browser console for React errors

**Data not updating?**
- Use `refetchAll()` to refresh all data
- Check network tab for API calls
- Verify API response format matches interfaces

**TypeScript errors?**
- Ensure all imports are correct
- Check that types match between service and components
- Run `npm run build` to check for compilation errors

---

## 📈 Performance

- All charts render efficiently with ApexCharts
- Mock data generators are lightweight
- Loading states prevent UI blocking
- Parallel data fetching in useEffect
- No unnecessary re-renders

---

## ✨ Future Enhancements

Potential additions:
- Customer lifetime value (CLV) chart
- Customer acquisition cost (CAC) trend
- Customer retention rate over time
- Geographic distribution map
- Customer satisfaction scores
- Export data to CSV/Excel

---

## 📝 Code Quality

✅ Full TypeScript coverage
✅ Consistent naming conventions
✅ Proper error handling
✅ Loading state management
✅ Reusable component pattern
✅ Clean separation of concerns
✅ Well-documented interfaces
✅ Mock data for testing

---

## 🎉 Summary

The **Customer Analytics Tab** is now fully integrated into your dashboard! It includes:

1. ✅ 4 KPI cards with gradient designs
2. ✅ Line chart for new customers (30 days)
3. ✅ Donut chart for customer segmentation
4. ✅ Horizontal bar chart for top 10 spenders
5. ✅ Complete TypeScript types
6. ✅ API services with mock fallbacks
7. ✅ Custom hook for data management
8. ✅ Professional styling matching existing tabs
9. ✅ Full responsive design
10. ✅ Loading and error states

**Total lines of code added:** ~766 lines across 7 files

**Ready to use immediately** with mock data, and will seamlessly switch to real API data when backend is ready! 🚀
