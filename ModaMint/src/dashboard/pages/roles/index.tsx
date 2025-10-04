import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    Space,
    message,
    Popconfirm,
    Tag,
    Row,
    Col,
    Select,
    Avatar,
    Badge,
    Typography,
    Checkbox,
    Divider,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    TeamOutlined,
    SecurityScanOutlined,
    CrownOutlined,
    SafetyCertificateOutlined,
    UserSwitchOutlined,
    EyeOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import './style_new.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface Permission {
    id: string;
    name: string;
    module: string;
    description: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    isDefault: boolean;
    userCount: number;
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    roleId: string;
    roleName: string;
    isActive: boolean;
    avatar?: string;
    createdAt: string;
}

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);

    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isUserModalVisible, setIsUserModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingRole, setViewingRole] = useState<Role | null>(null);

    const [roleForm] = Form.useForm();
    const [userForm] = Form.useForm();

    useEffect(() => {
        loadMockData();
    }, []);

    const loadMockData = () => {
        const mockPermissions: Permission[] = [
            { id: '1', name: 'Xem sản phẩm', module: 'products', description: 'Quyền xem danh sách sản phẩm' },
            { id: '2', name: 'Thêm sản phẩm', module: 'products', description: 'Quyền thêm sản phẩm mới' },
            { id: '3', name: 'Sửa sản phẩm', module: 'products', description: 'Quyền chỉnh sửa sản phẩm' },
            { id: '4', name: 'Xóa sản phẩm', module: 'products', description: 'Quyền xóa sản phẩm' },
            { id: '5', name: 'Xem đơn hàng', module: 'orders', description: 'Quyền xem đơn hàng' },
            { id: '6', name: 'Xử lý đơn hàng', module: 'orders', description: 'Quyền xử lý đơn hàng' },
            { id: '7', name: 'Quản lý khách hàng', module: 'customers', description: 'Quyền quản lý khách hàng' },
            { id: '8', name: 'Xem báo cáo', module: 'reports', description: 'Quyền xem báo cáo' },
            { id: '9', name: 'Quản lý hệ thống', module: 'system', description: 'Quyền quản lý hệ thống' },
            { id: '10', name: 'Quản lý người dùng', module: 'users', description: 'Quyền quản lý người dùng' }
        ];

        const mockRoles: Role[] = [
            {
                id: '1',
                name: 'Admin',
                description: 'Quản trị viên hệ thống - có toàn quyền truy cập',
                permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                isActive: true,
                isDefault: true,
                userCount: 2,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
            },
            {
                id: '2',
                name: 'Manager',
                description: 'Quản lý cửa hàng - quản lý sản phẩm và đơn hàng',
                permissions: ['1', '2', '3', '5', '6', '7', '8'],
                isActive: true,
                isDefault: false,
                userCount: 5,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
            },
            {
                id: '3',
                name: 'Staff',
                description: 'Nhân viên bán hàng - xử lý đơn hàng và khách hàng',
                permissions: ['1', '5', '6', '7'],
                isActive: true,
                isDefault: false,
                userCount: 12,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
            },
            {
                id: '4',
                name: 'Guest',
                description: 'Khách vãng lai - chỉ xem thông tin cơ bản',
                permissions: ['1'],
                isActive: false,
                isDefault: false,
                userCount: 0,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
            }
        ];

        const mockUsers: User[] = [
            {
                id: '1',
                name: 'Nguyễn Văn A',
                email: 'admin@modamint.com',
                roleId: '1',
                roleName: 'Admin',
                isActive: true,
                createdAt: '2024-01-01'
            },
            {
                id: '2',
                name: 'Trần Thị B',
                email: 'manager@modamint.com',
                roleId: '2',
                roleName: 'Manager',
                isActive: true,
                createdAt: '2024-01-01'
            },
            {
                id: '3',
                name: 'Lê Văn C',
                email: 'staff1@modamint.com',
                roleId: '3',
                roleName: 'Staff',
                isActive: true,
                createdAt: '2024-01-01'
            },
            {
                id: '4',
                name: 'Phạm Thị D',
                email: 'staff2@modamint.com',
                roleId: '3',
                roleName: 'Staff',
                isActive: false,
                createdAt: '2024-01-01'
            }
        ];

        setAllPermissions(mockPermissions);
        setRoles(mockRoles);
        setUsers(mockUsers);
    };

    const getRoleIcon = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin': return <CrownOutlined />;
            case 'manager': return <SafetyCertificateOutlined />;
            case 'staff': return <UserOutlined />;
            default: return <UserSwitchOutlined />;
        }
    };

    const getRoleColorClass = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin': return 'role-admin';
            case 'manager': return 'role-manager';
            case 'staff': return 'role-staff';
            default: return 'role-default';
        }
    };

    const getRoleColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin': return 'red';
            case 'manager': return 'blue';
            case 'staff': return 'green';
            default: return 'default';
        }
    };

    const totalRoles = roles.length;
    const activeRoles = roles.filter(role => role.isActive).length;
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;

    const handleAddRole = () => {
        setEditingRole(null);
        setIsRoleModalVisible(true);
        roleForm.resetFields();
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsRoleModalVisible(true);
        roleForm.setFieldsValue({
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            isActive: role.isActive
        });
    };

    const handleViewRole = (role: Role) => {
        setViewingRole(role);
        setIsViewModalVisible(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setRoles(roles.filter(role => role.id !== roleId));
            message.success('Xóa vai trò thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa vai trò!');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRoleStatus = async (roleId: string) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));

            setRoles(roles.map(role =>
                role.id === roleId
                    ? { ...role, isActive: !role.isActive }
                    : role
            ));
            message.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật trạng thái!');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRole = async (values: any) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingRole) {
                setRoles(roles.map(role =>
                    role.id === editingRole.id
                        ? { ...role, ...values, updatedAt: new Date().toISOString() }
                        : role
                ));
                message.success('Cập nhật vai trò thành công!');
            } else {
                const newRole: Role = {
                    id: Date.now().toString(),
                    ...values,
                    userCount: 0,
                    isDefault: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setRoles([...roles, newRole]);
                message.success('Thêm vai trò thành công!');
            }

            setIsRoleModalVisible(false);
            roleForm.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu vai trò!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserModalVisible(true);
        userForm.resetFields();
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserModalVisible(true);
        userForm.setFieldsValue({
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            isActive: user.isActive
        });
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setUsers(users.filter(user => user.id !== userId));
            message.success('Xóa người dùng thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa người dùng!');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (values: any) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const selectedRole = roles.find(role => role.id === values.roleId);

            if (editingUser) {
                setUsers(users.map(user =>
                    user.id === editingUser.id
                        ? {
                            ...user,
                            ...values,
                            roleName: selectedRole?.name || ''
                        }
                        : user
                ));
                message.success('Cập nhật người dùng thành công!');
            } else {
                const newUser: User = {
                    id: Date.now().toString(),
                    ...values,
                    roleName: selectedRole?.name || '',
                    createdAt: new Date().toISOString()
                };
                setUsers([...users, newUser]);
                message.success('Thêm người dùng thành công!');
            }

            setIsUserModalVisible(false);
            userForm.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu người dùng!');
        } finally {
            setLoading(false);
        }
    };

    // Export Excel
    const handleExportRolesExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(roles.map(role => ({
            'Tên vai trò': role.name,
            'Mô tả': role.description,
            'Số quyền': role.permissions.length,
            'Số người dùng': role.userCount,
            'Trạng thái': role.isActive ? 'Hoạt động' : 'Tạm dừng',
            'Vai trò mặc định': role.isDefault ? 'Có' : 'Không',
            'Ngày tạo': new Date(role.createdAt).toLocaleDateString('vi-VN'),
            'Cập nhật lần cuối': new Date(role.updatedAt).toLocaleDateString('vi-VN')
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vai trò');
        XLSX.writeFile(workbook, `vai-tro-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    const handleExportUsersExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
            'Họ và tên': user.name,
            'Email': user.email,
            'Vai trò': user.roleName,
            'Trạng thái': user.isActive ? 'Hoạt động' : 'Khóa',
            'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN')
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Người dùng');
        XLSX.writeFile(workbook, `nguoi-dung-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    return (
        <div className="role-management">
            <div className="page-header">
                <Title level={2}>
                    <SecurityScanOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                    Quản lý vai trò & phân quyền
                </Title>
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportRolesExcel}
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handleAddRole}
                        className="add-role-btn"
                    >
                        Thêm vai trò mới
                    </Button>
                </Space>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="stats-section">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card role-stat">
                        <div className="stat-content">
                            <div className="stat-icon">
                                <SecurityScanOutlined />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{totalRoles}</div>
                                <div className="stat-label">Tổng vai trò</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card active-role-stat">
                        <div className="stat-content">
                            <div className="stat-icon">
                                <SafetyCertificateOutlined />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{activeRoles}</div>
                                <div className="stat-label">Vai trò hoạt động</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card user-stat">
                        <div className="stat-content">
                            <div className="stat-icon">
                                <TeamOutlined />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{totalUsers}</div>
                                <div className="stat-label">Tổng người dùng</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card active-user-stat">
                        <div className="stat-content">
                            <div className="stat-icon">
                                <UserOutlined />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{activeUsers}</div>
                                <div className="stat-label">Người dùng hoạt động</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Search and Filter */}
            <Card className="filter-section">
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder="Tìm kiếm vai trò..."
                            prefix={<SecurityScanOutlined />}
                            allowClear
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 120 }}
                            allowClear
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Tạm dừng</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Role Cards Grid */}
            <div className="roles-grid">
                <Row gutter={[24, 24]}>
                    {roles.map(role => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={role.id}>
                            <Card
                                className={`role-card ${getRoleColorClass(role.name)} ${!role.isActive ? 'inactive' : ''}`}
                                hoverable
                            >
                                <div className="role-card-header">
                                    <div className="role-info">
                                        <div className="role-icon">
                                            {getRoleIcon(role.name)}
                                        </div>
                                        <div>
                                            <Title level={4} className="role-title">
                                                {role.name}
                                                {role.isDefault && <CrownOutlined className="default-crown" />}
                                            </Title>
                                            <Text className="role-description">{role.description}</Text>
                                        </div>
                                    </div>
                                    <div className="role-status">
                                        <Switch
                                            checked={role.isActive}
                                            onChange={() => handleToggleRoleStatus(role.id)}
                                            size="small"
                                        />
                                    </div>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                                <div className="role-stats">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <div className="stat-item">
                                                <div className="stat-value">{role.permissions.length}</div>
                                                <div className="stat-label">Quyền</div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div className="stat-item">
                                                <div className="stat-value">{role.userCount}</div>
                                                <div className="stat-label">Người dùng</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="permissions-preview">
                                    <Text strong style={{ fontSize: '12px', color: '#666' }}>Quyền chính:</Text>
                                    <div className="permissions-tags">
                                        {allPermissions
                                            .filter(p => role.permissions.includes(p.id))
                                            .slice(0, 3)
                                            .map(permission => (
                                                <Tag key={permission.id} className="permission-tag">
                                                    {permission.name}
                                                </Tag>
                                            ))}
                                        {role.permissions.length > 3 && (
                                            <Tag color="blue">
                                                +{role.permissions.length - 3} khác
                                            </Tag>
                                        )}
                                    </div>
                                </div>

                                <div className="role-actions">
                                    <Space size="small">
                                        <Tooltip title="Xem chi tiết">
                                            <Button
                                                type="text"
                                                icon={<EyeOutlined />}
                                                onClick={() => handleViewRole(role)}
                                                className="action-btn view-btn"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Chỉnh sửa">
                                            <Button
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditRole(role)}
                                                className="action-btn edit-btn"
                                            />
                                        </Tooltip>
                                        {!role.isDefault && (
                                            <Tooltip title="Xóa vai trò">
                                                <Popconfirm
                                                    title="Bạn có chắc muốn xóa vai trò này?"
                                                    onConfirm={() => handleDeleteRole(role.id)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className="action-btn delete-btn"
                                                    />
                                                </Popconfirm>
                                            </Tooltip>
                                        )}
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Users Section */}
            <Card className="users-section" style={{ marginTop: '24px' }}>
                <div className="section-header">
                    <Title level={3}>
                        <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Quản lý người dùng
                    </Title>
                    <Space>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExportUsersExcel}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddUser}
                        >
                            Thêm người dùng
                        </Button>
                    </Space>
                </div>

                <Row gutter={[16, 16]}>
                    {users.map(user => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                            <Card className="user-card" size="small">
                                <div className="user-info">
                                    <Avatar
                                        size={48}
                                        src={user.avatar}
                                        icon={<UserOutlined />}
                                        className="user-avatar"
                                    />
                                    <div className="user-details">
                                        <Title level={5} style={{ margin: 0 }}>{user.name}</Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {user.email}
                                        </Text>
                                        <div>
                                            <Tag
                                                color={getRoleColor(user.roleName)}
                                                style={{ marginTop: '4px' }}
                                            >
                                                {user.roleName}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                <div className="user-status">
                                    <Badge
                                        status={user.isActive ? 'success' : 'error'}
                                        text={user.isActive ? 'Hoạt động' : 'Khóa'}
                                    />
                                </div>

                                <div className="user-actions">
                                    <Space size="small">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditUser(user)}
                                            size="small"
                                        />
                                        <Popconfirm
                                            title="Bạn có chắc muốn xóa người dùng này?"
                                            onConfirm={() => handleDeleteUser(user.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                            />
                                        </Popconfirm>
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Role Form Modal */}
            <Modal
                title={editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                open={isRoleModalVisible}
                onCancel={() => setIsRoleModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={roleForm}
                    layout="vertical"
                    onFinish={handleSaveRole}
                >
                    <Form.Item
                        name="name"
                        label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
                    >
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập mô tả vai trò" />
                    </Form.Item>

                    <Form.Item
                        name="permissions"
                        label="Quyền hạn"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
                    >
                        <Checkbox.Group>
                            <Row gutter={[16, 16]}>
                                {allPermissions.map(permission => (
                                    <Col span={12} key={permission.id}>
                                        <Checkbox value={permission.id}>
                                            {permission.name}
                                        </Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingRole ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setIsRoleModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* User Form Modal */}
            <Modal
                title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                open={isUserModalVisible}
                onCancel={() => setIsUserModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={userForm}
                    layout="vertical"
                    onFinish={handleSaveUser}
                >
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ email" />
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            {roles.filter(role => role.isActive).map(role => (
                                <Option key={role.id} value={role.id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingUser ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setIsUserModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Role Modal */}
            <Modal
                title={`Thông tin vai trò: ${viewingRole?.name}`}
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
                width={600}
            >
                {viewingRole && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Tên vai trò:</Text>
                                    <div>{viewingRole.name}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Trạng thái:</Text>
                                    <div>
                                        <Badge
                                            status={viewingRole.isActive ? 'success' : 'error'}
                                            text={viewingRole.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Text strong>Mô tả:</Text>
                            <div>{viewingRole.description}</div>
                        </div>

                        <Divider />

                        <div>
                            <Text strong>Quyền hạn ({viewingRole.permissions.length}):</Text>
                            <div style={{ marginTop: '8px' }}>
                                {allPermissions
                                    .filter(p => viewingRole.permissions.includes(p.id))
                                    .map(permission => (
                                        <Tag key={permission.id} style={{ marginBottom: '4px' }}>
                                            {permission.name}
                                        </Tag>
                                    ))}
                            </div>
                        </div>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={12}>
                                <div>
                                    <Text strong>Số người dùng:</Text>
                                    <div>{viewingRole.userCount}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <Text strong>Vai trò mặc định:</Text>
                                    <div>{viewingRole.isDefault ? 'Có' : 'Không'}</div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RoleManagement;