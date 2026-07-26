import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import Analytics from './Analytics.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#e11d48', marginBottom: '12px' }}>Application Runtime Exception</h1>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>{this.state.error && this.state.error.toString()}</p>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.stack}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px', padding: '10px 20px', background: '#6d28d9', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

if (pathname === '/analytics') {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Analytics />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

