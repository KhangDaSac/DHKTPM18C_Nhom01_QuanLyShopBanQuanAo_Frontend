import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Popconfirm,
    Spin,
    Alert,
    Checkbox
} from 'antd';
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
    ExclamationCircleOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';
import { categoryService, type CategoryRequest } from '../../../services/category';

const { Title, Text } = Typography;

// Interface cho Category - phù hợp với API backend
interface Category {
    id: number;
    name: string;
    isActive: boolean;
    createAt?: string;
    updateAt?: string;
    // Thêm các trường để hiển thị (mock data)
    productCount?: number;
}

// Data sẽ được load từ API

const Categories: React.FC = () => {
    // State cho categories từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
            
            if (result.code === 1000 && result.result) {
                const allCategoriesWithMockData = result.result.map((category: Category) => ({
                    ...category,
                    productCount: Math.floor(Math.random() * 100) + 1 // Mock product count
                }));
                
                setCategories(allCategoriesWithMockData);
                
                // Tính toán pagination mới
                const totalCategories = allCategoriesWithMockData.length;
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
                
                console.log(`Loaded ${totalCategories} categories, page ${currentPage}/${maxPage}`);
                console.log('All categories from API:', result.result);
                console.log('Active categories:', allCategoriesWithMockData.filter(c => c.isActive).length);
                console.log('Inactive categories:', allCategoriesWithMockData.filter(c => !c.isActive).length);
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

    // Inject CSS để fix table spacing
    useEffect(() => {
        const styleId = 'custom-categories-table-fix';
        let existingStyle = document.getElementById(styleId);

        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .custom-categories-table .ant-table-thead {
                position: sticky !important;
                top: 0 !important;
                z-index: 2 !important;
            }
            
            .custom-categories-table .ant-table-tbody {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
            
            .custom-categories-table .ant-table-thead > tr > th {
                vertical-align: middle !important;
                text-align: center !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                background-color: #fafafa !important;
                height: 40px !important;
                margin: 0 !important;
                border-top: none !important;
            }
            
            .custom-categories-table .ant-table-tbody > tr > td {
                vertical-align: middle !important;
                padding: 8px 16px !important;
                height: 60px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                margin: 0 !important;
                border-top: none !important;
            }
            
            .custom-categories-table .ant-table-container {
                border: none !important;
            }
            
            .custom-categories-table .ant-table {
                border-collapse: collapse !important;
                border-spacing: 0 !important;
            }
            
            .custom-categories-table .ant-table-thead > tr > th.ant-table-selection-column {
                padding: 8px !important;
                width: 50px !important;
                text-align: center !important;
                background-color: #fafafa !important;
            }
            
            .custom-categories-table .ant-table-tbody > tr > td.ant-table-selection-column {
                padding: 8px !important;
                width: 50px !important;
                text-align: center !important;
            }
        `;

        document.head.appendChild(style);

        return () => {
            const styleToRemove = document.getElementById(styleId);
            if (styleToRemove) {
                styleToRemove.remove();
            }
        };
    }, []);

    // Filtered categories - Logic mới: hiển thị hoặc danh mục hoạt động hoặc danh mục ngừng hoạt động
    const filteredCategories = categories.filter(c => {
        // Nếu showDeleted = true: chỉ hiển thị danh mục ngừng hoạt động (!c.isActive)
        // Nếu showDeleted = false: chỉ hiển thị danh mục hoạt động (c.isActive)
        const activeCheck = showDeleted ? !c.isActive : c.isActive;
        const searchCheck = !searchText || c.name.toLowerCase().includes(searchText.toLowerCase());
        
        return activeCheck && searchCheck;
    });

    // Logic phân trang mới: Tính toán categories hiển thị trên trang hiện tại
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageCategories = filteredCategories.slice(startIndex, endIndex);
    
    // Cập nhật total cho pagination dựa trên filtered categories
    const filteredTotal = filteredCategories.length;

    // Statistics từ dữ liệu thực
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const inactiveCategories = categories.filter(c => !c.isActive).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

    // Table columns
    const columns = [
        {
            title: 'Danh mục',
            key: 'category',
            width: 300,
            render: (record: Category) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    minHeight: '60px'
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '6px',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FolderOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            fontSize: '14px'
                        }}>
                            {record.name}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '2px'
                        }}>
                            <AppstoreOutlined style={{ marginRight: '4px' }} />
                            ID: {record.id}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#999'
                        }}>
                            {record.createAt ? `Tạo: ${new Date(record.createAt).toLocaleDateString('vi-VN')}` : 'Chưa có thông tin'}
                        </div>
                    </div>
                </div>
            ),
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
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Tag color={isActive ? 'green' : 'red'} style={{ fontSize: '12px' }}>
                        {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center' as const,
            render: (record: Category) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            isActive: category.isActive
        });
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

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            // Validate required fields
            if (!values.name?.trim()) {
                message.error('Tên danh mục không được để trống');
                setLoading(false);
                return;
            }

            const categoryData: CategoryRequest = {
                name: values.name.trim(),
                isActive: values.isActive !== undefined ? values.isActive : true
            };

            console.log('Sending category data:', categoryData);

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
                } else {
                    message.error(result.message || 'Không thể thêm danh mục');
                }
            }

            if (result.code === 1000) {
                setIsModalVisible(false);
                form.resetFields();
                
                // Reload toàn bộ dữ liệu sau khi thêm/sửa để đảm bảo dữ liệu chính xác
                loadCategories(1, true);
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
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Đang tải dữ liệu danh mục từ API...</p>
                </div>
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
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={refreshData}
                                loading={loading}
                            >
                                Làm mới
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
                                Thêm danh mục
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
                <Table
                    columns={columns}
                    dataSource={currentPageCategories}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        getCheckboxProps: (record: Category) => ({
                            disabled: !record.isActive
                        })
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} danh mục`,
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
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
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
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Checkbox>Hoạt động</Checkbox>
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