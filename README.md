# 📊 BilanzTool SKR04

> Professional financial statement generator for German accounting standards (SKR04). Transform your Excel General Ledger into interactive Balance Sheet and P&L reports for instant error detection (without Buhl WISO / Lexware / DATEV subscription or having to wait to hear back from tax consultants).

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Instant Excel Import** – Upload DATEV-formatted Excel ledgers (see Hauptbuch.xlsx to get started) and get instant processing
- **Dual Financial Views** – Interactive Bilanz (Balance Sheet) and GuV (P&L Statement) with hierarchical drilling
- **Complete Account List** – Summe/Salden tab shows all accounts with balances and clickable details
- **Smart Account Mapping** – Visual account assignment tool
- **Real-time Balance Validation** – Automatic detection of discrepancies
- **Expandable Hierarchies** – Collapse/expand any or all detail levels
- **Complete Journal View** – Browse full transaction records with date, account, and amount details
- **Print-Ready Export** – Generate PDF-ready reports optimized for professional presentation

### 🔧 Advanced Features
- **Custom Account Assignment** – Override defaults with user-defined mappings
- **Unassigned Account Alerts** – Clear warnings for accounts not matching standard SKR04 structure
- **Account Details Panel** – Click any account to view full transaction history and details
- **German Localization** – All formatting follows DE standards (EUR currency, date format, decimal points)
- **Responsive Design** – Works seamlessly on desktop and tablet devices

---

## 🚀 Quick Start

Choose one of the two simple ways below. For most users, downloading a prebuilt installer is the easiest and recommended option.

### Option A — Installers (recommended, non-technical users)

- Go to the project's GitHub Releases page: `https://github.com/paprika27/Bilanztool-SKR04/releases`
- Download the installer for your platform from the latest Release assets.

- Windows: download the `*.exe` (NSIS) installer and run it — follow the on-screen installer steps.
  - If an `*.msi` is preferred you can also use that.
  - If a `*-portable.exe` is preferred you can use that.

- macOS: download the `*.dmg`, open it, and drag the app into `/Applications`.
  - Important: the macOS app may be unsigned (no Apple Developer key configured in CI). If macOS refuses to open it, right-click the app and choose Open, or run the quarantine removal command below.

- Linux (Debian/Ubuntu): download the `*.deb` package and either double-click it in your file manager or run:

```bash
sudo dpkg -i BilanzTool_SKR04_<version>_amd64.deb
sudo apt-get install -f
```

- Docker (alternative for advanced / server users): a prebuilt image is published to GitHub Container Registry (`ghcr.io/paprika27/bilanztool-skr04:latest`). Pull and run with:

```bash
docker pull ghcr.io/paprika27/bilanztool-skr04:latest
docker run --rm -p 3000:3000 ghcr.io/paprika27/bilanztool-skr04:latest
```

### Quick macOS Gatekeeper workaround (if app is blocked)

```bash
# Right-click the app and choose Open, or use this terminal command:
sudo xattr -r -d com.apple.quarantine /Applications/BilanzTool\ SKR04.app
```

### Option B — Run locally (developers / power users)

If you want to run the development server or build the web UI yourself, use Node.js. This is optional — regular users do not need to do this.

