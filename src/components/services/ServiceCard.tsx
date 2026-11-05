import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: any;
  idx: number;
  setShowModal: (show: boolean) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, idx, setShowModal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.15 }}
      className={`group rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/20 transition-all duration-500 overflow-hidden ${
        idx === 0 
          ? "lg:col-span-2 flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 md:gap-12 bg-gradient-to-br from-white to-slate-50" 
          : "flex flex-col p-8 md:p-10"
      }`}
    >
      <div className={`shrink-0 ${idx === 0 ? "w-32 h-32" : "w-20 h-20"} ${service.color} text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-current/20 ${idx !== 0 && "mb-8"}`}>
        {React.cloneElement(service.icon as React.ReactElement<{ size?: number }>, { size: idx === 0 ? 48 : 36 })}
      </div>
      
      <div className={idx === 0 ? "flex-1" : ""}>
        <h3 className={`${idx === 0 ? "text-3xl md:text-4xl" : "text-2xl"} font-extrabold text-dark mb-4 group-hover:text-primary transition-colors`}>
          {service.title}
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed whitespace-pre-line text-lg">
          {service.desc}
        </p>
        
        {service.features && service.features.length > 0 && (
          <ul className={`grid ${idx === 0 ? "sm:grid-cols-2 gap-4" : "grid-cols-1 gap-3"} mb-10`}>
            {service.features.map((f: string) => (
              <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}
        
        {service.title !== "Sertifikasi Halal" && service.title !== "Legalitas Bisnis" && service.title !== "Halal Branding" && (
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all bg-primary/5 px-6 py-3 rounded-xl hover:bg-primary hover:text-white"
          >
            Konsultasi {service.title}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
