import React, { useState } from "react";
import { submitLead } from "../lib/leads";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (isLogin) {
      // Akun komunitas belum punya basis data pengguna; masuk hanya sebagai
      // penanda di peramban. Pendaftaran di bawah tetap tersimpan di server.
      localStorage.setItem("isJoinedCommunity", "true");
      window.dispatchEvent(new Event("communityStatusChanged"));
      navigate("/");
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await submitLead({ type: "account", name, email, source: "/auth" });
      localStorage.setItem("isJoinedCommunity", "true");
      window.dispatchEvent(new Event("communityStatusChanged"));
      setNotice("Pendaftaran terkirim. Tim KHB akan menghubungi Anda.");
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <Link to="/join-community" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Kembali
        </Link>

        <motion.div 
          layout
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-dark mb-2">
                {isLogin ? "Selamat Datang Kembali!" : "Buat Akun Baru."}
              </h1>
              <p className="text-slate-500">
                {isLogin ? "Masuk untuk mengakses fitur komunitas." : "Daftar untuk menjadi bagian dari Halal Bandung."}
              </p>
            </div>

            {error ? <p className="text-sm font-bold text-red-500 bg-red-50 rounded-2xl px-5 py-3">{error}</p> : null}
            {notice ? <p className="text-sm font-bold text-green-600 bg-green-50 rounded-2xl px-5 py-3">{notice}</p> : null}
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-bold text-dark ml-2">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        required
                        name="name"
                        type="text" 
                        placeholder="John Doe"
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-bold text-dark ml-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required
                    name="email"
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-dark ml-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-bold text-dark ml-2">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        required
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Lupa Password?</button>
                </div>
              )}

              <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3">
                {isLogin ? "Masuk" : "Daftar"}
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">Atau lanjutkan dengan</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all font-bold text-sm">
                <GoogleIcon />
                Lanjutkan dengan Google
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Daftar Sekarang" : "Masuk Sekarang"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
