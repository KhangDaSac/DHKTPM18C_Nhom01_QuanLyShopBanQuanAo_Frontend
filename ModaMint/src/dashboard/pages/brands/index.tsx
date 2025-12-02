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
    Checkbox
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    TagsOutlined,
    AppstoreOutlined,
    ReloadOutlined,
    RestOutlined,
    ExclamationCircleOutlined,
    CrownOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../categories/style.css';
import '../../components/common-styles.css';
import { brandService, type BrandRequest } from '../../../services/brand';
import { useProducts } from '../../../hooks/useProducts';

const { Title, Text } = Typography;
const { Option } = Select;

interface Brand {
    id: number;
    name: string;
    isActive: boolean;
    createAt?: string;
    updateAt?: string;
    productCount?: number;
}

const Brands: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
    const [form] = Form.useForm();

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [searchText, setSearchText] = useState<string>('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const loadBrands = async (page?: number, forceReload: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await brandService.getAllBrands();

            if (result.code === 1000 && result.result) {
                // Normalize isActive to boolean (in case API returns 0/1)
                const normalizedBrands = result.result.map(brand => ({
                    ...brand,
                    isActive: Boolean(brand.isActive)
                }));
                setBrands(normalizedBrands);

                const totalBrands = normalizedBrands.length;
                const maxPage = Math.ceil(totalBrands / pagination.pageSize); let currentPage = page !== undefined ? page : pagination.current;
                if (forceReload) {
                    currentPage = 1;
                }
                if (currentPage > maxPage && maxPage > 0) {
                    currentPage = maxPage;
                }

                setPagination(prev => ({
                    ...prev,
                    current: currentPage,
                    total: totalBrands
                }));

            } else {
                setError(result.message || 'Không thể tải danh sách thương hiệu');
            }
        } catch (err) {
            setError('Lỗi kết nối đến server');
            console.error('Error loading brands:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        loadBrands(1, true);
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const { products: allProducts } = useProducts();

    // Tính số sản phẩm cho mỗi brand
    const brandsWithProductCount = brands.map(brand => {
        const productCount = allProducts.filter(p => p.brandName === brand.name).length;
        return { ...brand, productCount };
    });

    const filteredBrands = brandsWithProductCount.filter(b => {
        const activeCheck = showDeleted ? !b.isActive : b.isActive;
        const searchCheck = !searchText || b.name.toLowerCase().includes(searchText.toLowerCase());
        return activeCheck && searchCheck;
    });

    const totalBrands = brands.length;
    const activeBrands = brands.filter(b => b.isActive).length;
    const inactiveBrands = brands.filter(b => !b.isActive).length;
    const totalProducts = brandsWithProductCount.reduce((sum, b) => sum + (b.productCount || 0), 0);

    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const currentPageBrands = filteredBrands.slice(startIndex, endIndex);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => startIndex + index + 1,
        },
        {
            title: 'Thương hiệu',
            key: 'brand',
            width: 400,
            render: (record: Brand) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    minHeight: '60px'
                }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CrownOutlined style={{ fontSize: 20, color: '#f97316' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                            {record.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9aa4b2', marginBottom: 2 }}>
                            <span style={{ marginRight: 12 }}>ID: {record.id}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
            width: 120,
            align: 'center' as const,
            sorter: (a: Brand, b: Brand) => (a.productCount || 0) - (b.productCount || 0),
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
            width: 130,
            align: 'center' as const,
            render: (isActive: boolean) => (
                <Badge
                    status={isActive ? 'success' : 'default'}
                    text={isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                />
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createAt',
            key: 'createAt',
            width: 130,
            align: 'center' as const,
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center' as const,
            render: (record: Brand) => (
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
                            title="Bạn có chắc muốn vô hiệu hóa thương hiệu này?"
                            description="Thương hiệu sẽ không hiển thị trên website nhưng vẫn có thể khôi phục."
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
        setEditingBrand(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        form.setFieldsValue({
            name: brand.name,
            isActive: brand.isActive
        });
        setIsModalVisible(true);
    };

    const handleView = (brand: Brand) => {
        setViewingBrand(brand);
        setIsViewModalVisible(true);
    };

    const handleSoftDelete = async (id: number) => {
        try {
            const result = await brandService.deleteBrand(id);
            if (result.code === 1000) {
                message.success('Đã vô hiệu hóa thương hiệu thành công');

                setBrands(prevBrands =>
                    prevBrands.map(brand =>
                        brand.id === id ? { ...brand, isActive: false } : brand
                    )
                );

                const remainingFilteredBrands = filteredBrands.filter(b => b.id !== id);
                const maxPage = Math.ceil(remainingFilteredBrands.length / pagination.pageSize);
                if (pagination.current > maxPage && maxPage > 0) {
                    setPagination(prev => ({
                        ...prev,
                        current: maxPage
                    }));
                }
            } else {
                message.error(result.message || 'Không thể vô hiệu hóa thương hiệu');
            }
        } catch (error) {
            message.error('Lỗi khi vô hiệu hóa thương hiệu');
            console.error('Error soft deleting brand:', error);
        }
    };

    const handleRestore = async (id: number) => {
        try {
            const result = await brandService.restoreBrand(id);
            if (result.code === 1000) {
                message.success('Đã khôi phục thương hiệu thành công');

                setBrands(prevBrands =>
                    prevBrands.map(brand =>
                        brand.id === id ? { ...brand, isActive: true } : brand
                    )
                );

                if (showDeleted) {
                    const remainingFilteredBrands = filteredBrands.filter(b => b.id !== id);
                    const maxPage = Math.ceil(remainingFilteredBrands.length / pagination.pageSize);
                    if (pagination.current > maxPage && maxPage > 0) {
                        setPagination(prev => ({
                            ...prev,
                            current: maxPage
                        }));
                    }
                }
            } else {
                message.error(result.message || 'Không thể khôi phục thương hiệu');
            }
        } catch (error) {
            message.error('Lỗi khi khôi phục thương hiệu');
            console.error('Error restoring brand:', error);
        }
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            if (!values.name?.trim()) {
                message.error('Tên thương hiệu không được để trống');
                setLoading(false);
                return;
            }

            const brandData: BrandRequest = {
                name: values.name.trim(),
                isActive: values.isActive !== undefined ? values.isActive : true
            };

            let result;
            if (editingBrand) {
                result = await brandService.updateBrand(editingBrand.id, brandData);
                if (result.code === 1000) {
                    message.success('Đã cập nhật thương hiệu thành công');
                } else {
                    message.error(result.message || 'Không thể cập nhật thương hiệu');
                }
            } else {
                result = await brandService.createBrand(brandData);
                if (result.code === 1000) {
                    message.success('Đã thêm thương hiệu thành công');
                } else {
                    message.error(result.message || 'Không thể thêm thương hiệu');
                }
            }

            if (result.code === 1000) {
                setIsModalVisible(false);
                form.resetFields();
                loadBrands(1, true);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
            console.error('Error saving brand:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(brandsWithProductCount.map(brand => ({
            'ID': brand.id,
            'Tên thương hiệu': brand.name,
            'Số sản phẩm': brand.productCount || 0,
            'Trạng thái': brand.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
            'Ngày tạo': brand.createAt || '',
            'Ngày cập nhật': brand.updateAt || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Thương hiệu');
        XLSX.writeFile(workbook, `thuong-hieu-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                Quản lý Thương hiệu
            </Title>

            {error && (
                <Alert
                    message="Lỗi tải dữ liệu từ API"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => loadBrands()}>
                            Thử lại
                        </Button>
                    }
                    style={{ marginBottom: '24px' }}
                />
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Đang tải dữ liệu thương hiệu từ API...</p>
                </div>
            )}

            {!loading && (
                <>
                    <Row gutter={16} style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng thương hiệu"
                                    value={totalBrands}
                                    prefix={<CrownOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Đang hoạt động"
                                    value={activeBrands}
                                    prefix={<TagsOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Ngừng hoạt động"
                                    value={inactiveBrands}
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

                    <Card style={{ marginBottom: '16px', marginTop: 0 }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Space wrap>
                                    <Input.Search
                                        placeholder="Tìm kiếm thương hiệu..."
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
                                            Hiện thương hiệu ngừng hoạt động ({inactiveBrands})
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
                                        Thêm thương hiệu
                                    </Button>
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
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {selectedRowKeys.length > 0 && (
                        <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text strong>Đã chọn {selectedRowKeys.length} thương hiệu</Text>
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

                    <Card style={{ marginTop: 0 }}>
                        <Table
                            columns={columns}
                            dataSource={currentPageBrands}
                            rowKey="id"
                            loading={loading}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                                getCheckboxProps: (record: Brand) => ({
                                    disabled: !record.isActive
                                })
                            }}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: filteredBrands.length,
                                onChange: (page, pageSize) => {
                                    setPagination({ current: page, pageSize, total: filteredBrands.length });
                                },
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} thương hiệu`,
                            }}
                            scroll={{ x: 1000 }}
                        />
                    </Card>

                    <Modal
                        title={editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
                        open={isModalVisible}
                        onOk={() => form.submit()}
                        onCancel={() => setIsModalVisible(false)}
                        confirmLoading={loading}
                        width={600}
                        okText={editingBrand ? 'Cập nhật' : 'Thêm mới'}
                        cancelText="Hủy"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                        >
                            <Form.Item
                                name="name"
                                label="Tên thương hiệu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên thương hiệu' },
                                    { min: 1, message: 'Tên thương hiệu không được để trống' }
                                ]}
                            >
                                <Input placeholder="Nhập tên thương hiệu" />
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

                    <Modal
                        title="Chi tiết thương hiệu"
                        open={isViewModalVisible}
                        onCancel={() => setIsViewModalVisible(false)}
                        footer={[
                            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                                Đóng
                            </Button>
                        ]}
                        width={600}
                    >
                        {viewingBrand && (
                            <Row gutter={16}>
                                <Col span={8}>
                                    <div style={{
                                        width: '100%',
                                        height: '120px',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff7ed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CrownOutlined style={{ fontSize: '48px', color: '#f97316' }} />
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Tên thương hiệu: </Text>
                                        <Text>{viewingBrand.name}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>ID: </Text>
                                        <Text code>{viewingBrand.id}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Số sản phẩm: </Text>
                                        <Text>{viewingBrand.productCount || 0}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Trạng thái: </Text>
                                        <Tag color={viewingBrand.isActive ? 'green' : 'red'}>
                                            {viewingBrand.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                        </Tag>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Ngày tạo: </Text>
                                        <Text>{viewingBrand.createAt ? new Date(viewingBrand.createAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</Text>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong>Cập nhật lần cuối: </Text>
                                        <Text>{viewingBrand.updateAt ? new Date(viewingBrand.updateAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</Text>
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

export default Brands;
