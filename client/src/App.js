import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import WeatherCard from './features/weather/WeatherCard';
import DiseaseScanner from './features/ai/DiseaseScanner';
import ExpenseManager from './components/ExpenseManager';
import SoilAnalysis from './features/soil/SoilAnalysis';
import ChatBot from './components/ChatBot';
import CropAdvisor from './features/soil/CropAdvisor';
import { Activity, Cloud, Eye, EyeOff, History, IndianRupee, LayoutDashboard, Leaf, LogIn, MapPin, Menu, ShieldAlert, Sprout, Trash2, UserPlus, X } from 'lucide-react';

const I18N = {
  en: { home: 'Home', dashboard: 'Dashboard', login: 'Login', register: 'Register', logout: 'Sign Out', launch: 'Launch Operations Console', title: 'Smart Farming for a Better Tomorrow', subtitle: 'AI-powered agriculture assistant with secure profile ledgers and pathology history.', email: 'Email Account', password: 'Password', name: 'Farmer Full Name', signin: 'Verify & Authenticate', signup: 'Create Account', existing: 'Existing operator?', newUser: 'No profile node?', overview: 'Ecosystem Overview', weather: 'Weather Telemetry', scanner: 'Crop Disease Scanner', crop: 'Crop Recommender', expense: 'Expense Manager', soil: 'Soil Health Matrix', history: 'Audited Records Log', workspace: 'Workspace Modules', active: 'Active Operator', isolated: 'User Data Isolated', totalSpend: 'Total Expense', budgetLimit: 'Total Budget Limit', scanCount: 'Diagnostic Count', recentExpenses: 'Recent Expenditures', recentScans: 'Recent Diagnostic Logs', noExpenses: 'No expenses saved for this account.', noScans: 'No scans saved for this account.', item: 'Item', location: 'Location', amount: 'Amount', diagnosis: 'Diagnosis', confidence: 'Confidence', action: 'Action', delete: 'Delete', saveMock: 'Save Mock Scan Run', ledger: 'Dynamic Expenditure Ledger', commit: 'Commit & Save' },
  hi: { home: 'होम', dashboard: 'डैशबोर्ड', login: 'लॉगिन', register: 'रजिस्टर', logout: 'साइन आउट', launch: 'ऑपरेशन कंसोल खोलें', title: 'बेहतर कल के लिए स्मार्ट खेती', subtitle: 'सुरक्षित प्रोफाइल लेजर और रोग इतिहास वाला AI कृषि सहायक।', email: 'ईमेल खाता', password: 'पासवर्ड', name: 'किसान का पूरा नाम', signin: 'सत्यापित करें', signup: 'खाता बनाएं', existing: 'पहले से ऑपरेटर?', newUser: 'नया प्रोफाइल?', overview: 'इकोसिस्टम ओवरव्यू', weather: 'मौसम टेलीमेट्री', scanner: 'फसल रोग स्कैनर', crop: 'फसल सलाहकार', expense: 'खर्च प्रबंधक', soil: 'मिट्टी स्वास्थ्य', history: 'रिकॉर्ड लॉग', workspace: 'वर्कस्पेस मॉड्यूल', active: 'सक्रिय ऑपरेटर', isolated: 'यूजर डेटा अलग है', totalSpend: 'कुल खर्च', budgetLimit: 'कुल बजट सीमा', scanCount: 'डायग्नोस्टिक संख्या', recentExpenses: 'हाल के खर्च', recentScans: 'हाल के स्कैन', noExpenses: 'इस खाते में खर्च नहीं है।', noScans: 'इस खाते में स्कैन नहीं है।', item: 'वस्तु', location: 'स्थान', amount: 'राशि', diagnosis: 'निदान', confidence: 'विश्वास', action: 'क्रिया', delete: 'हटाएं', saveMock: 'मॉक स्कैन सेव करें', ledger: 'गतिशील खर्च लेजर', commit: 'सेव करें' },
  mr: { home: 'मुख्यपृष्ठ', dashboard: 'डॅशबोर्ड', login: 'लॉगिन', register: 'नोंदणी', logout: 'साइन आउट', launch: 'ऑपरेशन कन्सोल उघडा', title: 'उद्याच्या शेतीसाठी स्मार्ट व्यवस्थापन', subtitle: 'सुरक्षित प्रोफाइल लेजर आणि रोग इतिहासासह AI कृषी सहाय्यक.', email: 'ईमेल खाते', password: 'पासवर्ड', name: 'शेतकऱ्याचे पूर्ण नाव', signin: 'सत्यापित करा', signup: 'खाते तयार करा', existing: 'आधीच ऑपरेटर?', newUser: 'नवीन प्रोफाइल?', overview: 'इकोसिस्टम आढावा', weather: 'हवामान टेलीमेट्री', scanner: 'पीक रोग स्कॅनर', crop: 'पीक सल्लागार', expense: 'खर्च व्यवस्थापक', soil: 'माती आरोग्य', history: 'नोंद लॉग', workspace: 'वर्कस्पेस मॉड्यूल', active: 'सक्रिय ऑपरेटर', isolated: 'युजर डेटा वेगळा आहे', totalSpend: 'एकूण खर्च', budgetLimit: 'एकूण बजेट मर्यादा', scanCount: 'डायग्नोस्टिक संख्या', recentExpenses: 'अलीकडील खर्च', recentScans: 'अलीकडील स्कॅन', noExpenses: 'या खात्यात खर्च नाहीत.', noScans: 'या खात्यात स्कॅन नाहीत.', item: 'वस्तू', location: 'ठिकाण', amount: 'रक्कम', diagnosis: 'निदान', confidence: 'विश्वास', action: 'क्रिया', delete: 'हटवा', saveMock: 'मॉक स्कॅन सेव्ह करा', ledger: 'गतिशील खर्च लेजर', commit: 'सेव्ह करा' }
};

