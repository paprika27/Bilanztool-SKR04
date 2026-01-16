export interface Booking {
  id: string;
  date: string; // Formatiertes Datum
  rawDate: number; // Excel Serial Date für Sortierung
  year: number; // NEU: Jahr der Buchung
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
  balance: number; // Gesamtsaldo (Legacy/Aktuelles Jahr)
  yearlyBalances: Record<number, number>; // NEU: Saldo pro Jahr
  bookings: Booking[];
}

export type AccountType = 'AKTIVA' | 'PASSIVA' | 'AUFWAND' | 'ERTRAG' | 'UNASSIGNED';

export interface FinancialReportItem {
  id: string;
  label: string;
  amount: number; // Gesamtsaldo (Legacy/Aktuelles Jahr)
  yearlyAmounts: Record<number, number>; // NEU: Saldo pro Jahr
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
  unassigned: AccountBalance[];
  journal: Booking[];
  accounts: Record<string, AccountBalance>;
  profit: number; // Legacy
  yearlyProfits: Record<number, number>; // NEU
  years: number[]; // Liste der verfügbaren Jahre (sortiert absteigend)
}

export interface CustomAccountMapping {
  [accountNumber: string]: {
    name?: string;
    structureId?: string; 
  };
}

export interface StructureDefinition {
  id: string;
  label: string;
  parent?: string;
  type: 'AKTIVA' | 'PASSIVA' | 'GUV_ERTRAG' | 'GUV_AUFWAND' | 'ROOT';
  order: number;
}

export interface KPIDefinition {
  id: string;
  label: string;
  formula: string; // z.B. "{{umsatz}} - {{personal}}"
  format: 'currency' | 'percent' | 'number';
}
