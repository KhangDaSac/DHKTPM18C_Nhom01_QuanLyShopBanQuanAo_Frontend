import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { useRoles, usePermissions } from '@/hooks/useRoles';
import { Card, Typography, Space, Tag, Button, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AuthTestPage: React.FC = () => {
    const { accessToken, user, roles, isAuthenticated } = useAuth();
    const { isAdmin, isUser, isAuthenticated: isAuth } = useRoles();
    const { canAccessDashboard, canManageProducts } = usePermissions();

    const testResults = [
        {
            name: 'Authentication Status',
            result: isAuthenticated,
            description: 'User is logged in'
        },
        {
            name: 'Has Access Token',
            result: !!accessToken,
            description: 'JWT token is present'
        },
        {
            name: 'Is Admin Role',
            result: isAdmin(),
            description: 'User has ADMIN role'
        },
        {
            name: 'Is User Role',
            result: isUser(),
            description: 'User has USER role'
        },
        {
            name: 'Can Access Dashboard',
            result: canAccessDashboard(),
            description: 'User can access dashboard'
        },
        {
            name: 'Can Manage Products',
            result: canManageProducts(),
            description: 'User can manage products'
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>🔐 Authentication Test Page</Title>
            
            <Card title="User Information" style={{ marginBottom: '24px' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>User ID:</Text> {user?.id || 'N/A'}
                    </div>
                    <div>
                        <Text strong>Username:</Text> {user?.username || 'N/A'}
                    </div>
                    <div>
                        <Text strong>Email:</Text> {user?.email || 'N/A'}
                    </div>
                    <div>
                        <Text strong>Roles:</Text> 
                        <Space>
                            {roles.map(role => (
                                <Tag key={role} color="blue">{role}</Tag>
                            ))}
                        </Space>
                    </div>
                </Space>
            </Card>

            <Card title="Permission Test Results">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {testResults.map((test, index) => (
                        <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '12px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '6px'
                        }}>
                            <div>
                                <Text strong>{test.name}</Text>
                                <br />
                                <Text type="secondary">{test.description}</Text>
                            </div>
                            <div>
                                {test.result ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success">
                                        PASS
                                    </Tag>
                                ) : (
                                    <Tag icon={<CloseCircleOutlined />} color="error">
                                        FAIL
                                    </Tag>
                                )}
                            </div>
                        </div>
                    ))}
                </Space>
            </Card>

            <Divider />

            <Card title="Debug Information">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Access Token (first 50 chars):</Text>
                        <br />
                        <Text code>{accessToken?.substring(0, 50)}...</Text>
                    </div>
                    
                    <div>
                        <Text strong>Raw User Data:</Text>
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: '12px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                </Space>
            </Card>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Button 
                    type="primary" 
                    href="/dashboard"
                    disabled={!canAccessDashboard()}
                >
                    {canAccessDashboard() ? 'Go to Dashboard' : 'Cannot Access Dashboard'}
                </Button>
            </div>
        </div>
    );
};

export default AuthTestPage;
