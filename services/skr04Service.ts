import { AccountBalance, FinancialData, FinancialReportItem, StructureDefinition, CustomAccountMapping } from '../types';

export const structureDefs: StructureDefinition[] = [
  // --- BILANZ AKTIVA ---
  { id: 'aktiva_root', label: 'AKTIVA', type: 'ROOT', order: 1 },
  { id: 'av', label: 'A. Anlagevermögen', parent: 'aktiva_root', type: 'AKTIVA', order: 10 },
  { id: 'av_immat', label: 'I. Immaterielle Vermögensgegenstände', parent: 'av', type: 'AKTIVA', order: 11 },
  { id: 'av_sach', label: 'I. Sachanlagen', parent: 'av', type: 'AKTIVA', order: 12 },
  { id: 'av_finanz', label: 'II. Finanzanlagen', parent: 'av', type: 'AKTIVA', order: 13 },
  
  { id: 'uv', label: 'B. Umlaufvermögen', parent: 'aktiva_root', type: 'AKTIVA', order: 20 },
  { id: 'uv_vorrat', label: 'I. Vorräte', parent: 'uv', type: 'AKTIVA', order: 21 },
  { id: 'uv_ford', label: 'II. Forderungen und sonstige Vermögensgegenstände', parent: 'uv', type: 'AKTIVA', order: 22 },
  { id: 'uv_kasse', label: 'III. Kassenbestand, Guthaben bei Kreditinstituten', parent: 'uv', type: 'AKTIVA', order: 23 },
  
  { id: 'rap_akt', label: 'C. Rechnungsabgrenzungsposten', parent: 'aktiva_root', type: 'AKTIVA', order: 30 },

  // --- BILANZ PASSIVA ---
  { id: 'passiva_root', label: 'PASSIVA', type: 'ROOT', order: 2 },
  { id: 'ek', label: 'A. Eigenkapital', parent: 'passiva_root', type: 'PASSIVA', order: 10 },
  { id: 'ek_kapital', label: 'I. Kapitalanteile', parent: 'ek', type: 'PASSIVA', order: 11 },
  { id: 'ek_vortrag', label: 'II. Gewinn-/Verlustvortrag', parent: 'ek', type: 'PASSIVA', order: 12 },
  { id: 'ek_ergebnis', label: 'III. Jahresergebnis', parent: 'ek', type: 'PASSIVA', order: 99 }, 

  { id: 'rs', label: 'B. Rückstellungen', parent: 'passiva_root', type: 'PASSIVA', order: 20 },
  { id: 'verb', label: 'C. Verbindlichkeiten', parent: 'passiva_root', type: 'PASSIVA', order: 30 },
  { id: 'rap_pass', label: 'D. Rechnungsabgrenzungsposten', parent: 'passiva_root', type: 'PASSIVA', order: 40 },

  // --- GuV (GKV) ---
  { id: 'guv_root', label: 'Gewinn- und Verlustrechnung', type: 'ROOT', order: 3 },
  
  // Ertrag
  { id: 'umsatz', label: '1. Umsatzerlöse', parent: 'guv_root', type: 'GUV_ERTRAG', order: 10 },
  { id: 'bestandsva', label: '2. Bestandsveränderungen', parent: 'guv_root', type: 'GUV_ERTRAG', order: 20 },
  { id: 'sonst_ertrag', label: '3. Sonstige betriebliche Erträge', parent: 'guv_root', type: 'GUV_ERTRAG', order: 30 },
  
  // Aufwand
  { id: 'material', label: '4. Materialaufwand', parent: 'guv_root', type: 'GUV_AUFWAND', order: 40 },
  { id: 'personal', label: '5. Personalaufwand', parent: 'guv_root', type: 'GUV_AUFWAND', order: 50 },
  { id: 'abschr', label: '6. Abschreibungen', parent: 'guv_root', type: 'GUV_AUFWAND', order: 60 },
  
  { id: 'sonst_aufw', label: '7. Sonstige betriebliche Aufwendungen', parent: 'guv_root', type: 'GUV_AUFWAND', order: 70 },
  { id: 'sonst_aufw_raum', label: 'a) Raumkosten', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 71 },
  { id: 'sonst_aufw_vers', label: 'b) Versicherungen, Beiträge', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 72 },
  { id: 'sonst_aufw_kfz', label: 'c) Fahrzeugkosten', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 73 },
  { id: 'sonst_aufw_werb', label: 'd) Werbe- und Reisekosten', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 74 },
  { id: 'sonst_aufw_rep', label: 'e) Reparaturen/Instandhaltung', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 75 },
  { id: 'sonst_aufw_rest', label: 'f) Übrige betriebliche Aufwendungen', parent: 'sonst_aufw', type: 'GUV_AUFWAND', order: 79 },

  { id: 'zinsen', label: '8. Zinsen und ähnliche Aufwendungen', parent: 'guv_root', type: 'GUV_AUFWAND', order: 80 },
  { id: 'steuern_er', label: '9. Steuern vom Einkommen und Ertrag', parent: 'guv_root', type: 'GUV_AUFWAND', order: 90 },
  { id: 'steuern_sonst', label: '10. Sonstige Steuern', parent: 'guv_root', type: 'GUV_AUFWAND', order: 100 },
];

