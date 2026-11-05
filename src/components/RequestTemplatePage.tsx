import { 
  Plus, 
  ArrowLeft, 
  MessageSquare, 
  Layers, 
  LayoutGrid, 
  FileText, 
  Laptop 
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { cmsService } from "../services/api";

const formatWAMarkdown = (text: string) => {
  if (!text) return "";
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  formatted = formatted.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\n/g, "<br />");
  
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export default function RequestTemplatePage() {
  const [cmsContacts, setCmsContacts] = useState<any>(null);
  const [mainCategory, setMainCategory] = useState("Media Elektronik");
  const [subCategory, setSubCategory] = useState("IG Feed/Story");
  const [formData, setFormData] = useState({
    description: "",
    app: ""
  });
  const [timeStr, setTimeStr] = useState("08:00");

  const subCategories: Record<string, string[]> = {
    "Media Elektronik": ["IG Feed/Story", "PowerPoint Template", "Video TikTok/Reels", "WhatsApp Broadcast Banner"],
    "Media Cetak": ["X-Banner", "Brosur/Flyer", "Poster Acara", "Kartu Nama"]
  };

  useEffect(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setTimeStr(`${hh}:${mm}`);
  }, []);

  useEffect(() => {
    const loadCms = async () => {
      try {
        const pages = await cmsService.getPages();
        const contactPage = pages.find((p: any) => p.slug === "kontak");
        if (contactPage) {
          const contactsBlock = contactPage.content.find((c: any) => c.type === "contacts");
          setCmsContacts(contactsBlock?.data);
        }
      } catch (error) {
        console.error("Request page CMS fetch error:", error);
      }
    };
    loadCms();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const messagePreview = `*REQUEST TEMPLATE BARU*

*Detail Kebutuhan Template:*
• *Deskripsi Template:* ${formData.description || "..."}
• *Kategori Utama:* ${mainCategory}
• *Sub-Kategori:* ${subCategory}
• *Aplikasi:* ${formData.app || "Canva, PPT, atau semacamnya"}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rawPhone = cmsContacts?.phone_numbers?.[0] || "+62 812-3456-7890";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messagePreview)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container-custom max-w-5xl">
        <Link to="/repository" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Kembali ke Library
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-[3rem] p-8 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-primary-dark" />
            
            <div className="mb-8">
              <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">WhatsApp Request</p>
              <h1 className="text-3xl font-extrabold text-dark mb-4">Request Template.</h1>
              <p className="text-slate-500 text-sm">
                Isi detail kebutuhan template Anda di bawah ini, lalu kirimkan permintaan langsung ke WhatsApp Admin KHB.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-2">Deskripsi Template</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-400">
                    <FileText size={18} />
                  </span>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Contoh: Saya membutuhkan banner promosi diskon awal bulan bertema kopi susu."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 ml-2">Kategori Utama</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Layers size={18} />
                    </span>
                    <select 
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm appearance-none font-medium"
                      value={mainCategory}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setMainCategory(selected);
                        setSubCategory(subCategories[selected][0]);
                      }}
                    >
                      <option value="Media Elektronik">Media Elektronik</option>
                      <option value="Media Cetak">Media Cetak</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 ml-2">Sub Kategori</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <LayoutGrid size={18} />
                    </span>
                    <select 
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm appearance-none font-medium"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                    >
                      {subCategories[mainCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 ml-2">Aplikasi Desain yang Diinginkan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Laptop size={18} />
                  </span>
                  <input 
                    type="text" 
                    name="app"
                    value={formData.app}
                    onChange={handleInputChange}
                    placeholder="Contoh: Canva, PPT, Photoshop"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3">
                <MessageSquare size={20} />
                Kirim ke WhatsApp Admin
              </button>
            </form>
          </div>

          {/* WA Live Preview Column */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[480px]">
              {/* WA Header */}
              <div className="bg-[#008069] text-white px-5 py-4 flex items-center justify-between shadow-md select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm relative">
                    KH
                    <span className="w-2 h-2 bg-emerald-400 rounded-full absolute bottom-0 right-0 border border-[#008069]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Admin KHB</h4>
                    <p className="text-[9px] text-emerald-100">Online</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-white/15 rounded">Live WA Preview</span>
              </div>

              {/* WA Chat Body */}
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-end" 
                style={{ 
                  backgroundColor: "#efeae2",
                  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
                  backgroundSize: "cover",
                  backgroundBlendMode: "overlay",
                  opacity: 0.92
                }}
              >
                <div className="self-center bg-white/90 backdrop-blur-sm text-[8px] text-slate-500 px-3 py-1 rounded shadow-sm mb-4 max-w-[85%] text-center font-medium border border-slate-100 select-none">
                  🔒 Pesan dienkripsi secara end-to-end.
                </div>

                {/* Sender Bubble */}
                <div className="self-end bg-[#d9fdd3] text-[#111b21] p-3 rounded-2xl rounded-tr-none shadow-md max-w-[88%] text-[11px] leading-relaxed relative border border-[#cbe4c7] break-words break-all overflow-hidden">
                  <div className="font-sans whitespace-pre-wrap break-words break-all pb-4 pr-8 select-text">
                    {formatWAMarkdown(messagePreview)}
                  </div>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[8px] text-slate-400 font-medium select-none">
                    <span>{timeStr}</span>
                    <span className="text-[#53bdeb] text-[10px] font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* WA Footer */}
              <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2 border-t border-slate-200 select-none">
                <div className="flex-1 bg-white rounded-full px-4 py-2 text-[11px] text-slate-400 truncate">
                  Ketik pesan...
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow">
                  <MessageSquare size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
