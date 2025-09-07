import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with error reporting services like Sentry here
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    const maxRetries = this.props.maxRetries || 3;
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= maxRetries) {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: newRetryCount
      });
    } else {
      // Max retries reached, force reload
      this.handleReload();
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-red-500">
                <AlertTriangle size={48} />
              </div>
              <CardTitle className="text-red-700">Đã xảy ra lỗi</CardTitle>
              <CardDescription>
                Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc tải lại trang.
                {this.state.retryCount > 0 && (
                  <div className="mt-2 text-sm text-orange-600">
                    Đã thử lại: {this.state.retryCount}/{this.props.maxRetries || 3} lần
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 max-h-32 overflow-y-auto">
                  <div className="font-bold text-red-600 mb-2">Error Details:</div>
                  <div>{this.state.error.message}</div>
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <div className="font-bold">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  disabled={this.state.retryCount >= (this.props.maxRetries || 3)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= (this.props.maxRetries || 3) ? 'Đã hết lượt thử' : 'Thử lại'}
                </Button>
                <Button 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  Tải lại trang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;