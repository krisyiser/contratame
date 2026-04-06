"use client";

import { Star, ShoppingCart, User, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string; // 'digital', 'physical', 'abstract'
  requires_kyc?: boolean;
  image_url: string;
  owner?: {
    full_name: string;
    avatar_url: string;
  };
}

export function GigCard({ gig, onHire }: { gig: Gig; onHire: (gig: Gig) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-premium group"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={gig.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"}
          alt={gig.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="rounded-xl bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
            {gig.category}
          </span>
          {gig.type === 'physical' && (
            <span className="rounded-xl bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-1">
              Físico
            </span>
          )}
          {gig.type === 'abstract' && (
            <span className="rounded-xl bg-amber-500/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-1">
              Abstracto
            </span>
          )}
          {gig.requires_kyc && (
            <span className="rounded-xl bg-rose-500/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 fill-current" />
              KYC Req.
            </span>
          )}
          {gig.price > 500 && !gig.requires_kyc && (
            <span className="rounded-xl bg-amber-500/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" />
              Pro
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 overflow-hidden rounded-xl border-2 border-indigo-500/30 bg-slate-100 p-0.5">
              <img 
                src={gig.owner?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${gig.id}`} 
                alt="" 
                className="h-full w-full rounded-lg object-cover" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {gig.owner?.full_name || "Freelancer Elite"}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
                <ShieldCheck className="h-3 w-3" />
                Verificado
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            <Star className="h-3 w-3 text-amber-500 fill-current" />
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">4.9</span>
          </div>
        </div>

        <h3 className="mb-3 text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1">
          {gig.title}
        </h3>
        
        <p className="mb-6 flex-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {gig.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">Desde</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              ${gig.price}
            </span>
          </div>
          
          <button
            onClick={() => onHire(gig)}
            className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 hover:scale-110 active:scale-95 group/btn"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover/btn:-rotate-12" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function GigSkeleton() {
  return (
    <div className="animate-pulse flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="mt-4 flex justify-between">
          <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
