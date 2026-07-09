import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const EXPECTED = import.meta.env.VITE_ANALYTICS_KEY;
  const [authorized, setAuthorized] = useState(false);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('analyticsKey') : null;
    const queryKey = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('key') : null;
    if (EXPECTED) {
      if (queryKey === EXPECTED || storedKey === EXPECTED) {
        setAuthorized(true);
      }
    } else {
      if (storedKey === 'local' || queryKey === 'local') {
        setAuthorized(true);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (EXPECTED) {
      if (inputKey === EXPECTED) {
        localStorage.setItem('analyticsKey', inputKey);
        setAuthorized(true);
      } else {
        alert('Invalid key');
      }
    } else {
      localStorage.setItem('analyticsKey', 'local');
      setAuthorized(true);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow">
          <h1 className="text-xl font-semibold mb-4">Analytics (Private)</h1>
          {EXPECTED ? (
            <>
              <p className="text-sm text-slate-600 mb-4">This page is protected. Enter the analytics key to continue.</p>
              <input value={inputKey} onChange={(e)=>setInputKey(e.target.value)} className="w-full border p-2 rounded mb-3" placeholder="Enter key" />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-violet-600 text-white rounded" onClick={handleSubmit}>Unlock</button>
                <button className="px-4 py-2 border rounded" onClick={()=>{window.location.href='/'}}>Back</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4">No environment key set. To restrict this page to you only, set <strong>VITE_ANALYTICS_KEY</strong> in your .env and restart the dev server. For now you can enable local access:</p>
              <button className="px-4 py-2 bg-violet-600 text-white rounded" onClick={handleSubmit}>Enable local access</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const sampleStats = {
    totalVisits: 12345,
    uniques: 4321,
    sessionsToday: 456,
    bounceRate: 34.5,
    avgDuration: '01:45',
    topPages: [
      { path: '/', views: 6789 },
      { path: '/manageen', views: 2345 },
      { path: '/compose', views: 1234 },
    ],
    last7: [120, 200, 150, 300, 250, 400, 430],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <div className="flex gap-3">
            <button className="px-3 py-2 rounded border" onClick={()=>{ localStorage.removeItem('analyticsKey'); window.location.reload();}}>Lock</button>
            <a href="/" className="px-3 py-2 rounded border">Back</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded p-4 shadow">
            <div className="text-xs text-slate-500">Total visits</div>
            <div className="text-2xl font-semibold">{sampleStats.totalVisits.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded p-4 shadow">
            <div className="text-xs text-slate-500">Unique visitors</div>
            <div className="text-2xl font-semibold">{sampleStats.uniques.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded p-4 shadow">
            <div className="text-xs text-slate-500">Sessions today</div>
            <div className="text-2xl font-semibold">{sampleStats.sessionsToday.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded p-4 shadow">
            <div className="text-xs text-slate-500">Bounce rate</div>
            <div className="text-2xl font-semibold">{sampleStats.bounceRate}%</div>
          </div>
        </div>

        <div className="bg-white rounded p-6 shadow mb-6">
          <div className="text-sm text-slate-600 mb-4">Traffic — last 7 days</div>
          <svg width="100%" height="120" viewBox="0 0 700 120" preserveAspectRatio="none">
            {sampleStats.last7.map((v,i)=> {
              const max = Math.max(...sampleStats.last7);
              const height = (v / max) * 80;
              const x = i * 90 + 20;
              const y = 100 - height;
              return <rect key={i} x={x} y={y} width="60" height={height} fill="#7c3aed" rx="6" />;
            })}
          </svg>
        </div>

        <div className="bg-white rounded p-6 shadow">
          <div className="text-sm font-semibold mb-3">Top pages</div>
          <div className="space-y-2">
            {sampleStats.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between">
                <div className="text-sm text-slate-700">{p.path}</div>
                <div className="text-sm text-slate-500">{p.views.toLocaleString()} views</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