const tabs = [
  ['overview', LayoutDashboard], ['weather', Cloud], ['scanner', ShieldAlert], ['crop', Sprout],
  ['expense', IndianRupee], ['soil', Activity], ['history', History]
];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const keyFor = (type, email = 'guest') => `${type}_${email || 'guest'}`;

function App() {
  const [lang, setLang] = useState(localStorage.getItem('agrismart_lang') || 'en');
  const [view, setView] = useState('landing');
  const [tab, setTab] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [scans, setScans] = useState([]);
  const [authError, setAuthError] = useState('');
  const t = I18N[lang];

  useEffect(() => {
    const session = read('agrismart_user', null);
    if (session?.email) activateSession(session);
  }, []);

  const activateSession = (nextProfile) => {
    setProfile(nextProfile);
    write('agrismart_user', nextProfile);
    setExpenses(read(keyFor('expenses', nextProfile.email), []));
    setScans(read(keyFor('scans', nextProfile.email), []));
    setView('dashboard');
  };
  const saveExpenses = (next) => { setExpenses(next); write(keyFor('expenses', profile?.email), next); };
  const saveScans = (next) => { setScans(next); write(keyFor('scans', profile?.email), next); };
  const setLanguage = (next) => { setLang(next); localStorage.setItem('agrismart_lang', next); };
  const submitAuth = (mode, data) => {
    const users = read('agrismart_users_db', {});
    const email = data.email.trim().toLowerCase();
    if (mode === 'signup') {
      if (users[email]) return setAuthError('This email identifier is already registered.');
      users[email] = { name: data.name, password: data.password, role: 'Lead Field Director' };
      write('agrismart_users_db', users);
    }
    if (!users[email] || users[email].password !== data.password) return setAuthError('Invalid email identity or password.');
    setAuthError('');
    activateSession({ name: users[email].name, email });
  };
  const logout = () => { localStorage.removeItem('agrismart_user'); setProfile(null); setExpenses([]); setScans([]); setView('landing'); };
  const addExpense = (e) => {
    e.preventDefault();
    const f = e.target;
    saveExpenses([{ id: Date.now(), item: f.itemName.value, amount: Number(f.itemAmount.value), category: 'General', month: new Date().toLocaleString('en-US', { month: 'short' }), budgetLimit: Number(f.itemAmount.value) * 1.2, location: f.itemLocation.value || 'Main Farm Field', date: new Date().toLocaleDateString() }, ...expenses]);
    f.reset();
  };
  const addScan = (scan) => saveScans([{ id: Date.now(), plant: scan.plant || 'Uploaded Leaf', diagnosis: scan.disease || scan.diagnosis, confidence: scan.confidence || '0%', location: scan.location || 'Scanner Upload', status: scan.status || 'Recorded', date: new Date().toLocaleDateString() }, ...scans]);
  const mockScan = () => addScan(Math.random() > 0.5 ? { plant: 'Tomato Foliage', diagnosis: 'Early Blight Fungus', confidence: '94.2%', location: 'Greenhouse Sector B', status: 'Needs Treatment' } : { plant: 'Wheat Crop Node', diagnosis: 'Healthy Surface', confidence: '99.1%', location: 'North Acre', status: 'Optimal' });
  const metrics = useMemo(() => ({
    total: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    limits: expenses.reduce((sum, e) => sum + (Number(e.budgetLimit) || 0), 0),
    scans: scans.length
  }), [expenses, scans]);
  const goDash = () => { setView(profile ? 'dashboard' : 'login'); setTab('overview'); };

  return <div className="ag-app">
    <Navigation t={t} lang={lang} setLang={setLanguage} profile={profile} view={view} setView={setView} goDash={goDash} logout={logout} menu={menu} setMenu={setMenu} />
    {menu && <div className="mobile-menu"><button onClick={() => setView('landing')}>{t.home}</button><button onClick={goDash}>{t.dashboard}</button><select value={lang} onChange={(e) => setLanguage(e.target.value)}><option value="en">EN</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select></div>}
    {view === 'landing' && <section className="hero fade"><Leaf size={44}/><h1>{t.title}</h1><p>{t.subtitle}</p><button onClick={goDash}>{t.launch}</button></section>}
    {(view === 'login' || view === 'signup') && <AuthForm mode={view} t={t} error={authError} switchMode={setView} onSubmit={submitAuth} />}
    {view === 'dashboard' && <section className="dash fade">
      <div className="status"><div><h2>{t.active}: {profile?.name}</h2><p>{profile?.email}</p></div><span>{t.isolated}</span></div>
      <div className="workspace">
        <aside className="sidebar"><small>{t.workspace}</small>{tabs.map(([id, Icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={18}/>{t[id]}</button>)}</aside>
        <main className="panel">
          {tab === 'overview' && <Overview t={t} expenses={expenses} scans={scans} metrics={metrics} />}
          {tab === 'expense' && <div><h3>{t.ledger}</h3><form className="quick-form" onSubmit={addExpense}><input name="itemName" required placeholder={t.item}/><input name="itemAmount" required type="number" placeholder={t.amount}/><input name="itemLocation" placeholder={t.location}/><button>{t.commit}</button></form><ExpenseManager expenses={expenses} onExpensesChange={saveExpenses}/></div>}
          {tab === 'scanner' && <div><div className="panel-head"><h3>{t.scanner}</h3><button onClick={mockScan}>{t.saveMock}</button></div><DiseaseScanner activeUserEmail={profile?.email} onScanSaved={addScan}/></div>}
          {tab === 'weather' && <WeatherCard/>}{tab === 'crop' && <CropAdvisor/>}{tab === 'soil' && <SoilAnalysis/>}
          {tab === 'history' && <HistoryLog t={t} expenses={expenses} scans={scans} onDeleteExpense={(id) => saveExpenses(expenses.filter(e => e.id !== id))} onDeleteScan={(id) => saveScans(scans.filter(s => s.id !== id))}/>}
        </main>
      </div>
    </section>}
    <ChatBot />
  </div>;
}

function Navigation({ t, lang, setLang, profile, setView, goDash, logout, menu, setMenu }) {
  return <nav className="nav"><button className="brand" onClick={() => setView('landing')}><Leaf/>AgriSmart Pro</button><div className="nav-actions">
    <button onClick={() => setView('landing')}>{t.home}</button><button onClick={goDash}>{t.dashboard}</button>
    <select value={lang} onChange={(e) => setLang(e.target.value)}><option value="en">EN</option><option value="hi">हिंदी</option><option value="mr">मराठी</option></select>
    {profile ? <button className="danger" onClick={logout}>{t.logout}</button> : <><button onClick={() => setView('login')}>{t.login}</button><button className="primary" onClick={() => setView('signup')}>{t.register}</button></>}
  </div><button className="hamburger" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></nav>;
}

function AuthForm({ mode, t, error, switchMode, onSubmit }) {
  const [show, setShow] = useState(false);
  const submit = (e) => { e.preventDefault(); onSubmit(mode, { name: e.target.name?.value || '', email: e.target.email.value, password: e.target.password.value }); };
  return <section className="auth fade"><form onSubmit={submit}><h2>{mode === 'login' ? <LogIn/> : <UserPlus/>}{mode === 'login' ? t.login : t.register}</h2>{error && <p className="error">{error}</p>}
    {mode === 'signup' && <label>{t.name}<input name="name" required/></label>}<label>{t.email}<input name="email" required type="email"/></label>
    <label>{t.password}<span className="password"><input name="password" required type={show ? 'text' : 'password'}/><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff/> : <Eye/>}</button></span></label>
    <button className="primary">{mode === 'login' ? t.signin : t.signup}</button><p>{mode === 'login' ? t.newUser : t.existing} <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? t.register : t.login}</button></p></form></section>;
}

