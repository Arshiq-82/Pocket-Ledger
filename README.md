# Pocket Ledger — React Expense Tracker

A responsive personal finance dashboard built with React + Vite. It supports adding, editing and deleting income and expense transactions, category tagging, date/type/category filters, search, monthly summaries, charts, CSV export and browser-local persistence.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
1. Extract the project ZIP.
2. Open a terminal in the `expense-tracker` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Production build
```bash
npm run build
npm run preview
```

## Features
- Dashboard summary: current-month net cash flow, income, expenses and savings rate.
- Transaction CRUD: create, edit and delete income or expenses.
- Categories appropriate to income and expense entries.
- Search by title, category or note; filter by date range, type and category.
- Six-month income/expense trend and monthly expense category breakdown.
- Export the currently filtered results as CSV.
- Persists transactions in browser `localStorage` under `pocket-ledger-transactions-v1`.
- Responsive desktop, tablet and mobile layouts.
- Includes starter/demo transactions on first run. Use **Reset sample data** at the bottom to restore them.

## Notes
- This is a frontend-only project; it does not require a backend server or API key.
- Data is stored only in the current browser on the current device. Clearing browser site data or using another browser/device will not carry transactions over.
- Charts use Recharts; icons use Lucide React. Google Fonts is optional and falls back to local sans-serif fonts if unavailable.
