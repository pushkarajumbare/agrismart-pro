import React, { useEffect, useMemo, useState, Component } from 'react';
import './App.css';
import WeatherCard from './features/weather/WeatherCard';
import DiseaseScanner from './features/ai/DiseaseScanner';
import SoilAnalysis from './features/soil/SoilAnalysis';
import CropAdvisor from './features/soil/CropAdvisor';
import CostEstimation from './features/budget/CostEstimation';
import ChatBot from './components/ChatBot';
import ExpenseManager from './components/ExpenseManager';
import { 
  Cloud, 
  ShieldAlert, 
  Sprout, 
  IndianRupee, 
  Activity, 
  BarChart3, 
  Zap, 
  Leaf, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  History,
  Eye,
  EyeOff,
  MapPin,
  Trash2,
  Loader2
} from 'lucide-react';

/* ==========================================================================
   1. ERROR BOUNDARY
   ========================================================================== */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AgriSmart Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#e53e3e' }}>
          <h2>Something went wrong in this module.</h2>
          <p>{this.state.error?.toString()}</p>
          <button 
            style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ==========================================================================
   2. INTERNATIONALIZATION (I18N)
   ========================================================================== */
const I18N = {
  en: { 
    home: 'Home', 
    dashboard: 'Dashboard', 
    login: 'Login', 
    register: 'Register', 
    logout: 'Sign Out', 
    launch: 'Launch AgriSmart', 
    title: 'Smart Farming for a Better Tomorrow', 
    subtitle: 'AI-powered agriculture assistant with disease detection, soil analysis, and cost estimation.', 
    email: 'Email', 
    password: 'Password', 
    name: 'Full Name', 
    signin: 'Sign In', 
    signup: 'Sign Up', 
    existing: 'Existing user?', 
    newUser: 'New user?', 
    overview: 'Overview', 
    weather: 'Weather', 
    scanner: 'Disease Detection', 
    crop: 'Crop Advisor', 
    cost: 'Cost Estimation', 
    expense: 'Expenses', 
    soil: 'Soil Analysis', 
    history: 'History', 
    workspace: 'Features', 
    active: 'Active User', 
    isolated: 'Your Data', 
    totalSpend: 'Total Spending', 
    budgetLimit: 'Budget', 
    scanCount: 'Scans', 
    recentExpenses: 'Recent Expenses', 
    recentScans: 'Recent Scans', 
    noExpenses: 'No expenses', 
    noScans: 'No scans', 
    item: 'Item', 
    location: 'Location', 
    amount: 'Amount', 
    diagnosis: 'Diagnosis', 
    confidence: 'Confidence', 
    action: 'Action', 
    delete: 'Delete', 
    saveMock: 'Save Sample', 
    ledger: 'Expense Ledger', 
    commit: 'Save' 
  },
  hi: { 
    home: 'होम', 
    dashboard: 'डैशबोर्ड', 
    login: 'लॉगिन', 
    register: 'पंजीकरण', 
    logout: 'साइन आउट', 
    launch: 'एग्रीस्मार्ट शुरू करें', 
    title: 'बेहतर कल के लिए स्मार्ट खेती', 
    subtitle: 'रोग पहचान, मिट्टी विश्लेषण और लागत अनुमान के साथ AI-संचालित कृषि सहायक।', 
    email: 'ईमेल', 
    password: 'पासवर्ड', 
    name: 'पूरा नाम', 
    signin: 'साइन इन', 
    signup: 'साइन अप', 
    existing: 'मौजूदा उपयोगकर्ता?', 
    newUser: 'नए उपयोगकर्ता?', 
    overview: 'अवलोकन', 
    weather: 'मौसम', 
    scanner: 'रोग पहचान', 
    crop: 'फसल सलाहकार', 
    cost: 'लागत अनुमान', 
    expense: 'खर्च', 
    soil: 'मिट्टी विश्लेषण', 
    history: 'इतिहास', 
    workspace: 'विशेषताएं', 
    active: 'सक्रिय उपयोगकर्ता', 
    isolated: 'आपका डेटा', 
    totalSpend: 'कुल खर्च', 
    budgetLimit: 'बजट', 
    scanCount: 'स्कैन', 
    recentExpenses: 'हाल के खर्च', 
    recentScans: 'हाल के स्कैन', 
    noExpenses: 'कोई खर्च नहीं', 
    noScans: 'कोई स्कैन नहीं', 
    item: 'आइटम', 
    location: 'स्थान', 
    amount: 'राशि', 
    diagnosis: 'निदान', 
    confidence: 'विश्वास स्तर', 
    action: 'कार्रवाई', 
    delete: 'हटाएं', 
    saveMock: 'नमूना सहेजें', 
    ledger: 'खर्च बही', 
    commit: 'सहेजें' 
  },
  mr: { 
    home: 'मुख्यपृष्ठ', 
    dashboard: 'डॅशबोर्ड', 
    login: 'लॉगिन', 
    register: 'नोंदणी', 
    logout: 'साइन आउट', 
    launch: 'अ‍ॅग्रीस्मार्ट सुरू करा', 
    title: 'उद्याच्या उत्तम भविष्यासाठी स्मार्ट शेती', 
    subtitle: 'रोग ओळख, माती विश्लेषण आणि खर्च अंदाजासह AI-आधारित कृषी सहाय्यक.', 
    email: 'ईमेल', 
    password: 'पासवर्ड', 
    name: 'पूर्ण नाव', 
    signin: 'साइन इन', 
    signup: 'साइन अप', 
    existing: 'हयात असलेले वापरकर्ते?', 
    newUser: 'नवीन वापरकर्ता?', 
    overview: 'आढावा', 
    weather: 'हवामान', 
    scanner: 'रोग ओळख', 
    crop: 'पीक सल्लागार', 
    cost: 'खर्च अंदाज', 
    expense: 'खर्च', 
    soil: 'माती विश्लेषण', 
    history: 'इतिहास', 
    workspace: 'वैशिष्ट्ये', 
    active: 'सक्रिय वापरकर्ता', 
    isolated: 'तुमचा डेटा', 
    totalSpend: 'एकूण खर्च', 
    budgetLimit: 'बजेट', 
    scanCount: 'स्कॅन', 
    recentExpenses: 'नुकतेच झालेले खर्च', 
    recentScans: 'नुकतेच केलेले स्कॅन', 
    noExpenses: 'कोणताही खर्च नाही', 
    noScans: 'कोणतेही स्कॅन नाही', 
    item: 'वस्तू', 
    location: 'ठिकाण', 
    amount: 'रक्कम', 
    diagnosis: 'निदान', 
    confidence: 'विश्वासार्हता', 
    action: 'कृती', 
    delete: 'हटवा', 
    saveMock: 'नमूना जतन करा', 
    ledger: 'खर्च वही', 
    commit: 'जतन करा' 
  }
};

