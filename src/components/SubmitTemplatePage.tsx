import { motion } from "motion/react";
import { Upload, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { submitLead } from "../lib/leads";

export default function SubmitTemplatePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mainCategory, setMainCategory] = useState("Media Elektronik");
  const [subCategory, setSubCategory] = useState("");

  const subCategories: Record<string, string[]> = {
    "Media Elektronik": ["IG", "PPT", "TikTok", "WA"],
    "Media Cetak": ["X-Banner", "Flyer", "Poster", "Kartu Nama"]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const templateName = String(data.get("templateName") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();

    setSubmitting(true);
    setError("");
    try {
      await submitLead({
        type: "template",
        name: templateName,
        message: `${mainCategory} / ${subCategory} — ${description}`,
        source: "/submit-template",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim template, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 container-custom min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-dark mb-4">Berhasil Diajukan!</h2>
          <p className="text-slate-500 mb-10">Terima kasih telah berkontribusi. Tim kami akan meninjau template Anda sebelum dipublikasikan di repository.</p>
          <Link to="/repository" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
            Kembali ke Repository
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container-custom max-w-4xl">
        <Link to="/repository" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Kembali
        </Link>
        
        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-dark mb-4">Ajukan Template.</h1>
            <p className="text-slate-500 text-lg">Bagikan karya desain Anda untuk membantu UMKM Halal Bandung berkembang lebih pesat.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-dark ml-2">Nama Template</label>
                <input 
                  required
                  name="templateName"
                  type="text" 
                  placeholder="Contoh: Poster Ramadhan Minimalis"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-dark ml-2">Kategori Utama</label>
                <select 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                  value={mainCategory}
                  onChange={(e) => {
                    setMainCategory(e.target.value);
                    setSubCategory("");
                  }}
                >
                  <option value="Media Elektronik">Media Elektronik</option>
                  <option value="Media Cetak">Media Cetak</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-dark ml-2">Sub Kategori</label>
                <select 
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="" disabled>Pilih Sub Kategori</option>
                  {subCategories[mainCategory].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-dark ml-2">Deskripsi Singkat</label>
              <textarea 
                required
                name="description"
                rows={4}
                placeholder="Jelaskan kegunaan dan fitur template Anda..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-dark ml-2">Upload File (ZIP/PDF/Image)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-primary transition-colors cursor-pointer bg-slate-50/50">
                <Upload size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Klik atau seret file ke sini untuk mengunggah</p>
                <p className="text-xs text-slate-400 mt-2">Maksimal ukuran file 20MB</p>
              </div>
            </div>

            {error ? <p className="text-sm font-bold text-red-500 bg-red-50 rounded-2xl px-5 py-3">{error}</p> : null}
            <button type="submit" disabled={submitting} className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-60">
              <CheckCircle size={24} />
              {submitting ? "Mengirim…" : "Kirim Template"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
