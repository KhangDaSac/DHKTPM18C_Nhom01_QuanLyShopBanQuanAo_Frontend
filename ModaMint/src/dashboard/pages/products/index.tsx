import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Badge,
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
    Divider,
    Upload
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload';

const { PreviewGroup } = Image;
const { Dragger } = Upload;

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
    ExclamationCircleOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';
import { productService, type ProductRequest } from '../../../services/product';
import { categoryService, type Category } from '../../../services/category';
import { brandService, type BrandResponse } from '../../../services/brand/index.ts';
import { useProducts } from '../../../hooks/useProducts';
import { productVariantService, type ProductVariant, type ProductVariantRequest } from '../../../services/productVariant';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductModal from './ProductModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho Product với thông tin đầy đủ từ API
interface Product {
    id: number;
    name: string;
    minPrice: number;
    maxPrice: number;
    priceRange: string;
    active: boolean;
    description: string;
    brandName: string;
    categoryName: string;
    createAt?: string;
    updateAt?: string;
    productVariants?: ProductVariant[];
    // Thêm các trường để hiển thị
    image?: string;
    images?: string[]; // Mảng ảnh của sản phẩm
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

    // State cho brands từ API
    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(false);

    // State cho modals
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    // State cho upload ảnh
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // State cho upload ảnh variant (dùng cho variant management modal)
    const [variantFileLists, setVariantFileLists] = useState<{ [key: number]: UploadFile[] }>({});

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
    const [editingVariants, setEditingVariants] = useState<ProductVariant[]>([]);
    const [currentProductId, setCurrentProductId] = useState<number | null>(null);
    const [variantsLoading, setVariantsLoading] = useState(false);
    const [savingVariantId, setSavingVariantId] = useState<number | null>(null);
    const [variantForm] = Form.useForm();

