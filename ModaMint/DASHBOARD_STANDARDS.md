# Dashboard Standards - ModaMint

Bộ quy tắc chuẩn hóa cho việc phát triển các trang Dashboard trong ModaMint. Tài liệu này đảm bảo tính nhất quán về UI/UX, code structure, và best practices.

**📌 Chú ý:** Màu sắc sử dụng theo [COLOR_PALETTE.md](./COLOR_PALETTE.md) - **Bảng Màu A: Warm & Professional**

## 1. Cấu trúc Layout

### 1.0 Page Container
```tsx
return (
    <div style={{ margin: 0, padding: 0 }}>
        <style>{`
            .ant-table-measure-row {
                display: none !important;
                height: 0 !important;
                visibility: hidden !important;
            }
            .ant-table-tbody > tr > td {
                height: 70px !important;
                vertical-align: middle !important;
                padding: 8px 16px !important;
            }
            .ant-table-tbody > tr {
                height: 70px !important;
            }
            .ant-table-tbody > tr:first-child > td {
                padding-top: 8px !important;
            }
            .ant-table-thead > tr > th {
                padding: 8px 16px !important;
            }
            .ant-table {
                margin-top: 0 !important;
            }
            .ant-card-body {
                padding: 16px !important;
            }
        `}</style>
        {/* Content */}
    </div>
);
```
- **Critical**: Container div phải có `margin: 0, padding: 0`
- **Critical**: Inline `<style>` tag ở đầu component để fix spacing issues
- **KHÔNG BAO GIỜ**: Đặt padding trên container (layout đã có `padding: 24px`)
- **KHÔNG BAO GIỜ**: Đặt background color trên container

