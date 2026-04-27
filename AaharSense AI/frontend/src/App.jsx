import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import ProfileSetup from './components/ProfileSetup';
import Recommendations from './components/Recommendations';
import WeeklyReport from './components/WeeklyReport';
import FoodQuery from './components/FoodQuery';

function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nutrisense_user');
    const uid = localStorage.getItem('nutrisense_uid');
    if (saved && uid) {
      try { setUser(JSON.parse(saved)); setPage('dashboard'); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setPage(u.onboarding_complete ? 'dashboard' : 'profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('landing');
  };

  const handleProfileDone = (u) => {
    setUser(u);
    localStorage.setItem('nutrisense_user', JSON.stringify(u));
    setPage('dashboard');
  };

  const nav = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (loading) return (
    <div className="loading-screen" role="status"><div className="loading-logo">
      <span className="loading-icon">🥗</span>
      <h2><span className="text-accent">NutriSense</span> OS</h2>
      <div className="loading-bar"><div className="loading-bar-fill"></div></div>
    </div></div>
  );

  return (
    <div className="app">
      {page !== 'landing' && <Navbar user={user} page={page} nav={nav} onLogout={handleLogout} />}
      <main className="main-content" role="main">
        {page === 'landing' && <Landing onLogin={handleLogin} />}
        {page === 'dashboard' && <Dashboard user={user} nav={nav} />}
        {page === 'scanner' && <FoodScanner user={user} nav={nav} />}
        {page === 'profile' && <ProfileSetup user={user} onComplete={handleProfileDone} isOnboarding={!user?.onboarding_complete} />}
        {page === 'recommendations' && <Recommendations user={user} />}
        {page === 'weekly' && <WeeklyReport user={user} />}
        {page === 'query' && <FoodQuery user={user} />}
      </main>
      {page !== 'landing' && (
        <footer className="app-footer" role="contentinfo">
          Powered by <span className="text-accent">Google Gemini</span> · <span className="text-accent">Cloud Firestore</span> · <span className="text-accent">Cloud Run</span>
        </footer>
      )}
    </div>
  );
}

export default App;
