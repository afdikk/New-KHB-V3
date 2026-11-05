import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: 'AI & KNOWLEDGE',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></> },
      { to: '/admin/chatbot', label: 'Chatbot AI', icon: <><circle cx="10" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" /><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
      { to: '/admin/products', label: 'Produk', icon: <><path d="M3 7l7-4 7 4v6l-7 4-7-4V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M3 7l7 4 7-4M10 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></> },
      { to: '/admin/knowledge-base', label: 'Basis Pengetahuan', icon: <><rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
      { to: '/admin/knowledge', label: 'Flow Builder', icon: <><circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.5" /><circle cx="14" cy="14" r="2.4" stroke="currentColor" strokeWidth="1.5" /><path d="M6 8.4v3.2a2.4 2.4 0 002.4 2.4h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
    ],
  },
  {
    label: 'OMNICHANNEL',
    items: [
      { to: '/admin/channels', label: 'Channels', icon: <path d="M7 8a4 4 0 015.7-.4l2 2a4 4 0 01-5.6 5.6l-1.1-1.1M9 12a4 4 0 01-5.7.4l-2-2a4 4 0 015.6-5.6l1.1 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> },
    ],
  },
  {
    label: 'WORKSPACE',
    items: [
      { to: '/admin/customers', label: 'Pelanggan', icon: <><circle cx="8" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.5" /><path d="M2 17c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 5.2A2.8 2.8 0 0114 10.6M16 17c0-2.2-1-3.8-2.6-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
      { to: '/admin/getting-started', label: 'Panduan Mulai', icon: <path d="M10 2l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 14.4 5 17.2l1.2-5.6L2 7.8l5.6-.6L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /> },
    ],
  },
  {
    label: 'KHB',
    items: [
      { to: '/admin/chat', label: 'Chat Edukasi', badge: 'AI', icon: <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /> },
      { to: '/admin/history', label: 'Percakapan', icon: <><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></> },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, collapsed = false, onClose }: SidebarProps) {
  return (
    <aside className={'sidebar' + (open ? ' open' : '') + (collapsed ? ' collapsed' : '')} id="sidebar">
      <NavLink className="brand" to="/admin/dashboard" aria-label="KHB Beranda">
        <div className="brand-mark">
          <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path d="M22 4 36 9.5v11C36 29.8 30 35.3 22 38.8 14 35.3 8 29.8 8 20.5v-11L22 4Z" fill="currentColor" opacity=".2" />
            <path d="m13.5 22 5.2 5.1 11-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="brand-copy">
          <strong>komunitas<span>halal</span></strong>
          <small>BANDUNG · AI</small>
        </div>
      </NavLink>

      <nav className="main-nav sidebar-scroll" aria-label="Menu utama">
        {GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={item.label}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span className="nav-icon">
                  <svg viewBox="0 0 20 20" fill="none">{item.icon}</svg>
                </span>
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

    </aside>
  );
}
