import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, PieChart, Table, Settings, Printer, AlertTriangle, ChevronDown, ChevronUp, Search, RefreshCw, FilePlus, Calculator, XCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ReportTable from './components/ReportTable';
import AccountDetails from './components/AccountDetails';
import AccountManager from './components/AccountManager';
import KPIBoard from './components/KPIBoard';
import { parseExcelFile } from './services/excelService';
import { generateFinancialReport } from './services/skr04Service';
import { FinancialData, AccountBalance, CustomAccountMapping, Booking, KPIDefinition } from './types';

const DEFAULT_KPIS: KPIDefinition[] = [
  { 
    id: 'ebit', 
    label: 'EBIT (Näherung)', 
    formula: '{{ek_ergebnis}} + {{steuern_er}} + {{steuern_sonst}} + {{zinsen}}', 
    format: 'currency' 
  },
  { 
    id: 'pers_quote', 
    label: 'Personalquote', 
    formula: '({{personal}} / {{umsatz}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'rohertrag', 
    label: 'Rohertrag', 
    formula: '{{umsatz}} - {{material}} - {{bestandsva}}', 
    format: 'currency' 
  },
  { 
    id: 'anlageintens', 
    label: 'Anlageintensität', 
    formula: '({{av}} / {{aktiva_root}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'liquid_mittel_quote', 
    label: 'Quote liquider Mittel', 
    formula: '({{uv_kasse}} / {{aktiva_root}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'ek_quote', 
    label: 'Eigenkapitalquote', 
    formula: '({{ek}} / {{passiva_root}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'verschuldung', 
    label: 'Verschuldungsgrad (Fremd/Eigen)', 
    formula: '(({{passiva_root}} - {{ek}}) / {{ek}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'erfolgsquote', 
    label: 'Umsatzrentabilität (Erfolgsquote)', 
    formula: '({{ek_ergebnis}} / {{umsatz}}) * 100', 
    format: 'percent' 
  },
  { 
    id: 'liq_1', 
    label: 'Liquidität 1. Grades (Cash Ratio)', 
    formula: '({{uv_kasse}} / {{verb}}) * 100', 
    format: 'percent' 
  }
];

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [rawAccounts, setRawAccounts] = useState<Record<string, AccountBalance>>({});
  const [rawBookings, setRawBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'BILANZ' | 'GUV' | 'KPI' | 'JOURNAL' | 'KONTEN' | 'SALDEN'>('BILANZ');
  const [selectedAccount, setSelectedAccount] = useState<AccountBalance | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [saldenSearchTerm, setSaldenSearchTerm] = useState('');
  const [showUnassignedDetails, setShowUnassignedDetails] = useState(false);
  
  // State für Custom Mappings
  const [customMapping, setCustomMapping] = useState<CustomAccountMapping>({});
  
  // State für KPIs (Lifted State)
  const [kpis, setKpis] = useState<KPIDefinition[]>(DEFAULT_KPIS);

  // Trigger Report Generation
  const refreshReport = (accounts: Record<string, AccountBalance>) => {
      const accountsCopy = JSON.parse(JSON.stringify(accounts));
      const report = generateFinancialReport(accountsCopy, customMapping);
      report.journal = rawBookings;
      setData(report);
  };

  useEffect(() => {
    if (Object.keys(rawAccounts).length > 0) {
      refreshReport(rawAccounts);
    }
  }, [customMapping, rawAccounts]);

  const processFiles = async (files: File[], mode: 'replace' | 'append') => {
    setLoading(true);
    try {
        let currentAccounts = mode === 'replace' ? {} : { ...rawAccounts };
        let currentBookings = mode === 'replace' ? [] : [...rawBookings];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const idPrefix = mode === 'append' ? `add_${Date.now()}_${i}` : `f${i}_${Date.now()}`;
            const { accounts: newAccounts, bookings: newBookings } = await parseExcelFile(file, idPrefix);

            // Merge Logic
            Object.values(newAccounts).forEach(newAcc => {
                const existing = currentAccounts[newAcc.accountNumber];
                if (existing) {
                    existing.balance += newAcc.balance;
                    existing.bookings = [...existing.bookings, ...newAcc.bookings].sort((a,b) => a.rawDate - b.rawDate);
                    
                    // Merge yearly balances
                    Object.entries(newAcc.yearlyBalances).forEach(([year, amount]) => {
                        const y = parseInt(year);
                        existing.yearlyBalances[y] = (existing.yearlyBalances[y] || 0) + amount;
                    });
                } else {
                    currentAccounts[newAcc.accountNumber] = newAcc;
                }
            });
            currentBookings = [...currentBookings, ...newBookings];
        }

        setRawAccounts(currentAccounts);
        setRawBookings(currentBookings);
        
        if (mode === 'replace') setActiveTab('BILANZ');

    } catch (e) {
      console.error(e);
      alert("Fehler beim Verarbeiten der Dateien. Bitte prüfen Sie das Format.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files: File[]) => processFiles(files, 'replace');

  const handleAppendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          processFiles(Array.from(e.target.files), 'append');
      }
  };

  const handleReload = () => {
      setData(null);
      setRawAccounts({});
      setRawBookings([]);
      setCustomMapping({});
      setKpis(DEFAULT_KPIS);
      setActiveTab('BILANZ');
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors print:hidden whitespace-nowrap ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border-b-2 border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  // Helper for Header Columns in Bilanz/GuV - Updated width logic
  const HeaderColumns = () => (
      <div className="flex items-center justify-end font-semibold text-gray-500 text-sm mb-2 pr-4 min-w-max">
          {data?.years.map((year, idx) => (
              <React.Fragment key={year}>
                  <div className="w-32 text-right px-2">{year}</div>
                  {data?.years[idx + 1] && <div className="w-8"></div>}
              </React.Fragment>
          ))}
      </div>
  );
  
  // Logic to determine layout of Bilanz (stack if multiple years, side-by-side if single year)
  const bilanzGridClass = data && data.years.length > 1 
      ? "block space-y-8" 
      : "grid md:grid-cols-2 gap-8";

  return (
    <div className="min-h-screen pb-20 print:pb-0 print:bg-white text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-lg print:hidden">
        <div className="w-full max-w-[98%] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BilanzTool SKR04</h1>
            <p className="text-slate-400 text-sm mt-1">Jahresabschluss & Auswertung</p>
          </div>
          <div className="flex gap-3 items-center">
            {data && (
              <>
                 <button 
                  onClick={handleReload}
                  className="p-2 bg-slate-800 hover:bg-red-900/50 rounded text-slate-300 hover:text-white transition-colors"
                  title="Neu laden / Reset"
                >
                  <RefreshCw size={18} />
                </button>
                <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer border border-slate-700">
                   <FilePlus size={16} />
                   <span>Import (+)</span>
                   <input type="file" className="hidden" accept=".xlsx,.xls,.xlsm" multiple onChange={handleAppendFile} />
                </label>
                
                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <button 
                  onClick={() => setExpandAll(!expandAll)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  {expandAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {expandAll ? 'Einklappen' : 'Ausklappen'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  <Printer size={16} />
                  Drucken
                </button>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${data.bilanz.check.balanced ? 'bg-green-600' : 'bg-red-600'}`}>
                    {data.bilanz.check.balanced ? 'OK' : 'Diff'}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block p-8 pb-0">
         <h1 className="text-3xl font-bold mb-2">Jahresabschluss Auswertung</h1>
         <p className="text-gray-500">Erstellt am {new Date().toLocaleDateString()}</p>
         {data && (
             <div className="mt-2 text-sm text-gray-600">
                 Geschäftsjahre: {data.years.join(', ')}
             </div>
         )}
      </div>

      {/* Main Container - Updated to use wider percentage on large screens */}
      <main className="w-full max-w-[98%] mx-auto mt-8 px-4 print:mt-4 print:px-0 print:max-w-none">
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
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-amber-800">
                          {data.unassigned.length} nicht zugeordnete Konten gefunden
                        </h3>
                        <button 
                           onClick={() => setShowUnassignedDetails(!showUnassignedDetails)}
                           className="text-amber-700 hover:text-amber-900 text-xs underline font-semibold"
                        >
                           {showUnassignedDetails ? 'Verbergen' : 'Details anzeigen'}
                        </button>
                    </div>
                    
                    {showUnassignedDetails && (
                        <div className="mt-3 bg-white/50 rounded p-2 border border-amber-200 text-sm max-h-40 overflow-y-auto">
                           <p className="text-xs text-amber-800 mb-2">Bitte ordnen Sie diese Konten im Tab "Kontenplan" zu:</p>
                           <ul className="space-y-1">
                               {data.unassigned.map(acc => (
                                   <li key={acc.accountNumber} className="flex gap-2">
                                       <span className="font-mono font-bold text-amber-900">{acc.accountNumber}</span>
                                       <span className="text-amber-800 truncate">{acc.accountName}</span>
                                       <span className="text-amber-600 ml-auto tabular-nums">{acc.balance.toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</span>
                                   </li>
                               ))}
                           </ul>
                        </div>
                    )}
                    {!showUnassignedDetails && (
                         <div className="mt-1 text-xs text-amber-700">
                             Beispiele: {data.unassigned.slice(0, 5).map(a => a.accountNumber).join(', ')}...
                         </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-lg shadow-sm overflow-hidden mb-6 print:hidden overflow-x-auto">
              <TabButton id="BILANZ" icon={LayoutDashboard} label="Bilanz" />
              <TabButton id="GUV" icon={PieChart} label="GuV" />
              <TabButton id="KPI" icon={Calculator} label="KPI" />
              <TabButton id="SALDEN" icon={FileText} label="Summe/Salden" />
              <TabButton id="KONTEN" icon={Settings} label="Kontenplan" />
              <TabButton id="JOURNAL" icon={Table} label="Journal" />
            </div>

            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] print:border-0 print:shadow-none`}>
              
              {/* BILANZ VIEW */}
              <div className={activeTab === 'BILANZ' ? 'block' : 'hidden print:block'}>
                 <div className={`${bilanzGridClass} p-6 print:block print:p-8`}>
                  
                  {/* AKTIVA */}
                  <div className="space-y-4 print:mb-8 overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <div className="min-w-max">
                            <div className="flex justify-between items-end border-b pb-2">
                                <h3 className="text-lg font-bold text-gray-800">AKTIVA</h3>
                                <HeaderColumns />
                            </div>
                            <ReportTable 
                            data={data.bilanz.aktiva} 
                            onSelectAccount={setSelectedAccount} 
                            root 
                            forceExpanded={isPrinting || expandAll}
                            years={data.years}
                            />
                        </div>
                    </div>
                  </div>

                  {/* PASSIVA */}
                  <div className="space-y-4 print:break-before-page overflow-hidden">
                     <div className="overflow-x-auto pb-2">
                        <div className="min-w-max">
                            <div className="flex justify-between items-end border-b pb-2">
                                <h3 className="text-lg font-bold text-gray-800">PASSIVA</h3>
                                <HeaderColumns />
                            </div>
                            <ReportTable 
                            data={data.bilanz.passiva} 
                            onSelectAccount={setSelectedAccount} 
                            root 
                            forceExpanded={isPrinting || expandAll}
                            years={data.years}
                            />
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* GUV VIEW */}
              <div className={(activeTab === 'GUV' ? 'block' : 'hidden print:block print:break-before-page')}>
                <div className="p-6 w-full print:max-w-none print:p-8 overflow-x-auto">
                   <div className="min-w-max">
                        <h2 className="hidden print:block text-xl font-bold mb-4">Gewinn- und Verlustrechnung</h2>
                        
                        <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded border print:border-gray-300 min-w-max">
                            <span className="font-medium text-gray-700 mr-8">Jahresergebnis</span>
                            <div className="flex gap-8">
                                {data.years.map(y => (
                                    <div key={y} className="text-right w-32">
                                        <div className="text-xs text-gray-500 mb-1">{y}</div>
                                        <div className={`text-xl font-bold ${data.yearlyProfits[y] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.yearlyProfits[y].toLocaleString('de-DE', {style:'currency', currency:'EUR'})}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-2">
                            <HeaderColumns />
                        </div>
                        <ReportTable 
                            data={data.guv} 
                            onSelectAccount={setSelectedAccount} 
                            root 
                            forceExpanded={isPrinting || expandAll}
                            years={data.years}
                        />
                   </div>
                </div>
              </div>
              
              {/* KPI VIEW */}
              {activeTab === 'KPI' && (
                  <KPIBoard 
                    data={data} 
                    years={data.years}
                    kpis={kpis}
                    setKpis={setKpis}
                  />
              )}

              {/* SALDEN VIEW */}
              {activeTab === 'SALDEN' && (
                <div className="p-6">
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Suchen nach Nummer oder Name..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
                      value={saldenSearchTerm}
                      onChange={(e) => setSaldenSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="overflow-auto max-h-[650px]">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="p-3 w-20">Nr.</th>
                          <th className="p-3">Kontoname</th>
                          {data.years.map(y => (
                              <th key={y} className="p-3 text-right w-32">{y}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.values(data.accounts)
                          .filter(acc => 
                            acc.accountNumber.includes(saldenSearchTerm) || 
                            acc.accountName.toLowerCase().includes(saldenSearchTerm.toLowerCase())
                          )
                          .sort((a, b) => parseInt(a.accountNumber) - parseInt(b.accountNumber))
                          .map(acc => (
                            <tr 
                              key={acc.accountNumber} 
                              className="hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedAccount(acc)}
                            >
                              <td className="p-3 font-mono text-blue-700 font-medium">{acc.accountNumber}</td>
                              <td className="p-3 text-gray-800">{acc.accountName}</td>
                              {data.years.map(y => (
                                  <td key={y} className={`p-3 text-right font-mono w-32 tabular-nums ${(acc.yearlyBalances[y] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {(acc.yearlyBalances[y] || 0).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* KONTEN PLAN */}
              {activeTab === 'KONTEN' && (
                <div className="print:hidden">
                  <AccountManager 
                    accounts={rawAccounts} 
                    mapping={customMapping} 
                    onUpdateMapping={setCustomMapping} 
                  />
                </div>
              )}

              {/* JOURNAL */}
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