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
    Checkbox,
    Upload
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FolderOutlined,
    TagsOutlined,
    AppstoreOutlined,
    ReloadOutlined,
    RestOutlined,
    ExclamationCircleOutlined,
    RightCircleTwoTone,
    DownCircleTwoTone,
    UploadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';
import { categoryService, type CategoryRequest } from '../../../services/category';
import { useProducts } from '../../../hooks/useProducts';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;
const { Option } = Select;

// Interface cho Category - phù hợp với API backend
interface Category {
    id: number;
    name: string;
    isActive: boolean;
    image?: string;
    createAt?: string;
    updateAt?: string;
    // Thêm các trường để hiển thị (mock data)
    productCount?: number;
    parentId?: number;
    parentName?: string;
}

// Data sẽ được load từ API

const Categories: React.FC = () => {
    // State cho categories từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Thêm state tree
    type CategoryTree = Category & { children?: CategoryTree[]; level?: number };
    const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);

    // State cho modals
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    // States cho bulk actions và filtering  
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const [imageFile, setImageFile] = useState<UploadFile | null>(null);

    // State cho pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Load categories từ API - Logic mới: Load tất cả categories rồi phân trang ở frontend
    const loadCategories = async (page?: number, forceReload: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            // Load tất cả categories từ API (không phân trang ở backend)
            const result = await categoryService.getAllCategories();
            console.log('Load categories result:', result);

            if (result.code === 1000 && result.result) {
                console.log('Categories loaded:', result.result.length, 'items');
                console.log('First category:', result.result[0]);
                setCategories(result.result);

                // Xây dựng cây danh mục từ parentId và điền parentName nếu thiếu
                const idToNode = new Map<number, CategoryTree>();
                result.result.forEach((c) => {
                    idToNode.set(c.id, { ...c, children: [], level: 1 });
                });
                idToNode.forEach((node) => {
                    if (!node.parentName && node.parentId && idToNode.has(node.parentId)) {
                        node.parentName = idToNode.get(node.parentId)!.name;
                    }
                });
                const roots: CategoryTree[] = [];
                idToNode.forEach((node) => {
                    if (node.parentId && idToNode.has(node.parentId)) {
                        const parent = idToNode.get(node.parentId)!;
                        if (!parent.children) parent.children = [];
                        node.level = (parent.level || 1) + 1;
                        parent.children.push(node);
                    } else {
                        node.level = 1;
                        roots.push(node);
                    }
                });
                const sortTree = (nodes: CategoryTree[]) => {
                    nodes.sort((a, b) => a.name.localeCompare(b.name));
                    nodes.forEach(n => n.children && sortTree(n.children));
                };
                sortTree(roots);
                setCategoryTree(roots);

                // Tính toán pagination mới
                const totalCategories = result.result.length;
                const maxPage = Math.ceil(totalCategories / pagination.pageSize);

                // Điều chỉnh trang hiện tại nếu cần
                let currentPage = page !== undefined ? page : pagination.current;
                if (forceReload) {
                    currentPage = 1;
                }
                if (currentPage > maxPage && maxPage > 0) {
                    currentPage = maxPage;
                }

                setPagination(prev => ({
                    ...prev,
                    current: currentPage,
                    total: totalCategories
                }));

            } else {
                setError(result.message || 'Không thể tải danh sách danh mục');
            }
        } catch (err) {
            setError('Lỗi kết nối đến server');
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    // Refresh toàn bộ dữ liệu
    const refreshData = () => {
        loadCategories(1, true);
    };

    // Load categories khi component mount
    useEffect(() => {
        loadCategories();
    }, []); // Chỉ load một lần khi component mount

    // Lấy danh sách sản phẩm thật
    const { products: allProducts } = useProducts();


    // Filtered categories - Logic mới: hiển thị hoặc danh mục hoạt động hoặc danh mục ngừng hoạt động
    const filteredCategories = categories.filter(c => {
        // Nếu showDeleted = true: chỉ hiển thị danh mục ngừng hoạt động (!c.isActive)
        // Nếu showDeleted = false: chỉ hiển thị danh mục hoạt động (c.isActive)
        const activeCheck = showDeleted ? !c.isActive : c.isActive;
        const searchCheck = !searchText || c.name.toLowerCase().includes(searchText.toLowerCase());

        return activeCheck && searchCheck;
    });

    // Xây dựng cây danh mục theo filter để hiển thị
    const buildCategoryTreeWithProductCount = () => {
        // Tạo bản đồ: categoryName => số sản phẩm trực tiếp
        const productMap: Record<string, number> = {};
        allProducts.forEach(p => {
            if (p.categoryName in productMap) {
                productMap[p.categoryName] += 1;
            } else {
                productMap[p.categoryName] = 1;
            }
        });
        // Build cây, đồng thời cộng dồn sản phẩm cấp con lên cha
        const idToNode = new Map<number, CategoryTree & { productCount?: number }>();
        categories.forEach((c) => {
            idToNode.set(c.id, { ...c, children: [], level: 1, productCount: productMap[c.name] || 0 });
        });
        idToNode.forEach((node) => {
            if (!node.parentName && node.parentId && idToNode.has(node.parentId)) {
                node.parentName = idToNode.get(node.parentId)!.name;
            }
        });
        // Xây cấu trúc cây và cộng dồn productCount
        const roots: (CategoryTree & { productCount?: number })[] = [];
        idToNode.forEach((node) => {
            if (node.parentId && idToNode.has(node.parentId)) {
                const parent = idToNode.get(node.parentId)!;
                if (!parent.children) parent.children = [];
                node.level = (parent.level || 1) + 1;
                parent.children.push(node);
            } else {
                node.level = 1;
                roots.push(node);
            }
        });
        // Hàm cộng dồn sp lên parent
        const accumulate = (node: CategoryTree & { productCount?: number }): number => {
            let total = node.productCount || 0;
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    total += accumulate(child);
                }
            }
            node.productCount = total;
            return total;
        };
        roots.forEach(accumulate);
        const sortTree = (nodes: (CategoryTree & { productCount?: number })[]) => {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            nodes.forEach(n => n.children && sortTree(n.children));
        };
        sortTree(roots);
        return roots;
    };
    const filteredTree = buildCategoryTreeWithProductCount();

    // Gán STT dạng phân cấp trực tiếp trên cây để dùng expandable
    type SttCategory = CategoryTree & { sttLabel?: string };
    const assignSttLabels = (nodes: CategoryTree[], prefix: string = ''): SttCategory[] => {
        return nodes.map((node, idx) => {
            const currentIndex = idx + 1;
            const currentStt = prefix ? `${prefix}.${currentIndex}` : `${currentIndex}`;
            const withStt: SttCategory = { ...node, sttLabel: currentStt };
            if (node.children && node.children.length > 0) {
                withStt.children = assignSttLabels(node.children, currentStt);
            }
            return withStt;
        });
    };
    const sttTree: SttCategory[] = assignSttLabels(filteredTree);

    // Statistics từ dữ liệu thực
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const inactiveCategories = categories.filter(c => !c.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

    // Table columns
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            align: 'center' as const,
            render: (_: any, record: any) => record.sttLabel || '',
        },
        {
            title: 'Danh mục cha',
            key: 'parentLevel',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Tag style={{ fontSize: '12px' }}>Cấp {record.level || 1}</Tag>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            key: 'category',
            width: 400,
            render: (record: any) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    minHeight: '60px',
                    marginLeft: `${Math.max(0, (record.level || 1) - 1) * 20}px`
                }}>
                    {record.image ? (
                        <img
                            src={record.image}
                            alt={record.name}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: '1px solid #e6efff',
                                flexShrink: 0
                            }}
                            onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                const iconDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                if (iconDiv) iconDiv.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: '#f3f6ff',
                        border: '1px solid #e6efff',
                        display: record.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AppstoreOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                            {record.name}
                            {record.level && (
                                <Tag color={record.level === 1 ? 'blue' : record.level === 2 ? 'geekblue' : 'purple'} style={{ marginLeft: 8, fontSize: 11 }}>
                                    Cấp {record.level}
                                </Tag>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9aa4b2', marginBottom: 2 }}>
                            <span style={{ marginRight: 12 }}>ID: {record.id}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {record.description || 'Chưa có thông tin'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Quan hệ',
            key: 'relation',
            width: 140,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <div style={{ padding: '8px 0', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag color={record.level && record.level > 1 ? 'geekblue' : 'green'} style={{ fontSize: '12px' }}>
                        {record.level && record.level > 1 ? 'Danh mục con' : 'Danh mục cha'}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
            width: 100,
            align: 'center' as const,
            sorter: (a: Category, b: Category) => (a.productCount || 0) - (b.productCount || 0),
            render: (count: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
                        {count || 0}
                    </span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center' as const,
            render: (isActive: boolean) => (
                <Badge
                    status={isActive ? 'success' : 'default'}
                    text={isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center' as const,
            render: (record: Category) => (
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
                    {record.isActive ? (
                        <Popconfirm
                            title="Bạn có chắc muốn vô hiệu hóa danh mục này?"
                            description="Danh mục sẽ không hiển thị trên website nhưng vẫn có thể khôi phục."
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
                            title="Bạn có chắc muốn xóa vĩnh viễn danh mục này?"
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
                    {!record.isActive && (
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
        setEditingCategory(null);
        form.resetFields();
        setImageFile(null);
        setIsModalVisible(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            isActive: category.isActive,
            parentId: category.parentId
        });

        // Set existing image if available
        if (category.image) {
            setImageFile({
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: category.image,
            });
        } else {
            setImageFile(null);
        }

        setIsModalVisible(true);
    };

    const handleView = (category: Category) => {
        setViewingCategory(category);
        setIsViewModalVisible(true);
    };

    // Soft delete - vô hiệu hóa danh mục
    const handleSoftDelete = async (id: number) => {
        try {
            const result = await categoryService.deleteCategory(id);
            if (result.code === 1000) {
                message.success('Đã vô hiệu hóa danh mục thành công');

                // Cập nhật local state ngay lập tức
                setCategories(prevCategories =>
                    prevCategories.map(category =>
                        category.id === id ? { ...category, isActive: false } : category
                    )
                );

                // Nếu đang ở trang cuối và trang đó trống sau khi xóa, chuyển về trang trước
                const remainingFilteredCategories = filteredCategories.filter(c => c.id !== id);
                const maxPage = Math.ceil(remainingFilteredCategories.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }
            } else {
                message.error(result.message || 'Không thể vô hiệu hóa danh mục');
            }
        } catch (error) {
            message.error('Lỗi khi vô hiệu hóa danh mục');
            console.error('Error soft deleting category:', error);
        }
    };

    // Hard delete - xóa vĩnh viễn danh mục
    const handleHardDelete = async (id: number) => {
        try {
            const result = await categoryService.permanentDeleteCategory(id);
            if (result.code === 1000) {
                message.success('Đã xóa vĩnh viễn danh mục thành công');

                // Xóa danh mục khỏi local state ngay lập tức
                setCategories(prevCategories => prevCategories.filter(category => category.id !== id));

                // Tính toán lại pagination sau khi xóa
                const remainingCategories = categories.filter(c => c.id !== id);
                const remainingFilteredCategories = remainingCategories.filter(c => {
                    const activeCheck = showDeleted ? !c.isActive : c.isActive;
                    const searchCheck = !searchText || c.name.toLowerCase().includes(searchText.toLowerCase());
                    return activeCheck && searchCheck;
                });

                const maxPage = Math.ceil(remainingFilteredCategories.length / pagination.pageSize);

                // Nếu đang ở trang cuối và trang đó trống sau khi xóa, chuyển về trang trước
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage,
                        total: remainingCategories.length
                    }));
                } else {
                    setPagination(prev => ({
                        ...prev,
                        total: remainingCategories.length
                    }));
                }
            } else {
                message.error(result.message || 'Không thể xóa vĩnh viễn danh mục');
            }
        } catch (error) {
            message.error('Lỗi khi xóa vĩnh viễn danh mục');
            console.error('Error hard deleting category:', error);
        }
    };

    // Khôi phục danh mục đã xóa
    const handleRestore = async (id: number) => {
        try {
            const result = await categoryService.restoreCategory(id);
            if (result.code === 1000) {
                message.success('Đã khôi phục danh mục thành công');

                // Cập nhật local state ngay lập tức
                setCategories(prevCategories =>
                    prevCategories.map(category =>
                        category.id === id ? { ...category, isActive: true } : category
                    )
                );

                // Nếu đang xem danh sách danh mục vô hiệu và khôi phục danh mục,
                // danh mục sẽ biến mất khỏi danh sách hiện tại
                if (showDeleted) {
                    const remainingFilteredCategories = filteredCategories.filter(c => c.id !== id);
                    const maxPage = Math.ceil(remainingFilteredCategories.length / pagination.pageSize);
                    if (pagination.current > maxPage && maxPage > 0) {
                        setPagination(prev => ({
                            ...prev,
                            current: maxPage
                        }));
                    }
                }
            } else {
                message.error(result.message || 'Không thể khôi phục danh mục');
            }
        } catch (error) {
            message.error('Lỗi khi khôi phục danh mục');
            console.error('Error restoring category:', error);
        }
    };

    // Helper function to upload image to Cloudinary
    const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Get token from localStorage
            const authDataStr = localStorage.getItem('authData');
            let token = '';
            if (authDataStr) {
                try {
                    const authData = JSON.parse(authDataStr);
                    token = authData?.accessToken || '';
                } catch (error) {
                    console.error('Error parsing authData:', error);
                }
            }

            console.log('Uploading image to Cloudinary...');
            const response = await fetch('http://localhost:8080/api/v1/images/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed with status:', response.status, errorText);
                return null;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Response is not JSON:', text);
                return null;
            }

            const data = await response.json();
            console.log('Upload response:', data);

            if (data.code === 1000 && data.result?.imageUrl) {
                return data.result.imageUrl;
            } else {
                console.error('Upload failed:', data);
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            // Validate required fields
            if (!values.name?.trim()) {
                message.error('Tên danh mục không được để trống');
                setLoading(false);
                return;
            }

            // Upload image if present
            let imageUrl = '';
            if (imageFile && imageFile.originFileObj) {
                const uploadedUrl = await uploadImageToCloudinary(imageFile.originFileObj);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    message.error('Không thể upload ảnh, vui lòng thử lại');
                    setLoading(false);
                    return;
                }
            }

            const categoryData: CategoryRequest = {
                name: values.name.trim(),
                isActive: values.isActive !== undefined ? values.isActive : true,
                parentId: values.parentId ? Number(values.parentId) : undefined,
                image: imageUrl
            };

            let result;
            if (editingCategory) {
                result = await categoryService.updateCategory(editingCategory.id, categoryData);
                if (result.code === 1000) {
                    message.success('Đã cập nhật danh mục thành công');
                } else {
                    message.error(result.message || 'Không thể cập nhật danh mục');
                }
            } else {
                result = await categoryService.createCategory(categoryData);
                if (result.code === 1000) {
                    message.success('Đã thêm danh mục thành công');
                    console.log('Create category response:', result);
                } else {
                    message.error(result.message || 'Không thể thêm danh mục');
                }
            }

            if (result.code === 1000) {
                setIsModalVisible(false);
                form.resetFields();
                setImageFile(null);

                // Reload toàn bộ dữ liệu sau khi thêm/sửa để đảm bảo dữ liệu chính xác
                console.log('Category saved successfully, reloading data...');
                await loadCategories(1, true);
                console.log('Data reloaded');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Error saving category:', error);
        } finally {
            setLoading(false);
        }
    };

    // Export Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(categories.map(category => ({
            'ID': category.id,
            'Tên danh mục': category.name,
            'Số sản phẩm': category.productCount || 0,
            'Trạng thái': category.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
            'Ngày tạo': category.createAt || '',
            'Ngày cập nhật': category.updateAt || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục');
        XLSX.writeFile(workbook, `danh-muc-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                Quản lý Danh mục
            </Title>

            {/* API Error Alert */}
            {error && (
                <Alert
                    message="Lỗi tải dữ liệu từ API"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => loadCategories()}>
                            Thử lại
                        </Button>
                    }
                    style={{ marginBottom: '24px' }}
                />
            )}

            {/* Loading State */}
            {loading && (
                <LoadingSpinner size="large" tip="Đang tải dữ liệu danh mục từ API..." />
            )}

            {/* Content */}
            {!loading && (
                <>

                    {/* Statistics */}
                    <Row gutter={16} style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng danh mục"
                                    value={totalCategories}
                                    prefix={<FolderOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đang hoạt động"
                                    value={activeCategories}
                                    prefix={<TagsOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Ngừng hoạt động"
                                    value={inactiveCategories}
                                    prefix={<AppstoreOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng sản phẩm"
                                    value={totalProducts}
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
                                        placeholder="Tìm kiếm danh mục..."
                                        style={{ width: 300 }}
                                        allowClear
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onSearch={(value) => setSearchText(value)}
                                    />
                                    <div>
                                        <Checkbox
                                            checked={showDeleted}
                                            onChange={(e) => setShowDeleted(e.target.checked)}
                                        >
                                            Hiện danh mục ngừng hoạt động ({inactiveCategories})
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
                                        Thêm danh mục
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<ReloadOutlined />}
                                        onClick={refreshData}
                                        loading={loading}
                                    >
                                        Làm mới danh mục
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
                    {selectedRowKeys.length > 0 && (
                        <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text strong>Đã chọn {selectedRowKeys.length} danh mục</Text>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button onClick={() => setSelectedRowKeys([])}>
                                            Bỏ chọn
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Categories Table */}
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
                    /* Level highlight rows for categories */
                    .custom-categories-table .row-level-1 td { background: #ffffff !important; }
                    .custom-categories-table .row-level-2 td { background: #f8fbff !important; }
                    .custom-categories-table .row-level-3 td { background: #f9f5ff !important; }
                `}</style>
                        <Table
                            columns={columns}
                            dataSource={sttTree}
                            rowKey="id"
                            loading={loading}
                            className="custom-categories-table"
                            rowClassName={(record: any) => {
                                const lvl = record.level || 1;
                                if (lvl >= 3) return 'row-level-3';
                                if (lvl === 2) return 'row-level-2';
                                return 'row-level-1';
                            }}
                            expandable={{
                                childrenColumnName: 'children',
                                expandIconColumnIndex: 2,
                                indentSize: 0,
                                expandIcon: ({ expanded, onExpand, record }: any) => {
                                    const hasChildren = record.children && record.children.length > 0;
                                    if (!hasChildren) {
                                        return <span style={{ display: 'inline-block', width: 24 }} />;
                                    }
                                    return (
                                        <Button
                                            type="text"
                                            onClick={(e) => onExpand(record, e)}
                                            style={{ padding: 0, width: 24, height: 24 }}
                                            icon={expanded ? (
                                                <DownCircleTwoTone twoToneColor="#1677ff" style={{ fontSize: 18 }} />
                                            ) : (
                                                <RightCircleTwoTone twoToneColor="#1677ff" style={{ fontSize: 18 }} />
                                            )}
                                        />
                                    );
                                }
                            }}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                                getCheckboxProps: (record: Category) => ({
                                    disabled: !record.isActive
                                })
                            }}
                            pagination={false}
                            scroll={{ x: 1000 }}
                        />
                    </Card>

                    {/* Add/Edit Modal */}
                    <Modal
                        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        open={isModalVisible}
                        onOk={() => form.submit()}
                        onCancel={() => {
                            setIsModalVisible(false);
                            setImageFile(null);
                        }}
                        confirmLoading={loading}
                        width={600}
                        okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
                        cancelText="Hủy"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                        >
                            <Form.Item
                                name="name"
                                label="Tên danh mục"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên danh mục' },
                                    { min: 1, message: 'Tên danh mục không được để trống' }
                                ]}
                            >
                                <Input placeholder="Nhập tên danh mục" />
                            </Form.Item>

                            <Form.Item
                                name="parentId"
                                label="Danh mục cha"
                                tooltip="Không chọn nếu là danh mục cấp 1"
                            >
                                <Input.Group compact>
                                    <select
                                        style={{ width: '100%', height: 32, borderRadius: 6, border: '1px solid #d9d9d9', padding: '4px 8px' }}
                                        value={form.getFieldValue('parentId') ?? ''}
                                        onChange={(e) => form.setFieldsValue({ parentId: e.target.value ? Number(e.target.value) : undefined })}
                                    >
                                        <option value="">Không có (cấp 1)</option>
                                        {categories
                                            .filter(c => !editingCategory || c.id !== editingCategory.id)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                    </select>
                                </Input.Group>
                            </Form.Item>

                            <Form.Item
                                label="Ảnh danh mục"
                            >
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    fileList={imageFile ? [imageFile] : []}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Chỉ được upload file ảnh!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        const isLt10M = file.size / 1024 / 1024 < 10;
                                        if (!isLt10M) {
                                            message.error('Ảnh phải nhỏ hơn 10MB!');
                                            return Upload.LIST_IGNORE;
                                        }
                                        setImageFile({
                                            uid: file.uid,
                                            name: file.name,
                                            status: 'done',
                                            originFileObj: file as any,
                                        });
                                        return false;
                                    }}
                                    onRemove={() => {
                                        setImageFile(null);
                                    }}
                                >
                                    {!imageFile && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="isActive"
                                label="Trạng thái"
                                initialValue={true}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Ngừng hoạt động</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* View Modal */}
                    <Modal
                        title="Chi tiết danh mục"
                        open={isViewModalVisible}
                        onCancel={() => setIsViewModalVisible(false)}
                        footer={[
                            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                                Đóng
                            </Button>
                        ]}
                        width={600}
                    >
                        {viewingCategory && (
                            <Row gutter={16}>
                                <Col span={8}>
                                    <div style={{
                                        width: '100%',
                                        height: '120px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FolderOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Tên danh mục: </Text>
                                        <Text>{viewingCategory.name}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>ID: </Text>
                                        <Text code>{viewingCategory.id}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Số sản phẩm: </Text>
                                        <Text>{viewingCategory.productCount || 0}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Trạng thái: </Text>
                                        <Tag color={viewingCategory.isActive ? 'green' : 'red'}>
                                            {viewingCategory.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                        </Tag>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Ngày tạo: </Text>
                                        <Text>{viewingCategory.createAt ? new Date(viewingCategory.createAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Cập nhật lần cuối: </Text>
                                        <Text>{viewingCategory.updateAt ? new Date(viewingCategory.updateAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</Text>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Modal>

                </>
            )}
        </div>
    );
};

export default Categories;