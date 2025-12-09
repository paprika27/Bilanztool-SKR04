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

  // Klasse 9 (Vortragskonten) und Klasse 8 (Statistik) oder ungültige
  // werden HIER nicht mehr automatisch zugeordnet.
  // Das sorgt dafür, dass 9000 etc. als "Unassigned" zurückkommen.
  return null;
};

export const generateFinancialReport = (
  accounts: Record<string, AccountBalance>,
  customMapping?: CustomAccountMapping
): FinancialData => {
  const accountList = Object.values(accounts);
  const unassignedAccounts: AccountBalance[] = [];
  
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
      level: def.parent ? 1 : 0,
      children: [],
      accounts: []
    });
  });

  accountList.forEach(acc => {
    if (Math.abs(acc.balance) < 0.01) return;

    const structId = mapAccountToStructure(acc.accountNumber, customMapping);
    
    // Wenn keine Zuordnung gefunden wurde (z.B. Konto 9000), kommt es in die Fehlerliste
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
    
    let displayAmount = acc.balance;
    if (def.type === 'PASSIVA' || def.type === 'GUV_ERTRAG') {
      displayAmount = -acc.balance;
    }

    item.accounts = item.accounts || [];
    item.accounts.push({ ...acc, balance: displayAmount });
    item.amount += displayAmount;
  });

  const rootItems: Record<string, FinancialReportItem> = {};
  let totalProfit = 0;
  let rawGuvBalance = 0;

  structureDefs.forEach(def => {
    if (def.type === 'GUV_ERTRAG' || def.type === 'GUV_AUFWAND') {
        const item = itemMap.get(def.id);
        if (item && item.accounts) {
             item.accounts.forEach(acc => {
                 const isInverted = (def.type === 'GUV_ERTRAG');
                 const originalBalance = isInverted ? -acc.balance : acc.balance;
                 rawGuvBalance += originalBalance;
             });
        }
    }
  });
  
  totalProfit = -rawGuvBalance;

  const resultItem = itemMap.get('ek_ergebnis');
  if (resultItem) {
      resultItem.amount = totalProfit;
      resultItem.accounts = [{
          accountNumber: 'JÜ', 
          accountName: totalProfit >= 0 ? 'Jahresüberschuss' : 'Jahresfehlbetrag', 
          balance: totalProfit, 
          bookings: []
      }];
  }

  structureDefs.forEach(def => {
    const item = itemMap.get(def.id)!;
    if (def.parent) {
      const parent = itemMap.get(def.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
        parent.amount += item.amount;
      }
    } else {
      rootItems[def.id] = item;
    }
  });

  const calculateTotals = (item: FinancialReportItem): number => {
      if (item.children && item.children.length > 0) {
          const childrenSum = item.children.reduce((acc, child) => acc + calculateTotals(child), 0);
          const ownAccountsSum = item.accounts ? item.accounts.reduce((a, b) => a + b.balance, 0) : 0;
          item.amount = childrenSum + ownAccountsSum;
          return item.amount;
      }
      return item.amount;
  };

  Object.values(rootItems).forEach(root => calculateTotals(root));

  // Check Logic:
  // Aktiva = Positiv
  // Passiva = Positiv (dargestellt), aber logisch Haben.
  // Wenn Konto 9000 (Soll 500) fehlt, dann fehlt es in Aktiva oder Passiva.
  // Double Entry Check: Summe aller Balances muss 0 sein.
  // Wenn unassignedAccounts Balances haben, ist Summe der zugewiesenen != 0.
  
  const aktivaSum = rootItems['aktiva_root'].amount;
  const passivaSum = rootItems['passiva_root'].amount;
  
  // Diff ist normalerweise (Aktiva - Passiva). 
  // Da Passiva hier als positiver Wert angezeigt wird (z.B. 1000 Aktiva, 1000 Passiva),
  // ist die Differenz Aktiva - Passiva.
  // Wenn Konto 9000 (Soll 100) unassigned ist, fehlt es bei Aktiva (theoretisch) oder bläht Passiva nicht auf.
  // Summe aller Accounts + Unassigned = 0.
  
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
    profit: totalProfit
  };
};