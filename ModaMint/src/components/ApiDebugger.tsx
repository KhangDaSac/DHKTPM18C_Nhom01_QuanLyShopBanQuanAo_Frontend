import React, { useState } from 'react';
import { Button, Card, Space, Typography, Alert } from 'antd';
import { productService } from '../services/product';

const { Title, Text } = Typography;

const ApiDebugger: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testApi = async () => {
        setLoading(true);
        try {
            console.log('🧪 Testing API...');
            
            // Test 1: Check environment
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
            console.log('🌐 API URL:', apiUrl);
            
            // Test 2: Check auth token
            const authDataStr = localStorage.getItem("authData");
            console.log('🔑 Auth Data:', authDataStr ? 'Present' : 'Missing');
            
            // Test 3: Call API
            const result = await productService.getAllProducts();
            console.log('📡 API Result:', result);
            
            setDebugInfo({
                apiUrl,
                hasAuth: !!authDataStr,
                result,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('💥 Debug Error:', error);
            setDebugInfo({
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🔧 API Debugger" style={{ marginBottom: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                    type="primary" 
                    onClick={testApi} 
                    loading={loading}
                    size="large"
                >
                    Test API Connection
                </Button>
                
                {debugInfo && (
                    <div>
                        <Title level={4}>Debug Information:</Title>
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: '16px', 
                            borderRadius: '8px',
                            overflow: 'auto',
                            maxHeight: '400px'
                        }}>
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}
                
                <Alert
                    message="Debug Tips"
                    description={
                        <div>
                            <p>1. Kiểm tra console để xem logs chi tiết</p>
                            <p>2. Đảm bảo backend đang chạy trên port 8080</p>
                            <p>3. Kiểm tra token authentication trong localStorage</p>
                            <p>4. Kiểm tra network tab trong DevTools</p>
                        </div>
                    }
                    type="info"
                    showIcon
                />
            </Space>
        </Card>
    );
};

export default ApiDebugger;
