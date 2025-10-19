import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Unexpected Application Error!"
                    subTitle={
                        <div>
                            <p><strong>Error:</strong> {this.state.error?.message}</p>
                            <p><strong>Stack:</strong></p>
                            <pre style={{ 
                                background: '#f5f5f5', 
                                padding: '12px', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                overflow: 'auto',
                                maxHeight: '200px'
                            }}>
                                {this.state.error?.stack}
                            </pre>
                            {this.state.errorInfo && (
                                <div>
                                    <p><strong>Component Stack:</strong></p>
                                    <pre style={{ 
                                        background: '#f5f5f5', 
                                        padding: '12px', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        overflow: 'auto',
                                        maxHeight: '200px'
                                    }}>
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    }
                    extra={[
                        <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>,
                        <Button key="home" onClick={() => window.location.href = '/'}>
                            Go Home
                        </Button>
                    ]}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
