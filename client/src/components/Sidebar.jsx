import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', icon: '🔮', label: 'Dashboard', end: true },
  { to: '/clients', icon: '👥', label: 'Clients' },
  { to: '/appointments', icon: '📅', label: 'Appointments' },
  { to: '/notes', icon: '📜', label: 'Notes' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">⭐ AstroVault</div>
        <div className="logo-sub">CRM for Astrologers</div>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button className="nav-link" onClick={handleLogout} style={{ marginTop: 'auto' }}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="user-card">
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">Astrologer</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
