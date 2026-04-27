import './Navbar.css';

const LANGUAGES = ['English', 'ಕನ್ನಡ', 'हिन्दी'];

export default function Navbar({ page, setPage, language, setLanguage }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container flex justify-between items-center py-4">
        {/* Brand */}
        <button className="flex items-center gap-2 border-none bg-transparent cursor-pointer" onClick={() => setPage('scanner')}>
          <div className="flex flex-col items-start">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--primary-container)' }}>
              Aahar<span style={{ color: 'var(--secondary-container)' }}>Sense</span> AI
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted" style={{ marginTop: '-4px' }}>
              Food Analyzer
            </span>
          </div>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <button 
            className={`btn-nav ${page === 'scanner' ? 'active' : ''}`}
            onClick={() => setPage('scanner')}
          >
            Analyze
          </button>
          <button 
            className={`btn-nav ${page === 'about' ? 'active' : ''}`}
            onClick={() => setPage('about')}
          >
            About
          </button>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-surface-dim rounded-md p-1 shadow-inner">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${
                  language === l ? 'bg-primary-container text-white shadow-sm' : 'bg-transparent text-muted hover:text-primary'
                }`}
                onClick={() => setLanguage(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
