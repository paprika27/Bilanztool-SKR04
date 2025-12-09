import React, { useState } from 'react';
import { Download, Upload, Save, Search } from 'lucide-react';
import { AccountBalance, CustomAccountMapping, StructureDefinition } from '../types';
import { structureDefs } from '../services/skr04Service';

interface Props {
  accounts: Record<string, AccountBalance>;
  mapping: CustomAccountMapping;
  onUpdateMapping: (newMapping: CustomAccountMapping) => void;
}

const AccountManager: React.FC<Props> = ({ accounts, mapping, onUpdateMapping }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Flache Liste aller Konten
  const accountList = (Object.values(accounts) as AccountBalance[]).sort((a, b) => parseInt(a.accountNumber) - parseInt(b.accountNumber));
  
  // Filter
  const filtered = accountList.filter(acc => 
    acc.accountNumber.includes(searchTerm) || 
    acc.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNameChange = (id: string, newName: string) => {
    const current = mapping[id] || {};
    onUpdateMapping({
      ...mapping,
      [id]: { ...current, name: newName }
    });
  };

  const handleStructureChange = (id: string, newStructId: string) => {
    const current = mapping[id] || {};
    onUpdateMapping({
      ...mapping,
      [id]: { ...current, structureId: newStructId }
    });
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kontenplan_mapping.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        onUpdateMapping(parsed);
        alert('Mapping erfolgreich geladen!');
      } catch (err) {
        alert('Fehler beim Laden der Datei.');
      }
    };
    reader.readAsText(file);
  };

  // Liste der Kategorien für Dropdown, gruppiert nach Root
  const categories = structureDefs.filter(d => d.type !== 'ROOT');

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Kontenplan bearbeiten</h2>
        <div className="flex gap-2">
           <button onClick={handleExportJson} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
             <Download size={16} /> Export JSON
           </button>
           <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 cursor-pointer">
             <Upload size={16} /> Import JSON
             <input type="file" className="hidden" accept=".json" onChange={handleImportJson} />
           </label>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Suchen nach Nummer oder Name..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto max-h-[600px] border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 w-24 font-bold">Nr.</th>
              <th className="p-3 font-bold">Bezeichnung</th>
              <th className="p-3 font-bold">Zuordnung (Bilanz/GuV)</th>
              <th className="p-3 text-right font-bold">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.slice(0, 100).map(acc => {
               const mapEntry = mapping[acc.accountNumber] || {};
               const currentName = mapEntry.name || acc.accountName;
               const currentStruct = mapEntry.structureId || ''; // Leer = Auto

               return (
                 <tr key={acc.accountNumber} className="hover:bg-gray-50">
                   <td className="p-3 font-mono text-gray-600 font-medium">{acc.accountNumber}</td>
                   <td className="p-3">
                     <input 
                       type="text" 
                       value={currentName}
                       onChange={(e) => handleNameChange(acc.accountNumber, e.target.value)}
                       className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent text-gray-900 font-medium placeholder-gray-400"
                       placeholder={acc.accountName}
                     />
                   </td>
                   <td className="p-3">
                     <select 
                       value={currentStruct} 
                       onChange={(e) => handleStructureChange(acc.accountNumber, e.target.value)}
                       className="w-full p-1 border-gray-200 rounded text-xs text-gray-700 bg-white"
                     >
                       <option value="">(Automatisch)</option>
                       {categories.map(c => (
                         <option key={c.id} value={c.id}>
                           {c.label} ({c.type})
                         </option>
                       ))}
                     </select>
                   </td>
                   <td className={`p-3 text-right font-mono font-medium ${acc.balance < 0 ? 'text-red-600' : 'text-green-700'}`}>
                     {acc.balance.toLocaleString('de-DE', {minimumFractionDigits: 2})}
                   </td>
                 </tr>
               );
            })}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div className="p-2 text-center text-xs text-gray-400">Suche nutzen, um mehr Ergebnisse zu sehen.</div>
        )}
      </div>
    </div>
  );
};

export default AccountManager;