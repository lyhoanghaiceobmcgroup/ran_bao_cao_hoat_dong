'use client';
import React from 'react';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  error?: Error;
  reset?: () => void;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <html>
          <body>
            <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
              <h2>Đã có lỗi xảy ra</h2>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px', 
                textAlign: 'left',
                overflow: 'auto',
                maxWidth: '100%'
              }}>
                {this.state.error?.message || 'Unknown error'}
              </pre>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  if (this.props.reset) {
                    this.props.reset();
                  } else if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Thử lại
              </button>
            </div>
          </body>
        </html>
      );
    }

    return this.props.children;
  }
}