    // Load categories từ API
    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const result = await categoryService.getAllCategories();
            if (result.code === 1000 && result.result) {
                setCategories(result.result);
            }
        } catch (error) {
            // Silent fail
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Load brands từ API
    const loadBrands = async () => {
        setBrandsLoading(true);
        try {
            const result = await brandService.getAllBrands();
            if (result.code === 1000 && result.result) {
                setBrands(result.result);
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        } finally {
            setBrandsLoading(false);
        }
    };

    // Load categories và brands khi component mount
    useEffect(() => {
        loadCategories();
        loadBrands();
    }, []); // Chỉ load khi component mount

    // Kết hợp dữ liệu từ API và local
    const allProducts = [
        ...apiProducts.map(apiProduct => {
            // Tính giá từ variants
            const variants = apiProduct.productVariants || [];
            const prices = variants.map(v => v.price).filter(p => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
            const priceRange = prices.length === 0
                ? 'Chưa có giá'
                : minPrice === maxPrice
                    ? `${minPrice.toLocaleString('vi-VN')}₫`
                    : `${minPrice.toLocaleString('vi-VN')}₫ - ${maxPrice.toLocaleString('vi-VN')}₫`;

            // Tính tổng tồn kho từ tất cả variants
            const totalStock = apiProduct.productVariants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;

            return {
                id: apiProduct.id,
                name: apiProduct.name,
                minPrice,
                maxPrice,
                priceRange,
                active: apiProduct.active,
                description: apiProduct.description,
                brandName: apiProduct.brandName,
                categoryName: apiProduct.categoryName,
                createAt: apiProduct.createAt,
                updateAt: apiProduct.updateAt,
                productVariants: apiProduct.productVariants,
                image: apiProduct.images && apiProduct.images.length > 0
                    ? apiProduct.images[0]
                    : `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&random=${apiProduct.id}`,
                images: apiProduct.images || [],
                stock: totalStock
            };
        }),
        ...localProducts
    ];

    // Filtered products - Logic mới: hiển thị hoặc sản phẩm hoạt động hoặc sản phẩm ngừng hoạt động
    // Sắp xếp theo ID giảm dần (sản phẩm mới nhất có ID lớn nhất ở trên cùng)
    const filteredProducts = allProducts
        .filter(p => {
            // Nếu showDeleted = true: chỉ hiển thị sản phẩm ngừng hoạt động (!p.active)
            // Nếu showDeleted = false: chỉ hiển thị sản phẩm hoạt động (p.active)
            const activeCheck = showDeleted ? !p.active : p.active;
            const categoryCheck = filterCategory === 'all' || p.categoryName === filterCategory;
            // Kiểm tra giá bằng minPrice
            const priceCheck = p.minPrice >= priceRange[0] && p.minPrice <= priceRange[1];
            const searchCheck = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());

            return activeCheck && categoryCheck && priceCheck && searchCheck;
        })
        .sort((a, b) => b.id - a.id); // Sắp xếp giảm dần theo ID (mới nhất lên đầu)

    // Logic phân trang mới: Tính toán products hiển thị trên trang hiện tại
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageProducts = filteredProducts.slice(startIndex, endIndex);

    // Cập nhật total cho pagination dựa trên filtered products
    const filteredTotal = filteredProducts.length;

    // Statistics từ dữ liệu thực
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.active).length;
    const inactiveProducts = allProducts.filter(p => !p.active).length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.minPrice || 0), 0);
    const totalStock = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            align: 'center' as const,
            render: (image: string, record: Product) => {
                if (record.images && record.images.length > 1) {
                    const imagesLength = record.images.length;
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '70px',
                            padding: '8px 0',
                            position: 'relative'
                        }}>
                            <PreviewGroup>
                                {record.images.map((img, idx) => (
                                    <Image
                                        key={idx}
                                        width={idx === 0 ? 45 : 0}
                                        height={idx === 0 ? 45 : 0}
                                        src={img}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                        style={{
                                            borderRadius: '4px',
                                            objectFit: 'cover',
                                            border: '1px solid #f0f0f0',
                                            display: idx === 0 ? 'block' : 'none'
                                        }}
                                        preview={{
                                            mask: idx === 0 ? <div style={{ color: 'white', fontSize: '12px' }}>Xem {imagesLength} ảnh</div> : false
                                        }}
                                    />
                                ))}
                            </PreviewGroup>
                            <div style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 8,
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '1px 4px',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                lineHeight: '1'
                            }}>
                                +{imagesLength}
                            </div>
                        </div>
                    );
                }
                return (
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
                        />
                    </div>
                );
            },
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
                            {record.priceRange}
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
            render: (stock: number | undefined) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '70px',
                    padding: '8px 0'
                }}>
                    <span style={{
                        color: (stock || 0) === 0 ? '#ff4d4f' : (stock || 0) < 20 ? '#faad14' : '#52c41a',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {stock || 0}
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
                <Badge
                    status={active ? 'success' : 'default'}
                    text={active ? 'Đang bán' : 'Ngừng bán'}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center' as const,
            render: (record: Product) => (
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
                        icon={<AppstoreOutlined />}
                        onClick={() => handleManageVariants(record)}
                        title="Quản lý biến thể"
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
                        <Button
                            type="text"
                            icon={<RestOutlined />}
                            onClick={() => handleRestore(record.id)}
                            title="Khôi phục"
                            size="small"
                        />
                    )}
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setFileList([]);
        setIsModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        // Tìm categoryId từ categoryName
        const category = categories.find(cat => cat.name === product.categoryName);
        // Tìm brandId từ brandName
        const brand = brands.find(b => b.name === product.brandName);

        // Convert images array thành string với delimiter |
        const imagesString = product.images ? product.images.join('|') : '';

        // Tạo fileList từ images URLs
        const initialFiles: UploadFile[] = product.images ? product.images.map((img, idx) => ({
            uid: `-${idx}`,
            name: `image-${idx + 1}.jpg`,
            status: 'done',
            url: img,
        })) : [];
        setFileList(initialFiles);

        form.setFieldsValue({
            name: product.name,
            description: product.description,
            brandId: brand?.id, // Sử dụng brandId thực từ API
            categoryId: category?.id, // Sử dụng categoryId thực từ API
            active: product.active,
            images: imagesString
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
                toast.success('Đã vô hiệu hóa sản phẩm thành công');

                // Đóng modal nếu đang edit sản phẩm này
                if (editingProduct?.id === id) {
                    setIsModalVisible(false);
                    setEditingProduct(null);
                }

                // Reload dữ liệu từ API để cập nhật trạng thái mới nhất
                refetch();

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
                toast.error(result.message || 'Không thể vô hiệu hóa sản phẩm');
            }
        } catch (error) {
            toast.error('Lỗi khi vô hiệu hóa sản phẩm');
            console.error('Error soft deleting product:', error);
        }
    };

    // Hard delete - xóa vĩnh viễn sản phẩm


    // Khôi phục sản phẩm đã xóa
    const handleRestore = async (id: number) => {
        try {
            const result = await productService.restoreProduct(id);
            if (result.success) {
                toast.success('Đã khôi phục sản phẩm thành công');

                // Đóng modal nếu đang edit sản phẩm này
                if (editingProduct?.id === id) {
                    setIsModalVisible(false);
                    setEditingProduct(null);
                }

                // Reload dữ liệu từ API để cập nhật trạng thái mới nhất
                refetch();

                // Chuyển sang tab sản phẩm đang hoạt động
                setShowDeleted(false);

                // Nếu đang xem danh sách sản phẩm vô hiệu và khôi phục sản phẩm,
                // sản phẩm sẽ biến mất khỏi danh sách hiện tại
                const remainingFilteredProducts = filteredProducts.filter(p => p.id !== id);
                const maxPage = Math.ceil(remainingFilteredProducts.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }
            } else {
                toast.error(result.message || 'Không thể khôi phục sản phẩm');
            }
        } catch (error) {
            toast.error('Lỗi khi khôi phục sản phẩm');
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
        const selectedProducts = allProducts.filter(p => selectedIds.includes(p.id));

        // Lọc sản phẩm theo hành động
        const targetProducts = action === 'delete'
            ? selectedProducts.filter(p => p.active) // Chỉ vô hiệu hóa sản phẩm đang hoạt động
            : selectedProducts.filter(p => !p.active); // Chỉ khôi phục sản phẩm ngừng bán

        if (targetProducts.length === 0) {
            message.warning(action === 'delete'
                ? 'Không có sản phẩm nào đang hoạt động để vô hiệu hóa'
                : 'Không có sản phẩm nào ngừng bán để khôi phục');
            return;
        }

        let successCount = 0;

        try {
            for (const product of targetProducts) {
                let result;
                if (action === 'delete') {
                    result = await productService.deleteProduct(product.id);
                    if (result.success) {
                        setLocalProducts(prevProducts =>
                            prevProducts.map(p =>
                                p.id === product.id ? { ...p, active: false } : p
                            )
                        );
                        successCount++;
                    }
                } else if (action === 'restore') {
                    result = await productService.restoreProduct(product.id);
                    if (result.success) {
                        setLocalProducts(prevProducts =>
                            prevProducts.map(p =>
                                p.id === product.id ? { ...p, active: true } : p
                            )
                        );
                        successCount++;
                    }
                }
            }

            if (successCount > 0) {
                toast.success(`Đã ${action === 'delete' ? 'vô hiệu hóa' : 'khôi phục'} ${successCount}/${targetProducts.length} sản phẩm`);

                // Reload dữ liệu từ API để cập nhật trạng thái mới nhất
                refetch();

                // Tính toán lại pagination nếu cần
                const maxPage = Math.ceil(filteredProducts.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }

                // Nếu khôi phục, chuyển sang tab active
                if (action === 'restore') {
                    setShowDeleted(false);
                }
            }
        } catch (error) {
            toast.error('Lỗi khi thực hiện hành động hàng loạt');
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
            'Giá': product.priceRange,
            'Trạng thái': product.active ? 'Đang bán' : 'Ngừng bán',
            'Mô tả': product.description,
            'Ngày tạo': product.createAt || '',
            'Ngày cập nhật': product.updateAt || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
        XLSX.writeFile(workbook, `san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Đã xuất file Excel thành công!');
    };

    // Handler cho quản lý biến thể
    const handleManageVariants = async (product: Product) => {
        setCurrentProductId(product.id);
        setEditingVariants([]);
        setVariantFileLists({}); // Reset variant file lists
        setIsVariantModalVisible(true);
        setVariantsLoading(true);

        try {
            const result = await productVariantService.getProductVariantsByProductId(product.id);

            if (result.success && result.data) {
                setEditingVariants(result.data);

                // Initialize variantFileLists with existing images
                const initialFileLists: { [key: number]: UploadFile[] } = {};
                result.data.forEach((variant) => {
                    if (variant.image) {
                        initialFileLists[variant.id] = [{
                            uid: `${variant.id}`,
                            name: `variant-${variant.id}.jpg`,
                            status: 'done',
                            url: variant.image,
                            thumbUrl: variant.image
                        }];
                    }
                });
                setVariantFileLists(initialFileLists);

                if (result.data.length === 0) {
                    toast.info('Sản phẩm này chưa có biến thể. Nhấn "Thêm biến thể" để tạo mới.');
                }
            } else {
                toast.error(result.message || 'Không thể tải danh sách biến thể');
            }
        } catch (error) {
            toast.error('Lỗi khi tải danh sách biến thể. Vui lòng thử lại.');
        } finally {
            setVariantsLoading(false);
        }
    };

    // Thêm biến thể mới
    const handleAddVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now(), // Temporary ID
            productId: currentProductId!,
            size: '',
            color: '',
            image: '',
            price: 0,
            discount: 0,
            quantity: 0,
            additionalPrice: 0,
            active: true
        };
        setEditingVariants([...editingVariants, newVariant]);
    };

    // Vô hiệu hóa biến thể (soft delete)
    const handleDeleteVariant = async (variantId: number) => {
        // Nếu là variant mới (có ID tạm thời - số lớn)
        if (variantId > 1000000) {
            setEditingVariants(editingVariants.filter(v => v.id !== variantId));
            return;
        }

        setSavingVariantId(variantId);
        try {
            const result = await productVariantService.deleteProductVariant(variantId);
            if (result.success) {
                toast.success('Đã vô hiệu hóa biến thể thành công');
                // Update active status instead of removing from list
                setEditingVariants(editingVariants.map(v =>
                    v.id === variantId ? { ...v, active: false } : v
                ));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error soft deleting variant:', error);
            toast.error('Lỗi khi vô hiệu hóa biến thể');
        } finally {
            setSavingVariantId(null);
        }
    };

    // Khôi phục biến thể
    const handleRestoreVariant = async (variantId: number) => {
        setSavingVariantId(variantId);
        try {
            const result = await productVariantService.restoreProductVariant(variantId);
            if (result.success) {
                toast.success('Đã khôi phục biến thể thành công');
                setEditingVariants(editingVariants.map(v =>
                    v.id === variantId ? { ...v, active: true } : v
                ));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error restoring variant:', error);
            toast.error('Lỗi khi khôi phục biến thể');
        } finally {
            setSavingVariantId(null);
        }
    };

    // Lưu biến thể
    const handleSaveVariant = async (variant: ProductVariant) => {
        // Validate required fields
        if (!variant.price || variant.price <= 0) {
            toast.error('Giá sản phẩm phải lớn hơn 0');
            return false;
        }
        if (variant.quantity === undefined || variant.quantity === null || variant.quantity < 0) {
            toast.error('Số lượng không hợp lệ');
            return false;
        }

        setSavingVariantId(variant.id);
        const variantData: ProductVariantRequest = {
            productId: currentProductId!,
            size: variant.size,
            color: variant.color,
            image: variant.image,
            price: variant.price,
            discount: variant.discount,
            quantity: variant.quantity,
            additionalPrice: variant.additionalPrice,
            active: variant.active !== undefined ? variant.active : true
        };

        try {
            let result;
            const isNewVariant = variant.id > 1000000; // ID tạm thời cho variant mới

            if (isNewVariant) {
                // Thêm mới
                result = await productVariantService.createProductVariant(variantData);
                if (result.success && result.data) {
                    toast.success('Đã thêm biến thể mới thành công');
                    // Thay thế variant tạm bằng variant mới có ID thật từ server
                    setEditingVariants(editingVariants.map(v =>
                        v.id === variant.id ? result.data! : v
                    ));
                    // Reload danh sách sản phẩm để cập nhật giá
                    refetch();
                    return true;
                } else {
                    toast.error(result.message || 'Không thể thêm biến thể');
                    return false;
                }
            } else {
                // Cập nhật
                result = await productVariantService.updateProductVariant(variant.id, variantData);
                if (result.success && result.data) {
                    toast.success('Đã cập nhật biến thể thành công');
                    setEditingVariants(editingVariants.map(v =>
                        v.id === variant.id ? result.data! : v
                    ));
                    // Reload danh sách sản phẩm để cập nhật giá
                    refetch();
                    return true;
                } else {
                    toast.error(result.message || 'Không thể cập nhật biến thể');
                    return false;
                }
            }
        } catch (error) {
            console.error('Error saving variant:', error);
            toast.error('Lỗi khi lưu biến thể');
            return false;
        } finally {
            setSavingVariantId(null);
        }
    };

    // Cập nhật variant trong state
    const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        const updatedVariants = [...editingVariants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setEditingVariants(updatedVariants);
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
                <LoadingSpinner size="large" tip="Đang tải dữ liệu sản phẩm từ API..." />
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
                                    title="Tổng tồn kho"
                                    value={totalStock}
                                    prefix={<InboxOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
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
                                        value={filterCategory}
                                        onChange={(value) => setFilterCategory(value || 'all')}
                                        loading={categoriesLoading}
                                    >
                                        <Option value="all">Tất cả</Option>
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
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAdd}
                                    >
                                        Thêm sản phẩm
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<ReloadOutlined />}
                                        onClick={refetch}
                                        loading={apiLoading}
                                    >
                                        Làm mới sản phẩm
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<DownloadOutlined />}
                                        onClick={handleExportExcel}
                                    >
                                        Xuất Excel
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Bulk Actions */}
                    {selectedRowKeys.length > 0 && (() => {
                        const selectedProducts = allProducts.filter(p => selectedRowKeys.includes(p.id));
                        const hasActiveProducts = selectedProducts.some(p => p.active);
                        const hasInactiveProducts = selectedProducts.some(p => !p.active);

                        return (
                            <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong>Đã chọn {selectedRowKeys.length} sản phẩm</Text>
                                    </Col>
                                    <Col>
                                        <Space>
                                            {hasInactiveProducts && (
                                                <Button
                                                    onClick={() => handleBulkAction('restore')}
                                                    type="default"
                                                    icon={<RestOutlined />}
                                                >
                                                    Khôi phục {hasInactiveProducts && !hasActiveProducts ? '' : `(${selectedProducts.filter(p => !p.active).length})`}
                                                </Button>
                                            )}
                                            {hasActiveProducts && (
                                                <Button
                                                    onClick={() => handleBulkAction('delete')}
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                >
                                                    Vô hiệu hóa {hasActiveProducts && !hasInactiveProducts ? '' : `(${selectedProducts.filter(p => p.active).length})`}
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => setSelectedRowKeys([])}
                                            >
                                                Bỏ chọn
                                            </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        );
                    })()}

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
                                onChange: setSelectedRowKeys
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
                    <ProductModal
                        key={editingProduct?.id || 'new'}
                        visible={isModalVisible}
                        editingProduct={editingProduct}
                        categories={categories}
                        brands={brands}
                        categoriesLoading={categoriesLoading}
                        brandsLoading={brandsLoading}
                        onClose={() => {
                            setIsModalVisible(false);
                            setEditingProduct(null);
                            setFileList([]);
                        }}
                        onSuccess={async () => {
                            const currentProductId = editingProduct?.id;
                            await refetch();

                            // Re-fetch and update editingProduct if modal is still open
                            if (currentProductId && isModalVisible) {
                                try {
                                    const result = await productService.getProductById(currentProductId);
                                    if (result.success && result.data) {
                                        const freshProduct = result.data;
                                        console.log('Fetched fresh product data:', freshProduct);
                                        // Transform to match Product interface
                                        const variants = freshProduct.productVariants || [];
                                        const prices = variants.map(v => v.price).filter(p => p > 0);
                                        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                                        const priceRange = prices.length === 0
                                            ? 'Chưa có giá'
                                            : minPrice === maxPrice
                                                ? `${minPrice.toLocaleString('vi-VN')}₫`
                                                : `${minPrice.toLocaleString('vi-VN')}₫ - ${maxPrice.toLocaleString('vi-VN')}₫`;

                                        // Tính tổng tồn kho từ tất cả variants
                                        const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

                                        const updatedProduct = {
                                            id: freshProduct.id,
                                            name: freshProduct.name,
                                            minPrice,
                                            maxPrice,
                                            priceRange,
                                            active: freshProduct.active,
                                            description: freshProduct.description,
                                            brandName: freshProduct.brandName,
                                            categoryName: freshProduct.categoryName,
                                            createAt: freshProduct.createAt,
                                            updateAt: freshProduct.updateAt,
                                            productVariants: freshProduct.productVariants as any,
                                            image: freshProduct.images?.[0],
                                            images: freshProduct.images,
                                            stock: totalStock
                                        };
                                        console.log('Setting editingProduct with fresh data:', updatedProduct);

                                        // Force modal re-render by closing and reopening
                                        setIsModalVisible(false);
                                        setTimeout(() => {
                                            setEditingProduct(updatedProduct);
                                            setIsModalVisible(true);
                                        }, 100);
                                    }
                                } catch (error) {
                                    console.error('Error fetching fresh product:', error);
                                }
                            }
                        }}
                    />

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
                                        <PreviewGroup>
                                            {viewingProduct.images && viewingProduct.images.length > 1 ? (
                                                viewingProduct.images.map((img, idx) => (
                                                    <Image
                                                        key={idx}
                                                        width={idx === 0 ? '100%' : 0}
                                                        src={img}
                                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                                        style={{
                                                            borderRadius: '8px',
                                                            display: idx === 0 ? 'block' : 'none'
                                                        }}
                                                        preview={{
                                                            mask: idx === 0 ? <div style={{ color: 'white', fontSize: '12px' }}>Xem {viewingProduct.images?.length} ảnh</div> : false
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <Image
                                                    width="100%"
                                                    src={viewingProduct.image}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                                    style={{ borderRadius: '8px' }}
                                                    preview={false}
                                                />
                                            )}
                                        </PreviewGroup>
                                        {viewingProduct.images && viewingProduct.images.length > 1 && (
                                            <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {viewingProduct.images.length} ảnh (Click để xem tất cả)
                                                </Text>
                                            </div>
                                        )}
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
                                                    {viewingProduct.priceRange}
                                                </Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Số biến thể">
                                                <Badge
                                                    count={viewingProduct.productVariants?.length || 0}
                                                    showZero
                                                    style={{ backgroundColor: '#52c41a' }}
                                                />
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

                                {/* Hiển thị danh sách biến thể */}
                                {viewingProduct.productVariants && viewingProduct.productVariants.length > 0 && (
                                    <>
                                        <Divider />
                                        <div>
                                            <Title level={4}>Danh sách biến thể</Title>
                                            <Table
                                                dataSource={viewingProduct.productVariants}
                                                rowKey="id"
                                                pagination={false}
                                                size="small"
                                                columns={[
                                                    {
                                                        title: 'Màu sắc',
                                                        dataIndex: 'color',
                                                        key: 'color',
                                                        render: (color: string) => (
                                                            <Tag color="blue">{color}</Tag>
                                                        )
                                                    },
                                                    {
                                                        title: 'Kích thước',
                                                        dataIndex: 'size',
                                                        key: 'size',
                                                        render: (size: string) => (
                                                            <Tag color="green">{size}</Tag>
                                                        )
                                                    },
                                                    {
                                                        title: 'Giá',
                                                        dataIndex: 'price',
                                                        key: 'price',
                                                        render: (price: number) => (
                                                            <Text strong style={{ color: '#1890ff' }}>
                                                                {price.toLocaleString('vi-VN')}₫
                                                            </Text>
                                                        )
                                                    },
                                                    {
                                                        title: 'Số lượng',
                                                        dataIndex: 'quantity',
                                                        key: 'quantity',
                                                        render: (quantity: number) => (
                                                            <Text>{quantity}</Text>
                                                        )
                                                    }
                                                ]}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Modal>

                    {/* Variant Management Modal */}
                    <Modal
                        title={`Quản lý biến thể - Product ID: ${currentProductId}`}
                        open={isVariantModalVisible}
                        onCancel={() => setIsVariantModalVisible(false)}
                        footer={[
                            <Button key="add" type="primary" onClick={handleAddVariant}>
                                Thêm biến thể
                            </Button>,
                            <Button key="close" onClick={() => setIsVariantModalVisible(false)}>
                                Đóng
                            </Button>
                        ]}
                        width={900}
                    >
                        {variantsLoading ? (
                            <LoadingSpinner tip="Đang tải danh sách biến thể..." />
                        ) : (
                            <>
                                {editingVariants.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <Text type="secondary">
                                            Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo mới.
                                        </Text>
                                    </div>
                                ) : (
                                    <Table
                                        dataSource={editingVariants}
                                        rowKey="id"
                                        size="small"
                                        pagination={false}
                                        columns={[
                                            {
                                                title: 'Hình ảnh',
                                                dataIndex: 'image',
                                                width: 120,
                                                render: (text, record, index) => {
                                                    // Priority: variantFileLists first, then fallback to text (image URL from DB)
                                                    let currentFileList: UploadFile[] = [];

                                                    if (variantFileLists[record.id]) {
                                                        currentFileList = variantFileLists[record.id];
                                                    } else if (text) {
                                                        currentFileList = [{
                                                            uid: `${record.id}-initial`,
                                                            name: `variant-${record.id}.jpg`,
                                                            status: 'done',
                                                            url: text,
                                                            thumbUrl: text
                                                        }];
                                                    }

                                                    return (
                                                        <Upload
                                                            key={`upload-${record.id}`}
                                                            listType="picture-card"
                                                            fileList={currentFileList}
                                                            maxCount={1}
                                                            beforeUpload={(file) => {
                                                                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                                                                if (!isJpgOrPng) {
                                                                    message.error('Chỉ upload file JPG/PNG!');
                                                                    return Upload.LIST_IGNORE;
                                                                }
                                                                const isLt2M = file.size / 1024 / 1024 < 2;
                                                                if (!isLt2M) {
                                                                    message.error('Ảnh phải nhỏ hơn 2MB!');
                                                                    return Upload.LIST_IGNORE;
                                                                }
                                                                return false;
                                                            }}
                                                            onChange={({ fileList: newFileList }) => {
                                                                const updatedLists = { ...variantFileLists };
                                                                if (newFileList.length > 0) {
                                                                    updatedLists[record.id] = newFileList;
                                                                    const file = newFileList[0];
                                                                    if (file.originFileObj) {
                                                                        const url = URL.createObjectURL(file.originFileObj);
                                                                        handleUpdateVariant(index, 'image', url);
                                                                    } else if (file.url) {
                                                                        handleUpdateVariant(index, 'image', file.url);
                                                                    }
                                                                } else {
                                                                    delete updatedLists[record.id];
                                                                    handleUpdateVariant(index, 'image', '');
                                                                }
                                                                setVariantFileLists(updatedLists);
                                                            }}
                                                            onRemove={() => {
                                                                handleUpdateVariant(index, 'image', '');
                                                            }}
                                                        >
                                                            {currentFileList.length < 1 && <div>
                                                                <PlusOutlined />
                                                                <div style={{ marginTop: 8 }}>Upload</div>
                                                            </div>}
                                                        </Upload>
                                                    );
                                                },
                                            },
                                            {
                                                title: 'Size',
                                                dataIndex: 'size',
                                                render: (text, _, index) => (
                                                    <Input
                                                        value={text}
                                                        onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                                                        placeholder="Size"
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Màu',
                                                dataIndex: 'color',
                                                render: (text, _, index) => (
                                                    <Input
                                                        value={text}
                                                        onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                                                        placeholder="Color"
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Giá',
                                                dataIndex: 'price',
                                                render: (text, _, index) => (
                                                    <InputNumber
                                                        value={text}
                                                        onChange={(value) => handleUpdateVariant(index, 'price', value || 0)}
                                                        placeholder="Price"
                                                        min={0}
                                                        style={{ width: '100%' }}
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Giảm giá',
                                                dataIndex: 'discount',
                                                render: (text, _, index) => (
                                                    <InputNumber
                                                        value={text}
                                                        onChange={(value) => handleUpdateVariant(index, 'discount', value || 0)}
                                                        placeholder="Discount"
                                                        min={0}
                                                        max={100}
                                                        style={{ width: '100%' }}
                                                        suffix="%"
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Số lượng',
                                                dataIndex: 'quantity',
                                                render: (text, _, index) => (
                                                    <InputNumber
                                                        value={text}
                                                        onChange={(value) => handleUpdateVariant(index, 'quantity', value || 0)}
                                                        placeholder="Quantity"
                                                        min={0}
                                                        style={{ width: '100%' }}
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Phụ phí',
                                                dataIndex: 'additionalPrice',
                                                render: (text, _, index) => (
                                                    <InputNumber
                                                        value={text}
                                                        onChange={(value) => handleUpdateVariant(index, 'additionalPrice', value || 0)}
                                                        placeholder="Additional Price"
                                                        min={0}
                                                        style={{ width: '100%' }}
                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    />
                                                ),
                                            },
                                            {
                                                title: 'Trạng thái',
                                                dataIndex: 'active',
                                                width: 120,
                                                render: (active) => (
                                                    <Tag color={active !== false ? 'green' : 'red'}>
                                                        {active !== false ? 'Đang bán' : 'Ngừng bán'}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: 'Thao tác',
                                                width: 200,
                                                render: (_, record) => {
                                                    // Show different actions based on active status
                                                    if (record.active === false) {
                                                        return (
                                                            <Space>
                                                                <Button
                                                                    type="link"
                                                                    icon={<ReloadOutlined />}
                                                                    onClick={() => handleRestoreVariant(record.id)}
                                                                    loading={savingVariantId === record.id}
                                                                >
                                                                    Khôi phục
                                                                </Button>
                                                            </Space>
                                                        );
                                                    }

                                                    return (
                                                        <Space>
                                                            <Button
                                                                type="link"
                                                                onClick={() => handleSaveVariant(record)}
                                                                loading={savingVariantId === record.id}
                                                            >
                                                                Lưu
                                                            </Button>
                                                            <Popconfirm
                                                                title="Bạn có chắc muốn vô hiệu hóa biến thể này?"
                                                                onConfirm={() => handleDeleteVariant(record.id)}
                                                                okText="Vô hiệu hóa"
                                                                cancelText="Hủy"
                                                                icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                                                            >
                                                                <Button type="link" danger>
                                                                    Vô hiệu hóa
                                                                </Button>
                                                            </Popconfirm>
                                                        </Space>
                                                    );
                                                },
                                            },
                                        ]}
                                    />
                                )}
                            </>
                        )}
                    </Modal>

                </>
            )}
        </div>
    );
};

export default Products;