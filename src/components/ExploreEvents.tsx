import { motion, AnimatePresence } from "motion/react";
import { Search, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { allEvents } from "../data/mockEvents";
import { EventDiscoveryCard } from "./events/EventDiscoveryCard";

interface ExploreEvent {
  id: string | number;
  title: string;
  date: string;
  location: string;
  category: string;
  image: string;
  popular: boolean;
  type: "Upcoming" | "Past";
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/khb-event/800/500";

export default function ExploreEvents() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<ExploreEvent[]>(allEvents as ExploreEvent[]);

  // Ambil agenda dari database; bila API kosong/gagal, pakai data contoh agar
  // halaman tetap tampil (mis. saat backend dimatikan).
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/v1/public/events");
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: Array<{
            id: string;
            title: string;
            slug: string;
            category: string;
            location: string | null;
            startsAt: string;
            imageUrl: string | null;
          }>;
        };
        const rows = payload.data ?? [];
        if (!active || rows.length === 0) return;
        setEvents(
          rows.map((row) => ({
            id: row.slug,
            title: row.title,
            date: row.startsAt.slice(0, 10),
            location: row.location ?? "Bandung",
            category: row.category,
            image: row.imageUrl ?? FALLBACK_IMAGE,
            popular: false,
            type: new Date(row.startsAt).getTime() >= Date.now() ? "Upcoming" : "Past",
          })),
        );
      } catch {
        // biarkan data contoh
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category))).map((name) => ({
        name,
        image:
          events.find((event) => event.category === name)?.image ??
          "https://picsum.photos/seed/khb-category/400/400",
      })),
    [events],
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20">
      <section className="pt-24 pb-16 bg-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Discovery</p>
              <h1 className="text-4xl md:text-6xl font-extrabold">Jelajahi Event.</h1>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full md:max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Temukan inspirasi event..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-white placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="container-custom">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-dark">Kategori Populer</h2>
            </div>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 no-scrollbar">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex-shrink-0 group relative w-32 sm:w-40 aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-300 ${activeCategory === cat.name ? "border-primary shadow-2xl shadow-primary/30" : "border-transparent shadow-lg shadow-slate-200"}`}
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/10 to-transparent transition-opacity duration-500 ${activeCategory === cat.name ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`} />
                  <div className="absolute inset-x-0 bottom-4 text-center px-2">
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide">{cat.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => (
                <EventDiscoveryCard key={event.id} event={event} idx={idx} />
              ))}
            </AnimatePresence>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Tidak ada hasil</h3>
              <p className="text-slate-500">Coba gunakan kata kunci lain atau ganti kategori.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
