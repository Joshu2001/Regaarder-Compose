const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Top Navigation Restructure & Export functionality
content = content.replace(
  /\{sheetToolbarTab === 'Data' \? \(/g,
  `{sheetToolbarTab === 'Export' ? (
    <div className="flex items-center gap-6 px-2 py-1">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => showToast('Exporting to XLSX...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><Download size={14} /> XLSX</button>
        <button type="button" onClick={() => showToast('Exporting to CSV...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><FileText size={14} /> CSV</button>
        <button type="button" onClick={() => showToast('Exporting to PDF...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><File size={14} /> PDF</button>
      </div>
    </div>
  ) : sheetToolbarTab === 'Templates' ? (
    <div className="flex items-center gap-6 px-2 py-1">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => showToast('Loading Financial Models...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">Financial</button>
        <button type="button" onClick={() => showToast('Loading Project Tracking...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">Project Tracking</button>
      </div>
    </div>
  ) : {sheetToolbarTab === 'Data' ? (`
);

content = content.replace(
  /\{sheetToolbarTab === 'Analyze' \? \(/g,
  `{sheetToolbarTab === 'Analyze' ? (
    <div className="flex items-center gap-6 px-2 py-1">
      <div className="flex items-center gap-1">
         <button type="button" onClick={() => showToast('Running T-Test...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">T-Test</button>
         <button type="button" onClick={() => showToast('Running ANOVA...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">ANOVA</button>
         <button type="button" onClick={() => showToast('Running Regression...')} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded">Regression</button>
      </div>
    </div>
  ) : {sheetToolbarTab === 'Analyze' ? (`
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('App.jsx patched successfully');
