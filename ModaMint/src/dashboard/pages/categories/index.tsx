import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
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
    Image,
    ColorPicker
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FolderOutlined,
    TagsOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style.css';
import '../../components/common-styles.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho Category
interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    parentId: number | null;
    level: number;
    productCount: number;
    status: 'active' | 'inactive';
    color: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// Mock data cho categories
const initialCategories: Category[] = [
    {
        id: 1,
        name: 'Thời trang nam',
        slug: 'thoi-trang-nam',
        description: 'Các sản phẩm thời trang dành cho nam giới',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
        parentId: null,
        level: 0,
        productCount: 125,
        status: 'active',
        color: '#1890ff',
        sortOrder: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01'
    },
    {
        id: 2,
        name: 'Áo sơ mi nam',
        slug: 'ao-so-mi-nam',
        description: 'Áo sơ mi công sở và casual cho nam',
        image: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=200',
        parentId: 1,
        level: 1,
        productCount: 45,
        status: 'active',
        color: '#52c41a',
        sortOrder: 1,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    },
    {
        id: 3,
        name: 'Quần jean nam',
        slug: 'quan-jean-nam',
        description: 'Quần jean thời trang cho nam',
        image: 'https://images.unsplash.com/photo-1542272454315-7e475c0d6e99?w=200',
        parentId: 1,
        level: 1,
        productCount: 38,
        status: 'active',
        color: '#722ed1',
        sortOrder: 2,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    },
    {
        id: 4,
        name: 'Thời trang nữ',
        slug: 'thoi-trang-nu',
        description: 'Các sản phẩm thời trang dành cho nữ giới',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200',
        parentId: null,
        level: 0,
        productCount: 156,
        status: 'active',
        color: '#eb2f96',
        sortOrder: 2,
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01'
    },
    {
        id: 5,
        name: 'Váy nữ',
        slug: 'vay-nu',
        description: 'Váy công sở và dạo phố cho nữ',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200',
        parentId: 4,
        level: 1,
        productCount: 42,
        status: 'active',
        color: '#f759ab',
        sortOrder: 1,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    },
    {
        id: 6,
        name: 'Áo kiểu nữ',
        slug: 'ao-kieu-nu',
        description: 'Áo kiểu thời trang cho nữ',
        image: 'https://images.unsplash.com/photo-1564593165-e0c5e77f9b71?w=200',
        parentId: 4,
        level: 1,
        productCount: 35,
        status: 'active',
        color: '#faad14',
        sortOrder: 2,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    },
    {
        id: 7,
        name: 'Phụ kiện',
        slug: 'phu-kien',
        description: 'Phụ kiện thời trang và trang sức',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200',
        parentId: null,
        level: 0,
        productCount: 89,
        status: 'active',
        color: '#13c2c2',
        sortOrder: 3,
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01'
    },
    {
        id: 8,
        name: 'Túi xách',
        slug: 'tui-xach',
        description: 'Túi xách, balo và ví',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
        parentId: 7,
        level: 1,
        productCount: 28,
        status: 'active',
        color: '#fa8c16',
        sortOrder: 1,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    },
    {
        id: 9,
        name: 'Giày dép',
        slug: 'giay-dep',
        description: 'Giày thể thao, giày cao gót, dép',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
        parentId: null,
        level: 0,
        productCount: 73,
        status: 'active',
        color: '#a0d911',
        sortOrder: 4,
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01'
    },
    {
        id: 10,
        name: 'Trang sức',
        slug: 'trang-suc',
        description: 'Nhẫn, dây chuyền, bông tai',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
        parentId: 7,
        level: 1,
        productCount: 19,
        status: 'inactive',
        color: '#d46b08',
        sortOrder: 2,
        createdAt: '2024-01-16',
        updatedAt: '2024-12-01'
    }
];

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // States cho filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterLevel, setFilterLevel] = useState<string>('all');

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

    // Filtered categories
    const filteredCategories = categories.filter(category => {
        if (filterStatus !== 'all' && category.status !== filterStatus) return false;
        if (filterLevel !== 'all' && category.level.toString() !== filterLevel) return false;
        return true;
    });

    // Statistics
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.status === 'active').length;
    const parentCategories = categories.filter(c => c.level === 0).length;
    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

    // Get parent categories for select options
    const parentCategoryOptions = categories
        .filter(c => c.level === 0)
        .map(c => ({ value: c.id, label: c.name }));

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
                    <Image
                        src={record.image}
                        alt={record.name}
                        width={40}
                        height={40}
                        style={{
                            borderRadius: '6px',
                            objectFit: 'cover',
                            flexShrink: 0
                        }}
                        preview={false}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            fontSize: '14px',
                            paddingLeft: record.level * 20 + 'px'
                        }}>
                            {record.level > 0 && '└── '}
                            {record.name}
                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: record.color,
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginLeft: '8px'
                                }}
                            />
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '2px'
                        }}>
                            <AppstoreOutlined style={{ marginRight: '4px' }} />
                            {record.slug}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#999',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {record.description}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            width: 100,
            align: 'center' as const,
            render: (level: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Tag color={level === 0 ? 'blue' : 'green'}>
                        {level === 0 ? 'Chính' : `Cấp ${level}`}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productCount',
            key: 'productCount',
            width: 100,
            align: 'center' as const,
            sorter: (a: Category, b: Category) => a.productCount - b.productCount,
            render: (count: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
                        {count}
                    </span>
                </div>
            ),
        },
        {
            title: 'Thứ tự',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            width: 100,
            align: 'center' as const,
            sorter: (a: Category, b: Category) => a.sortOrder - b.sortOrder,
            render: (order: number) => (
                <div style={{
                    padding: '8px 0',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '14px' }}>{order}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center' as const,
            render: (status: string, record: Category) => {
                const handleToggleStatus = () => {
                    const newStatus = status === 'active' ? 'inactive' : 'active';
                    setCategories(categories.map(c =>
                        c.id === record.id ? { ...c, status: newStatus } : c
                    ));
                    message.success(`Đã cập nhật trạng thái danh mục`);
                };

                const getText = () => {
                    switch (status) {
                        case 'active': return 'Hoạt động';
                        case 'inactive': return 'Tạm dừng';
                        default: return status;
                    }
                };

                return (
                    <div className="status-button-container">
                        <Button
                            size="small"
                            onClick={handleToggleStatus}
                            className={`status-button ${status}`}
                        >
                            {getText()}
                        </Button>
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
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
                        />
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            title="Chỉnh sửa"
                        />
                        <Popconfirm
                            title="Bạn có chắc muốn xóa danh mục này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                title="Xóa"
                            />
                        </Popconfirm>
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
            ...category,
            color: category.color
        });
        setIsModalVisible(true);
    };

    const handleView = (category: Category) => {
        setViewingCategory(category);
        setIsViewModalVisible(true);
    };

    const handleDelete = (id: number) => {
        // Check if category has subcategories
        const hasSubCategories = categories.some(c => c.parentId === id);
        if (hasSubCategories) {
            message.error('Không thể xóa danh mục có danh mục con!');
            return;
        }

        setCategories(categories.filter(c => c.id !== id));
        message.success('Đã xóa danh mục thành công!');
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const newCategory: Category = {
                id: editingCategory?.id || Date.now(),
                name: values.name,
                slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
                description: values.description || '',
                image: values.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
                parentId: values.parentId || null,
                level: values.parentId ? 1 : 0,
                productCount: editingCategory?.productCount || 0,
                status: values.status || 'active',
                color: values.color || '#1890ff',
                sortOrder: values.sortOrder || 1,
                createdAt: editingCategory?.createdAt || new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };

            if (editingCategory) {
                setCategories(categories.map(c => c.id === editingCategory.id ? newCategory : c));
                message.success('Đã cập nhật danh mục thành công!');
            } else {
                setCategories([...categories, newCategory]);
                message.success('Đã thêm danh mục thành công!');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    // Export Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(categories.map(category => ({
            'ID': category.id,
            'Tên danh mục': category.name,
            'Slug': category.slug,
            'Mô tả': category.description,
            'Cấp độ': category.level,
            'Danh mục cha': category.parentId ? categories.find(c => c.id === category.parentId)?.name || '' : '',
            'Số sản phẩm': category.productCount,
            'Trạng thái': category.status === 'active' ? 'Hoạt động' : 'Tạm dừng',
            'Màu sắc': category.color,
            'Thứ tự': category.sortOrder,
            'Ngày tạo': category.createdAt,
            'Ngày cập nhật': category.updatedAt
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục');
        XLSX.writeFile(workbook, `danh-muc-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Quản lý Danh mục
            </Title>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
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
                            title="Danh mục chính"
                            value={parentCategories}
                            prefix={<AppstoreOutlined />}
                            valueStyle={{ color: '#faad14' }}
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
            <Card style={{ marginBottom: '16px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space wrap>
                            <Input.Search
                                placeholder="Tìm kiếm danh mục..."
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 150 }}
                                value={filterStatus === 'all' ? undefined : filterStatus}
                                onChange={(value) => setFilterStatus(value || 'all')}
                                allowClear
                            >
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Tạm dừng</Option>
                            </Select>
                            <Select
                                placeholder="Cấp độ"
                                style={{ width: 150 }}
                                value={filterLevel === 'all' ? undefined : filterLevel}
                                onChange={(value) => setFilterLevel(value || 'all')}
                                allowClear
                            >
                                <Option value="0">Danh mục chính</Option>
                                <Option value="1">Danh mục con</Option>
                            </Select>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
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
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredCategories}
                    rowKey="id"
                    size="small"
                    className="custom-categories-table"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 50,
                        fixed: true,
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} danh mục`,
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
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Tên danh mục"
                                rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                            >
                                <Input placeholder="Nhập tên danh mục" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="slug"
                                label="Slug"
                            >
                                <Input placeholder="auto-generate từ tên" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="parentId"
                                label="Danh mục cha"
                            >
                                <Select placeholder="Chọn danh mục cha" allowClear>
                                    {parentCategoryOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Mô tả"
                            >
                                <TextArea rows={3} placeholder="Nhập mô tả danh mục" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="color"
                                label="Màu sắc"
                            >
                                <ColorPicker showText />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sortOrder"
                                label="Thứ tự sắp xếp"
                            >
                                <Input type="number" placeholder="1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="image"
                                label="Hình ảnh URL"
                            >
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                initialValue="active"
                            >
                                <Select>
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="inactive">Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
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
                            <Image
                                src={viewingCategory.image}
                                alt={viewingCategory.name}
                                width="100%"
                                style={{ borderRadius: '8px' }}
                            />
                        </Col>
                        <Col span={16}>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Tên danh mục: </Text>
                                <Text>{viewingCategory.name}</Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Slug: </Text>
                                <Text code>{viewingCategory.slug}</Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Cấp độ: </Text>
                                <Tag color={viewingCategory.level === 0 ? 'blue' : 'green'}>
                                    {viewingCategory.level === 0 ? 'Danh mục chính' : `Cấp ${viewingCategory.level}`}
                                </Tag>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Số sản phẩm: </Text>
                                <Text>{viewingCategory.productCount}</Text>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Trạng thái: </Text>
                                <Tag color={viewingCategory.status === 'active' ? 'green' : 'red'}>
                                    {viewingCategory.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                </Tag>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong>Màu sắc: </Text>
                                <div
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: viewingCategory.color,
                                        borderRadius: '4px',
                                        display: 'inline-block',
                                        marginLeft: '8px',
                                        border: '1px solid #d9d9d9'
                                    }}
                                />
                                <Text code style={{ marginLeft: '8px' }}>{viewingCategory.color}</Text>
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ marginTop: '16px' }}>
                                <Text strong>Mô tả: </Text>
                                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                    {viewingCategory.description || 'Chưa có mô tả'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default Categories;