### 1.1 Title Page
```tsx
<Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
    Quản lý [Tên trang]
</Title>
```
- **Required**: `className="text-primary"` để có màu cam (#ff6347)
- **Required**: `marginBottom: '16px', marginTop: 0`
- **Level**: Sử dụng `level={2}`

### 1.2 Statistics Cards
```tsx
<Row gutter={16} style={{ marginBottom: '16px', marginTop: 0 }}>
    <Col xs={24} sm={12} lg={6}>
        <Card>
            <Statistic
                title="[Tên thống kê]"
                value={value}
                prefix={<Icon />}
                valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
                [Mô tả phụ]
            </Text>
        </Card>
    </Col>
</Row>
```
- **Responsive**: `xs={24} sm={12} lg={6}` - 4 cột trên desktop, 2 cột tablet, 1 cột mobile
- **Gutter**: `16` giữa các cột
- **Color scheme**:
  - Thông tin chính: `#1890ff` (blue)
  - Tích cực: `#52c41a` (green)
  - Tiêu cực: `#ff4d4f` (red)
  - Đặc biệt: `#722ed1` (purple)
- **Subtext**: Font size `12px`, `type="secondary"`

### 1.3 Action Bar
```tsx
<Card style={{ marginBottom: '16px', marginTop: 0 }}>
    <Row justify="space-between" align="middle">
        <Col>
            <Space wrap>
                <Input.Search
                    placeholder="Tìm kiếm..."
                    style={{ width: 300 }}
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                {/* Filters khác */}
            </Space>
        </Col>
        <Col>
            <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm [Item]
                </Button>
                <Button type="default" icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
                    Làm mới [Item]
                </Button>
                <Button type="default" icon={<DownloadOutlined />} onClick={handleExportExcel}>
                    Xuất Excel
                </Button>
            </Space>
        </Col>
    </Row>
</Card>
```
- **Layout**: `justify="space-between"` - filters bên trái, actions bên phải
- **Buttons**:
  - "Thêm": `type="primary"` (màu cam)
  - "Làm mới": `type="default"`
  - "Xuất Excel": `type="default"`
- **Icons**: Sử dụng `@ant-design/icons`

### 1.4 Table Container
```tsx
<Card style={{ marginTop: 0 }}>
    <Table />
</Card>
```
- **Note**: Inline styles đã được đặt ở Page Container (1.0), KHÔNG lặp lại
- **Critical**: Card phải có `marginTop: 0` để khít với element trên

## 2. Table Configuration

### 2.1 Standard Columns

#### STT Column
```tsx
{
    title: 'STT',
    key: 'index',
    width: 60,
    align: 'center' as const,
    render: (_: any, __: any, index: number) => index + 1,
}
```

#### Status Column
```tsx
{
    title: 'Trạng thái',
    dataIndex: 'active', // hoặc 'isActive', 'status' tùy context
    key: 'active',
    width: 120,
    align: 'center' as const,
    render: (active: boolean) => (
        <Badge 
            status={active ? 'success' : 'default'} 
            text={active ? 'Hoạt động' : 'Ngừng hoạt động'} 
        />
    ),
}
```
- **Component**: Luôn sử dụng `Badge` component, KHÔNG dùng `Tag` hoặc `Button`
- **Status mapping**:
  - `success` (xanh) cho hoạt động
  - `default` (xám) cho ngừng hoạt động
  - `error` (đỏ) cho bị khóa/lỗi

#### Actions Column
```tsx
{
    title: 'Thao tác',
    key: 'actions',
    width: 180, // Có thể điều chỉnh dựa trên số nút
    align: 'center' as const,
    render: (record: ItemType) => (
        <Space size="small">
            <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                title="Xem chi tiết"
                size="small"
            />
            <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                title="Chỉnh sửa"
                size="small"
            />
            {/* More actions */}
        </Space>
    ),
}
```
- **Required**: Bọc trong `<Space size="small">`
- **No wrapper div**: KHÔNG bọc trong `<div>`
- **Button props**:
  - `type="text"`
  - `size="small"`
  - `title` cho tooltip
- **Icons**: Sử dụng `@ant-design/icons`

### 2.2 Action Buttons Standard

#### View Button (Dashboard Overview)
```tsx
<Button
    icon={<EyeOutlined />}
    size="small"
    className="btn-view-details"
    onClick={() => handleView(record)}
>
    Xem chi tiết
</Button>
```
- **Special**: Dùng trong Dashboard Overview với `className="btn-view-details"`
- **Style**: Orange gradient từ `dashboard/style.css`

#### View Button (Table Actions)
```tsx
<Button
    type="text"
    icon={<EyeOutlined />}
    onClick={() => handleView(record)}
    title="Xem chi tiết"
    size="small"
/>
```

#### Delete Button (Soft Delete - Active Item)
```tsx
{record.active && (
    <Popconfirm
        title="Bạn có chắc muốn vô hiệu hóa sản phẩm này?"
        description="Sản phẩm sẽ không hiển thị trên website nhưng vẫn có thể khôi phục."
        onConfirm={() => handleSoftDelete(record.id)}
        okText="Vô hiệu hóa"
        cancelText="Hủy"
        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
    >
        <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Vô hiệu hóa"
            size="small"
        />
    </Popconfirm>
)}
```

#### Delete Button (Hard Delete - Inactive Item)
```tsx
{!record.active && (
    <Popconfirm
        title="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?"
        description="Hành động này không thể hoàn tác!"
        onConfirm={() => handleHardDelete(record.id)}
        okText="Xóa vĩnh viễn"
        cancelText="Hủy"
        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
    >
        <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Xóa vĩnh viễn"
            size="small"
        />
    </Popconfirm>
)}
```

#### Restore Button
```tsx
{!record.active && (
    <Button
        type="text"
        icon={<RestOutlined />}
        onClick={() => handleRestore(record.id)}
        title="Khôi phục"
        size="small"
    />
)}
```

### 2.3 Table Props
```tsx
<Table
    columns={columns}
    dataSource={displayedData}
    rowKey="id"
    loading={loading}
    pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: filteredTotal,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} [items]`,
        onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
        },
    }}
    scroll={{ x: 1000 }}
    rowSelection={
        showDeleted ? undefined : {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
                disabled: !record.active
            })
        }
    }
