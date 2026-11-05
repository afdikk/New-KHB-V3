import { motion } from "motion/react";
import { Briefcase, Binoculars, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { cmsService } from "../services/api";
import { Skeleton } from "./shared/Skeleton";
import { EcosystemSkeleton } from "./shared/CommonSkeletons";

export default function Ecosystem() {
  const [cmsData, setCmsData] = useState<{ title: string; subtitle: string; image?: string; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const staticItems = [
    { 
      title: "Sertifikasi Halal", 
      desc: "Mendapatkan sertifikasi halal adalah langkah penting bagi UMKM untuk menjamin kehalalan produknya. Kami menyediakan layanan konsultasi dan panduan dalam proses sertifikasi halal agar UMKM dapat memenuhi persyaratan yang diperlukan.",
      icon: <Briefcase className="w-7 h-7" />
    },
    { 
      title: "Konsultasi Bisnis", 
      desc: "Dapatkan konsultasi bisnis yang profesional untuk membantu UMKM dalam mengembangkan strategi pemasaran, manajemen keuangan, dan peningkatan daya saing. Tim kami akan memberikan arahan yang tepat guna membantu UMKM mencapai kesuksesan.",
      icon: <Binoculars className="w-7 h-7" />
    },
    { 
      title: "Perizinan Legalitas", 
      desc: "Kami menyediakan layanan perizinan legalitas untuk UMKM agar dapat beroperasi secara sah dan memenuhi semua persyaratan hukum. Dengan bantuan kami, UMKM dapat mengurus perizinan dengan mudah dan menghindari masalah hukum yang tidak diinginkan.",
      icon: <Rocket className="w-7 h-7" />
    },
  ];

  useEffect(() => {
    const loadCms = async () => {
      try {
        const pages = await cmsService.getPages();
        const landingPage = pages.find((p: any) => p.slug === "landing-page");
        if (landingPage) {
          const ecosystemBlock = landingPage.content.filter((c: any) => c.type === "features")[1];
          if (ecosystemBlock && ecosystemBlock.data) {
            setCmsData({
              title: ecosystemBlock.data.title,
              subtitle: ecosystemBlock.data.subtitle,
              image: ecosystemBlock.data.image_url || "/umkmKlinik.png",
              items: ecosystemBlock.data.items
            });
          }
        }
      } catch (error) {
        console.error("Ecosystem CMS fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCms();
  }, []);

  const items = cmsData ? cmsData.items.map((item, index) => ({
    title: item.title || staticItems[index]?.title,
    desc: item.description || staticItems[index]?.desc,
    icon: item.icon_url ? (
      <img src={item.icon_url} alt={item.title} className="w-7 h-7 object-contain" />
    ) : (staticItems[index]?.icon || <Briefcase className="w-7 h-7" />)
  })) : staticItems;

  if (loading) {
    return <EcosystemSkeleton />;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
          
          {/* Left Column - Branding Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-4/12 flex flex-col items-center text-center lg:sticky lg:top-32"
          >
            {/* Enhanced Modern Circular Image Wrapper */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10 group mx-auto">
              {/* Outer glowing rings */}
              <div className="absolute inset-[-10%] bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 animate-pulse" />
              
              {/* Rotating border layer 1 */}
              <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-primary/40 animate-[spin_10s_linear_infinite]" />
              
              {/* Rotating border layer 2 (reverse) */}
              <div className="absolute inset-2 rounded-full border-b-4 border-l-4 border-secondary/40 animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Main container with floating effect on hover */}
              <div className="absolute inset-4 rounded-full bg-white shadow-[0_10px_30px_rgb(0,0,0,0.1)] flex items-center justify-center z-10 overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] border-[6px] border-white">
                {/* Subtle inner gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white z-0" />
                <img 
                  src={cmsData?.image || "/umkmKlinik.png"} 
                  alt="UMKM Klinik Logo" 
                  className="w-3/4 object-contain relative z-10 group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              
              {/* Decorative floating dots */}
              <div className="absolute top-10 right-10 w-4 h-4 bg-primary rounded-full animate-bounce z-20 shadow-lg shadow-primary/40" style={{ animationDuration: '2s' }} />
              <div className="absolute bottom-10 left-10 w-6 h-6 bg-secondary rounded-full animate-bounce z-20 shadow-lg shadow-secondary/40" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </div>

            <h3 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight mb-2 italic" style={{ fontFamily: "cursive, sans-serif" }}>
              {cmsData?.title?.split(":")[0] || "UMKM Klinik"}
            </h3>
            <p className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-widest">KHB x Ko+Lab</p>
            
            <p className="text-slate-500 leading-relaxed max-w-sm text-sm">
              {cmsData?.subtitle || "Kolaborasi Komunitas UMKM dengan Ko+Lab tentang pengembangan dan pembinaan Usaha Mikro Kecil dan Menengah (UMKM) dalam upaya membantu dan mengembangkan UMKM."}
            </p>
          </motion.div>

          {/* Right Column - Cards Content */}
          <div className="w-full lg:w-8/12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 relative"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-4xl md:text-5xl font-extrabold text-dark tracking-tight italic" style={{ fontFamily: "cursive, sans-serif" }}>UMKM Klinik</h2>
                {loading && <Skeleton className="h-8 w-36" />}
              </div>
              <div className="w-12 h-1.5 bg-primary rounded-full mb-6" />
              <p className="text-slate-600 leading-relaxed text-lg">
                Program pendampingan untuk UMKM dalam pembinaan produk tersertifikasi halal. Kunjungi kami pada UMKM Klinik untuk informasi lebih lanjut.
              </p>
            </motion.div>

            <div className="space-y-6">
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white p-6 md:p-8 rounded-[2rem] border border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-primary/20 hover:-translate-y-2 transition-all duration-300 flex flex-col sm:flex-row gap-6 md:gap-8 items-start"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-primary group-hover:border-primary group-hover:text-white text-slate-500 flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm group-hover:shadow-primary/25 group-hover:shadow-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-dark mb-3 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}