const tabs = [
  ['overview', BarChart3], 
  ['weather', Cloud], 
  ['scanner', ShieldAlert], 
  ['crop', Sprout],
  ['cost', IndianRupee],
  ['soil', Activity], 
  ['expense', Zap],
  ['history', History]
];

/* LocalStorage Helpers */
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const keyFor = (type, email = 'guest') => `${type}_${email || 'guest'}`;

/* ==========================================================================
   3. MAIN APPLICATION COMPONENT
   ========================================================================== */
export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('agrismart_lang') || 'en');
  const [view, setView] = useState('landing');
  const [tab, setTab] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [scans, setScans] = useState([]);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const t = I18N[lang] || I18N.en;

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
    setIsLoading(true);
    setTimeout(() => {
      const users = read('agrismart_users_db', {});
      const email = data.email.trim().toLowerCase();
      if (mode === 'signup') {
        if (users[email]) {
          setIsLoading(false);
          return setAuthError('This email identifier is already registered.');
        }
        users[email] = { name: data.name, password: data.password, role: 'Lead Field Director' };
        write('agrismart_users_db', users);
      }
      if (!users[email] || users[email].password !== data.password) {
        setIsLoading(false);
        return setAuthError('Invalid email identity or password.');
      }
      setAuthError('');
      activateSession({ name: users[email].name, email });
      setIsLoading(false);
    }, 400);
  };

  const logout = () => { 
    localStorage.removeItem('agrismart_user'); 
    setProfile(null); 
    setExpenses([]); 
    setScans([]); 
    setView('landing'); 
  };
  
  const addScan = (scan) => saveScans([
    { 
      id: Date.now(), 
      plant: scan.plant || 'Uploaded Leaf', 
      diagnosis: scan.disease || scan.diagnosis, 
      confidence: scan.confidence || '0%', 
      location: scan.location || 'Scanner Upload', 
      status: scan.status || 'Recorded', 
      date: new Date().toLocaleDateString() 
    }, 
    ...scans
  ]);

  const metrics = useMemo(() => ({
    total: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    limits: expenses.reduce((sum, e) => sum + (Number(e.budgetLimit) || 0), 0),
    scans: scans.length
  }), [expenses, scans]);

  const goDash = () => { setView(profile ? 'dashboard' : 'login'); setTab('overview'); };

  return (
    <ErrorBoundary>
      <div className="ag-app">
        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="global-loader-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Loader2 className="animate-spin" size={40} />
          </div>
        )}

        {/* Top Navigation */}
        <Navigation t={t} lang={lang} setLang={setLanguage} profile={profile} setView={setView} goDash={goDash} logout={logout} menu={menu} setMenu={setMenu} />
        
        {menu && (
          <div className="mobile-menu">
            <button onClick={() => { setView('landing'); setMenu(false); }}>{t.home}</button>
            <button onClick={() => { goDash(); setMenu(false); }}>{t.dashboard}</button>
            <select className="nav-lang-select" value={lang} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="mr">🇮🇳 मराठी</option>
            </select>
          </div>
        )}

        {/* Landing Page View */}
        {view === 'landing' && (
          <section className="hero fade">
            <Leaf size={44}/>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
            <button onClick={goDash}>{t.launch}</button>
          </section>
        )}

        {/* Authentication Form View */}
        {(view === 'login' || view === 'signup') && (
          <AuthForm mode={view} t={t} error={authError} switchMode={setView} onSubmit={submitAuth} />
        )}

        {/* Main Dashboard View */}
        {view === 'dashboard' && (
          <section className="dash fade">
            <div className="status">
              <div>
                <h2>{t.active}: {profile?.name}</h2>
                <p>{profile?.email}</p>
              </div>
              <span>{t.isolated}</span>
            </div>

            <div className="workspace">
              <aside className="sidebar">
                <small>{t.workspace}</small>
                {tabs.map(([id, Icon]) => (
                  <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                    <Icon size={18}/>{t[id]}
                  </button>
                ))}
              </aside>

              <main className="panel">
                <ErrorBoundary>
                  {tab === 'overview' && <Overview t={t} expenses={expenses} scans={scans} metrics={metrics} />}
                  {tab === 'weather' && <WeatherCard/>}
                  {tab === 'scanner' && <DiseaseScanner activeUserEmail={profile?.email} onScanSaved={addScan}/>}
                  {tab === 'crop' && <CropAdvisor/>}
                  {tab === 'cost' && <CostEstimation/>}
                  {tab === 'soil' && <SoilAnalysis/>}
                  {tab === 'expense' && <ExpenseManager expenses={expenses} onExpensesChange={saveExpenses}/>}
                  {tab === 'history' && (
                    <HistoryLog 
                      t={t} 
                      expenses={expenses} 
                      scans={scans} 
                      onDeleteExpense={(id) => saveExpenses(expenses.filter(e => e.id !== id))} 
                      onDeleteScan={(id) => saveScans(scans.filter(s => s.id !== id))}
                    />
                  )}
                </ErrorBoundary>
              </main>
            </div>
          </section>
        )}

        {/* Floating AI Chatbot rendered at root so it stays open across all views/tabs */}
        <ChatBot />
      </div>
    </ErrorBoundary>
  );
}