/>
```

## 3. Modal Forms

### 3.1 Add/Edit Modal Structure
```tsx
<Modal
    title={editingItem ? `Chỉnh sửa [Item]` : `Thêm [Item] mới`}
    open={isModalVisible}
    onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
    }}
    footer={[
        <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
        }}>
            Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {editingItem ? 'Cập nhật' : 'Thêm mới'}
        </Button>
    ]}
    width={800}
>
    <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
    >
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    name="name"
                    label="Tên"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên' },
                        { min: 3, message: 'Tên phải có ít nhất 3 ký tự' }
                    ]}
                >
                    <Input placeholder="Nhập tên" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="status"
                    label="Trạng thái"
                >
                    <Select placeholder="Chọn trạng thái">
                        <Option value={true}>Hoạt động</Option>
                        <Option value={false}>Ngừng hoạt động</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>
        {/* More fields */}
    </Form>
</Modal>
```

### 3.2 Form Status Field
**KHÔNG sử dụng Checkbox**, luôn dùng Select:
```tsx
<Form.Item name="active" label="Trạng thái">
    <Select placeholder="Chọn trạng thái">
        <Option value={true}>Đang bán</Option>
        <Option value={false}>Ngừng bán</Option>
    </Select>
</Form.Item>
```

### 3.3 View Modal
```tsx
<Modal
    title="Chi tiết [Item]"
    open={isViewModalVisible}
    onCancel={() => setIsViewModalVisible(false)}
    footer={[
        <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
        </Button>
    ]}
    width={700}
>
    <Descriptions column={1} size="small">
        <Descriptions.Item label="ID">
            <Text code>{viewingItem?.id}</Text>
        </Descriptions.Item>
        {/* More fields */}
    </Descriptions>
</Modal>
```

## 4. State Management

### 4.1 Required States
```tsx
// Data
const [items, setItems] = useState<ItemType[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Modals
const [isModalVisible, setIsModalVisible] = useState(false);
const [isViewModalVisible, setIsViewModalVisible] = useState(false);
const [editingItem, setEditingItem] = useState<ItemType | null>(null);
const [viewingItem, setViewingItem] = useState<ItemType | null>(null);
const [form] = Form.useForm();

// Filters & Selection
const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
const [showDeleted, setShowDeleted] = useState(false);
const [searchText, setSearchText] = useState<string>('');
const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
});
```

### 4.2 Filtering Logic
```tsx
const filteredItems = items.filter(item => {
    // Show only active or inactive based on showDeleted flag
    const activeCheck = showDeleted ? !item.active : item.active;
    
    // Search filter
    const searchCheck = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase());
    
    // More filters...
    
    return activeCheck && searchCheck;
});

// Sort by ID descending (newest first)
const sortedItems = filteredItems.sort((a, b) => b.id - a.id);
```

### 4.3 Pagination Logic
```tsx
const startIndex = (pagination.current - 1) * pagination.pageSize;
const endIndex = startIndex + pagination.pageSize;
const displayedItems = sortedItems.slice(startIndex, endIndex);
```

## 5. Error Handling & Loading

### 5.1 Error Alert
```tsx
{error && (
    <Alert
        message="Lỗi tải dữ liệu từ API"
        description={error}
        type="error"
        showIcon
        closable
        style={{ marginBottom: '24px' }}
    />
)}
```

### 5.2 Loading State
```tsx
{loading && (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text style={{ marginTop: '16px', display: 'block' }}>
            Đang tải dữ liệu...
        </Text>
    </div>
)}
```

### 5.3 Conditional Rendering
```tsx
{!loading && (
    <>
        {/* Your content here */}
    </>
)}
```

## 6. Colors & Theming

**Sử dụng Bảng Màu A theo [COLOR_PALETTE.md](./COLOR_PALETTE.md)**

### 6.1 Primary Colors
- **Primary**: `#ff6347` (Tomato - Cam đỏ)
- **Secondary**: `#ff7f50` (Coral - Cam san hô)
- **Info**: `#1890ff` (Blue - Xanh dương)
- **Success**: `#52c41a` (Green - Xanh lá)
- **Warning**: `#faad14` (Yellow/Orange - Vàng cam)
- **Error**: `#ff4d4f` (Red - Đỏ)
- **Special**: `#722ed1` (Purple - Tím)