function Overview({ t, expenses, scans, metrics }) {
  return <div><div className="metric-grid"><Metric label={t.totalSpend} value={`₹${metrics.total}`}/><Metric label={t.budgetLimit} value={`₹${Math.round(metrics.limits)}`}/><Metric label={t.scanCount} value={metrics.scans}/></div>
    <div className="split"><Card title={t.recentExpenses} empty={t.noExpenses} rows={expenses.slice(0, 3).map(e => `₹${e.amount} - ${e.item} (${e.location})`)}/><Card title={t.recentScans} empty={t.noScans} rows={scans.slice(0, 3).map(s => `${s.plant}: ${s.diagnosis} (${s.confidence})`)}/></div></div>;
}

function Metric({ label, value }) { return <div className="metric"><small>{label}</small><strong>{value}</strong></div>; }
function Card({ title, rows, empty }) { return <section className="card"><h3>{title}</h3>{rows.length ? rows.map((r, i) => <p key={i}>{r}</p>) : <p className="muted">{empty}</p>}</section>; }

function HistoryLog({ t, expenses, scans, onDeleteExpense, onDeleteScan }) {
  return <div><h3>{t.history}</h3><div className="table-wrap"><table><thead><tr><th>{t.item}</th><th>{t.location}</th><th>{t.amount}</th><th>{t.action}</th></tr></thead><tbody>
    {expenses.map(e => <tr key={e.id}><td>{e.item}</td><td><MapPin size={12}/>{e.location}</td><td>₹{e.amount}</td><td><button title={t.delete} onClick={() => onDeleteExpense(e.id)}><Trash2 size={16}/></button></td></tr>)}
    {!expenses.length && <tr><td colSpan="4">{t.noExpenses}</td></tr>}</tbody></table></div>
    <div className="table-wrap"><table><thead><tr><th>{t.item}</th><th>{t.diagnosis}</th><th>{t.confidence}</th><th>{t.action}</th></tr></thead><tbody>
    {scans.map(s => <tr key={s.id}><td>{s.plant}</td><td>{s.diagnosis}</td><td>{s.confidence}</td><td><button title={t.delete} onClick={() => onDeleteScan(s.id)}><Trash2 size={16}/></button></td></tr>)}
    {!scans.length && <tr><td colSpan="4">{t.noScans}</td></tr>}</tbody></table></div></div>;
}

export default App;
