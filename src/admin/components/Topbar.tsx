import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { labels } from '../data/khb';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const pathKey = (p: string): string => p.replace('/', '') || 'dashboard';

const resolveLabel = (key: string): string => {
  if (labels[key]) return labels[key];
  if (key.startsWith('channels/')) return 'Edit Kanal';
  if (key.startsWith('products/')) return 'Edit Produk';
  return 'Ringkasan';
};

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const MENU: MenuItem[] = [
  {
    to: '/admin/edit-profile',
    label: 'Edit Profil',
    icon: <path d="M13 3l4 4-9 9H4v-4L13 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  },
  {
    to: '/admin/settings',
    label: 'Pengaturan',
    icon: (
      <>
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
];

interface TopbarProps {
  onMenu?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function Topbar({ onMenu, onToggleSidebar, sidebarCollapsed = false }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const title = resolveLabel(pathKey(pathname));
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void api.notifications
      .list()
      .then((data) => setUnread(data.unread))
      .catch(() => setUnread(0));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="topbar">
      <button className="mobile-menu icon-btn" onClick={onMenu} aria-label="Buka menu">
        <svg viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </button>
      <button
        className="icon-btn sidebar-collapse-btn"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        aria-expanded={!sidebarCollapsed}
        title={sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
      >
        <svg viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7.5 3.5v13" stroke="currentColor" strokeWidth="1.5" />
          {sidebarCollapsed
            ? <path d="M11 8l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            : <path d="M13 8l-2 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      </button>
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="crumb-slash">/</span>
        <strong id="breadcrumb-current">{title}</strong>
      </div>
      <div className="topbar-actions">
        <span className="prototype-badge"><i></i> PROTOTIPE</span>
        <Link className="icon-btn notification-btn" to="/admin/notifications" aria-label="Notifikasi">
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 3 .8 5 1.5 6H2.5C3.2 13 4 11 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          {unread > 0 ? <span className="notif-badge" id="notif-badge">{unread}</span> : null}
        </Link>
        <div className="topbar-pop-wrap" ref={wrap}>
          <button
            className="topbar-avatar-btn"
            aria-label="Menu profil"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <div className="avatar avatar-admin" id="topbar-avatar">A</div>
          </button>
          <div className={`topbar-pop${open ? '' : ' hidden'}`} id="profile-pop" role="menu" aria-label="Menu profil">
            {MENU.map((item) => (
              <button
                key={item.to}
                className="profile-dd-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate(item.to);
                }}
              >
                <svg viewBox="0 0 20 20" fill="none">{item.icon}</svg>
                {item.label}
              </button>
            ))}
            <div className="profile-dd-divider"></div>
            <button
              className="profile-dd-item danger"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/admin/login', { replace: true });
              }}
            >
              <svg viewBox="0 0 20 20" fill="none"><path d="M8 3H4a1 1 0 00-1 1v12a1 1 0 001 1h4M13 14l4-4-4-4M17 10H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
