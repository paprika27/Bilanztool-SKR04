import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, PieChart, Table, Settings, Printer, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ReportTable from './components/ReportTable';
import AccountDetails from './components/AccountDetails';
import AccountManager from './components/AccountManager';
import { parseExcelFile } from './services/excelService';
import { generateFinancialReport } from './services/skr04Service';
import { FinancialData, AccountBalance, CustomAccountMapping, Booking } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [rawAccounts, setRawAccounts] = useState<Record<string, AccountBalance>>({});
  const [rawBookings, setRawBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'BILANZ' | 'GUV' | 'JOURNAL' | 'KONTEN'>('BILANZ');
  const [selectedAccount, setSelectedAccount] = useState<AccountBalance | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // State für Custom Mappings
  const [customMapping, setCustomMapping] = useState<CustomAccountMapping>({});

  // Re-Generate Report wenn Mappings sich ändern
  useEffect(() => {
    if (Object.keys(rawAccounts).length > 0) {
      // Deep Copy der Accounts, damit Namen nicht permanent im Raw-State überschrieben werden
      const accountsCopy = JSON.parse(JSON.stringify(rawAccounts));
      
      const report = generateFinancialReport(accountsCopy, customMapping);
      report.journal = rawBookings;
      setData(report);
    }
  }, [customMapping, rawAccounts, rawBookings]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const { accounts, bookings } = await parseExcelFile(file);
      setRawAccounts(accounts);
      setRawBookings(bookings);
      // Triggered useEffect via State update
      setActiveTab('BILANZ');
    } catch (e) {
      console.error(e);
      alert("Fehler beim Lesen der Datei. Bitte stellen Sie sicher, dass es sich um eine gültige Excel-Datei handelt.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // 1. Set printing state to true (forces tables to expand)
    setIsPrinting(true);
    
    // 2. Wait for render, then print, then reset
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors print:hidden ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen pb-20 print:pb-0 print:bg-white text-gray-900">
      {/* Header - Hide on Print */}
      <header className="bg-slate-900 text-white p-6 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BilanzTool SKR04</h1>
            <p className="text-slate-400 text-sm mt-1">Jahresabschluss & Auswertung</p>
          </div>
          <div className="flex gap-4 items-center">
            {data && (
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <Printer size={16} />
                Export / Druck
              </button>
            )}
            {data && (
              <div className={`px-4 py-2 rounded-lg font-bold text-sm ${data.bilanz.check.balanced ? 'bg-green-600' : 'bg-red-600'}`}>
                {data.bilanz.check.balanced 
                  ? 'Bilanz ausgeglichen' 
                  : `Differenz: ${data.bilanz.check.diff.toLocaleString('de-DE', {style:'currency', currency:'EUR'})}`}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Print Header Only */}
      <div className="hidden print:block p-8 pb-0">
         <h1 className="text-3xl font-bold mb-2">Jahresabschluss Auswertung</h1>
         <p className="text-gray-500">Erstellt am {new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-7xl mx-auto mt-8 px-4 print:mt-4 print:px-0 print:max-w-none">
        {!data ? (
          <div className="max-w-xl mx-auto mt-20">
            <FileUpload onFileSelect={handleFileUpload} isLoading={loading} />
          </div>
        ) : (
          <>
            {/* Warning for Unassigned Accounts */}
            {data.unassigned.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 print:break-inside-avoid">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-amber-800">
                      Nicht zugeordnete Konten ({data.unassigned.length})
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p className="mb-2">
                        Folgende Konten konnten nicht automatisch zugeordnet werden (oder sind Vortragskonten mit Saldo). 
                        Dies führt wahrscheinlich zur Bilanzdifferenz. Bitte ordnen Sie diese im Kontenplan zu oder korrigieren Sie die Buchungen.
                      </p>
                      <div className="bg-white/50 rounded overflow-hidden border border-amber-200">
                        <table className="min-w-full text-sm">
                           <thead className="bg-amber-100/50">
                             <tr>
                               <th className="px-3 py-1 text-left">Nr.</th>
                               <th className="px-3 py-1 text-left">Name</th>
                               <th className="px-3 py-1 text-right">Saldo</th>
                             </tr>
                           </thead>
                           <tbody>
                             {data.unassigned.map(acc => (
                               <tr key={acc.accountNumber} 
                                   className="cursor-pointer hover:bg-amber-100"
                                   onClick={() => setSelectedAccount(acc)}>
                                 <td className="px-3 py-1 font-mono">{acc.accountNumber}</td>
                                 <td className="px-3 py-1">{acc.accountName}</td>
                                 <td className={`px-3 py-1 text-right font-mono ${acc.balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                                   {acc.balance.toLocaleString('de-DE', {style:'currency', currency:'EUR'})}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs - Hide on Print */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-hidden mb-6 print:hidden">
              <TabButton id="BILANZ" icon={LayoutDashboard} label="Bilanz" />
              <TabButton id="GUV" icon={PieChart} label="GuV" />
              <TabButton id="KONTEN" icon={Settings} label="Kontenplan" />
              <TabButton id="JOURNAL" icon={Table} label="Journal" />
            </div>

            {/* Content */}
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] print:border-0 print:shadow-none`}>
              
              {/* BILANZ VIEW (Always show in print if visible or print mode overrides tab) */}
              <div className={activeTab === 'BILANZ' ? 'block' : 'hidden print:block'}>
                 <div className="grid md:grid-cols-2 gap-8 p-6 print:block print:p-8">
                  <div className="space-y-4 print:mb-8">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">AKTIVA</h3>
                    <ReportTable 
                      data={data.bilanz.aktiva} 
                      onSelectAccount={setSelectedAccount} 
                      root 
                      forceExpanded={isPrinting}
                    />
                  </div>
                  <div className="space-y-4 print:break-before-page">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">PASSIVA</h3>
                    <ReportTable 
                      data={data.bilanz.passiva} 
                      onSelectAccount={setSelectedAccount} 
                      root 
                      forceExpanded={isPrinting}
                    />
                  </div>
                </div>
              </div>

              {/* GUV VIEW */}
              <div className={(activeTab === 'GUV' ? 'block' : 'hidden print:block print:break-before-page')}>
                <div className="p-6 max-w-4xl mx-auto print:max-w-none print:p-8">
                   <h2 className="hidden print:block text-xl font-bold mb-4">Gewinn- und Verlustrechnung</h2>
                   <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded border print:border-gray-300">
                      <span className="font-medium text-gray-700">Jahresergebnis</span>
                      <span className={`text-2xl font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.profit.toLocaleString('de-DE', {style:'currency', currency:'EUR'})}
                      </span>
                   </div>
                   <ReportTable 
                    data={data.guv} 
                    onSelectAccount={setSelectedAccount} 
                    root 
                    forceExpanded={isPrinting}
                   />
                </div>
              </div>

              {activeTab === 'KONTEN' && (
                <div className="print:hidden">
                  <AccountManager 
                    accounts={rawAccounts} 
                    mapping={customMapping} 
                    onUpdateMapping={setCustomMapping} 
                  />
                </div>
              )}

              {activeTab === 'JOURNAL' && (
                <div className="p-0 overflow-auto max-h-[700px] print:hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-3">Nr.</th>
                        <th className="p-3">Datum</th>
                        <th className="p-3">Konto</th>
                        <th className="p-3">Gegenk.</th>
                        <th className="p-3">Text</th>
                        <th className="p-3 text-right">Soll</th>
                        <th className="p-3 text-right">Haben</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.journal.slice(0, 500).map((b, i) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-400 text-xs">{i+1}</td>
                          <td className="p-3 whitespace-nowrap text-gray-800">{b.date}</td>
                          <td className="p-3 font-mono text-blue-700 font-medium">{b.konto}</td>
                          <td className="p-3 font-mono text-gray-600">{b.gegenkonto}</td>
                          <td className="p-3 max-w-md truncate text-gray-800">{b.text}</td>
                          <td className="p-3 text-right text-gray-800 font-mono">{b.soll ? b.soll.toLocaleString('de-DE', {minimumFractionDigits: 2}) : ''}</td>
                          <td className="p-3 text-right text-gray-800 font-mono">{b.haben ? b.haben.toLocaleString('de-DE', {minimumFractionDigits: 2}) : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.journal.length > 500 && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50">
                      Zeige erste 500 von {data.journal.length} Buchungen. Für vollständiges Journal bitte Excel prüfen.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {selectedAccount && (
        <AccountDetails 
          account={selectedAccount} 
          onClose={() => setSelectedAccount(null)} 
        />
      )}
    </div>
  );
};

export default App;