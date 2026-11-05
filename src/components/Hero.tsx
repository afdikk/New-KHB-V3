import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cmsService } from "../services/api";
import { Skeleton } from "./shared/Skeleton";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cmsData, setCmsData] = useState<{
    headline: string;
    subheadline: string;
    sub_headline?: string;
    backgroundImage?: string;
    backgroundImages?: string[];
    stats?: { label: string; value: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const images = (loading || !cmsData) ? [] : (cmsData?.backgroundImages?.length 
    ? cmsData.backgroundImages 
    : (cmsData?.backgroundImage ? [cmsData.backgroundImage] : []));

  const staticData = {
    headline: "KHB On Clinic: Business Growth",
    subheadline: "Akselerasi UMKM Anda melalui konsultasi bisnis mendalam, pendampingan legalitas NIB & PIRT, serta percepatan Sertifikasi Halal yang kredibel."
  };

  useEffect(() => {
    const loadCms = async () => {
      try {
        const pages = await cmsService.getPages();
        const landingPage = pages.find((p: any) => p.slug === "landing-page");
        if (landingPage) {
          const heroBlock = landingPage.content.find((c: any) => c.type === "hero");
          if (heroBlock && heroBlock.data) {
            setCmsData({
              headline: heroBlock.data.headline,
              subheadline: heroBlock.data.sub_headline ?? heroBlock.data.subheadline ?? "",
              sub_headline: heroBlock.data.sub_headline,
              backgroundImage: heroBlock.data.background_image,
              backgroundImages: heroBlock.data.background_images || [],
              stats: heroBlock.data.stats
            });
          }
        }
      } catch (error) {
        console.error("Hero CMS fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCms();

    const interval = setInterval(() => {
      if (images.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Keluarga Selamanya
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-dark leading-[1.1] mb-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-3/4" />
                </div>
              ) : (
                cmsData?.headline || staticData.headline
              )}
            </h1>
            
            <div className="mb-8">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                  {cmsData?.sub_headline || staticData.subheadline}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {loading ? (
                <>
                  <Skeleton className="h-14 w-44 rounded-xl" />
                </>
              ) : (
                <>
                  <Link to="/layanan" className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center sm:justify-start gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all text-sm sm:text-base"
                    >
                      Konsultasi Sekarang
                      <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                </>
              )}
            </div>


          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-auto lg:h-[600px] bg-slate-200">
              {loading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : (
                <>
                  {images.length > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt="Business Growth"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8 }}
                        className="w-full h-full object-cover relative z-10"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      Tidak ada gambar
                    </div>
                  )}
                </>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent pointer-events-none z-20" />
            </div>

            {/* Floating Card - Positioned to the bottom-left of the image */}
            <motion.div 
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -left-6 bottom-12 bg-white p-6 rounded-[2rem] shadow-xl z-40 border border-slate-100 hidden sm:block"
            >
              <div className="flex flex-col">
                <p className="text-2xl font-extrabold text-primary">{cmsData?.stats?.[0]?.value || "1,200+"}</p>
                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{cmsData?.stats?.[0]?.label || "Sertifikat Halal"}</p>
              </div>
            </motion.div>
            
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
