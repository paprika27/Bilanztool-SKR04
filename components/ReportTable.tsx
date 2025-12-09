import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, List } from 'lucide-react';
import { FinancialReportItem, AccountBalance } from '../types';

interface Props {
  data: FinancialReportItem;
  onSelectAccount: (acc: AccountBalance) => void;
  root?: boolean;
  level?: number;
  forceExpanded?: boolean;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
};

const ReportTable: React.FC<Props> = ({ data, onSelectAccount, root = false, level = 0, forceExpanded = false }) => {
  const [localExpanded, setLocalExpanded] = useState(root || level < 1);
  
  // Combine local state with forced print state
  const expanded = forceExpanded || localExpanded;

  // Verstecke Items ohne Wert und ohne Unterelemente, es sei denn es ist Root
  if (!root && Math.abs(data.amount) < 0.01 && (!data.children || data.children.length === 0) && (!data.accounts || data.accounts.length === 0)) {
     return null;
  }

  const hasChildren = (data.children && data.children.length > 0) || (data.accounts && data.accounts.length > 0);
  
  // Styling basierend auf Level
  const isTotalRow = root || level === 0;
  const isSubTotal = level === 1;
  
  const rowClass = isTotalRow 
    ? "bg-slate-100 font-bold border-b border-white text-slate-900 print:bg-gray-100 print:border-gray-300" 
    : isSubTotal 
      ? "bg-gray-50 font-semibold text-gray-800 border-b border-gray-100 print:bg-white print:border-gray-200"
      : "hover:bg-gray-50 text-gray-700 print:hover:bg-transparent";

  const paddingLeft = level * 1.5 + 1; // rem

  return (
    <div className="w-full break-inside-avoid">
      <div 
        className={`flex items-center justify-between py-2 pr-4 cursor-pointer transition-colors ${rowClass}`}
        style={{ paddingLeft: `${paddingLeft}rem` }}
        onClick={() => setLocalExpanded(!localExpanded)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <span className="text-gray-400 print:hidden">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          ) : <span className="w-4 print:hidden" />} 
          
          <span>{data.label}</span>
        </div>
        <span className={`font-mono ${data.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatCurrency(data.amount)}
        </span>
      </div>

      {expanded && (
        <div>
          {/* Unterkategorien rekursiv */}
          {data.children?.map(child => (
            <ReportTable 
              key={child.id} 
              data={child} 
              onSelectAccount={onSelectAccount} 
              level={level + 1}
              forceExpanded={forceExpanded}
            />
          ))}
          
          {/* Einzelkonten */}
          {data.accounts?.map((acc) => (
            <div 
              key={acc.accountNumber} 
              className="flex items-center justify-between py-1.5 pr-4 border-l-2 border-transparent hover:bg-blue-50 hover:border-blue-500 cursor-pointer text-sm group print:hover:bg-transparent print:border-l-0"
              style={{ paddingLeft: `${paddingLeft + 1.5}rem` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(acc);
              }}
            >
              <div className="flex items-center gap-3 text-gray-600 group-hover:text-blue-700 print:text-gray-600">
                <List size={12} className="text-gray-300 group-hover:text-blue-400 print:hidden" />
                <span className="font-mono bg-white border border-gray-200 px-1 rounded text-xs text-gray-600 print:border-gray-300">{acc.accountNumber}</span>
                <span>{acc.accountName}</span>
              </div>
              <span className={`font-mono text-xs ${acc.balance < 0 ? 'text-red-600' : 'text-gray-700'}`}>{formatCurrency(acc.balance)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportTable;