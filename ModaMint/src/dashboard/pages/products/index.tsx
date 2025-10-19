import React, { useState, useEffect } from 'react';
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
    Alert,
    Descriptions,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    InboxOutlined,
    TagOutlined,
    ReloadOutlined,
    RestOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';
import { productService, type ProductRequest } from '../../../services/product';
import { categoryService, type Category } from '../../../services/category';
import { useProducts } from '../../../hooks/useProducts';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho Product với thông tin đầy đủ từ API
interface Product {
    id: number;
    name: string;
    price: number;
    active: boolean;
    description: string;
    brandName: string;
    categoryName: string;
    createAt?: string;
    updateAt?: string;
    // Thêm các trường để hiển thị
    image?: string;
    stock?: number;
}

const Products: React.FC = () => {
    // Sử dụng hook để lấy dữ liệu từ API
    const { products: apiProducts, loading: apiLoading, error: apiError, refetch } = useProducts();
    
    // State cho local products (để thêm/sửa/xóa)
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    
    // State cho categories từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    
    // State cho modals
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    // States cho bulk actions và filtering  
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');

    // State cho pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // State cho variant modal
    const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
    const [editingVariants, setEditingVariants] = useState<any[]>([]);

    // Load categories từ API
    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const result = await categoryService.getAllCategories();
            if (result.code === 1000 && result.result) {
                setCategories(result.result);
                console.log('Loaded categories:', result.result);
            } else {
                console.error('Failed to load categories:', result.message);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Load categories khi component mount
    useEffect(() => {
        loadCategories();
    }, []); // Chỉ load categories khi component mount

    // Kết hợp dữ liệu từ API và local
    const allProducts = [
        ...apiProducts.map(apiProduct => ({
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            active: apiProduct.active,
            description: apiProduct.description,
            brandName: apiProduct.brandName,
            categoryName: apiProduct.categoryName,
            createAt: apiProduct.createAt,
            updateAt: apiProduct.updateAt,
            image: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&random=${apiProduct.id}`,
            stock: Math.floor(Math.random() * 100) + 1 // Mock stock
        })),
        ...localProducts
    ];

    // Filtered products - Logic mới: hiển thị hoặc sản phẩm hoạt động hoặc sản phẩm ngừng hoạt động
    const filteredProducts = allProducts.filter(p => {
        // Nếu showDeleted = true: chỉ hiển thị sản phẩm ngừng hoạt động (!p.active)
        // Nếu showDeleted = false: chỉ hiển thị sản phẩm hoạt động (p.active)
        const activeCheck = showDeleted ? !p.active : p.active;
        const categoryCheck = filterCategory === 'all' || p.categoryName === filterCategory;
        const priceCheck = p.price >= priceRange[0] && p.price <= priceRange[1];
        const searchCheck = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
        
        return activeCheck && categoryCheck && priceCheck && searchCheck;
    });

    // Logic phân trang mới: Tính toán products hiển thị trên trang hiện tại
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Cập nhật total cho pagination dựa trên filtered products
    const filteredTotal = filteredProducts.length;

    // Debug filtered products
    console.log('=== FILTERING DEBUG ===');
    console.log('All products:', allProducts.length);
    console.log('Active products:', allProducts.filter(p => p.active).length);
    console.log('Inactive products:', allProducts.filter(p => !p.active).length);
    console.log('Filtered products:', filteredProducts.length);
    console.log('Show deleted (inactive):', showDeleted);
    console.log('Filter category:', filterCategory);
    console.log('Search text:', searchText);
    console.log('Price range:', priceRange);

    // Statistics từ dữ liệu thực
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.active).length;
    const inactiveProducts = allProducts.filter(p => !p.active).length;
    const totalValue = allProducts.reduce((sum, p) => sum + p.price, 0);

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            align: 'center' as const,
            render: (image: string) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <Image
                        width={45}
                        height={45}
                        src={image}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        style={{ 
                            borderRadius: '4px',
                            objectFit: 'cover',
                            border: '1px solid #f0f0f0'
                        }}
                        preview={{
                            mask: <div style={{ color: 'white', fontSize: '12px' }}>Xem</div>
                        }}
                    />
                </div>
            ),
        },
        {
            title: 'Thông tin sản phẩm',
            key: 'product_info',
            render: (record: Product) => (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '14px', lineHeight: '1.3' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '1px', lineHeight: '1.2' }}>
                        ID: {record.id}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '1px', lineHeight: '1.2' }}>
                        Thương hiệu: {record.brandName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.2' }}>
                        Danh mục: {record.categoryName}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            width: 120,
            align: 'center' as const,
            render: (record: Product) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        <span className="text-primary">
                            {record.price.toLocaleString()}đ
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            width: 80,
            align: 'center' as const,
            render: (stock: number) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <span style={{
                        color: stock === 0 ? '#ff4d4f' : stock < 20 ? '#faad14' : '#52c41a',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {stock}
                    </span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            width: 120,
            align: 'center' as const,
            render: (active: boolean) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <Tag color={active ? 'green' : 'red'} style={{ fontSize: '12px' }}>
                        {active ? 'Đang bán' : 'Ngừng bán'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center' as const,
            render: (record: Product) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
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
                        {record.active ? (
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
                        ) : (
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
                        {!record.active && (
                            <Button
                                type="text"
                                icon={<RestOutlined />}
                                onClick={() => handleRestore(record.id)}
                                title="Khôi phục"
                                size="small"
                            />
                        )}
                    </Space>
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        // Tìm categoryId từ categoryName
        const category = categories.find(cat => cat.name === product.categoryName);
        form.setFieldsValue({
            name: product.name,
            price: product.price,
            description: product.description,
            brandId: product.brandName, // Mock brandId
            categoryId: category?.id, // Sử dụng categoryId thực từ API
            active: product.active
        });
        setIsModalVisible(true);
    };

    const handleView = (product: Product) => {
        setViewingProduct(product);
        setIsViewModalVisible(true);
    };

    // Soft delete - vô hiệu hóa sản phẩm
    const handleSoftDelete = async (id: number) => {
        try {
            const result = await productService.deleteProduct(id);
            if (result.success) {
                message.success('Đã vô hiệu hóa sản phẩm thành công');
                
                // Cập nhật local state ngay lập tức
                setLocalProducts(prevProducts => 
                    prevProducts.map(product => 
                        product.id === id ? { ...product, active: false } : product
                    )
                );
                
                // Nếu đang ở trang cuối và trang đó trống sau khi xóa, chuyển về trang trước
                const remainingFilteredProducts = filteredProducts.filter(p => p.id !== id);
                const maxPage = Math.ceil(remainingFilteredProducts.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }
            } else {
                message.error(result.message || 'Không thể vô hiệu hóa sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi khi vô hiệu hóa sản phẩm');
            console.error('Error soft deleting product:', error);
        }
    };

    // Hard delete - xóa vĩnh viễn sản phẩm
    const handleHardDelete = async (id: number) => {
        try {
            const result = await productService.permanentDeleteProduct(id);
            if (result.success) {
                message.success('Đã xóa vĩnh viễn sản phẩm thành công');
                
                // Xóa sản phẩm khỏi local state ngay lập tức
                setLocalProducts(prevProducts => prevProducts.filter(product => product.id !== id));
                
                // Tính toán lại pagination sau khi xóa
                const remainingProducts = allProducts.filter(p => p.id !== id);
                const remainingFilteredProducts = remainingProducts.filter(p => {
                    const activeCheck = showDeleted ? !p.active : p.active;
                    const categoryCheck = filterCategory === 'all' || p.categoryName === filterCategory;
                    const priceCheck = p.price >= priceRange[0] && p.price <= priceRange[1];
                    const searchCheck = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
                    return activeCheck && categoryCheck && priceCheck && searchCheck;
                });
                
                const maxPage = Math.ceil(remainingFilteredProducts.length / pagination.pageSize);
                
                // Nếu đang ở trang cuối và trang đó trống sau khi xóa, chuyển về trang trước
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage,
                        total: remainingProducts.length
                    }));
                } else {
                    setPagination(prev => ({
                        ...prev,
                        total: remainingProducts.length
                    }));
                }
            } else {
                message.error(result.message || 'Không thể xóa vĩnh viễn sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi khi xóa vĩnh viễn sản phẩm');
            console.error('Error hard deleting product:', error);
        }
    };

    // Khôi phục sản phẩm đã xóa
    const handleRestore = async (id: number) => {
        try {
            const result = await productService.restoreProduct(id);
            if (result.success) {
                message.success('Đã khôi phục sản phẩm thành công');
                
                // Cập nhật local state ngay lập tức
                setLocalProducts(prevProducts => 
                    prevProducts.map(product => 
                        product.id === id ? { ...product, active: true } : product
                    )
                );
                
                // Nếu đang xem danh sách sản phẩm vô hiệu và khôi phục sản phẩm,
                // sản phẩm sẽ biến mất khỏi danh sách hiện tại
                if (showDeleted) {
                    const remainingFilteredProducts = filteredProducts.filter(p => p.id !== id);
                    const maxPage = Math.ceil(remainingFilteredProducts.length / pagination.pageSize);
                    if (pagination.current > maxPage && maxPage > 0) {
                        setPagination(prev => ({
                            ...prev,
                            current: maxPage
                        }));
                    }
                }
            } else {
                message.error(result.message || 'Không thể khôi phục sản phẩm');
            }
        } catch (error) {
            message.error('Lỗi khi khôi phục sản phẩm');
            console.error('Error restoring product:', error);
        }
    };

    // Bulk actions
    const handleBulkAction = async (action: string) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        const selectedIds = selectedRowKeys as number[];
        let successCount = 0;

        try {
            for (const id of selectedIds) {
                let result;
                switch (action) {
                    case 'delete':
                        result = await productService.deleteProduct(id);
                        if (result.success) {
                            // Cập nhật local state ngay lập tức
                            setLocalProducts(prevProducts => 
                                prevProducts.map(product => 
                                    product.id === id ? { ...product, active: false } : product
                                )
                            );
                        }
                        break;
                    case 'restore':
                        result = await productService.restoreProduct(id);
                        if (result.success) {
                            // Cập nhật local state ngay lập tức
                            setLocalProducts(prevProducts => 
                                prevProducts.map(product => 
                                    product.id === id ? { ...product, active: true } : product
                                )
                            );
                        }
                        break;
                    default:
                        continue;
                }
                if (result.success) {
                    successCount++;
                }
            }
            
            if (successCount > 0) {
                message.success(`Đã ${action === 'delete' ? 'vô hiệu hóa' : 'khôi phục'} ${successCount}/${selectedIds.length} sản phẩm`);
                
                // Tính toán lại pagination nếu cần
                const maxPage = Math.ceil(filteredProducts.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }
            }
        } catch (error) {
            message.error('Lỗi khi thực hiện hành động hàng loạt');
            console.error('Error in bulk action:', error);
        }
        
        setSelectedRowKeys([]);
    };

    // Chức năng xuất Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(allProducts.map(product => ({
            'ID': product.id,
            'Tên sản phẩm': product.name,
            'Thương hiệu': product.brandName,
            'Danh mục': product.categoryName,
            'Giá': product.price,
            'Trạng thái': product.active ? 'Đang bán' : 'Ngừng bán',
            'Mô tả': product.description,
            'Ngày tạo': product.createAt || '',
            'Ngày cập nhật': product.updateAt || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
        XLSX.writeFile(workbook, `san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    const handleSave = async (values: any) => {
        try {
            // Validate required fields
            if (!values.name?.trim()) {
                message.error('Tên sản phẩm không được để trống');
                return;
            }
            if (!values.description?.trim()) {
                message.error('Mô tả sản phẩm không được để trống');
                return;
            }
            if (!values.price || values.price <= 0) {
                message.error('Giá sản phẩm phải lớn hơn 0');
                return;
            }
            if (!values.brandId) {
                message.error('Vui lòng chọn thương hiệu');
                return;
            }
            if (!values.categoryId) {
                message.error('Vui lòng chọn danh mục');
                return;
            }

            const productData: ProductRequest = {
                name: values.name.trim(),
                price: values.price, // Backend sẽ convert number thành BigDecimal
                description: values.description.trim(),
                brandId: values.brandId,
                categoryId: values.categoryId,
                active: values.active !== undefined ? values.active : true
            };

            console.log('Sending product data:', productData);

            let result;
            if (editingProduct) {
                result = await productService.updateProduct(editingProduct.id, productData);
                if (result.success) {
                    message.success('Đã cập nhật sản phẩm thành công');
                } else {
                    message.error(result.message || 'Không thể cập nhật sản phẩm');
                }
            } else {
                result = await productService.createProduct(productData);
                if (result.success) {
                    message.success('Đã thêm sản phẩm thành công');
                } else {
                    message.error(result.message || 'Không thể thêm sản phẩm');
                }
            }

            if (result.success) {
                setIsModalVisible(false);
                form.resetFields();
                
                // Reload toàn bộ dữ liệu sau khi thêm/sửa để đảm bảo dữ liệu chính xác
                refetch();
                loadCategories();
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Error saving product:', error);
        }
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <style>{`
                .ant-table-measure-row {
                    display: none !important;
                    height: 0 !important;
                    visibility: hidden !important;
                }
                * {
                    margin-top: 0 !important;
                }
                .ant-card {
                    margin-top: 0 !important;
                    margin-bottom: 16px !important;
                }
                .ant-card-body {
                    padding: 16px !important;
                }
                .ant-table {
                    margin-top: 0 !important;
                }
                .ant-table-container {
                    margin-top: 0 !important;
                }
                .ant-table-thead > tr > th {
                    padding: 8px 16px !important;
                }
                .ant-typography {
                    margin-top: 0 !important;
                }
                .ant-row {
                    margin-top: 0 !important;
                }
                .ant-col {
                    margin-top: 0 !important;
                }
                .ant-statistic {
                    margin-top: 0 !important;
                }
                .ant-statistic-title {
                    margin-top: 0 !important;
                }
            `}</style>
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
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
                    <Row gutter={16} style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Col xs={24} sm={12} lg={6}>
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
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đang bán"
                                    value={activeProducts}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Ngừng bán"
                                    value={inactiveProducts}
                                    prefix={<TagOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng giá trị"
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
            <Card style={{ marginBottom: '16px', marginTop: 0 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space wrap>
                            <Input.Search
                                placeholder="Tìm kiếm sản phẩm..."
                                style={{ width: 300 }}
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Select
                                placeholder="Danh mục"
                                style={{ width: 150 }}
                                allowClear
                                value={filterCategory === 'all' ? undefined : filterCategory}
                                onChange={(value) => setFilterCategory(value || 'all')}
                                loading={categoriesLoading}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.name}>{cat.name}</Option>
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
                                    Hiện sản phẩm ngừng bán ({inactiveProducts})
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
                                    onClick={() => handleBulkAction('restore')}
                                    type="default"
                                    icon={<RestOutlined />}
                                >
                                    Khôi phục
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('delete')}
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Vô hiệu hóa
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
            <Card style={{ marginTop: 0 }}>
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
                    .ant-table-container {
                        margin-top: 0 !important;
                    }
                    .ant-card-body {
                        padding: 16px !important;
                    }
                    .ant-table-thead {
                        margin-top: 0 !important;
                    }
                    .ant-table-thead > tr {
                        margin-top: 0 !important;
                    }
                `}</style>
                <Table
                    columns={columns}
                    dataSource={currentPageProducts}
                    rowKey="id"
                    loading={apiLoading}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        getCheckboxProps: (record: Product) => ({
                            disabled: !record.active
                        })
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize || prev.pageSize
                            }));
                        },
                        onShowSizeChange: (_, size) => {
                            setPagination(prev => ({
                                ...prev,
                                current: 1, // Reset về trang 1 khi thay đổi page size
                                pageSize: size
                            }));
                        }
                    }}
                    scroll={{ x: 1000 }}
                    style={{
                        '--ant-table-row-height': '70px'
                    } as React.CSSProperties}
                    components={{
                        body: {
                            row: (props: any) => (
                                <tr {...props} style={{ height: '70px', verticalAlign: 'middle' }} />
                            )
                        }
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                            { min: 1, message: 'Tên sản phẩm không được để trống' }
                        ]}
                    >
                        <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá (đ)"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá' },
                                    { type: 'number', min: 0.01, message: 'Giá phải lớn hơn 0' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    min={0.01}
                                    step={1000}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="active"
                                label="Trạng thái"
                                valuePropName="checked"
                            >
                                <Checkbox>Đang bán</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả sản phẩm"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mô tả sản phẩm' },
                            { min: 1, message: 'Mô tả sản phẩm không được để trống' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả sản phẩm"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="brandId"
                                label="Thương hiệu"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn thương hiệu' },
                                    { type: 'number', message: 'Vui lòng chọn thương hiệu hợp lệ' }
                                ]}
                            >
                                <Select placeholder="Chọn thương hiệu">
                                    <Option value={1}>Nike</Option>
                                    <Option value={2}>Adidas</Option>
                                    <Option value={3}>Puma</Option>
                                    <Option value={4}>Uniqlo</Option>
                                    <Option value={5}>Chanel</Option>
                                    <Option value={6}>Gucci</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="categoryId"
                                label="Danh mục"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn danh mục' },
                                    { type: 'number', message: 'Vui lòng chọn danh mục hợp lệ' }
                                ]}
                            >
                                <Select 
                                    placeholder="Chọn danh mục"
                                    loading={categoriesLoading}
                                >
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
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
                width={700}
            >
                {viewingProduct && (
                    <div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Image
                                    width="100%"
                                    src={viewingProduct.image}
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                    style={{ borderRadius: '8px' }}
                                />
                            </Col>
                            <Col span={16}>
                                <Title level={3} style={{ marginBottom: '16px' }}>
                                    {viewingProduct.name}
                                </Title>
                                
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="ID">
                                        <Text code>{viewingProduct.id}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thương hiệu">
                                        <Tag color="blue">{viewingProduct.brandName}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Danh mục">
                                        <Tag color="green">{viewingProduct.categoryName}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá">
                                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                            {viewingProduct.price.toLocaleString()}đ
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tồn kho">
                                        <Text style={{ 
                                            color: (viewingProduct.stock || 0) === 0 ? '#ff4d4f' : 
                                                   (viewingProduct.stock || 0) < 20 ? '#faad14' : '#52c41a',
                                            fontWeight: 'bold'
                                        }}>
                                            {viewingProduct.stock || 0}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={viewingProduct.active ? 'green' : 'red'}>
                                            {viewingProduct.active ? 'Đang bán' : 'Ngừng bán'}
                                        </Tag>
                                    </Descriptions.Item>
                                    {viewingProduct.createAt && (
                                        <Descriptions.Item label="Ngày tạo">
                                            {new Date(viewingProduct.createAt).toLocaleDateString('vi-VN')}
                                        </Descriptions.Item>
                                    )}
                                    {viewingProduct.updateAt && (
                                        <Descriptions.Item label="Cập nhật lần cuối">
                                            {new Date(viewingProduct.updateAt).toLocaleDateString('vi-VN')}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Col>
                        </Row>
                        
                        {viewingProduct.description && (
                            <>
                                <Divider />
                                <div>
                                    <Title level={4}>Mô tả sản phẩm</Title>
                                    <Text>{viewingProduct.description}</Text>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

                </>
            )}
        </div>
    );
};

export default Products;