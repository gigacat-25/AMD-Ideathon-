import './Navbar.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'scanner', label: 'Scan Food', icon: '◉' },
  { id: 'recommendations', label: 'AI Suggest', icon: '◈' },
  { id: 'query', label: 'Ask AI', icon: '◎' },
  { id: 'weekly', label: 'Reports', icon: '▣' },
];

export default function Navbar({ user, page, nav, onLogout }) {
  return (
    <nav className="topbar" role="navigation" aria-label="Main navigation">
      <div className="topbar-inner container">
        <button className="topbar-brand" onClick={() => nav('dashboard')} aria-label="Dashboard">
          <span className="brand-mark">◆</span>
          <span className="brand-text">Nutri<span className="gradient-text">Sense</span></span>
        </button>

        <div className="topbar-nav" role="menubar">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => nav(n.id)} role="menuitem" aria-current={page === n.id ? 'page' : undefined}>
              <span className="nav-indicator"></span>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="topbar-end">
          <button className={`avatar-btn ${page === 'profile' ? 'active' : ''}`}
            onClick={() => nav('profile')} aria-label="Profile">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </button>
          <button className="btn btn-ghost text-xs" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