### 6.2 Badge Status Colors
```tsx
// Use Badge component with status prop
<Badge status="success" text="Hoạt động" />
<Badge status="error" text="Bị khóa" />
<Badge status="warning" text="Cảnh báo" />
<Badge status="default" text="Ngừng hoạt động" />
```

### 6.3 Tag Colors
```tsx
<Tag color="blue">Danh mục</Tag>
<Tag color="green">Thành công</Tag>
<Tag color="red">Lỗi</Tag>
<Tag color="orange">Cảnh báo</Tag>
```

## 7. Imports Standard

### 7.1 Required Imports
```tsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Badge,
    Modal,
    Form,
    Input,
    Select,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Popconfirm,
    Spin,
    Alert,
    // ... more as needed
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    ReloadOutlined,
    RestOutlined,
    ExclamationCircleOutlined,
    // ... more as needed
} from '@ant-design/icons';
import '../../components/common-styles.css';
```

### 7.2 Typography Shortcuts
```tsx
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
```

## 8. Button Styles

### 8.1 Primary Buttons
```tsx
// "Thêm" button
<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
    Thêm [Item]
</Button>

// "Cập nhật" button in modal
<Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
    Cập nhật
</Button>
```

### 8.2 Special Buttons (Dashboard Overview)
Sử dụng CSS classes từ `dashboard/style.css`:
```tsx
// Import the CSS
import '../../style.css';

// "Xem tất cả" button
<Button onClick={handleAction} className="btn-view-all">
    Xem tất cả
</Button>

// "Xem chi tiết" button
<Button icon={<EyeOutlined />} className="btn-view-details" size="small">
    Xem chi tiết
</Button>
```

## 9. Excel Export

### 9.1 Standard Export Function
```tsx
import * as XLSX from 'xlsx';

const handleExportExcel = () => {
    const data = filteredItems.map((item, index) => ({
        STT: index + 1,
        ID: item.id,
        'Tên': item.name,
        'Trạng thái': item.active ? 'Hoạt động' : 'Ngừng hoạt động',
        // ... more fields
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '[Items]');
    
    // Auto-width columns
    const maxWidth = 15;
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.min(Math.max(key.length, (data[0] as any)[key]?.toString().length || 0), maxWidth)
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `[Items]_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success('Xuất Excel thành công!');
};
```

## 10. Message & Notification

### 10.1 Success Messages
```tsx
import { message } from 'antd';

