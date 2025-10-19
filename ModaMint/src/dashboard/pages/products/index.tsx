import React, { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Image,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Popconfirm,
    Checkbox,
    Slider,
    Spin,
    Alert
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UploadOutlined,
    DownloadOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    InboxOutlined,
    TagOutlined,
    CopyOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';
import { useProducts } from '../../../hooks/useProducts';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho variant sản phẩm  
interface ProductVariant {
    id: string;
    color?: string;
    size?: string;
    material?: string;
    price?: number;
    stock: number;
    sku: string;
}

// Interface cho Product với variants
interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    salePrice?: number;
    stock: number;
    status: 'active' | 'inactive' | 'deleted';
    image: string;
    description: string;
    tags: string[];
    createdAt: string;
    variants?: ProductVariant[];
}

const categories = [
    'Áo Nam', 'Áo Nữ', 'Quần Nam', 'Quần Nữ', 'Váy Nữ', 'Giày Nam', 'Giày Nữ', 'Áo Khoác', 'Phụ Kiện'
];

const Products: React.FC = () => {
    // Sử dụng hook để lấy dữ liệu từ API
    const { products: apiProducts, loading: apiLoading, error: apiError, refetch } = useProducts();
    
    // State cho local products (để thêm/sửa/xóa)
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // States cho bulk actions và filtering  
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // State cho variant modal
    const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
    const [editingVariants, setEditingVariants] = useState<ProductVariant[]>([]);

    // Kết hợp dữ liệu từ API và local
    const allProducts = [
        ...apiProducts.map(apiProduct => ({
            id: apiProduct.id,
            name: apiProduct.name,
            sku: `API_${apiProduct.id}`,
            category: apiProduct.categoryName || 'API Product',
            price: apiProduct.price,
            salePrice: 0,
            stock: 100, // Mock stock cho API products
            status: apiProduct.active ? 'active' as const : 'inactive' as const,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
            description: apiProduct.description,
            tags: [apiProduct.brandName || 'API'],
            createdAt: new Date().toISOString().split('T')[0],
            variants: []
        })),
        ...localProducts
    ];

    // Filtered products (excluding deleted unless showDeleted is true)
    const filteredProducts = allProducts.filter(p => {
        if (!showDeleted && p.status === 'deleted') return false;
        if (filterCategory !== 'all' && p.category !== filterCategory) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
    });

    // Statistics từ dữ liệu thực
    const totalProducts = allProducts.filter(p => p.status !== 'deleted').length;
    const activeProducts = allProducts.filter(p => p.status === 'active').length;
    const outOfStockProducts = allProducts.filter(p => p.stock === 0 && p.status !== 'deleted').length;
    const totalValue = allProducts.filter(p => p.status !== 'deleted').reduce((sum, p) => sum + (p.price * p.stock), 0);
    const deletedProducts = allProducts.filter(p => p.status === 'deleted').length;

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string) => (
                <Image
                    width={50}
                    height={50}
                    src={image}
                    fallback="/api/placeholder/50/50"
                    style={{ borderRadius: '4px' }}
                />
            ),
        },
        {
            title: 'Thông tin sản phẩm',
            key: 'product_info',
            render: (record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        SKU: {record.sku}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.category}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            render: (record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {record.salePrice > 0 ? (
                            <>
                                <span style={{ color: '#ff4d4f', textDecoration: 'line-through' }}>
                                    {record.price.toLocaleString()}đ
                                </span>
                                <br />
                                <span className="text-primary">
                                    {record.salePrice.toLocaleString()}đ
                                </span>
                            </>
                        ) : (
                            <span className="text-primary">
                                {record.price.toLocaleString()}đ
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => (
                <span style={{
                    color: stock === 0 ? '#ff4d4f' : stock < 20 ? '#faad14' : '#52c41a',
                    fontWeight: 'bold'
                }}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string, record: Product) => {
                if (status === 'deleted') {
                    return (
                        <div className="status-tag-container">
                            <Tag color="red">Đã xóa</Tag>
                        </div>
                    );
                }

                const handleToggleStatusClick = () => {
                    handleToggleStatus(record.id, status);
                };

                const getText = () => {
                    switch (status) {
                        case 'active': return 'Đang bán';
                        case 'inactive': return 'Ngừng bán';
                        default: return status;
                    }
                };

                return (
                    <div className="status-button-container">
                        <Button
                            size="small"
                            onClick={handleToggleStatusClick}
                            className={`status-button ${status}`}
                        >
                            {getText()}
                        </Button>
                    </div>
                );
            },
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <div>
                    {tags.map(tag => (
                        <Tag key={tag} style={{ marginBottom: '2px', fontSize: '12px' }}>
                            {tag}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: 'Biến thể',
            key: 'variants',
            width: 120,
            render: (record: Product) => (
                <div>
                    {record.variants && record.variants.length > 0 ? (
                        <>
                            <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                                {record.variants.length} biến thể
                            </Text>
                            <br />
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    setEditingVariants(record.variants || []);
                                    setIsVariantModalVisible(true);
                                }}
                            >
                                Quản lý
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setEditingVariants([]);
                                setIsVariantModalVisible(true);
                            }}
                        >
                            Thêm biến thể
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (record: Product) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="Xem chi tiết"
                    />
                    {record.status !== 'deleted' && (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                title="Chỉnh sửa"
                            />
                            <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(record)}
                                title="Sao chép"
                            />
                            <Popconfirm
                                title="Bạn có chắc muốn xóa sản phẩm này?"
                                onConfirm={() => handleSoftDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa mềm"
                                />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 'deleted' && (
                        <>
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => handleRestore(record.id)}
                                title="Khôi phục"
                            />
                            <Popconfirm
                                title="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?"
                                onConfirm={() => handleHardDelete(record.id)}
                                okText="Xóa vĩnh viễn"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa vĩnh viễn"
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        form.setFieldsValue({
            ...product,
            tags: product.tags.join(', ')
        });
        setIsModalVisible(true);
    };

    const handleView = (product: any) => {
        setViewingProduct(product);
        setIsViewModalVisible(true);
    };

    // Soft delete - đánh dấu là deleted
    const handleSoftDelete = (id: number) => {
        setLocalProducts(localProducts.map(p =>
            p.id === id ? { ...p, status: 'deleted' as const } : p
        ));
        message.success('Đã xóa sản phẩm (có thể khôi phục)');
    };

    // Hard delete - xóa vĩnh viễn
    const handleHardDelete = (id: number) => {
        setLocalProducts(localProducts.filter(p => p.id !== id));
        message.success('Đã xóa vĩnh viễn sản phẩm');
    };

    // Khôi phục sản phẩm đã xóa
    const handleRestore = (id: number) => {
        setLocalProducts(localProducts.map(p =>
            p.id === id ? { ...p, status: 'active' as const } : p
        ));
        message.success('Đã khôi phục sản phẩm');
    };

    // Sao chép sản phẩm
    const handleCopy = (product: Product) => {
        const newProduct: Product = {
            ...product,
            id: Math.max(...allProducts.map(p => p.id)) + 1,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}_COPY_${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setLocalProducts([...localProducts, newProduct]);
        message.success('Đã sao chép sản phẩm');
    };

    // Toggle status function
    const handleToggleStatus = (id: number, currentStatus: string) => {
        if (currentStatus === 'deleted') {
            message.warning('Không thể thay đổi trạng thái sản phẩm đã xóa');
            return;
        }

        const newStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
        setLocalProducts(localProducts.map(p =>
            p.id === id ? { ...p, status: newStatus } : p
        ));
        message.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} sản phẩm`);
    };

    // Bulk actions
    const handleBulkAction = (action: string) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        const selectedIds = selectedRowKeys as number[];

        switch (action) {
            case 'delete':
                setLocalProducts(localProducts.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'deleted' as const } : p
                ));
                message.success(`Đã xóa ${selectedIds.length} sản phẩm`);
                break;
            case 'activate':
                setLocalProducts(localProducts.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'active' as const } : p
                ));
                message.success(`Đã kích hoạt ${selectedIds.length} sản phẩm`);
                break;
            case 'deactivate':
                setLocalProducts(localProducts.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'inactive' as const } : p
                ));
                message.success(`Đã vô hiệu hóa ${selectedIds.length} sản phẩm`);
                break;
        }
        setSelectedRowKeys([]);
    };

    // Chức năng xuất Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(allProducts.map(product => ({
            'ID': product.id,
            'Tên sản phẩm': product.name,
            'SKU': product.sku,
            'Danh mục': product.category,
            'Giá gốc': product.price,
            'Giá khuyến mãi': product.salePrice || '',
            'Tồn kho': product.stock,
            'Trạng thái': product.status === 'active' ? 'Hoạt động' : 'Ngừng bán',
            'Mô tả': product.description,
            'Tags': product.tags.join(', '),
            'Ngày tạo': product.createdAt
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
        XLSX.writeFile(workbook, `san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    // Chức năng nhập Excel
    const handleImportExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                const importedProducts = jsonData.map((row, index) => ({
                    id: Math.max(...allProducts.map(p => p.id)) + index + 1,
                    name: row['Tên sản phẩm'] || '',
                    sku: row['SKU'] || `SKU${Date.now()}${index}`,
                    category: row['Danh mục'] || 'Khác',
                    price: parseInt(row['Giá gốc']) || 0,
                    salePrice: parseInt(row['Giá khuyến mãi']) || 0,
                    stock: parseInt(row['Tồn kho']) || 0,
                    status: (row['Trạng thái'] === 'Hoạt động' ? 'active' : 'inactive') as 'active' | 'inactive',
                    image: '/api/placeholder/150/150',
                    description: row['Mô tả'] || '',
                    tags: row['Tags'] ? row['Tags'].split(', ') : [],
                    createdAt: row['Ngày tạo'] || new Date().toISOString().split('T')[0]
                }));

                setLocalProducts([...localProducts, ...importedProducts]);
                message.success(`Đã nhập ${importedProducts.length} sản phẩm từ Excel!`);
            } catch (error) {
                message.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // Prevent default upload behavior
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const productData = {
                ...values,
                tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
                id: editingProduct ? editingProduct.id : Math.max(...allProducts.map(p => p.id)) + 1,
                createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0]
            };

            if (editingProduct) {
                setLocalProducts(localProducts.map(p =>
                    p.id === editingProduct.id ? { ...p, ...productData } : p
                ));
                message.success('Đã cập nhật sản phẩm thành công');
            } else {
                setLocalProducts([...localProducts, productData]);
                message.success('Đã thêm sản phẩm thành công');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Quản lý Sản phẩm
            </Title>

            {/* API Error Alert */}
            {apiError && (
                <Alert
                    message="Lỗi tải dữ liệu từ API"
                    description={apiError}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={refetch}>
                            Thử lại
                        </Button>
                    }
                    style={{ marginBottom: '24px' }}
                />
            )}

            {/* Loading State */}
            {apiLoading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Đang tải dữ liệu sản phẩm từ API...</p>
                </div>
            )}

            {/* Content */}
            {!apiLoading && (
                <>
                    {/* Statistics */}
                    <Row gutter={16} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={12} lg={5}>
                            <Card>
                                <Statistic
                                    title="Tổng sản phẩm"
                                    value={totalProducts}
                                    prefix={<InboxOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {apiProducts.length} từ API, {localProducts.length} local
                                </Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={5}>
                            <Card>
                                <Statistic
                                    title="Đang bán"
                                    value={activeProducts}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={4}>
                            <Card>
                                <Statistic
                                    title="Hết hàng"
                                    value={outOfStockProducts}
                                    prefix={<TagOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={4}>
                            <Card>
                                <Statistic
                                    title="Đã xóa"
                                    value={deletedProducts}
                                    prefix={<DeleteOutlined />}
                                    valueStyle={{ color: '#8c8c8c' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={24} lg={6}>
                            <Card>
                                <Statistic
                                    title="Giá trị kho"
                                    value={totalValue}
                                    prefix={<DollarOutlined />}
                                    suffix="đ"
                                    valueStyle={{ color: '#722ed1' }}
                                    formatter={(value) => `${Number(value).toLocaleString()}`}
                                />
                            </Card>
                        </Col>
                    </Row>

            {/* Action Bar */}
            <Card style={{ marginBottom: '16px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space wrap>
                            <Input.Search
                                placeholder="Tìm kiếm sản phẩm..."
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                placeholder="Danh mục"
                                style={{ width: 150 }}
                                allowClear
                                value={filterCategory === 'all' ? undefined : filterCategory}
                                onChange={(value) => setFilterCategory(value || 'all')}
                            >
                                {categories.map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
                                ))}
                            </Select>
                            <div style={{ width: 200 }}>
                                <Text style={{ fontSize: '12px', color: '#666' }}>Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ</Text>
                                <Slider
                                    range
                                    min={0}
                                    max={2000000}
                                    step={50000}
                                    value={priceRange}
                                    onChange={(value) => setPriceRange(value as [number, number])}
                                />
                            </div>
                            <div>
                                <Checkbox
                                    checked={showDeleted}
                                    onChange={(e) => setShowDeleted(e.target.checked)}
                                >
                                    Hiện sản phẩm đã xóa ({deletedProducts})
                                </Checkbox>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={refetch}
                                loading={apiLoading}
                            >
                                Làm mới API
                            </Button>
                            <Button
                                type="default"
                                icon={<DownloadOutlined />}
                                onClick={handleExportExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Upload
                                accept=".xlsx,.xls"
                                beforeUpload={handleImportExcel}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />}>
                                    Nhập Excel
                                </Button>
                            </Upload>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                className="btn-primary"
                            >
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text strong>Đã chọn {selectedRowKeys.length} sản phẩm</Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    onClick={() => handleBulkAction('activate')}
                                    type="default"
                                >
                                    Kích hoạt
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('deactivate')}
                                    type="default"
                                >
                                    Vô hiệu hóa
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('delete')}
                                    danger
                                >
                                    Xóa tất cả
                                </Button>
                                <Button
                                    onClick={() => setSelectedRowKeys([])}
                                >
                                    Bỏ chọn
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Products Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        getCheckboxProps: (record: Product) => ({
                            disabled: record.status === 'deleted'
                        })
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                width={800}
                okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sku"
                                label="SKU"
                                rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}
                            >
                                <Input placeholder="Nhập mã SKU" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(cat => (
                                        <Option key={cat} value={cat}>{cat}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Đang bán</Option>
                                    <Option value="inactive">Ngừng bán</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="price"
                                label="Giá gốc (đ)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="salePrice"
                                label="Giá khuyến mãi (đ)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="stock"
                                label="Số lượng tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả sản phẩm"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả sản phẩm"
                        />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags (phân cách bằng dấu phẩy)"
                    >
                        <Input placeholder="Ví dụ: Nam, Thun, Basic" />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="Hình ảnh sản phẩm"
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Product Modal */}
            <Modal
                title="Chi tiết sản phẩm"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {viewingProduct && (
                    <div>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Image
                                    width="100%"
                                    src={viewingProduct.image}
                                    fallback="/api/placeholder/200/200"
                                />
                            </Col>
                            <Col span={16}>
                                <Title level={4}>{viewingProduct.name}</Title>
                                <p><strong>SKU:</strong> {viewingProduct.sku}</p>
                                <p><strong>Danh mục:</strong> {viewingProduct.category}</p>
                                <p><strong>Giá:</strong>
                                    {viewingProduct.salePrice && viewingProduct.salePrice > 0 ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                {viewingProduct.price.toLocaleString()}đ
                                            </span>
                                            {' → '}
                                            <span className="text-primary" style={{ fontWeight: 'bold' }}>
                                                {viewingProduct.salePrice?.toLocaleString()}đ
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-primary" style={{ fontWeight: 'bold' }}>
                                            {viewingProduct.price.toLocaleString()}đ
                                        </span>
                                    )}
                                </p>
                                <p><strong>Tồn kho:</strong> {viewingProduct.stock}</p>
                                <p><strong>Trạng thái:</strong>
                                    <Tag color={viewingProduct.status === 'active' ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                                        {viewingProduct.status === 'active' ? 'Đang bán' : 'Hết hàng'}
                                    </Tag>
                                </p>
                                <p><strong>Tags:</strong></p>
                                <div>
                                    {viewingProduct.tags.map((tag: string) => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                        {viewingProduct.description && (
                            <div style={{ marginTop: '16px' }}>
                                <Title level={5}>Mô tả:</Title>
                                <p>{viewingProduct.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Variants Management Modal */}
            <Modal
                title="Quản lý biến thể sản phẩm"
                open={isVariantModalVisible}
                onCancel={() => setIsVariantModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setIsVariantModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="save" type="primary" onClick={() => {
                        // Save variants logic would go here
                        setIsVariantModalVisible(false);
                        message.success('Đã lưu biến thể');
                    }}>
                        Lưu biến thể
                    </Button>
                ]}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const newVariant: ProductVariant = {
                                id: `variant_${Date.now()}`,
                                color: '',
                                size: '',
                                material: '',
                                price: 0,
                                stock: 0,
                                sku: `VAR_${Date.now()}`
                            };
                            setEditingVariants([...editingVariants, newVariant]);
                        }}
                        block
                    >
                        Thêm biến thể mới
                    </Button>
                </div>

                {editingVariants.map((variant, index) => (
                    <Card key={variant.id} size="small" style={{ marginBottom: '12px' }}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Input
                                    placeholder="Màu sắc"
                                    value={variant.color}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].color = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={4}>
                                <Input
                                    placeholder="Size"
                                    value={variant.size}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].size = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={6}>
                                <Input
                                    placeholder="Chất liệu"
                                    value={variant.material}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].material = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    placeholder="Giá"
                                    value={variant.price}
                                    onChange={(value) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].price = value || 0;
                                        setEditingVariants(newVariants);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={3}>
                                <InputNumber
                                    placeholder="Kho"
                                    value={variant.stock}
                                    onChange={(value) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].stock = value || 0;
                                        setEditingVariants(newVariants);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={1}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        const newVariants = editingVariants.filter((_, i) => i !== index);
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                        </Row>
                    </Card>
                ))}

                {editingVariants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Chưa có biến thế nào. Nhấn "Thêm biến thể mới" để bắt đầu.
                    </div>
                )}
            </Modal>
                </>
            )}
        </div>
    );
};

export default Products;