import { I18nProvider } from './i18n';
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import Analytics from './Analytics.jsx'
import SplashScreen from './components/SplashScreen.jsx'

function Root() {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const el = document.getElementById('regaarder-initial-splash');
    if (el) el.remove();
  }, []);

  return (
    <>
      {loading && <SplashScreen durationMs={3000} onFinish={() => setLoading(false)} />}
      <I18nProvider><App /></I18nProvider>
    </>
  );
}

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
      <Root />
    </React.StrictMode>,
  );
}

