import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, List, ArrowLeft, ArrowUpLeft, ArrowDownLeft } from 'lucide-react';
import { FinancialReportItem, AccountBalance } from '../types';

interface Props {
  data: FinancialReportItem;
  onSelectAccount: (acc: AccountBalance) => void;
  root?: boolean;
  level?: number;
  forceExpanded?: boolean;
  years: number[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
};

// Exporting for use in KPIBoard
export const DynamicTrendIcon = ({ current, prev }: { current: number, prev: number }) => {
  if (prev === 0 && current === 0) return <span className="w-6 text-center text-gray-300">-</span>;
  if (prev === 0) return <span className="w-6 text-center text-gray-300" title="Neu im aktuellen Jahr">•</span>; 
  
  const diff = current - prev;
  const percent = prev !== 0 ? Math.abs(diff / prev) * 100 : 0;
  
  const isPositive = diff > 0;
  
  // Color based on Math
  const colorClass = Math.abs(diff) < 1 
    ? "bg-gray-300" 
    : isPositive 
      ? "bg-green-500" 
      : "bg-red-500";

  if (Math.abs(diff) < 1) {
      return (
        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center" title="Keine Veränderung">
            <ArrowLeft size={12} className="text-white" />
        </div>
      );
  }

  return (
    <div 
        className={`w-5 h-5 rounded-full ${colorClass} flex items-center justify-center shadow-sm`} 
        title={`${isPositive ? '+' : ''}${formatCurrency(diff)} (${percent.toFixed(1)}%)`}
    >
      {isPositive ? (
          <ArrowUpLeft size={12} className="text-white" />
      ) : (
          <ArrowDownLeft size={12} className="text-white" />
      )}
    </div>
  );
};

const ReportTable: React.FC<Props> = ({ data, onSelectAccount, root = false, level = 0, forceExpanded = false, years }) => {
  const [localExpanded, setLocalExpanded] = useState(root || level < 1);
  const expanded = forceExpanded || localExpanded;

  if (!root && Math.abs(data.amount) < 0.01 && (!data.children || data.children.length === 0) && (!data.accounts || data.accounts.length === 0)) {
     // Check historical years too
     const hasHistory = years.some(y => Math.abs(data.yearlyAmounts[y] || 0) > 0.01);
     if (!hasHistory) return null;
  }

  const hasChildren = (data.children && data.children.length > 0) || (data.accounts && data.accounts.length > 0);
  
  const isTotalRow = root || level === 0;
  const isSubTotal = level === 1;
  
  const rowClass = isTotalRow 
    ? "bg-slate-100 font-bold border-b border-white text-slate-900 print:bg-gray-100 print:border-gray-300" 
    : isSubTotal 
      ? "bg-gray-50 font-semibold text-gray-800 border-b border-gray-100 print:bg-white print:border-gray-200"
      : "hover:bg-gray-50 text-gray-700 print:hover:bg-transparent";

  const paddingLeft = level * 1.5 + 1; // rem
  
  return (
    <div className="w-full break-inside-avoid min-w-max">
      <div 
        className={`flex items-center py-2 pr-2 cursor-pointerXB transition-colors ${rowClass}`}
        onClick={() => setLocalExpanded(!localExpanded)}
      >
        {/* LABEL COLUMN - Sticky left on small screens could be added, but kept simple for now */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-[300px]" style={{ paddingLeft: `${paddingLeft}rem` }}>
          {hasChildren ? (
            <span className="text-gray-400 print:hidden flex-shrink-0">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          ) : <span className="w-4 print:hidden flex-shrink-0" />} 
          
          <span className="truncate" title={data.label}>{data.label}</span>
        </div>

        {/* YEAR COLUMNS */}
        <div className="flex items-center justify-end flex-shrink-0">
          {years.map((year, idx) => {
             const val = data.yearlyAmounts[year] || 0;
             const prevYear = years[idx + 1];
             const prevVal = prevYear ? (data.yearlyAmounts[prevYear] || 0) : null;
             
             return (
               <React.Fragment key={year}>
                 <div className={`w-32 text-right font-mono px-2 tabular-nums ${val < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(val)}
                 </div>
                 {/* Trend Icon between columns */}
                 {prevVal !== null && (
                    <div className="w-8 flex justify-center items-center">
                       <DynamicTrendIcon current={val} prev={prevVal} />
                    </div>
                 )}
               </React.Fragment>
             );
          })}
        </div>
      </div>

      {expanded && (
        <div>
          {data.children?.map(child => (
            <ReportTable 
              key={child.id} 
              data={child} 
              onSelectAccount={onSelectAccount} 
              level={level + 1}
              forceExpanded={forceExpanded}
              years={years}
            />
          ))}
          
          {data.accounts?.map((acc) => (
            <div 
              key={acc.accountNumber} 
              className="flex items-center py-1.5 pr-2 border-l-2 border-transparent hover:bg-blue-50 hover:border-blue-500 cursor-pointer text-sm group print:hover:bg-transparent print:border-l-0"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(acc);
              }}
            >
              <div className="flex-1 flex items-center gap-3 text-gray-600 group-hover:text-blue-700 print:text-gray-600 overflow-hidden min-w-[300px]"
                   style={{ paddingLeft: `${paddingLeft + 1.5}rem` }}>
                <List size={12} className="text-gray-300 group-hover:text-blue-400 print:hidden flex-shrink-0" />
                <span className="font-mono bg-white border border-gray-200 px-1 rounded text-xs text-gray-600 print:border-gray-300">{acc.accountNumber}</span>
                <span className="truncate">{acc.accountName}</span>
              </div>
              
              <div className="flex items-center justify-end flex-shrink-0">
                {years.map((year, idx) => {
                   const val = acc.yearlyBalances[year] || 0;
                   const prevYear = years[idx + 1];
                   const prevVal = prevYear ? (acc.yearlyBalances[prevYear] || 0) : null;

                   return (
                     <React.Fragment key={year}>
                       <span className={`w-32 text-right font-mono text-xs px-2 tabular-nums ${val < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                         {formatCurrency(val)}
                       </span>
                       {prevVal !== null && (
                          <div className="w-8 flex justify-center items-center">
                             <DynamicTrendIcon current={val} prev={prevVal} />
                          </div>
                       )}
                     </React.Fragment>
                   );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportTable;