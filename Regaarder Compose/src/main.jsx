import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import Analytics from './Analytics.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));
const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

if (pathname === '/analytics') {
  root.render(
    <React.StrictMode>
      <Analytics />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
