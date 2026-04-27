import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FoodScanner from './components/FoodScanner';
import About from './components/About';

function App() {
  const [page, setPage] = useState('scanner');
  const [language, setLanguage] = useState('English');

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar page={page} setPage={setPage} language={language} setLanguage={setLanguage} />

      <main style={{ flex: 1 }}>
        {page === 'scanner' && <FoodScanner language={language} />}
        {page === 'about' && <About language={language} />}
      </main>

      <footer className="footer">
        © 2025 AaharSense AI &nbsp;·&nbsp; Built for AMD Ideathon &nbsp;·&nbsp;
        Powered by Google Gemini
      </footer>
    </div>
  );
}

export default App;
