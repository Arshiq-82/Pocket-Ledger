import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import {
  ArrowDownLeft, ArrowUpRight, CalendarDays, ChartNoAxesCombined, ChevronDown,
  CircleHelp, CreditCard, Download, Filter, LayoutDashboard, ListFilter, Plus,
  Search, Settings2, Sparkles, Trash2, TrendingUp, Wallet, X, Pencil, Check,
  Coffee, Car, ShoppingBag, House, HeartPulse, GraduationCap, BriefcaseBusiness,
  Banknote, Utensils, Plane, Gift, CircleDollarSign, MoreHorizontal
} from 'lucide-react';

const STORAGE_KEY = 'pocket-ledger-transactions-v1';
const CATEGORIES = {
  expense: [
    { name: 'Food & Dining', color: '#f59e0b', icon: Utensils },
    { name: 'Transport', color: '#3b82f6', icon: Car },
    { name: 'Shopping', color: '#a78bfa', icon: ShoppingBag },
    { name: 'Housing', color: '#14b8a6', icon: House },
    { name: 'Health', color: '#fb7185', icon: HeartPulse },
    { name: 'Education', color: '#818cf8', icon: GraduationCap },
    { name: 'Bills & Utilities', color: '#64748b', icon: CreditCard },
    { name: 'Travel', color: '#06b6d4', icon: Plane },
    { name: 'Entertainment', color: '#ec4899', icon: Gift },
    { name: 'Other', color: '#94a3b8', icon: MoreHorizontal },
  ],
  income: [
    { name: 'Salary', color: '#10b981', icon: BriefcaseBusiness },
    { name: 'Freelance', color: '#3b82f6', icon: LaptopIcon },
    { name: 'Business', color: '#8b5cf6', icon: TrendingUp },
    { name: 'Investment', color: '#f59e0b', icon: ChartNoAxesCombined },
    { name: 'Gift', color: '#ec4899', icon: Gift },
    { name: 'Other', color: '#94a3b8', icon: MoreHorizontal },
  ]
};
function LaptopIcon(props) { return <Banknote {...props} />; }
const COLORS = ['#6d5dfc', '#21b8a6', '#f5a524', '#f16c91', '#4f8df7', '#a78bfa', '#64748b', '#06b6d4', '#ec4899', '#94a3b8'];
const todayISO = () => new Date().toISOString().slice(0, 10);
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const formatDate = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const monthLabel = (date) => new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
const seedTransactions = () => {
  const now = new Date();
  const day = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  return [
    { id: 'seed-1', title: 'Monthly salary', amount: 48000, type: 'income', category: 'Salary', date: day(1), note: 'Monthly pay' },
    { id: 'seed-2', title: 'Groceries', amount: 1850, type: 'expense', category: 'Food & Dining', date: day(1), note: 'Weekly groceries' },
    { id: 'seed-3', title: 'Cab rides', amount: 640, type: 'expense', category: 'Transport', date: day(2), note: '' },
    { id: 'seed-4', title: 'Freelance project', amount: 6500, type: 'income', category: 'Freelance', date: day(4), note: 'Website work' },
    { id: 'seed-5', title: 'Internet bill', amount: 999, type: 'expense', category: 'Bills & Utilities', date: day(5), note: '' },
    { id: 'seed-6', title: 'Coffee with friends', amount: 420, type: 'expense', category: 'Food & Dining', date: day(6), note: '' },
    { id: 'seed-7', title: 'Gym membership', amount: 1800, type: 'expense', category: 'Health', date: day(9), note: 'Monthly plan' },
    { id: 'seed-8', title: 'Online course', amount: 1200, type: 'expense', category: 'Education', date: day(11), note: '' },
    { id: 'seed-9', title: 'Business sale', amount: 3200, type: 'income', category: 'Business', date: day(13), note: '' },
    { id: 'seed-10', title: 'New sneakers', amount: 2499, type: 'expense', category: 'Shopping', date: day(16), note: '' },
  ];
};
function loadTransactions() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch { /* use starter data */ }
  return seedTransactions();
}
function CategoryIcon({ category, type, size = 17 }) {
  const item = [...CATEGORIES.expense, ...CATEGORIES.income].find((c) => c.name === category);
  const Icon = item?.icon || CircleDollarSign;
  return <span className="category-icon" style={{ color: item?.color || (type === 'income' ? '#10b981' : '#64748b'), background: `${item?.color || '#94a3b8'}18` }}><Icon size={size} strokeWidth={2.1} /></span>;
}
function App() {
  const [transactions, setTransactions] = useState(loadTransactions);
  const [activeNav, setActiveNav] = useState('Overview');
  const [range, setRange] = useState('This month');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food & Dining', date: todayISO(), note: '' });

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch { /* storage may be disabled */ } }, [transactions]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);

  const monthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => { const d = new Date(`${t.date}T00:00:00`); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  }, [transactions]);
  const totals = useMemo(() => {
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses, savings: income ? Math.max(0, ((income - expenses) / income) * 100) : 0 };
  }, [monthTransactions]);

  const filtered = useMemo(() => {
    const now = new Date();
    const startWeek = new Date(now); startWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); startWeek.setHours(0, 0, 0, 0);
    return [...transactions].filter((t) => {
      const d = new Date(`${t.date}T00:00:00`);
      let inRange = true;
      if (range === 'This month') inRange = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      else if (range === 'This week') inRange = d >= startWeek && d <= now;
      else if (range === 'Last 30 days') { const start = new Date(now); start.setDate(now.getDate() - 29); start.setHours(0,0,0,0); inRange = d >= start && d <= now; }
      else if (range === 'All time') inRange = true;
      return inRange && (typeFilter === 'all' || t.type === typeFilter) && (categoryFilter === 'all' || t.category === categoryFilter) && `${t.title} ${t.category} ${t.note || ''}`.toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [transactions, range, typeFilter, categoryFilter, search]);

  const trendData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const list = transactions.filter(t => { const td = new Date(`${t.date}T00:00:00`); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear(); });
      return { month: monthLabel(d), Income: list.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0), Expenses: list.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0) };
    });
  }, [transactions]);
  const categoryData = useMemo(() => {
    const sums = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => { sums[t.category] = (sums[t.category] || 0) + Number(t.amount); });
    return Object.entries(sums).map(([name, value]) => ({ name, value })).sort((a,b) => b.value-a.value);
  }, [monthTransactions]);

  function openAdd(type = 'expense') {
    setEditing(null);
    setForm({ title: '', amount: '', type, category: type === 'income' ? 'Salary' : 'Food & Dining', date: todayISO(), note: '' });
    setModalOpen(true);
  }
  function openEdit(t) { setEditing(t.id); setForm({ ...t, amount: String(t.amount) }); setModalOpen(true); }
  function updateForm(key, value) {
    setForm(old => ({ ...old, [key]: value, ...(key === 'type' ? { category: value === 'income' ? 'Salary' : 'Food & Dining' } : {}) }));
  }
  function saveTransaction(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return;
    const entry = { ...form, title: form.title.trim(), amount, note: form.note.trim(), id: editing || `txn-${Date.now()}-${Math.random().toString(36).slice(2,7)}` };
    setTransactions(old => editing ? old.map(t => t.id === editing ? entry : t) : [entry, ...old]);
    setModalOpen(false); setToast(editing ? 'Transaction updated successfully' : 'Transaction added successfully');
  }
  function deleteTransaction(id) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    setTransactions(old => old.filter(t => t.id !== id)); setToast('Transaction deleted');
  }
  function exportCSV() {
    const rows = [['Date','Title','Type','Category','Amount (INR)','Note'], ...filtered.map(t => [t.date, t.title, t.type, t.category, t.amount, t.note || ''])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'pocket-ledger-transactions.csv'; a.click(); URL.revokeObjectURL(url); setToast('CSV exported');
  }
  function resetDemo() {
    if (!window.confirm('Restore the sample transactions? Your current local transactions will be replaced.')) return;
    setTransactions(seedTransactions()); setToast('Sample data restored');
  }

  const categoriesForForm = CATEGORIES[form.type] || CATEGORIES.expense;
  const navItems = [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Transactions', icon: ListFilter }, { name: 'Analytics', icon: ChartNoAxesCombined }];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Wallet size={21} strokeWidth={2.3} /></div><div><div className="brand-name">pocket<span>ledger</span></div><div className="brand-sub">PERSONAL FINANCE</div></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{navItems.map(({name, icon: Icon}) => <button key={name} className={`nav-item ${activeNav === name ? 'active' : ''}`} onClick={() => setActiveNav(name)}><Icon size={18}/><span>{name}</span>{name === 'Transactions' && <span className="nav-count">{transactions.length}</span>}</button>)}</nav>
      <div className="sidebar-divider" />
      <div className="workspace-label">QUICK ACTIONS</div>
      <button className="quick-action" onClick={() => openAdd('income')}><span className="quick-icon income"><ArrowDownLeft size={16}/></span><span>Add income</span><Plus size={15} className="quick-plus"/></button>
      <button className="quick-action" onClick={() => openAdd('expense')}><span className="quick-icon expense"><ArrowUpRight size={16}/></span><span>Add expense</span><Plus size={15} className="quick-plus"/></button>
      <div className="sidebar-bottom"><div className="tip-card"><div className="tip-icon"><Sparkles size={16}/></div><div className="tip-title">Small steps add up.</div><p>Track every rupee to build better money habits.</p></div><div className="profile"><div className="avatar">PL</div><div className="profile-text"><strong>My finances</strong><span>Personal workspace</span></div><Settings2 size={17} className="profile-settings"/></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div><div className="topbar-right"><div className="current-date"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div><button className="icon-button help-button" title="About Pocket Ledger" onClick={() => setToast('Your data is saved in this browser using localStorage.')}><CircleHelp size={18}/></button><div className="top-avatar">PL</div></div></header>
      <div className="page-content">
        <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR MONEY, IN FOCUS</div><h1>{activeNav === 'Overview' ? 'Good money habits start here.' : activeNav === 'Transactions' ? 'Your transactions' : 'Your financial insights'}</h1><p>{activeNav === 'Overview' ? 'A clear view of what comes in, what goes out, and what stays.' : activeNav === 'Transactions' ? 'Every transaction, organized in one place.' : 'Understand your spending patterns and cash flow.'}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={exportCSV}><Download size={16}/> Export CSV</button><button className="button button-primary" onClick={() => openAdd('expense')}><Plus size={17}/> Add transaction</button></div></section>

        <section className="summary-grid">
          <article className="summary-card balance-card"><div className="summary-top"><span className="summary-label">NET CASH FLOW <span className="info-dot">i</span></span><span className="summary-icon balance-icon"><Wallet size={18}/></span></div><div className="summary-value">{money(totals.balance)}</div><div className="summary-foot"><span className={`status-pill ${totals.balance >= 0 ? 'positive' : 'negative'}`}><TrendingUp size={13}/>{totals.balance >= 0 ? 'Positive balance' : 'Overspending'}</span><span className="muted-foot">This month</span></div><div className="balance-decoration"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
          <article className="summary-card"><div className="summary-top"><span className="summary-label">TOTAL INCOME</span><span className="summary-icon income-icon"><ArrowDownLeft size={19}/></span></div><div className="summary-value">{money(totals.income)}</div><div className="summary-foot"><span className="summary-caption"><span className="tiny-dot green"/> Money received</span><span className="muted-foot">This month</span></div><div className="mini-progress"><span className="income-progress" style={{width: `${totals.income ? Math.min(100, totals.income / Math.max(totals.income, totals.expenses, 1) * 100) : 0}%`}}/></div></article>
          <article className="summary-card"><div className="summary-top"><span className="summary-label">TOTAL EXPENSES</span><span className="summary-icon expense-icon"><ArrowUpRight size={19}/></span></div><div className="summary-value">{money(totals.expenses)}</div><div className="summary-foot"><span className="summary-caption"><span className="tiny-dot coral"/> Money spent</span><span className="muted-foot">This month</span></div><div className="mini-progress"><span className="expense-progress" style={{width: `${totals.expenses ? Math.min(100, totals.expenses / Math.max(totals.income, totals.expenses, 1) * 100) : 0}%`}}/></div></article>
          <article className="summary-card savings-card"><div className="summary-top"><span className="summary-label">SAVINGS RATE</span><span className="summary-icon savings-icon"><ChartNoAxesCombined size={18}/></span></div><div className="summary-value">{Math.round(totals.savings)}<span className="value-suffix">%</span></div><div className="summary-foot"><span className="summary-caption">{totals.income ? (totals.balance >= 0 ? 'Of income retained' : 'Expenses exceed income') : 'Add income to calculate'}</span></div><div className="mini-progress"><span className="savings-progress" style={{width: `${Math.min(100, totals.savings)}%`}}/></div></article>
        </section>

        {activeNav !== 'Transactions' && <section className="charts-grid">
          <article className="panel trend-panel"><div className="panel-header"><div><h2>Cash flow</h2><p>Income vs expenses over time</p></div><span className="chart-legend"><span className="legend-item"><i className="legend-income"/>Income</span><span className="legend-item"><i className="legend-expense"/>Expenses</span></span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}><defs><linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20b99a" stopOpacity={0.16}/><stop offset="95%" stopColor="#20b99a" stopOpacity={0}/></linearGradient><linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f18a9d" stopOpacity={0.15}/><stop offset="95%" stopColor="#f18a9d" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#8992a5',fontSize:11}} dy={9}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#8992a5',fontSize:11}} tickFormatter={(v)=>v >= 1000 ? `${(v/1000).toFixed(v%1000 ? 1 : 0)}k` : v}/><Tooltip formatter={(v,n)=>[money(v),n]} contentStyle={{border:'1px solid #edf0f5',borderRadius:12,boxShadow:'0 8px 24px #1c25400d',fontSize:12}}/><Area type="monotone" dataKey="Income" stroke="#20b99a" strokeWidth={2.5} fill="url(#incomeGradient)" activeDot={{r:4,strokeWidth:0}}/><Area type="monotone" dataKey="Expenses" stroke="#f18a9d" strokeWidth={2.5} fill="url(#expenseGradient)" activeDot={{r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer></div><div className="chart-bottom-note"><span className="note-check"><Check size={12}/></span><span>Stay consistent — small tracking habits create clarity.</span></div></article>
          <article className="panel category-panel"><div className="panel-header"><div><h2>Spending breakdown</h2><p>Where your money went this month</p></div><button className="dots-button" title="Spending breakdown">•••</button></div>{categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={3} stroke="none" cornerRadius={4}>{categoryData.map((entry,i)=><Cell key={entry.name} fill={CATEGORIES.expense.find(c=>c.name===entry.name)?.color || COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(v)=>money(v)} contentStyle={{border:'1px solid #edf0f5',borderRadius:10,fontSize:12}}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(totals.expenses)}</strong><span>Total spent</span></div></div><div className="category-legend">{categoryData.slice(0,4).map((c,i)=><div className="category-legend-row" key={c.name}><span className="category-name"><i style={{background:CATEGORIES.expense.find(x=>x.name===c.name)?.color || COLORS[i]}}/>{c.name}</span><strong>{money(c.value)}</strong></div>)}</div></> : <div className="empty-chart"><div className="empty-chart-icon"><ChartNoAxesCombined size={24}/></div><strong>No expenses yet</strong><span>Add an expense to see your breakdown.</span><button className="text-button" onClick={()=>openAdd('expense')}>Add your first expense <ArrowUpRight size={14}/></button></div>}</article>
        </section>}

        <section className="panel transactions-panel"><div className="panel-header transactions-heading"><div><h2>{activeNav === 'Overview' ? 'Recent transactions' : activeNav === 'Transactions' ? 'All transactions' : 'Transaction details'}</h2><p>{activeNav === 'Overview' ? 'Your latest money movements' : `${filtered.length} transaction${filtered.length===1?'':'s'} found`}</p></div><button className="button button-ghost" onClick={() => setActiveNav('Transactions')}>View all <ArrowUpRight size={15}/></button></div>
          <div className="filter-bar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..." aria-label="Search transactions"/><kbd>⌘ K</kbd></div><div className="filter-controls"><label className="select-wrap"><CalendarDays size={15}/><select value={range} onChange={e=>setRange(e.target.value)} aria-label="Date range"><option>This month</option><option>This week</option><option>Last 30 days</option><option>All time</option></select><ChevronDown size={13}/></label><label className="select-wrap filter-select"><Filter size={15}/><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} aria-label="Transaction type"><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select><ChevronDown size={13}/></label><label className="select-wrap category-select"><select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Category"><option value="all">All categories</option>{[...CATEGORIES.expense,...CATEGORIES.income].filter((c,i,a)=>a.findIndex(x=>x.name===c.name)===i).map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select><ChevronDown size={13}/></label></div></div>
          <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th className="actions-col">ACTIONS</th></tr></thead><tbody>{(activeNav === 'Overview' ? filtered.slice(0,6) : filtered).map(t=><tr key={t.id}><td><div className="transaction-title-cell"><CategoryIcon category={t.category} type={t.type} size={18}/><div className="transaction-copy"><strong>{t.title}</strong>{t.note && <span>{t.note}</span>}</div></div></td><td><span className="category-chip">{t.category}</span></td><td><span className="date-cell">{formatDate(t.date)}</span></td><td><span className={`amount-cell ${t.type}`}>{t.type==='income'?'+':'−'}{money(t.amount)}</span></td><td><div className="row-actions"><button title="Edit transaction" aria-label={`Edit ${t.title}`} onClick={()=>openEdit(t)}><Pencil size={15}/></button><button title="Delete transaction" aria-label={`Delete ${t.title}`} onClick={()=>deleteTransaction(t.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{filtered.length===0 && <div className="empty-table"><div className="empty-table-icon"><Search size={22}/></div><strong>No transactions found</strong><span>Try changing your filters or add a new transaction.</span><button className="button button-secondary" onClick={()=>{setSearch('');setTypeFilter('all');setCategoryFilter('all');setRange('All time');}}>Clear filters</button></div>}</div>
          <div className="table-footer"><span>Showing <strong>{filtered.length ? 1 : 0}–{activeNav === 'Overview' ? Math.min(6,filtered.length) : filtered.length}</strong> of <strong>{filtered.length}</strong> results</span><div className="storage-note"><span className="storage-dot"/> Saved on this device</div></div>
        </section>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Pocket Ledger</span><span>Made for better money habits <span className="footer-heart">♥</span></span><button onClick={resetDemo}>Reset sample data</button></footer>
      </div>
    </main>

    {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModalOpen(false);}}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><div className="modal-kicker">POCKET LEDGER</div><h2 id="modal-title">{editing ? 'Edit transaction' : 'Add a transaction'}</h2><p>Keep your money records up to date.</p></div><button className="modal-close" onClick={()=>setModalOpen(false)} aria-label="Close dialog"><X size={19}/></button></div><form onSubmit={saveTransaction}><div className="type-toggle"><button type="button" className={form.type==='expense'?'selected expense-selected':''} onClick={()=>updateForm('type','expense')}><ArrowUpRight size={16}/> Expense</button><button type="button" className={form.type==='income'?'selected income-selected':''} onClick={()=>updateForm('type','income')}><ArrowDownLeft size={16}/> Income</button></div><label className="form-label">Title <span>*</span><input autoFocus required maxLength={80} value={form.title} onChange={e=>updateForm('title',e.target.value)} placeholder="e.g. Weekly groceries"/></label><div className="form-two-col"><label className="form-label">Amount (₹) <span>*</span><div className="amount-input"><span>₹</span><input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>updateForm('amount',e.target.value)} placeholder="0.00"/></div></label><label className="form-label">Date <span>*</span><input required type="date" value={form.date} onChange={e=>updateForm('date',e.target.value)}/></label></div><label className="form-label">Category <span>*</span><select required value={form.category} onChange={e=>updateForm('category',e.target.value)}>{categoriesForForm.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></label><label className="form-label">Note <span className="optional">OPTIONAL</span><textarea rows="2" maxLength={180} value={form.note} onChange={e=>updateForm('note',e.target.value)} placeholder="Add a note (optional)"/></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={()=>setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary"><Check size={16}/>{editing?'Save changes':'Save transaction'}</button></div></form></section></div>}
    {toast && <div className="toast"><span className="toast-check"><Check size={14}/></span>{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
  </div>;
}

export default App;
