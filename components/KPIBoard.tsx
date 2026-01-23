import React, { useState, useMemo } from 'react';
import { FinancialData, KPIDefinition } from '../types';
import { structureDefs } from '../services/skr04Service';
import { DynamicTrendIcon } from './ReportTable';
import { Download, Upload, Plus, Trash2, Calculator, Info, Hash, FolderTree, GripVertical } from 'lucide-react';

interface Props {
  data: FinancialData;
  years: number[];
  kpis: KPIDefinition[];
  setKpis: React.Dispatch<React.SetStateAction<KPIDefinition[]>>;
}

interface Suggestion {
  id: string;
  label: string;
  type: 'structure' | 'account';
}

const KPIBoard: React.FC<Props> = ({ data, years, kpis, setKpis }) => {
  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  
  // Autocomplete State
  const [activeKpiId, setActiveKpiId] = useState<string | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  // Prepare suggestions list (memoized)
  const allSuggestions = useMemo<Suggestion[]>(() => {
     const struct: Suggestion[] = structureDefs
       .filter(d => d.type !== 'ROOT') 
       .map(d => ({ id: d.id, label: d.label, type: 'structure' }));
     
     const accounts: Suggestion[] = Object.values(data.accounts).map(a => ({
       id: a.accountNumber,
       label: a.accountName,
       type: 'account'
     }));

     return [...struct, ...accounts];
  }, [data]);

  const filteredSuggestions = useMemo(() => {
    if (!activeKpiId) return [];
    
    // If the user just typed '{{', query is empty but we should show suggestions
    if (suggestionQuery === '') {
        return allSuggestions.slice(0, 50); // Show top 50 matches initially
    }

    const q = suggestionQuery.toLowerCase();
    return allSuggestions
      .filter(s => s.id.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
      .slice(0, 10);
  }, [allSuggestions, suggestionQuery, activeKpiId]);

  const handleInputCheck = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
      const val = e.target.value;
      const pos = e.target.selectionStart || 0;
      updateKPI(id, 'formula', val);
      setCursorPos(pos);
      setActiveKpiId(id);

      const textBeforeCursor = val.slice(0, pos);
      // Regex modified: matches {{ followed by anything (including empty string) until end of string or closing brace
      const match = textBeforeCursor.match(/\{\{([^}]*)$/);
      
      if (match) {
          setSuggestionQuery(match[1]);
      } else {
          setActiveKpiId(null);
      }
  };

  const handleSuggestionClick = (suggestion: Suggestion, kpiId: string, currentFormula: string) => {
      // Re-find the split point
      const textBeforeCursor = currentFormula.slice(0, cursorPos);
      const lastOpen = textBeforeCursor.lastIndexOf('{{');
      
      if (lastOpen !== -1) {
          const prefix = currentFormula.slice(0, lastOpen);
          const suffix = currentFormula.slice(cursorPos);
          const newFormula = `${prefix}{{${suggestion.id}}}${suffix}`;
          updateKPI(kpiId, 'formula', newFormula);
      }
      setActiveKpiId(null);
  };
  
  const getStructureValue = (id: string, year: number): number => {
    const findInTree = (item: any): number | null => {
      if (item.id === id) return item.yearlyAmounts[year] || 0;
      if (item.children) {
        for (const child of item.children) {
          const res = findInTree(child);
          if (res !== null) return res;
        }
      }
      return null;
    };

    let val = findInTree(data.bilanz.aktiva) ?? 
              findInTree(data.bilanz.passiva) ?? 
              findInTree(data.guv);
    
    if (val !== null) return val;

    const acc = data.accounts[id];
    if (acc) {
      return acc.yearlyBalances[year] || 0;
    }

    return 0;
  };

  const evaluateFormula = (formula: string, year: number): number | null => {
    try {
      const parsedFormula = formula.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, id) => {
        return String(getStructureValue(id, year));
      });
      
      if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(parsedFormula)) return null;
      
      // eslint-disable-next-line no-new-func
      return new Function(`return (${parsedFormula})`)();
    } catch (e) {
      return null;
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(kpis, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", dataStr);
    node.setAttribute("download", "kpi_definitions.json");
    document.body.appendChild(node);
    node.click();
    node.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
            setKpis(parsed);
        } else {
            alert('Ungültiges Format');
        }
      } catch (err) {
        alert('Fehler beim Laden');
      }
    };
    reader.readAsText(file);
  };

  const addKPI = () => {
    const newId = `custom_${Date.now()}`;
    setKpis([...kpis, { id: newId, label: 'Neue Kennzahl', formula: '', format: 'number' }]);
  };

  const updateKPI = (id: string, field: keyof KPIDefinition, value: string) => {
    setKpis(kpis.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const deleteKPI = (id: string) => {
    if (confirm('Kennzahl wirklich löschen?')) {
      setKpis(kpis.filter(k => k.id !== id));
    }
  };

  const formatValue = (val: number | null, format: string) => {
    if (val === null || isNaN(val) || !isFinite(val)) return '-';
    if (format === 'currency') return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
    if (format === 'percent') return new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 1 }).format(val / 100);
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(val);
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(index));
    
    const row = (e.target as HTMLElement).closest('tr');
    if (row) {
        e.dataTransfer.setDragImage(row, 0, 0);
    }
  };

  const onDragOverRow = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedIdx !== null && draggedIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const performDrop = (dropIndex: number) => {
      if (draggedIdx === null || draggedIdx === dropIndex) return;
      
      const newKpis = [...kpis];
      const [draggedItem] = newKpis.splice(draggedIdx, 1);
      newKpis.splice(dropIndex, 0, draggedItem);
      
      setKpis(newKpis);
      setDraggedIdx(null);
      setDragOverIdx(null);
  };

  const onDropRow = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    performDrop(index);
  };

  const structureVars = structureDefs.filter(d => d.type !== 'ROOT').map(d => ({ id: d.id, label: d.label }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="text-blue-600" /> 
          KPI Dashboard
        </h2>
        <div className="flex gap-2">
           <button onClick={addKPI} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
             <Plus size={16} /> Neu
           </button>
           <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700">
             <Download size={16} /> Export
           </button>
           <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 cursor-pointer">
             <Upload size={16} /> Import
             <input type="file" className="hidden" accept=".json" onChange={handleImport} />
           </label>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 text-sm text-blue-800 rounded-lg flex items-start gap-3">
         <Info className="flex-shrink-0 mt-0.5" size={18} />
         <div className="w-full">
            <p className="font-semibold mb-1">Formel-Hilfe:</p>
            <p className="mb-2">Tippen Sie <code>{'{{'}</code> um Werte auszuwählen. Verfügbare Variablen:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 max-h-32 overflow-y-auto bg-blue-100/50 p-2 rounded border border-blue-200 text-xs font-mono">
                {structureVars.map(v => (
                    <div key={v.id} className="truncate" title={v.label}>
                        <span className="font-bold">{`{{${v.id}}}`}</span> <span className="text-blue-600/70">- {v.label}</span>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-xs text-blue-600">Zusätzlich können alle Kontonummern verwendet werden (z.B. <code>{'{{4400}}'}</code>).</p>
         </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left border-separate border-spacing-0">
          <thead>
            <tr className="text-gray-500">
              <th className="py-3 px-2 w-8 border-b-2 border-gray-200"></th>
              <th className="py-3 pl-2 w-1/3 border-b-2 border-gray-200">Kennzahl / Formel</th>
              {years.map((year, idx) => (
                <React.Fragment key={year}>
                    <th className="py-3 px-2 text-right w-32 border-b-2 border-gray-200">{year}</th>
                    {years[idx+1] && <th className="py-3 px-2 w-8 border-b-2 border-gray-200"></th>}
                </React.Fragment>
              ))}
              <th className="py-3 px-2 w-10 border-b-2 border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, index) => {
              const isDragging = draggedIdx === index;
              const isDraggedOver = dragOverIdx === index;
              const isActive = activeKpiId === kpi.id;
              
              // Calculate visual offset
              let transformStyle = {};
              let opacityClass = 'opacity-100';

              if (isDragging) {
                  opacityClass = 'opacity-40'; 
              } else if (draggedIdx !== null && dragOverIdx !== null) {
                  if (draggedIdx < dragOverIdx) {
                       if (index > draggedIdx && index <= dragOverIdx) {
                           transformStyle = { transform: 'translateY(-100%)' };
                       }
                  } else if (draggedIdx > dragOverIdx) {
                       if (index >= dragOverIdx && index < draggedIdx) {
                           transformStyle = { transform: 'translateY(100%)' };
                       }
                  }
              }
              
              // Z-Index Logic: Active row gets super high index to float dropdown over subsequent rows
              const zIndexStyle = { zIndex: isActive ? 50 : 10 };

              // Apply transition to content Wrapper DIV, NOT the TD itself.
              // This ensures the TD remains in place as a hit target for the drop event.
              const wrapperClass = `border-b border-gray-100 transition-transform duration-300 ease-in-out bg-white ${opacityClass} relative w-full h-full flex items-center`;

              return (
              <tr 
                key={kpi.id} 
                className={`group align-top ${isDraggedOver ? 'bg-blue-50' : ''}`}
                onDragOver={(e) => onDragOverRow(e, index)}
                onDrop={(e) => onDropRow(e, index)}
              >
                {/* Drag Handle Column */}
                <td className="p-0 border-b-0 align-top h-1">
                    <div className={`${wrapperClass} py-4 px-2 justify-center`} style={{...transformStyle, ...zIndexStyle}}>
                        <div 
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnd={onDragEnd}
                        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 drag-handle"
                        >
                            <GripVertical size={20} />
                        </div>
                    </div>
                </td>
                
                <td className="p-0 border-b-0 align-top h-1">
                   <div className={`${wrapperClass} py-4 pl-2 block`} style={{...transformStyle, ...zIndexStyle}}>
                        <div className="space-y-2 relative w-full">
                            <input 
                                type="text" 
                                value={kpi.label} 
                                onChange={(e) => updateKPI(kpi.id, 'label', e.target.value)}
                                className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 w-full outline-none transition-colors"
                            />
                            <div className="flex gap-2 items-center relative">
                                <input 
                                    type="text" 
                                    value={kpi.formula} 
                                    onChange={(e) => handleInputCheck(e, kpi.id)}
                                    onBlur={() => setTimeout(() => setActiveKpiId(null), 200)}
                                    className="font-mono text-xs text-gray-700 bg-white p-2 rounded border border-gray-300 w-full focus:border-blue-500 outline-none shadow-sm transition-colors"
                                    placeholder="Formel eingeben..."
                                />
                                <select 
                                    value={kpi.format}
                                    onChange={(e) => updateKPI(kpi.id, 'format', e.target.value as any)}
                                    className="text-xs border rounded p-2 bg-white text-gray-700 border-gray-300 outline-none focus:border-blue-500"
                                >
                                    <option value="currency">€</option>
                                    <option value="percent">%</option>
                                    <option value="number">#</option>
                                </select>

                                {isActive && filteredSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 w-full max-w-md bg-white border border-gray-200 rounded shadow-xl z-[100] max-h-60 overflow-y-auto">
                                        {filteredSuggestions.map(s => (
                                            <div 
                                                key={s.id} 
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group/item border-b border-gray-50 last:border-0"
                                                onClick={() => handleSuggestionClick(s, kpi.id, kpi.formula)}
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {s.type === 'structure' ? <FolderTree size={14} className="text-blue-500 flex-shrink-0" /> : <Hash size={14} className="text-gray-400 flex-shrink-0" />}
                                                    <span className="font-medium text-gray-800 truncate">{s.label}</span>
                                                </div>
                                                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 rounded ml-2 whitespace-nowrap">{s.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                   </div>
                </td>
                {years.map((y, idx) => {
                    const res = evaluateFormula(kpi.formula, y);
                    const prevYear = years[idx + 1];
                    const prevRes = prevYear ? evaluateFormula(kpi.formula, prevYear) : null;
                    
                    return (
                        <React.Fragment key={y}>
                            <td className="p-0 border-b-0 align-top h-1">
                                <div className={`${wrapperClass} py-4 px-2 justify-end font-mono text-base font-medium text-gray-900 tabular-nums`} style={{...transformStyle, ...zIndexStyle}}>
                                    {formatValue(res, kpi.format)}
                                </div>
                            </td>
                            {prevRes !== null && (
                                <td className="p-0 border-b-0 align-top h-1">
                                    <div className={`${wrapperClass} py-4 px-0 justify-center`} style={{...transformStyle, ...zIndexStyle}}>
                                        <DynamicTrendIcon current={res || 0} prev={prevRes || 0} />
                                    </div>
                                </td>
                            )}
                        </React.Fragment>
                    );
                })}
                <td className="p-0 border-b-0 align-top h-1">
                    <div className={`${wrapperClass} py-4 px-2 justify-end`} style={{...transformStyle, ...zIndexStyle}}>
                        <button onClick={() => deleteKPI(kpi.id)} className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-gray-100 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {kpis.length === 0 && <div className="text-center text-gray-400 py-10">Keine Kennzahlen definiert.</div>}
      </div>
    </div>
  );
};

export default KPIBoard;