const n = (acc: string) => parseInt(acc, 10);

const mapAccountToStructure = (accountNum: string, mapping?: CustomAccountMapping): string | null => {
  // 1. Check Custom Mapping
  if (mapping && mapping[accountNum] && mapping[accountNum].structureId) {
    return mapping[accountNum].structureId!;
  }

  // 2. Default SKR04 Logic
  const num = n(accountNum);
  if (isNaN(num)) return null;

  // --- AKTIVA (Klasse 0 und 1) ---
  if (num >= 100 && num < 200) return 'av_immat';
  if (num >= 200 && num < 700) return 'av_sach';
  if (num >= 700 && num < 1000) return 'av_finanz';

  if (num >= 1000 && num < 1200) return 'uv_vorrat';
  if ((num >= 1200 && num < 1600) || (num >= 10000 && num < 70000)) return 'uv_ford';
  if (num >= 1600 && num < 1900) return 'uv_kasse';

  if (num >= 1900 && num < 2000) return 'rap_akt';

  // --- PASSIVA (Klasse 2 und 3, sowie Kreditoren 70000+) ---
  if (num >= 2000 && num < 2900) return 'ek_kapital';
  if (num >= 2900 && num < 2980) return 'ek_vortrag';
  
  if (num >= 3000 && num < 3150) return 'rs';

  if ((num >= 3200 && num < 3900) || (num >= 70000 && num <= 99999)) return 'verb';
  
  if (num >= 3900 && num < 4000) return 'rap_pass';

  // --- GuV ERTRAG (Klasse 4) ---
  const umsatzSpecials = [4105, 4106, 4107, 4108];
  if (umsatzSpecials.includes(num) || (num >= 4100 && num < 4500)) return 'umsatz';
  if (num >= 4800 && num < 4830) return 'bestandsva';
  if ((num >= 4830 && num < 5000) || num === 5730) return 'sonst_ertrag';

  // --- GuV AUFWAND (Klasse 5, 6, 7) ---
  if (num >= 5000 && num < 6000) return 'material';
  if (num >= 6000 && num < 6200) return 'personal';
  if (num >= 6200 && num < 6300) return 'abschr';

  // Sonstige betriebliche Aufwendungen (Klasse 6 Detail)
  if (num >= 6300 && num < 7000) {
    const raum = [6315, 6320, 6325, 6330, 6345, 6350];
    if (raum.includes(num) || (num >= 6310 && num <= 6350)) return 'sonst_aufw_raum';

    const vers = [6400, 6420, 6436, 6437];
    if (vers.includes(num) || (num >= 6400 && num < 6440)) return 'sonst_aufw_vers';
    
    const rep = [6450, 6460, 6490];
    if (rep.includes(num) || (num >= 6450 && num < 6495)) return 'sonst_aufw_rep';

    // Fahrzeugkosten
    if (num >= 6500 && num < 6600) return 'sonst_aufw_kfz';

    // Werbung & Reise (66xx typisch SKR04 für Werbung/Reise)
    if (num >= 6600 && num < 6700) return 'sonst_aufw_werb';

    // Der Rest von Klasse 6 (und hohe 6xxx) ist "Übrige betriebliche"
    return 'sonst_aufw_rest';
  }

  // Zinsen & Steuern (Klasse 7)
  if (num >= 7300 && num < 7400) return 'zinsen';
  if (num >= 7600 && num < 7650) return 'steuern_er';
  if (num >= 7000 && num < 8000) return 'steuern_sonst';

  return null;
};

