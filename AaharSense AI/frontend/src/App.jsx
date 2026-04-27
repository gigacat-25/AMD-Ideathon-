import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FoodScanner from './components/FoodScanner';
import About from './components/About';

function App() {
  const [page, setPage] = useState('scanner');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="app-root">
      <Navbar 
        page={page} 
        setPage={setPage} 
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="main-content container py-8">
        {page === 'scanner' && (
          <FoodScanner language={language} />
        )}
        
        {page === 'about' && (
          <About language={language} />
        )}
      </main>

      <footer className="app-footer py-12 text-center border-t mt-12">
        <p className="text-muted text-sm">
          © 2024 AaharSense AI. Built for AMD Ideathon.
        </p>
      </footer>
    </div>
  );
}

export default App;
