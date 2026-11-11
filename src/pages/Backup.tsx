import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { DownloadCloud, UploadCloud, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Backup() {
  const { data, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aldahr_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus({ type: 'success', msg: 'Backup exported successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ type: 'error', msg: 'Failed to export backup.' });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('WARNING: Importing will overwrite all current data. Are you sure?')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsedData = JSON.parse(content);
          
          if (!parsedData.students || !parsedData.transactions) {
            throw new Error('Invalid backup file format');
          }

          importData(parsedData);
          setStatus({ type: 'success', msg: 'Data imported successfully!' });
          if (fileInputRef.current) fileInputRef.current.value = '';
          setTimeout(() => setStatus(null), 3000);
        } catch (err) {
          console.error(err);
          setStatus({ type: 'error', msg: 'Failed to parse backup file. Please ensure it is a valid backup.' });
        }
      };
      reader.readAsText(file);
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Backup & Restore</h2>

      {status && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="bg-[#0B1F3A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
            <DownloadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Export Data</h3>
          <p className="text-sm text-slate-500 mb-6 px-4">Download a copy of all your students, fee records, income, and expenses to keep them safe.</p>
          <button 
            onClick={handleExport}
            className="bg-[#0B1F3A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0f2a4a] transition-colors w-full max-w-xs mx-auto block shadow-md"
          >
            Export Backup
          </button>
        </div>

        <div className="text-center pt-4">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Import Data</h3>
          <p className="text-sm text-slate-500 mb-6 px-4">Restore your data from a previous backup file. <span className="text-rose-500 font-medium">This will replace current data.</span></p>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors w-full max-w-xs mx-auto block"
          >
            Select Backup File
          </button>
        </div>
      </div>
    </div>
  );
}