export const generateFinancialReport = (
  accounts: Record<string, AccountBalance>,
  customMapping?: CustomAccountMapping
): FinancialData => {
  const accountList = Object.values(accounts);
  const unassignedAccounts: AccountBalance[] = [];
  
  // Sammle alle vorhandenen Jahre
  const allYearsSet = new Set<number>();
  accountList.forEach(acc => {
    Object.keys(acc.yearlyBalances).forEach(y => allYearsSet.add(parseInt(y)));
  });
  // Sortiere Jahre absteigend (aktuellstes zuerst)
  const years = Array.from(allYearsSet).sort((a, b) => b - a);

  // Update Account Names based on mapping
  if (customMapping) {
    Object.keys(customMapping).forEach(accNum => {
      const mapping = customMapping[accNum];
      if (accounts[accNum] && mapping.name) {
        accounts[accNum].accountName = mapping.name;
      }
    });
  }
  
  const itemMap = new Map<string, FinancialReportItem>();
  
  structureDefs.forEach(def => {
    itemMap.set(def.id, {
      id: def.id,
      label: def.label,
      amount: 0,
      yearlyAmounts: {},
      level: def.parent ? 1 : 0,
      children: [],
      accounts: []
    });
  });

  accountList.forEach(acc => {
    if (Math.abs(acc.balance) < 0.01 && Object.values(acc.yearlyBalances).every(v => Math.abs(v) < 0.01)) return;

    const structId = mapAccountToStructure(acc.accountNumber, customMapping);
    
    if (!structId) {
      unassignedAccounts.push(acc);
      return;
    }

    const item = itemMap.get(structId);
    if (!item) {
      unassignedAccounts.push(acc);
      return;
    }

    const def = structureDefs.find(d => d.id === structId);
    if (!def) return;
    
    const displayAccount = { ...acc, yearlyBalances: { ...acc.yearlyBalances } };
    
    // Invert logic for Passiva/Ertrag
    if (def.type === 'PASSIVA' || def.type === 'GUV_ERTRAG') {
      displayAccount.balance = -displayAccount.balance;
      years.forEach(y => {
        if (displayAccount.yearlyBalances[y]) {
          displayAccount.yearlyBalances[y] = -displayAccount.yearlyBalances[y];
        }
      });
    }

    item.accounts = item.accounts || [];
    item.accounts.push(displayAccount);
    
    // Accumulate Item Totals
    item.amount += displayAccount.balance;
    years.forEach(y => {
        item.yearlyAmounts[y] = (item.yearlyAmounts[y] || 0) + (displayAccount.yearlyBalances[y] || 0);
    });
  });

  const rootItems: Record<string, FinancialReportItem> = {};
  let totalProfit = 0;
  const yearlyProfits: Record<number, number> = {};

  // Calculate Raw GuV Profits
  structureDefs.forEach(def => {
    if (def.type === 'GUV_ERTRAG' || def.type === 'GUV_AUFWAND') {
        const item = itemMap.get(def.id);
        if (item && item.accounts) {
             item.accounts.forEach(acc => {
                 const isInverted = (def.type === 'GUV_ERTRAG');
                 // Original balance needed for profit calc (Earnings - Expenses)
                 // Note: Account balance is already inverted in loop above if type is PASSIVA/ERTRAG.
                 // Wait, above we did: displayAccount.balance = -acc.balance for ERTRAG.
                 // So acc.balance in item.accounts IS POSITIVE for Revenue.
                 // Profit = Revenue (pos) - Expense (pos).
                 // But wait, in SKR04: Revenue is Credit (Haben) -> Negative in Excel. 
                 // We inverted it to display positive.
                 // Expenses are Debit (Soll) -> Positive in Excel.
                 // So Profit = DisplayRevenue - DisplayExpense.
                 
                 // However, simpler approach: Sum up original raw balances. 
                 // Revenue (Neg) + Expense (Pos) = Result (Neg = Profit, Pos = Loss).
                 // We want Profit as positive number usually.
                 
                 // Let's use the raw accounts from input to be safe, but we are iterating mapped items.
                 // Revert the inversion for profit calc:
                 const displayBal = acc.balance; 
                 const rawBal = isInverted ? -displayBal : displayBal; // Back to raw
                 // Actually, let's look at `acc.balance` in `item.accounts`.
                 // If `def.type === 'GUV_ERTRAG'`, we did `val = -val`.
                 // So `acc.balance` is positive revenue.
                 // If `def.type === 'GUV_AUFWAND'`, we did nothing. `acc.balance` is positive expense.
                 
                 // Total Profit = Revenue - Expense.
                 if (def.type === 'GUV_ERTRAG') {
                     totalProfit += acc.balance;
                     years.forEach(y => {
                         yearlyProfits[y] = (yearlyProfits[y] || 0) + (acc.yearlyBalances[y] || 0);
                     });
                 } else {
                     totalProfit -= acc.balance;
                     years.forEach(y => {
                         yearlyProfits[y] = (yearlyProfits[y] || 0) - (acc.yearlyBalances[y] || 0);
                     });
                 }
             });
        }
    }
  });

  const resultItem = itemMap.get('ek_ergebnis');
  if (resultItem) {
      resultItem.amount = totalProfit;
      resultItem.yearlyAmounts = yearlyProfits;
      
      resultItem.accounts = [{
          accountNumber: 'JÜ', 
          accountName: 'Jahresüberschuss / -fehlbetrag', 
          balance: totalProfit, 
          yearlyBalances: yearlyProfits,
          bookings: []
      }];
  }

  // Build Tree
  structureDefs.forEach(def => {
    const item = itemMap.get(def.id)!;
    if (def.parent) {
      const parent = itemMap.get(def.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
        parent.amount += item.amount;
        years.forEach(y => {
            parent.yearlyAmounts[y] = (parent.yearlyAmounts[y] || 0) + (item.yearlyAmounts[y] || 0);
        });
      }
    } else {
      rootItems[def.id] = item;
    }
  });

  const calculateTotals = (item: FinancialReportItem): void => {
      if (item.children && item.children.length > 0) {
          let sum = 0;
          const yearSums: Record<number, number> = {};
          
          item.children.forEach(child => {
              calculateTotals(child);
              sum += child.amount;
              years.forEach(y => {
                  yearSums[y] = (yearSums[y] || 0) + (child.yearlyAmounts[y] || 0);
              });
          });
          
          // Add own accounts if any (usually root nodes don't have accounts directly, but hybrids might)
          if (item.accounts) {
             item.accounts.forEach(acc => {
                 sum += acc.balance;
                 years.forEach(y => {
                    yearSums[y] = (yearSums[y] || 0) + (acc.yearlyBalances[y] || 0);
                 });
             });
          }

          item.amount = sum;
          item.yearlyAmounts = yearSums;
      }
  };

  Object.values(rootItems).forEach(root => calculateTotals(root));

  const aktivaSum = rootItems['aktiva_root'].amount;
  const passivaSum = rootItems['passiva_root'].amount;
  
  return {
    guv: rootItems['guv_root'],
    bilanz: {
      aktiva: rootItems['aktiva_root'],
      passiva: rootItems['passiva_root'],
      check: {
        diff: aktivaSum - passivaSum,
        balanced: Math.abs(aktivaSum - passivaSum) < 0.05
      }
    },
    unassigned: unassignedAccounts,
    accounts: accounts,
    journal: [],
    profit: totalProfit,
    yearlyProfits: yearlyProfits,
    years: years
  };
};