message.success('Thêm mới thành công!');
message.success('Cập nhật thành công!');
message.success('Xóa thành công!');
```

### 10.2 Error Messages
```tsx
message.error('Có lỗi xảy ra. Vui lòng thử lại.');
message.error('Không thể tải dữ liệu từ server.');
```

## 11. Common Patterns

### 11.1 Load Data on Mount
```tsx
useEffect(() => {
    loadItems();
}, []);
```

### 11.2 Refresh Data Function
```tsx
const refreshData = () => {
    loadItems();
    setSearchText('');
    setShowDeleted(false);
    setSelectedRowKeys([]);
};
```

### 11.3 Reset Form on Modal Close
```tsx
const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
};
```

### 11.4 Bulk Actions
```tsx
const handleBulkAction = async (action: 'restore' | 'delete') => {
    if (selectedRowKeys.length === 0) {
        message.warning('Vui lòng chọn ít nhất một item');
        return;
    }
    
    try {
        // Process bulk action
        message.success(`${selectedRowKeys.length} items đã được ${action === 'restore' ? 'khôi phục' : 'vô hiệu hóa'}`);
        setSelectedRowKeys([]);
        refreshData();
    } catch (error) {
        message.error('Có lỗi xảy ra');
    }
};
```

## 12. Checklist khi tạo trang mới

- [ ] Page container có `margin: 0, padding: 0` và inline styles ở đầu
- [ ] Title sử dụng `className="text-primary"` với margin đúng
- [ ] Statistics cards responsive `xs={24} sm={12} lg={6}`
- [ ] Action bar có "Thêm", "Làm mới", "Xuất Excel"
- [ ] Tất cả Cards có `marginTop: 0`
- [ ] Status column dùng `Badge`, KHÔNG dùng `Tag` hoặc `Button`
- [ ] Actions column bọc trong `<Space size="small">`, không có div wrapper
- [ ] Buttons có `size="small"`, `title`, `type="text"`
- [ ] Form modal dùng `Select` cho status, KHÔNG dùng `Checkbox`
- [ ] Popconfirm cho delete actions
- [ ] Pagination có `showSizeChanger`, `showQuickJumper`, `showTotal`
- [ ] Row selection disabled cho inactive items
- [ ] Filtering logic đúng (activeCheck, searchCheck)
- [ ] Sort by ID descending
- [ ] Error alert và loading spinner
- [ ] Conditional rendering khi loading
- [ ] Excel export với auto-width columns
- [ ] KHÔNG đặt padding hoặc background trên container
- [ ] Không có console.log trong production code
- [ ] TypeScript types đầy đủ
- [ ] No linter errors

## 13. Best Practices

### 13.1 Performance
- Sử dụng `useEffect` với dependencies array đúng
- Memoize expensive calculations nếu cần
- Pagination cho data lớn
- Lazy load images

### 13.2 Code Quality
- Component names là PascalCase
- Function names là camelCase
- TypeScript interfaces cho tất cả data
- Avoid `any` type, sử dụng proper types

### 13.3 User Experience
- Loading states cho tất cả async operations
- Success/error messages rõ ràng
- Confirm dialogs cho destructive actions
- Keyboard shortcuts nếu có thể

### 13.4 Maintainability
- Break down large components
- Reusable utility functions
- Consistent naming conventions
- Comments cho logic phức tạp

## 14. Loading States & User Feedback

### 14.1 Page Navigation Loading (Sidebar Routes)
**Mục đích**: Tạo cảm giác mượt mà khi chuyển giữa các trang khác nhau trong dashboard.

**Implementation trong `DashboardLayout`**:
```tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardLayout: React.FC = () => {
    const [pageLoading, setPageLoading] = useState(false);
    const location = useLocation();

    // Trigger loading khi route thay đổi
    useEffect(() => {
        setPageLoading(true);
        
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000); // 1 giây loading

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <Content>
            {pageLoading ? (
                <div style={{
                    minHeight: '500px',
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <LoadingSpinner tip="Đang tải dữ liệu..." size="large" />
                </div>
            ) : (
                <Outlet />
            )}
        </Content>
    );
};
```

**Áp dụng cho**:
- Tất cả page routes từ sidebar: Tổng Quan, Sản Phẩm, Khách Hàng, Đơn Hàng, v.v.
- Trigger: Khi `location.pathname` thay đổi
- Duration: **1 giây** (1000ms)

### 14.2 Tab Switching Loading (Internal Navigation)
**Mục đích**: Loading khi chuyển giữa các tabs bên trong một page (VD: Dashboard tabs).

**Implementation trong page có tabs**:
```tsx
const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [tabLoading, setTabLoading] = useState(false);

    const handleTabChange = (key: string) => {
        // Chuyển tab ngay lập tức
        setActiveTab(key);
        
        // Hiển thị loading overlay
        setTabLoading(true);
        
        // Tắt loading sau 1 giây
        setTimeout(() => {
            setTabLoading(false);
        }, 1000);
    };

    // Tách riêng tab items (chỉ key + label)
    const tabItems = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'all-products', label: 'Tất cả sản phẩm' },
        { key: 'sales', label: 'Doanh số' },
        // ...
    ];

    // Render content riêng
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewContent />;
            case 'all-products':
                return <AllProductsContent />;
            case 'sales':
                return <SalesAnalytics />;
            default:
                return null;
        }
    };

    return (
        <div>
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
            />
            
            {tabLoading ? (
                <div style={{
                    minHeight: '500px',
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <LoadingSpinner tip="Đang tải dữ liệu..." size="large" />
                </div>
            ) : (
                <div>{renderTabContent()}</div>
            )}
        </div>
    );
};
```

**Key Points**:
- **Tách riêng tabItems**: Không có `children` property trong items
- **renderTabContent()**: Function switch/case render content theo activeTab
- **Chuyển tab ngay**: `setActiveTab(key)` chạy đầu tiên
- **Loading overlay**: Ẩn toàn bộ content, chỉ hiện spinner
- **Duration**: **1 giây** (1000ms)

### 14.3 LoadingSpinner Component
**File**: `src/dashboard/components/LoadingSpinner.tsx`

```tsx
import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
    size?: 'small' | 'default' | 'large';
    tip?: string;
    fullScreen?: boolean;
    spinning?: boolean;
    children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'default',
    tip = 'Đang tải...',
    fullScreen = false,
    spinning = true,
    children
}) => {
    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 9999
            }}>
                <Spin size={size} tip={tip} />
            </div>
        );
    }

    if (children) {
        return (
            <Spin size={size} tip={tip} spinning={spinning}>
                {children}
            </Spin>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            width: '100%'
        }}>
            <Spin size={size} tip={tip} />
        </div>
    );
};

