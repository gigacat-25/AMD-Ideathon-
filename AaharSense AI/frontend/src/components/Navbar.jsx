import React, { useState } from 'react';

export default function Navbar({ page, setPage, language, setLanguage }) {
  const langs = ['English', 'ಕನ್ನಡ', 'हिन्दी'];

  return (
    <>
      <div className="flag-bar" />
      <nav className="navbar">
        <a className="navbar-brand" href="#" onClick={e => { e.preventDefault(); setPage('scanner'); }}>
          <div className="navbar-brand-icon">🍛</div>
          AaharSense AI
        </a>

        <div className="navbar-nav">
          <button
            className={`nav-btn ${page === 'scanner' ? 'active' : ''}`}
            onClick={() => setPage('scanner')}
          >
            Analyzer
          </button>
          <button
            className={`nav-btn ${page === 'about' ? 'active' : ''}`}
            onClick={() => setPage('about')}
          >
            About
          </button>

          <select
            className="lang-select"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {langs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </nav>
    </>
  );
}
