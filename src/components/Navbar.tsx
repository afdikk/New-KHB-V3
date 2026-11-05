import { motion, AnimatePresence } from "motion/react";
import { User, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar({ pages = [] }: { pages?: any[] }) {
  const location = useLocation();
  const [isJoined, setIsJoined] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to check if a specific page title exists. Bila CMS tidak tersedia
  // (pages kosong), semua menu bawaan tetap ditampilkan.
  const hasPage = (title: string) =>
    pages.length === 0 || pages.some((p: any) => p.title?.toLowerCase() === title.toLowerCase());

  useEffect(() => {
    const checkStatus = () => {
      const status = localStorage.getItem("isJoinedCommunity") === "true";
      setIsJoined(status);
    };

    checkStatus();
    window.addEventListener("communityStatusChanged", checkStatus);
    return () => window.removeEventListener("communityStatusChanged", checkStatus);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", href: "/", show: hasPage("Landing Page") },
    { name: "Layanan", href: "/layanan", show: hasPage("Layanan") },
    { name: "Events", href: "/events", show: true },
    { name: "Repository", href: "/repository", show: true },
    { name: "Gallery", href: "/galeri", show: hasPage("Galeri Komunitas") },
    { name: "Contact Us", href: "/kontak", show: hasPage("Kontak") },
  ].filter(link => link.show);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container-custom py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <img src="/logoKHB.png" alt="KHB Bandung" className="h-8 md:h-10 w-auto" referrerPolicy="no-referrer" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href 
                  ? "text-primary font-bold" 
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {isJoined && (
            <Link to="/profile" className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 md:hidden text-slate-600 hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-xl"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-lg font-bold py-2 transition-colors ${
                    location.pathname === link.href ? "text-primary border-l-4 border-primary pl-4" : "text-slate-600 hover:text-primary pl-1"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isJoined && (
                <Link to="/join-community" className="mt-4">
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
                    Join Community
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