1. Install Node.js 18+ ([download](https://nodejs.org/)).
2. Clone the repo and install dependencies:

```bash
git clone https://github.com/paprika27/Bilanztool-SKR04.git
cd Bilanztool-SKR04
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser at `http://localhost:3000` (or the URL shown in the terminal).

---

## 📖 Usage Guide

### Step 1: Upload Your Ledger
1. Click the **"Datei wählen"** button on the welcome screen
2. Select your Excel file (SKR04 format, feel free to use Hauptbuch.xlsx as a template)
3. Wait for processing (typically <2 seconds)

### Step 2: Review the Balance Sheet
- **AKTIVA (Left)** and **PASSIVA (Right)** columns show your asset and liability structure
- Green badge shows "Bilanz ausgeglichen" (balanced) or displays the discrepancy amount
- Click any row to expand/collapse that section or view detailed accounts

### Step 3: Check the P&L Statement
- Switch to **GuV** tab to see revenue and expense breakdown
- Same expansion/collapse functionality for detailed drilling

### Step 4: View Complete Account List
- Switch to **Summe/Salden** tab to see all accounts with their balances in a sortable list
- Click any account row to view its full transaction details in the side panel
- Useful for quick account lookup and transaction analysis without the hierarchical structure

### Step 5: Handle Unmatched Accounts
- If yellow warning box appears, accounts couldn't be auto-mapped and may thus be unbalanced
- Switch to **Kontenplan** tab to assign these accounts to proper categories or fix in your excel ledger (usually more likely)
- Changes to mapping immediately recalculate all reports

### Step 6: Export & Print
- Click **"Export / Druck"** to trigger browser print dialog
- Tables automatically expand for complete PDF export
- Optimized layout for A4 paper with sometimes proper page breaks

### Bonus: Journal View
- Switch to **Journal** tab to audit individual transactions
- Browse full ledger with dates, accounts, and amounts
- Shows first 500 transactions (full data available in source Excel)

---

## 🏗️ Project Structure

```
Bilanztool-SKR04/
├── components/
│   ├── AccountDetails.tsx      # Transaction detail panel for selected account
│   ├── AccountManager.tsx       # UI for custom account mapping
│   ├── FileUpload.tsx           # File input and validation component
│   └── ReportTable.tsx          # Hierarchical expandable table renderer
├── services/
│   ├── excelService.ts          # XLSX parsing and account extraction
│   └── skr04Service.ts          # SKR04 mapping and financial report generation
├── App.tsx                      # Main application layout and state management
├── types.ts                     # TypeScript interfaces for financial data
├── index.tsx                    # React DOM entry point
├── vite.config.ts               # Vite build configuration
└── package.json                 # Dependencies and scripts
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 19.2+ |
| **Language** | TypeScript | 5.8+ |
| **Build Tool** | Vite | 6.2+ |
| **Excel Processing** | XLSX | 0.18+ |
| **Icons** | Lucide React | 0.556+ |
| **Styling** | Tailwind CSS | 3.x |

---

## 📊 How It Works

### 1. **Excel Parsing** (`excelService.ts`)
- Extracts account master data and transaction journal from DATEV compatible Excel ledger
- Calculates running balances per account
- Handles German date formats and decimal conventions

### 2. **SKR04 Mapping** (`skr04Service.ts`)
- Maps parsed accounts to German SKR04 standard chart of accounts
- Categories: AKTIVA, PASSIVA, AUFWAND (expense), ERTRAG (revenue)
- Builds hierarchical reporting structure with totals
- Validates balance sheet equilibrium
- Supports custom user overrides via mapping tool

### 3. **Interactive UI** (React Components)
- Hierarchical table with state-managed expansion
- Drill-down from totals → subtotals → detail accounts → transactions
- Dynamic recalculation when mappings change
- Print mode forces all expansions for complete export

---

## ⚙️ Configuration

### Environment Variables
The app requires no environment configuration. All processing happens client-side.

### Build for Production
```bash
npm run build
```
Outputs optimized bundle to `dist/` directory. Ready to deploy to any static hosting (Vercel, Netlify, etc.).

### Preview Production Build
```bash
npm run preview
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Empty page on `npm run dev`** | Ensure `index.tsx` script tag is in `index.html` |
| **Excel won't upload** | File must be DATEV SKRIB04 format with standard column headers. Copy your data into the provided Hauptbuch.xlsx template and try with that. |
| **Bilanz not balanced** | Check yellow warning box for unassigned accounts; map them in Kontenplan tab or fix your ledger (more likely) |
| **Wrong account categories** | Use Kontenplan tab to override auto-mapping for specific accounts |
| **Print looks wrong** | Use "Export / Druck" button which properly expands all sections |
| **Sums seem weird** | Throw your ledger at a (private) LLM to see if it can help. |

---

## 📋 SKR04 Standard Reference

This tool implements the German **Skontrorahmen 04** (SKR04) chart of accounts structure:

- **0xxxx** – Fixed assets
- **1xxxx** – Current assets  
- **2xxxx** – Equity
- **3xxxx** – Liabilities
- **4xxxx** – Revenue
- **5xxxx** – Cost of sales
- **6xxxx** – Operating expenses
- **7xxxx** – Other income/expenses
- **8xxxx** – Tax and profit allocation
- **9xxxx** – Internal/clearing accounts

---

## 🤝 Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request!

---

## 📦 Packaging & Releases

This repository builds desktop installers (Windows `.exe`, Linux `.deb`, macOS `.dmg`) and a Docker image via GitHub Actions. The CI workflows are defined in `.github/workflows/rust.yml` (builds the native bundles and creates the Release) and `.github/workflows/publish-ghcr.yml` (builds & pushes a Docker image to GitHub Container Registry).

This repository builds desktop installers and several distributable bundle types via GitHub Actions. The relevant CI workflows are:

- `.github/workflows/rust.yml` — builds native bundles on Linux, Windows and macOS runners and creates the GitHub Release (collects artifacts from the build matrix).
- `.github/workflows/publish-ghcr.yml` — builds and pushes the Docker image to GitHub Container Registry (GHCR).

CI-produced artifacts and recommended usage:

- **Docker (GHCR):** `ghcr.io/<owner>/bilanztool-skr04:latest` (see `publish-ghcr.yml`). Pull & run:

```bash
docker pull ghcr.io/paprika27/bilanztool-skr04:latest
docker run --rm -p 3000:3000 ghcr.io/paprika27/bilanztool-skr04:latest
```

- **Windows**
  - `.exe` (NSIS setup): Standard installer for end users — run the installer and follow prompts.
  - `.msi`: Enterprise-friendly installer suitable for automated deployments via SCCM or other management tools.
  - `*-portable.exe` (portable): Standalone executable that runs without installation — place it in a folder and run directly.

- **macOS**
  - `.dmg`: Standard disk image installer — open and drag the app to `/Applications`.
  - `.app.tar.gz`: A compressed `.app` bundle (useful for advanced/manual installation or advanced users who want the raw app bundle). GitHub Release contains a compressed `.app` because Releases do not accept folders.
  - Note: I do NOT have an Apple Developer signing key configured in CI. Unsigned `.dmg`/`.app` bundles may be blocked by Gatekeeper. If macOS prevents opening the app, the user can right-click the app and choose Open, or run the quarantine removal workaround.

- **Linux**
  - `.deb`: Debian/Ubuntu installer — install via `dpkg -i` or double-click in a file manager.
  - `.rpm`: RPM package for Fedora/Red Hat/SUSE family distributions.
  - `.AppImage`: A portable, distro-agnostic single-file executable great for many desktop Linux users.

All of the above artifacts are attached to the GitHub Release by the `create-release` job in `rust.yml` (the job uploads everything found under the `release-assets` folder). The release body generated by CI includes a simple table describing each file type and recommended audience.

Example install / run commands (copy-paste):

```bash
# Debian/Ubuntu
sudo dpkg -i BilanzTool_SKR04_<version>_amd64.deb
sudo apt-get install -f

# Run portable Windows exe (on Windows PowerShell / cmd just run the .exe)
# Docker (Linux/any):
docker run --rm -p 3000:3000 ghcr.io/paprika27/bilanztool-skr04:latest
```

macOS Gatekeeper workaround (if app is blocked):

```bash
# Right-click the app and choose Open, or use:
sudo xattr -r -d com.apple.quarantine /Applications/BilanzTool\ SKR04.app
```

Where to get releases
- Visit the project's Releases page on GitHub: `https://github.com/paprika27/Bilanztool-SKR04/releases` and download the platform-appropriate file(s) listed in the assets.

## 📄 License

Vibe coded by Gemini 3 Pro, enhanced by Claude Haiku 4.5 (which also wrote this Readme).

---

## 💡 Tips & Tricks

- **Quick Overview:** Use the "Alle ausklappen / einklappen" toggle in the header to show/hide all detail levels instantly
- **Account Drill-Down:** Click any account in the hierarchical table to view its complete transaction history
- **Print Strategy:** Use browser's print settings (margins, scaling) to adjust PDF output before saving
- **Data Privacy:** All processing happens locally in your browser – no data is sent to any server
- **Spreadsheet Format:** Ensure your Excel export matches DATEV standard format before uploading

---

## 📞 Support

For questions or issues specific to SKR04 accounting standards, consult:
- [DATEV Documentation](https://www.datev.de/)
- German Chamber of Commerce accounting guidelines

---

**Built with ❤️ for German business professionals**
