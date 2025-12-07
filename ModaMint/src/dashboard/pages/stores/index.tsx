import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Input,
    Select,
    Space,
    Modal,
    Form,
    message,
    Typography,
    Tag,
    Rate,
    Switch,
    Divider,
    Tooltip,
    Drawer,
    TimePicker,
    InputNumber,
    Upload,
    Progress,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ExportOutlined,
    ShopOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    StarOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ToolOutlined,
    DollarOutlined,
    TeamOutlined,
    TrophyOutlined,
    RiseOutlined,
    FallOutlined,
    UploadOutlined,
    GlobalOutlined,
    MailOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import LoadingSpinner from '../../components/LoadingSpinner';
import dayjs from 'dayjs';
import './style.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Store {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    manager: string;
    status: 'active' | 'inactive' | 'maintenance';
    rating: number;
    totalRevenue: number;
    monthlyRevenue: number;
    employeeCount: number;
    customerCount: number;
    openingDate: string;
    workingHours: {
        [key: string]: { open: string; close: string; isOpen: boolean };
    };
    coordinates: { lat: number; lng: number };
    image?: string;
    description?: string;
    facilities: string[];
    performance: {
        salesGrowth: number;
        customerSatisfaction: number;
        employeeProductivity: number;
        inventoryTurnover: number;
    };
}

interface StoreStats {
    totalStores: number;
    activeStores: number;
    totalRevenue: number;
    averageRating: number;
}

