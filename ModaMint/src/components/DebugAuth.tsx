import React from 'react';
import { useAuth } from '../contexts/authContext';
import { getRolesFromToken, getUserInfoFromToken } from '../utils/apiAuthUtils';
import { debugJWTToken, logJWTTokenInfo } from '../utils/jwtDebugUtils';
import { Button, Card, Typography, Space, Tag, Divider } from 'antd';
import { BugOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DebugAuth: React.FC = () => {
    const { accessToken, user, roles, isAuthenticated } = useAuth();
    
    const tokenInfo = accessToken ? getUserInfoFromToken(accessToken) : null;
    const extractedRoles = accessToken ? getRolesFromToken(accessToken) : [];
    const debugInfo = accessToken ? debugJWTToken(accessToken) : null;

    const handleLogTokenInfo = () => {
        if (accessToken) {
            logJWTTokenInfo(accessToken);
        }
    };

    return (
        <Card 
            title={
                <Space>
                    <BugOutlined />
                    <span>Debug Authentication Info</span>
                </Space>
            }
            style={{ margin: '20px', border: '2px solid #ff4d4f' }}
            extra={
                <Button 
                    type="primary" 
                    icon={<InfoCircleOutlined />}
                    onClick={handleLogTokenInfo}
                    disabled={!accessToken}
                >
                    Log to Console
                </Button>
            }
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                    <Text strong>Is Authenticated:</Text> 
                    <Tag color={isAuthenticated ? 'success' : 'error'}>
                        {isAuthenticated ? '✅ Yes' : '❌ No'}
                    </Tag>
                </div>
                
                <div>
                    <Text strong>Access Token:</Text> 
                    <Tag color={accessToken ? 'success' : 'error'}>
                        {accessToken ? '✅ Present' : '❌ Missing'}
                    </Tag>
                </div>
                
                <div>
                    <Text strong>Roles from Context:</Text> 
                    <Space>
                        {roles.map(role => (
                            <Tag key={role} color="blue">{role}</Tag>
                        ))}
                    </Space>
                </div>
                
                <div>
                    <Text strong>Roles from Token:</Text> 
                    <Space>
                        {extractedRoles.map(role => (
                            <Tag key={role} color="green">{role}</Tag>
                        ))}
                    </Space>
                </div>
                
                <div>
                    <Text strong>Has ADMIN Role:</Text> 
                    <Tag color={roles.includes('ADMIN') ? 'success' : 'error'}>
                        {roles.includes('ADMIN') ? '✅ Yes' : '❌ No'}
                    </Tag>
                </div>
                
                <div>
                    <Text strong>Can Access Dashboard:</Text> 
                    <Tag color={roles.includes('ADMIN') ? 'success' : 'error'}>
                        {roles.includes('ADMIN') ? '✅ Yes' : '❌ No'}
                    </Tag>
                </div>

                {debugInfo && (
                    <>
                        <Divider />
                        <div>
                            <Text strong>Token Debug Info:</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text>Valid: </Text>
                                <Tag color={debugInfo.isValid ? 'success' : 'error'}>
                                    {debugInfo.isValid ? 'Yes' : 'No'}
                                </Tag>
                            </div>
                            <div>
                                <Text>Expired: </Text>
                                <Tag color={debugInfo.isExpired ? 'error' : 'success'}>
                                    {debugInfo.isExpired ? 'Yes' : 'No'}
                                </Tag>
                            </div>
                            <div>
                                <Text>Expiration: </Text>
                                <Text code>
                                    {debugInfo.expirationDate?.toLocaleString() || 'N/A'}
                                </Text>
                            </div>
                        </div>
                    </>
                )}
                
                <Divider />
                
                <div>
                    <Text strong>User Info:</Text>
                    <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '12px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                    }}>
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
                
                {accessToken && (
                    <div>
                        <Text strong>Raw Token (first 100 chars):</Text>
                        <br />
                        <Text code style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                            {accessToken.substring(0, 100)}...
                        </Text>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default DebugAuth;
