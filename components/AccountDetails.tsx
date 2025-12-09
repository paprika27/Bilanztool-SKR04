import React, { useEffect } from 'react';
import { AccountBalance } from '../types';
import { X } from 'lucide-react';

interface Props {
  account: AccountBalance;
  onClose: () => void;
}

const AccountDetails: React.FC<Props> = ({ account, onClose }) => {
  // Schließen bei ESC-Taste
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Klick auf Hintergrund schließt
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Klick im Modal verhindert Schließen
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded font-mono">
                {account.accountNumber}
              </span>
              <h2 className="text-xl font-bold text-gray-800">{account.accountName}</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">Detailansicht der Buchungen</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 border-b">Datum</th>
                <th className="p-4 border-b">Beleg</th>
                <th className="p-4 border-b">Gegenkonto</th>
                <th className="p-4 border-b w-1/3">Text</th>
                <th className="p-4 border-b text-right">Soll</th>
                <th className="p-4 border-b text-right">Haben</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.bookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="p-3 pl-4 whitespace-nowrap font-mono text-gray-600">{b.date}</td>
                  <td className="p-3 text-gray-600 group-hover:text-gray-900">{b.beleg1}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{b.gegenkonto}</td>
                  <td className="p-3 text-gray-700 max-w-xs truncate" title={b.text}>{b.text}</td>
                  <td className="p-3 text-right font-mono text-gray-700">
                    {b.soll !== 0 ? b.soll.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}
                  </td>
                  <td className="p-3 pr-4 text-right font-mono text-gray-700">
                    {b.haben !== 0 ? b.haben.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {account.bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p>Keine Einzelbuchungen vorhanden.</p>
              <p className="text-xs">(Möglicherweise nur Saldenvortrag)</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end items-center gap-4 rounded-b-xl">
            <span className="text-gray-600 font-medium">Endsaldo:</span>
            <span className={`text-xl font-bold font-mono ${account.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {account.balance.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}
            </span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;