const StoresPage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [viewingStore, setViewingStore] = useState<Store | null>(null);
    const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
    const [form] = Form.useForm();
    const [stats, setStats] = useState<StoreStats>({
        totalStores: 0,
        activeStores: 0,
        totalRevenue: 0,
        averageRating: 0
    });

    // Sample data
    useEffect(() => {
        const sampleStores: Store[] = [
            {
                id: '1',
                name: 'ModaMint Central',
                address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
                phone: '028-1234-5678',
                email: 'central@modamint.com',
                manager: 'Nguyễn Văn A',
                status: 'active',
                rating: 4.8,
                totalRevenue: 1250000000,
                monthlyRevenue: 125000000,
                employeeCount: 25,
                customerCount: 1500,
                openingDate: '2020-01-15',
                coordinates: { lat: 10.7769, lng: 106.7009 },
                facilities: ['Parking', 'WiFi', 'Air Conditioning', 'Security'],
                description: 'Cửa hàng trung tâm với không gian rộng rãi và đầy đủ tiện nghi',
                workingHours: {
                    'Mon': { open: '08:00', close: '22:00', isOpen: true },
                    'Tue': { open: '08:00', close: '22:00', isOpen: true },
                    'Wed': { open: '08:00', close: '22:00', isOpen: true },
                    'Thu': { open: '08:00', close: '22:00', isOpen: true },
                    'Fri': { open: '08:00', close: '22:00', isOpen: true },
                    'Sat': { open: '08:00', close: '23:00', isOpen: true },
                    'Sun': { open: '09:00', close: '23:00', isOpen: true }
                },
                performance: {
                    salesGrowth: 12.5,
                    customerSatisfaction: 4.8,
                    employeeProductivity: 85,
                    inventoryTurnover: 6.2
                }
            },
            {
                id: '2',
                name: 'ModaMint Thủ Đức',
                address: '456 Võ Văn Ngân, Thủ Đức, TP.HCM',
                phone: '028-9876-5432',
                email: 'thuduc@modamint.com',
                manager: 'Trần Thị B',
                status: 'active',
                rating: 4.6,
                totalRevenue: 980000000,
                monthlyRevenue: 98000000,
                employeeCount: 18,
                customerCount: 1200,
                openingDate: '2021-03-20',
                coordinates: { lat: 10.8700, lng: 106.8030 },
                facilities: ['WiFi', 'Air Conditioning', 'Fitting Room'],
                description: 'Chi nhánh hiện đại phục vụ khu vực Thủ Đức',
                workingHours: {
                    'Mon': { open: '08:30', close: '21:30', isOpen: true },
                    'Tue': { open: '08:30', close: '21:30', isOpen: true },
                    'Wed': { open: '08:30', close: '21:30', isOpen: true },
                    'Thu': { open: '08:30', close: '21:30', isOpen: true },
                    'Fri': { open: '08:30', close: '21:30', isOpen: true },
                    'Sat': { open: '08:30', close: '22:00', isOpen: true },
                    'Sun': { open: '09:00', close: '22:00', isOpen: true }
                },
                performance: {
                    salesGrowth: 8.3,
                    customerSatisfaction: 4.6,
                    employeeProductivity: 78,
                    inventoryTurnover: 5.8
                }
            },
            {
                id: '3',
                name: 'ModaMint Gò Vấp',
                address: '789 Phan Văn Trị, Gò Vấp, TP.HCM',
                phone: '028-5555-7777',
                email: 'govap@modamint.com',
                manager: 'Lê Văn C',
                status: 'maintenance',
                rating: 4.4,
                totalRevenue: 750000000,
                monthlyRevenue: 0,
                employeeCount: 15,
                customerCount: 800,
                openingDate: '2022-06-10',
                coordinates: { lat: 10.8376, lng: 106.6765 },
                facilities: ['WiFi', 'Air Conditioning'],
                description: 'Đang bảo trì và nâng cấp cơ sở vật chất',
                workingHours: {
                    'Mon': { open: '09:00', close: '21:00', isOpen: false },
                    'Tue': { open: '09:00', close: '21:00', isOpen: false },
                    'Wed': { open: '09:00', close: '21:00', isOpen: false },
                    'Thu': { open: '09:00', close: '21:00', isOpen: false },
                    'Fri': { open: '09:00', close: '21:00', isOpen: false },
                    'Sat': { open: '09:00', close: '21:00', isOpen: false },
                    'Sun': { open: '09:00', close: '21:00', isOpen: false }
                },
                performance: {
                    salesGrowth: -5.2,
                    customerSatisfaction: 4.4,
                    employeeProductivity: 65,
                    inventoryTurnover: 4.1
                }
            },
            {
                id: '4',
                name: 'ModaMint Bình Thạnh',
                address: '321 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
                phone: '028-3333-9999',
                email: 'binhthanh@modamint.com',
                manager: 'Phạm Thị D',
                status: 'active',
                rating: 4.7,
                totalRevenue: 1100000000,
                monthlyRevenue: 110000000,
                employeeCount: 22,
                customerCount: 1350,
                openingDate: '2021-09-15',
                coordinates: { lat: 10.8017, lng: 106.7101 },
                facilities: ['Parking', 'WiFi', 'Air Conditioning', 'Café Corner'],
                description: 'Cửa hàng với không gian café độc đáo',
                workingHours: {
                    'Mon': { open: '08:00', close: '22:00', isOpen: true },
                    'Tue': { open: '08:00', close: '22:00', isOpen: true },
                    'Wed': { open: '08:00', close: '22:00', isOpen: true },
                    'Thu': { open: '08:00', close: '22:00', isOpen: true },
                    'Fri': { open: '08:00', close: '22:00', isOpen: true },
                    'Sat': { open: '08:00', close: '23:00', isOpen: true },
                    'Sun': { open: '09:00', close: '22:00', isOpen: true }
                },
                performance: {
                    salesGrowth: 15.7,
                    customerSatisfaction: 4.7,
                    employeeProductivity: 88,
                    inventoryTurnover: 6.8
                }
            }
        ];

        setStores(sampleStores);
        setFilteredStores(sampleStores);
        calculateStats(sampleStores);
    }, []);

    const calculateStats = (storeData: Store[]) => {
        const totalStores = storeData.length;
        const activeStores = storeData.filter(store => store.status === 'active').length;
        const totalRevenue = storeData.reduce((sum, store) => sum + store.totalRevenue, 0);
        const averageRating = storeData.reduce((sum, store) => sum + store.rating, 0) / totalStores;

        setStats({
            totalStores,
            activeStores,
            totalRevenue,
            averageRating: Number(averageRating.toFixed(1))
        });
    };

    // Filter and search functionality
    useEffect(() => {
        let filtered = stores;

        if (searchText) {
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(searchText.toLowerCase()) ||
                store.address.toLowerCase().includes(searchText.toLowerCase()) ||
                store.manager.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(store => store.status === statusFilter);
        }

        setFilteredStores(filtered);
    }, [searchText, statusFilter, stores]);

    const handleAddStore = () => {
        setEditingStore(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditStore = (store: Store) => {
        setEditingStore(store);
        form.setFieldsValue({
            ...store,
            openingDate: store.openingDate ? dayjs(store.openingDate) : null,
            workingHours: Object.keys(store.workingHours).map(day => ({
                day,
                open: store.workingHours[day].open ? dayjs(store.workingHours[day].open, 'HH:mm') : null,
                close: store.workingHours[day].close ? dayjs(store.workingHours[day].close, 'HH:mm') : null,
                isOpen: store.workingHours[day].isOpen
            }))
        });
        setIsModalVisible(true);
    };

    const handleViewStore = (store: Store) => {
        setViewingStore(store);
        setIsViewDrawerVisible(true);
    };

    const handleDeleteStore = (storeId: string) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa cửa hàng này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                const updatedStores = stores.filter(store => store.id !== storeId);
                setStores(updatedStores);
                calculateStats(updatedStores);
                message.success('Đã xóa cửa hàng thành công');
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const storeData: Store = {
                id: editingStore?.id || Date.now().toString(),
                name: values.name,
                address: values.address,
                phone: values.phone,
                email: values.email,
                manager: values.manager,
                status: values.status,
                rating: values.rating || 0,
                totalRevenue: values.totalRevenue || 0,
                monthlyRevenue: values.monthlyRevenue || 0,
                employeeCount: values.employeeCount || 0,
                customerCount: values.customerCount || 0,
                openingDate: values.openingDate?.format('YYYY-MM-DD') || '',
                coordinates: {
                    lat: values.latitude || 0,
                    lng: values.longitude || 0
                },
                facilities: values.facilities || [],
                description: values.description || '',
                workingHours: values.workingHours?.reduce((acc: any, item: any) => {
                    acc[item.day] = {
                        open: item.open?.format('HH:mm') || '',
                        close: item.close?.format('HH:mm') || '',
                        isOpen: item.isOpen || false
                    };
                    return acc;
                }, {}) || {},
                performance: values.performance || {
                    salesGrowth: 0,
                    customerSatisfaction: 0,
                    employeeProductivity: 0,
                    inventoryTurnover: 0
                }
            };

            let updatedStores;
            if (editingStore) {
                updatedStores = stores.map(store =>
                    store.id === editingStore.id ? storeData : store
                );
                message.success('Đã cập nhật cửa hàng thành công');
            } else {
                updatedStores = [...stores, storeData];
                message.success('Đã thêm cửa hàng thành công');
            }

            setStores(updatedStores);
            calculateStats(updatedStores);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const exportData = stores.map(store => ({
            'ID': store.id,
            'Tên cửa hàng': store.name,
            'Địa chỉ': store.address,
            'Số điện thoại': store.phone,
            'Email': store.email,
            'Quản lý': store.manager,
            'Trạng thái': store.status === 'active' ? 'Hoạt động' :
                store.status === 'inactive' ? 'Không hoạt động' : 'Bảo trì',
            'Đánh giá': store.rating,
            'Doanh thu tổng': store.totalRevenue.toLocaleString('vi-VN'),
            'Doanh thu tháng': store.monthlyRevenue.toLocaleString('vi-VN'),
            'Số nhân viên': store.employeeCount,
            'Số khách hàng': store.customerCount,
            'Ngày mở': store.openingDate,
            'Mô tả': store.description,
            'Tiện ích': store.facilities.join(', '),
            'Tăng trưởng (%)': store.performance.salesGrowth,
            'Hài lòng KH': store.performance.customerSatisfaction,
            'Năng suất NV (%)': store.performance.employeeProductivity,
            'Vòng quay kho': store.performance.inventoryTurnover
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stores');
        XLSX.writeFile(wb, `ModaMint_Stores_${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất dữ liệu ra Excel thành công');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'error';
            case 'maintenance': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Không hoạt động';
            case 'maintenance': return 'Bảo trì';
            default: return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const renderStoreCard = (store: Store) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={store.id}>
            <Card
                className={`store-card ${store.status === 'inactive' ? 'inactive' : ''}`}
                hoverable
            >
                <div className="store-card-header">
                    <div className="store-info">
                        <div className="store-icon">
                            <ShopOutlined />
                        </div>
                        <div className="store-details">
                            <h4>{store.name}</h4>
                            <div className="store-address">
                                <EnvironmentOutlined />
                                <Text ellipsis={{ tooltip: store.address }}>{store.address}</Text>
                            </div>
                            <div className="store-contact">
                                <PhoneOutlined />
                                <Text>{store.phone}</Text>
                            </div>
                        </div>
                    </div>
                    <div className="store-status">
                        <Tag color={getStatusColor(store.status)} className="status-badge">
                            {getStatusText(store.status)}
                        </Tag>
                    </div>
                </div>

                <div className="store-stats">
                    <div className="store-stats-row">
                        <div className="stat-item">
                            <div className="stat-value">{formatCurrency(store.monthlyRevenue)}</div>
                            <div className="stat-label">Doanh thu tháng</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{store.employeeCount}</div>
                            <div className="stat-label">Nhân viên</div>
                        </div>
                    </div>
                </div>

                <div className="rating-stars">
                    <span className="rating-value">{store.rating}</span>
                    <Rate disabled defaultValue={store.rating} allowHalf />
                </div>

                <div className="working-hours">
                    <div className="working-hours-title">Giờ làm việc</div>
                    <div className="hours-list">
                        {Object.entries(store.workingHours).slice(0, 3).map(([day, hours]) => (
                            <div key={day} className="hours-item">
                                {day}: {hours.isOpen ? `${hours.open}-${hours.close}` : 'Đóng cửa'}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="store-actions">
                    <div className="action-buttons">
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                className="action-btn view-btn"
                                onClick={() => handleViewStore(store)}
                            />
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                className="action-btn edit-btn"
                                onClick={() => handleEditStore(store)}
                            />
                        </Tooltip>
                        <Tooltip title="Xem trên bản đồ">
                            <Button
                                type="text"
                                icon={<EnvironmentOutlined />}
                                className="action-btn map-btn"
                                onClick={() => window.open(`https://maps.google.com/?q=${store.coordinates.lat},${store.coordinates.lng}`, '_blank')}
                            />
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteStore(store.id)}
                            />
                        </Tooltip>
                    </div>
                </div>
            </Card>
        </Col>
    );

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
            <Title level={2} className="text-primary" style={{ marginBottom: '16px', marginTop: 0 }}>
                Quản lý cửa hàng
            </Title>

            {/* Statistics */}
            <div style={{ marginBottom: '16px', marginTop: 0 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng cửa hàng"
                                value={stats.totalStores}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Cửa hàng hoạt động"
                                value={stats.activeStores}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={stats.totalRevenue}
                                formatter={(value) => {
                                    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                    return formatCurrency(numValue);
                                }}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Đánh giá trung bình"
                                value={stats.averageRating}
                                formatter={(value) => {
                                    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                    return `${numValue.toFixed(1)} ⭐`;
                                }}
                                prefix={<StarOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Search and Filter */}
            <Card style={{ marginBottom: '16px', marginTop: 0 }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Search
                            placeholder="Tìm kiếm cửa hàng..."
                            allowClear
                            onSearch={(value) => setSearchText(value)}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 150 }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Không hoạt động</Option>
                            <Option value="maintenance">Bảo trì</Option>
                        </Select>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<ExportOutlined />}
                                onClick={exportToExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddStore}
                            >
                                Thêm cửa hàng
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Stores Grid */}
            <Row gutter={[16, 16]}>
                {filteredStores.map(store => renderStoreCard(store))}
            </Row>
        </div>
    );
};

export default StoresPage;