/* ==========================================================================
   4. SUB-COMPONENTS
   ========================================================================== */
function Navigation({ t, lang, setLang, profile, setView, goDash, logout, menu, setMenu }) {
  return (
    <nav className="nav">
      <button className="brand" onClick={() => setView('landing')}><Leaf/>AgriSmart Pro</button>
      <div className="nav-actions">
        <button onClick={() => setView('landing')}>{t.home}</button>
        <button onClick={goDash}>{t.dashboard}</button>
        <select className="nav-lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">🇺🇸 English</option>
          <option value="hi">🇮🇳 हिंदी</option>
          <option value="mr">🇮🇳 मराठी</option>
        </select>
        {profile ? (
          <button className="danger" onClick={logout}>{t.logout}</button>
        ) : (
          <>
            <button onClick={() => setView('login')}>{t.login}</button>
            <button className="primary" onClick={() => setView('signup')}>{t.register}</button>
          </>
        )}
      </div>
      <button className="hamburger" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </nav>
  );
}

function AuthForm({ mode, t, error, switchMode, onSubmit }) {
  const [show, setShow] = useState(false);
  const submit = (e) => { 
    e.preventDefault(); 
    onSubmit(mode, { name: e.target.name?.value || '', email: e.target.email.value, password: e.target.password.value }); 
  };
  return (
    <section className="auth fade">
      <form onSubmit={submit}>
        <h2>{mode === 'login' ? <LogIn/> : <UserPlus/>}{mode === 'login' ? t.login : t.register}</h2>
        {error && <p className="error">{error}</p>}
        {mode === 'signup' && <label>{t.name}<input name="name" required/></label>}
        <label>{t.email}<input name="email" required type="email"/></label>
        <label>
          {t.password}
          <span className="password">
            <input name="password" required type={show ? 'text' : 'password'}/>
            <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
          </span>
        </label>
        <button className="primary">{mode === 'login' ? t.signin : t.signup}</button>
        <p>
          {mode === 'login' ? t.newUser : t.existing}{' '}
          <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? t.register : t.login}
          </button>
        </p>
      </form>
    </section>
  );
}