export default LoadingSpinner;
```

**Usage Examples**:
```tsx
// Basic loading
<LoadingSpinner tip="Đang tải dữ liệu..." size="large" />

// Full screen loading
<LoadingSpinner tip="Đang xử lý..." fullScreen />

// Wrap content (loading overlay)
<LoadingSpinner spinning={isLoading}>
    <YourContent />
</LoadingSpinner>
```

### 14.4 API Data Loading
**Cho API calls và async operations**:

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await apiService.getData();
        setData(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

// Conditional rendering
if (loading) {
    return <LoadingSpinner tip="Đang tải dữ liệu..." />;
}

if (error) {
    return <Alert message="Lỗi" description={error} type="error" />;
}

return <DataTable data={data} />;
```

### 14.5 Loading Standards
**Timing Guidelines**:
- **Page navigation**: 1 giây (1000ms)
- **Tab switching**: 1 giây (1000ms)
- **Quick actions**: 0.5 giây (500ms)
- **API calls**: Thực tế (không fake delay)

**Visual Standards**:
- **Background**: `#fff` (trắng)
- **Border radius**: `8px`
- **Padding**: `24px`
- **Min height**: `500px` cho full page, `200px` cho components
- **Alignment**: Center (flexbox)

**Best Practices**:
- ✅ LUÔN có loading state cho async operations
- ✅ LUÔN cleanup timers trong useEffect return
- ✅ LUÔN disable actions khi đang loading (nếu cần)
- ✅ Hiển thị error state rõ ràng
- ❌ KHÔNG fake delay cho API calls thật
- ❌ KHÔNG nest nhiều loading states
- ❌ KHÔNG block UI quá lâu (> 2 giây cần progress bar)

---

**Cập nhật lần cuối**: 2025-12-07
**Người tạo**: Development Team
**Phiên bản**: 1.1

