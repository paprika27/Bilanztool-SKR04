export interface Booking {
  id: string;
  date: string; // Formatiertes Datum
  rawDate: number; // Excel Serial Date für Sortierung
  beleg1: string;
  beleg2: string;
  text: string;
  konto: string;
  gegenkonto: string;
  soll: number;
  haben: number;
}

export interface AccountBalance {
  accountNumber: string;
  accountName: string;
  balance: number; // Positive = Soll-Lastig (Aktiva/Aufwand), Negative = Haben-Lastig (Passiva/Ertrag)
  bookings: Booking[];
}

export type AccountType = 'AKTIVA' | 'PASSIVA' | 'AUFWAND' | 'ERTRAG' | 'UNASSIGNED';

export interface FinancialReportItem {
  id: string;
  label: string;
  amount: number;
  level: number;
  children?: FinancialReportItem[];
  accounts?: AccountBalance[];
}

export interface FinancialData {
  guv: FinancialReportItem;
  bilanz: {
    aktiva: FinancialReportItem;
    passiva: FinancialReportItem;
    check: {
      diff: number;
      balanced: boolean;
    };
  };
  unassigned: AccountBalance[]; // NEU: Konten die nirgendwo hin passen (z.B. 9000 mit Saldo)
  journal: Booking[];
  accounts: Record<string, AccountBalance>;
  profit: number;
}

// Neu für Mapping
export interface CustomAccountMapping {
  [accountNumber: string]: {
    name?: string;
    structureId?: string; // ID aus structureDefs
  };
}

export interface StructureDefinition {
  id: string;
  label: string;
  parent?: string;
  type: 'AKTIVA' | 'PASSIVA' | 'GUV_ERTRAG' | 'GUV_AUFWAND' | 'ROOT';
  order: number;
}