function Overview({ t, expenses, scans, metrics }) {
  return (
    <div>
      <div className="metric-grid">
        <Metric label={t.totalSpend} value={`₹${metrics.total}`}/>
        <Metric label={t.budgetLimit} value={`₹${Math.round(metrics.limits)}`}/>
        <Metric label={t.scanCount} value={metrics.scans}/>
      </div>
      <div className="split">
        <Card title={t.recentExpenses} empty={t.noExpenses} rows={expenses.slice(0, 3).map(e => `₹${e.amount} - ${e.item} (${e.location})`)}/>
        <Card title={t.recentScans} empty={t.noScans} rows={scans.slice(0, 3).map(s => `${s.plant}: ${s.diagnosis} (${s.confidence})`)}/>
      </div>
    </div>
  );
}

function Metric({ label, value }) { return <div className="metric"><small>{label}</small><strong>{value}</strong></div>; }
function Card({ title, rows, empty }) { return <section className="card"><h3>{title}</h3>{rows.length ? rows.map((r, i) => <p key={i}>{r}</p>) : <p className="muted">{empty}</p>}</section>; }

function HistoryLog({ t, expenses, scans, onDeleteExpense, onDeleteScan }) {
  return (
    <div>
      <h3>{t.history}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.item}</th>
              <th>{t.location}</th>
              <th>{t.amount}</th>
              <th>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.item}</td>
                <td><MapPin size={12}/>{e.location}</td>
                <td>₹{e.amount}</td>
                <td>
                  <button title={t.delete} onClick={() => onDeleteExpense(e.id)}>
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan="4">{t.noExpenses}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.item}</th>
              <th>{t.diagnosis}</th>
              <th>{t.confidence}</th>
              <th>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {scans.map(s => (
              <tr key={s.id}>
                <td>{s.plant}</td>
                <td>{s.diagnosis}</td>
                <td>{s.confidence}</td>
                <td>
                  <button title={t.delete} onClick={() => onDeleteScan(s.id)}>
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
            {!scans.length && <tr><td colSpan="4">{t.noScans}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}