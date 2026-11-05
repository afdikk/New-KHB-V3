import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const COLLAPSE_KEY = 'khb-sidebar-collapsed';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className={'app-shell' + (collapsed ? ' side-collapsed' : '')} id="app-shell">
      <Sidebar open={menuOpen} collapsed={collapsed} onClose={() => setMenuOpen(false)} />
      {menuOpen ? <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true"></div> : null}
      <main className="main-area">
        <Topbar onMenu={() => setMenuOpen(true)} onToggleSidebar={() => setCollapsed((v) => !v)} sidebarCollapsed={collapsed} />
        <Outlet />
      </main>
    </div>
  );
}
