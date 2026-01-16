import * as XLSX from 'xlsx';
import { Booking, AccountBalance } from '../types';

// Helper to parse German formatted numbers or standard floats
const parseAmount = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    let clean = val.trim();
    if (clean === '') return 0;
    // Check if German format (1.234,56) or US (1,234.56)
    if (clean.includes(',') && clean.includes('.')) {
      if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
        // German: dot is thousand, comma is decimal
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // US: comma is thousand
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      // Assume comma is decimal
      clean = clean.replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }
  return 0;
};

// Normalize Account Number (remove leading zeros)
const normAcc = (val: any): string => {
  if (!val) return '0';
  const s = String(val).replace(/'/g, '').trim();
  return s.replace(/^0+/, '') || '0';
};

// Excel Serial Date to JS Date String (DD.MM.YYYY)
const parseDate = (val: any): { display: string, raw: number, year: number } => {
  if (!val) return { display: '', raw: 0, year: 0 };
  
  // Wenn es bereits ein String ist (z.B. "01.01.2024")
  if (typeof val === 'string' && val.includes('.')) {
    const parts = val.split('.');
    const year = parts.length === 3 ? parseInt(parts[2]) : 0;
    return { display: val, raw: 0, year }; 
  }

  // Excel Serial Date
  const serial = parseInt(val);
  if (!isNaN(serial) && serial > 10000) {
    // Excel base date correction (approximate)
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    
    const day = String(date_info.getDate()).padStart(2, '0');
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const year = date_info.getFullYear();
    
    return { display: `${day}.${month}.${year}`, raw: serial, year };
  }
  
  return { display: String(val), raw: 0, year: 0 };
};

export const parseExcelFile = async (file: File, idPrefix: string = ''): Promise<{ bookings: Booking[], accounts: Record<string, AccountBalance> }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const bookings: Booking[] = [];
        const accounts: Record<string, AccountBalance> = {};

        // Helper to get or create account
        const getAccount = (num: string): AccountBalance => {
          const id = normAcc(num);
          if (!accounts[id]) {
            accounts[id] = {
              accountNumber: id,
              accountName: `Konto ${id}`,
              balance: 0,
              yearlyBalances: {},
              bookings: []
            };
          }
          return accounts[id];
        };

        // Helper to find column key dynamically (case insensitive)
        const findKey = (row: any, search: string) => {
          return Object.keys(row).find(k => k.toLowerCase().includes(search.toLowerCase()));
        };

        let rowIdx = 0;
        for (const row of jsonData as any[]) {
          rowIdx++;
          // Identify columns dynamically
          const kKonto = findKey(row, 'konto') && !findKey(row, 'gegen') ? findKey(row, 'konto') : 'Kontonummer';
          const kGegen = findKey(row, 'gegen') || 'Gegenkontonummer';
          const kSoll = findKey(row, 'soll') || 'Soll-Betrag';
          const kHaben = findKey(row, 'haben') || 'Haben-Betrag';
          const kText = findKey(row, 'text') || 'Text';
          const kDatum = findKey(row, 'datum') || 'Datum';
          const kBeleg1 = findKey(row, 'beleg') || 'Belegnummer 1';

          const kontoRaw = row[kKonto!] || '';
          const sollRaw = row[kSoll!] || 0;
          const habenRaw = row[kHaben!] || 0;

          if (!kontoRaw && !sollRaw && !habenRaw) continue;

          const soll = parseAmount(sollRaw);
          const haben = parseAmount(habenRaw);
          const konto = normAcc(kontoRaw);
          const gegenkonto = normAcc(row[kGegen!] || '');
          const dateObj = parseDate(row[kDatum!]);

          // ID muss bei Append unique sein
          const uniqueId = idPrefix ? `${idPrefix}-row-${rowIdx}` : `row-${rowIdx}`;

          const booking: Booking = {
            id: uniqueId,
            date: dateObj.display,
            rawDate: dateObj.raw,
            year: dateObj.year,
            text: String(row[kText!] || ''),
            beleg1: String(row[kBeleg1!] || ''),
            beleg2: '',
            konto,
            gegenkonto,
            soll,
            haben
          };

          bookings.push(booking);

          // Update Account Balances
          const mainAcc = getAccount(konto);
          const val = soll - haben;
          mainAcc.balance += val;
          mainAcc.yearlyBalances[booking.year] = (mainAcc.yearlyBalances[booking.year] || 0) + val;
          mainAcc.bookings.push(booking);

          if (gegenkonto && gegenkonto !== '0') {
            const contraAcc = getAccount(gegenkonto);
            const contraSoll = haben; 
            const contraHaben = soll;
            const contraVal = contraSoll - contraHaben;
            
            contraAcc.balance += contraVal;
            contraAcc.yearlyBalances[booking.year] = (contraAcc.yearlyBalances[booking.year] || 0) + contraVal;
            
            // Add a mirror booking for reference
            contraAcc.bookings.push({
              ...booking,
              id: `${uniqueId}-mirror`,
              konto: gegenkonto,
              gegenkonto: konto,
              soll: contraSoll,
              haben: contraHaben
            });
          }
        }
        
        // Sort bookings per account by date
        Object.values(accounts).forEach(acc => {
          acc.bookings.sort((a, b) => a.rawDate - b.rawDate);
        });

        resolve({ bookings, accounts });

      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });
};
