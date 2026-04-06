"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Menu, X, CheckCircle2, User, LogOut, LayoutDashboard, 
  ShoppingCart, FileText, ExternalLink, ChevronRight, Sparkles, TrendingUp, 
  ShieldCheck, Zap, Globe, ArrowRight, AlertTriangle, QrCode, Lock,
  Camera, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GigCard, GigSkeleton } from "../components/GigCard";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabase";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Mock Data
const MOCK_GIGS = [
  { id: "1", owner_id: "f1", title: "Diseño de Logotipo Moderno", description: "Logotipos únicos para tu startup con 3 propuestas.", price: 450, category: "Diseño", type: "digital", image_url: "https://images.unsplash.com/photo-1572044162444-ad60f128bde7?q=80&w=800&auto=format&fit=crop" },
  { id: "2", owner_id: "f2", title: "Reparación Eléctrica Domicilio", description: "Servicios profesionales de electricidad certificados.", price: 150, category: "Oficios", type: "physical", image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop" },
  { id: "3", owner_id: "f3", title: "Lectura de Tarot Espiritual", description: "Conoce tu destino financiero. Sesión de 1h.", price: 50, category: "Entretenimiento", type: "abstract", image_url: "https://images.unsplash.com/photo-1620131435213-9110d7a049c6?q=80&w=800&auto=format&fit=crop" },
  { id: "4", owner_id: "f4", title: "Asesoría Legal Corporativa", description: "Contratos de confidencialidad y revisión societaria.", price: 1200, category: "Legal", type: "digital", requires_kyc: true, image_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop" },
  { id: "5", owner_id: "f1", title: "Arquitectura Cloud AWS", description: "Configuración total de tus servidores.", price: 2500, category: "Web", type: "digital", image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" },
  { id: "6", owner_id: "f5", title: "Pintura de Interiores", description: "Renueva tu hogar con un acabado perfecto.", price: 300, category: "Oficios", type: "physical", image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0e?q=80&w=800&auto=format&fit=crop" },
];

export default function ContrataMe() {
  const [user, setUser] = useState<{ id: string; email: string; role: 'freelancer' | 'client', isVerified: boolean } | null>(null);
  const [gigs, setGigs] = useState(MOCK_GIGS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState('explore');
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [showChatId, setShowChatId] = useState<string | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewDetailGig, setViewDetailGig] = useState<any>(null);
  const [category, setCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // New Gig Form State
  const [newGigForm, setNewGigForm] = useState({
    title: '', description: '', price: 0, category: 'Diseño', type: 'digital'
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<Record<string, any[]>>({});
  const [currentMessage, setCurrentMessage] = useState('');

  // Job Actions State
  const [jobs, setJobs] = useState<any[]>([]);
  const [scanMode, setScanMode] = useState<string | null>(null); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setUser({ ...profile, email: session.user.email } as any);
      }

      const { data: dbGigs } = await supabase.from('gigs').select('*');
      if (dbGigs && dbGigs.length > 0) setGigs(dbGigs);

      const { data: dbJobs } = await supabase.from('jobs').select('*');
      if (dbJobs) setJobs(dbJobs);
      
      setLoading(false);
    };

    fetchInitialData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
       if (session) {
         const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         setUser({ ...profile, email: session.user.email } as any);
         setShowAuthModal(false);
       } else {
         setUser(null);
       }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogin = async (role: 'freelancer' | 'client') => {
    // We now use the Auth Modal for all logins
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab('explore');
  };

  const handleHireClick = (gig: any) => {
    if (!user) {
      alert("Debes iniciar sesión para contratar.");
      return;
    }
    if (gig.type === 'abstract') {
      setSelectedGig(gig);
      setShowDisclaimerModal(true);
    } else {
      setSelectedGig(gig);
      setShowPaymentModal(true);
    }
  };

  // 1. ESCROW SIMULATION
  const createEscrowJob = async () => {
    const newJob = {
      id: Math.random().toString(36).substring(2, 9),
      gig_id: selectedGig.id,
      gig_title: selectedGig.title,
      type: selectedGig.type,
      price: selectedGig.price,
      client_id: user?.id,
      owner_id: selectedGig.owner_id, 
      status: 'escrow_funded',
      created_at: new Date().toISOString()
    };
    
    setJobs([newJob, ...jobs]);
    await supabase.from('jobs').insert([newJob]); // Sync to Supabase
    
    setShowPaymentModal(false);
    setShowDisclaimerModal(false);
    setActiveTab('dashboard');
  };

  // POST A GIG
  const handlePostGig = async () => {
    if (!newGigForm.title || !newGigForm.price) return;
    const gig = {
      id: Math.random().toString(36).substring(2, 9),
      title: newGigForm.title,
      description: newGigForm.description,
      price: newGigForm.price,
      category: newGigForm.category,
      type: newGigForm.type,
      owner_id: user?.id,
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    };
    
    await supabase.from('gigs').insert([gig]);
    setGigs([...gigs, gig]);
    setShowPostGigModal(false);
    setNewGigForm({ title: '', description: '', price: 0, category: 'Diseño', type: 'digital' });
  };

  // CHAT LOGIC
  const sendMessage = (jobId: string) => {
    if (!currentMessage.trim()) return;
    const msg = { id: Date.now(), text: currentMessage, sender: user?.role, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const jobChat = chatMessages[jobId] || [];
    setChatMessages({ ...chatMessages, [jobId]: [...jobChat, msg] });
    setCurrentMessage('');
    
    // Auto-reply mock
    setTimeout(() => {
      const reply = { id: Date.now() + 1, text: "Recibido. Revisaré los detalles ahora mismo.", sender: user?.role === 'client' ? 'freelancer' : 'client', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => ({ ...prev, [jobId]: [...(prev[jobId] || []), reply] }));
    }, 1500);
  };

  // KYC LOGIC
  const handleVerifyKYC = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedUser = { ...user!, isVerified: true };
      setUser(updatedUser as any);
      setLoading(false);
      setShowKYCModal(false);
      alert("¡Identidad Verificada con Éxito (Stripe Identity Mock)!");
    }, 2000);
  };

  // Workflow Handlers
  const advanceJobStatus = (id: string, newStatus: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  const filteredGigs = gigs.filter(g => {
    const matchesCategory = category === 'Todas' || g.category === category;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dashboardJobs = jobs.filter(j => 
    user?.role === 'client' ? j.client_id === user.id : j.owner_id === user?.id
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-500">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-4' : 'py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`glass rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-2xl transition-all duration-500 ${
            scrolled ? 'shadow-indigo-500/10 border-indigo-500/10' : 'bg-white/40 dark:bg-slate-900/40'
          }`}>
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="h-11 w-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 transition-transform group-hover:rotate-12">
                <Sparkles className="text-white h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Contrata<span className="text-indigo-600">Me</span>
              </span>
              <div className="flex items-center gap-1.5 ml-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Live DB</span>
              </div>
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-lg"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {!user ? (
                <div className="flex gap-4">
                  <button onClick={() => handleLogin('freelancer')} className="btn-secondary">Soy Freelancer</button>
                  <button onClick={() => handleLogin('client')} className="btn-primary">
                    Comenzar Proyecto
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-6">
                    {user.role === 'client' && (
                      <button 
                        onClick={() => setActiveTab('explore')}
                        className={`text-sm font-black uppercase tracking-widest transition-all ${
                          activeTab === 'explore' ? 'text-indigo-600 scale-110' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Explorar
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className={`text-sm font-black uppercase tracking-widest transition-all ${
                        activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Dashboard
                    </button>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col pr-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 leading-none">{user.role}</span>
                      <span className="text-sm font-bold truncate max-w-[120px]">{user.email}</span>
                    </div>
                    <button 
                      onClick={() => handleLogin(user.role === 'client' ? 'freelancer' : 'client')}
                      className="p-2 hover:bg-indigo-500/10 text-indigo-600 rounded-xl transition-all"
                      title="Switch Role (Test)"
                    >
                      <TrendingUp className="h-5 w-5" />
                    </button>
                    <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-white dark:bg-slate-950 pt-40 px-6 flex flex-col gap-6"
          >
            {!user ? (
               <div className="flex flex-col gap-4">
                 <button onClick={() => handleLogin('freelancer')} className="btn-secondary w-full text-center py-6">Soy Freelancer</button>
                 <button onClick={() => handleLogin('client')} className="btn-primary w-full text-center py-6">Comenzar Proyecto</button>
               </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button onClick={() => { setActiveTab('explore'); setIsMobileMenuOpen(false); }} className={`text-xl font-black p-4 text-left rounded-2xl ${activeTab === 'explore' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Explorar Gigs</button>
                <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`text-xl font-black p-4 text-left rounded-2xl ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Dashboard</button>
                  <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white"><User /></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-indigo-500 uppercase">{user.role}</span>
                        <span className="font-bold">{user.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleLogin(user.role === 'client' ? 'freelancer' : 'client')}
                      className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl"
                    >
                      <TrendingUp className="h-6 w-6" />
                    </button>
                  </div>
                  <button onClick={handleLogout} className="w-full btn-secondary text-red-500 py-6 font-black uppercase tracking-widest text-xs">Cerrar Sesión</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-40 pb-20 max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-20">
               <header className="relative py-24 px-12 rounded-[3.5rem] overflow-hidden bg-slate-900 shadow-3xl">
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
                </div>
                <div className="relative z-10 max-w-4xl">
                   <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8">
                      <Lock className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">100% Fondos Protegidos por Escrow</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-12">
                      Pagos Seguros,<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Entrega Garantizada.</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="relative group max-w-2xl">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Buscar logotipos, plomeros, tarotistas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 backdrop-blur-3xl rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-bold text-lg shadow-2xl"
                      />
                    </div>
                </div>
              </header>

              <div className="space-y-12">
                   <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
                    {['Todas', 'Diseño', 'Web', 'Oficios', 'Legal', 'Entretenimiento'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                          category === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {!loading && filteredGigs.length === 0 ? (
                     <div className="col-span-full py-20 text-center space-y-4">
                        <Search className="h-12 w-12 mx-auto opacity-20" />
                        <p className="text-slate-400 font-bold">No encontramos servicios que coincidan.</p>
                        <button onClick={() => { setSearchQuery(''); setCategory('Todas'); }} className="text-indigo-600 font-black hover:underline uppercase text-xs tracking-widest">Limpiar Filtros</button>
                     </div>
                   ) : (
                    loading ? Array(6).fill(0).map((_, i) => <GigSkeleton key={i} />) : 
                      filteredGigs.map(gig => (
                        <div key={gig.id} onClick={() => setViewDetailGig(gig)} className="cursor-pointer">
                          <GigCard gig={gig as any} onHire={(e: any) => { e.stopPropagation(); handleHireClick(gig); }} />
                        </div>
                      ))
                   )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="flex flex-col lg:flex-row gap-12">
                 
                 {/* Dashboard Sidebar */}
                 <div className="lg:w-1/3 space-y-8">
                  <div className="card-premium p-8 text-center space-y-6 border-t-4 border-t-indigo-500">
                     <div className="relative mx-auto h-24 w-24">
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full" />
                        <div className="relative h-full w-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-indigo-500/20">
                          <User className="h-10 w-10 text-indigo-500" />
                        </div>
                     </div>
                     <h2 className="text-2xl font-black">{user?.email}</h2>
                     {user?.isVerified ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                          <ShieldCheck className="h-4 w-4" /> KYC Identidad Verificada
                        </div>
                     ) : (
                        <button 
                          onClick={() => setShowKYCModal(true)}
                          className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-200 transition-colors"
                        >
                          <AlertTriangle className="h-4 w-4" /> Pendiente Verificar ID
                        </button>
                     )}

                     {user?.role === 'freelancer' && (
                       <button onClick={() => setShowPostGigModal(true)} className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2">
                         <Zap className="h-5 w-5" /> Publicar Nuevo Gig
                       </button>
                     )}
                  </div>

                  <div className="card-premium p-8 space-y-6">
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-500">Mi Cartera</h4>
                    <div className="flex justify-between items-end">
                      <span className="text-4xl font-black">$0.00</span>
                      <span className="text-xs font-bold text-slate-400">Balance Retenido</span>
                    </div>
                  </div>
                 </div>

                 {/* Active Projects Tracker */}
                 <div className="lg:w-2/3 space-y-8">
                   <h3 className="text-3xl font-black tracking-tighter">Panel Avanzado Escrow</h3>
                   {dashboardJobs.length === 0 ? (
                      <div className="py-24 card-premium border-dashed border-2 flex flex-col items-center justify-center text-slate-400">
                        <Lock className="h-16 w-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">
                          {user?.role === 'client' ? 'Aún no has contratado servicios.' : 'No tienes trabajos asignados todavía.'}
                        </p>
                        {user?.role === 'client' && (
                          <button onClick={() => setActiveTab('explore')} className="mt-4 text-indigo-600 font-bold hover:underline">Ir a explorar gigs</button>
                        )}
                      </div>
                   ) : (
                     <div className="space-y-6">
                        {dashboardJobs.map(job => (
                           <div key={job.id} className="card-premium p-8 space-y-6 border-l-4 border-l-indigo-500">
                              <div className="flex justify-between items-start">
                                 <div>
                                   <div className="text-[10px] font-black tracking-[0.2em] mb-2 text-indigo-500 uppercase">TX-ID: {job.id.toUpperCase()}</div>
                                   <h4 className="text-2xl font-black mb-1">{job.gig_title}</h4>
                                   <div className="flex items-center gap-4">
                                     <p className="text-xs font-bold text-slate-500 uppercase">Tipo: {job.type}</p>
                                     <button 
                                      onClick={() => setShowChatId(job.id)}
                                      className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline uppercase tracking-widest"
                                     >
                                       <Globe className="h-3 w-3" /> Abrir Chat de Seguridad
                                     </button>
                                   </div>
                                 </div>
                                 <div className="text-2xl font-black">${job.price}</div>
                              </div>

                              {/* Escrow Status Timeline */}
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                 {/* Status Logic Matrix */}
                                 {job.status === 'escrow_funded' && (
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Lock className="h-6 w-6 text-emerald-500" />
                                        <div>
                                          <div className="font-black text-emerald-500">Fondos Congelados y Seguros</div>
                                          <div className="text-xs text-slate-500">ContrataMe custodia el pago.</div>
                                        </div>
                                      </div>
                                      {user?.role === 'freelancer' && (
                                        <button onClick={() => advanceJobStatus(job.id, 'in_progress')} className="btn-primary py-2 px-6 text-sm">Comenzar Trabajo</button>
                                      )}
                                   </div>
                                 )}

                                 {job.status === 'in_progress' && (
                                   <div className="flex flex-col gap-4">
                                      <div className="font-black text-amber-500 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"/> Trabajo en Progreso</div>
                                      
                                      {user?.role === 'freelancer' && job.type === 'digital' && (
                                        <button onClick={() => advanceJobStatus(job.id, 'in_review')} className="btn-secondary w-full flex items-center justify-center gap-2"><Upload className="h-4 w-4"/> Enviar Entregable (Zip/Link)</button>
                                      )}

                                      {user?.role === 'freelancer' && job.type === 'physical' && (
                                        <div className="flex gap-4">
                                          <button className="btn-secondary flex-1 py-4 flex flex-col gap-2 items-center text-xs"><Camera className="h-5 w-5"/> Subir Evidencia (Local)</button>
                                          <button onClick={() => advanceJobStatus(job.id, 'qr_checkout')} className="btn-primary flex-1 py-4 flex flex-col gap-2 items-center text-xs"><QrCode className="h-5 w-5"/> Generar Checkout QR</button>
                                        </div>
                                      )}

                                      {user?.role === 'client' && job.type === 'physical' && (
                                         <button onClick={() => setScanMode(job.id)} className="btn-primary w-full"><QrCode className="h-4 w-4"/> Escanear Checkout Físico</button>
                                      )}
                                   </div>
                                 )}

                                 {job.status === 'qr_checkout' && user?.role === 'freelancer' && (
                                    <div className="flex flex-col items-center p-6 bg-white rounded-2xl">
                                      <div className="font-black text-indigo-900 mb-4 text-center">Muestra este QR al cliente para liberar tu pago</div>
                                      <QRCodeSVG value={`verify_${job.id}`} size={200} />
                                    </div>
                                 )}

                                 {job.status === 'in_review' && (
                                    <div className="flex items-center justify-between">
                                      <div className="font-black text-blue-500">Entregable Enviado. Esperando Revisión.</div>
                                      {user?.role === 'client' && (
                                        <div className="flex gap-3">
                                           <button onClick={() => advanceJobStatus(job.id, 'disputed')} className="text-xs font-bold text-red-500 hover:underline">Iniciar Disputa</button>
                                           <button onClick={() => advanceJobStatus(job.id, 'completed')} className="btn-primary py-2 px-6 text-sm">Aprobar y Liberar Fondos</button>
                                        </div>
                                      )}
                                    </div>
                                 )}

                                 {job.status === 'completed' && (
                                    <div className="flex items-center gap-3 text-emerald-500 bg-emerald-500/10 p-4 rounded-xl">
                                       <CheckCircle2 className="h-8 w-8" />
                                       <div>
                                         <div className="font-black text-lg">Transacción Finalizada</div>
                                         <div className="text-xs font-bold">Los fondos fueron liberados al Freelancer.</div>
                                       </div>
                                    </div>
                                 )}

                                 {job.status === 'disputed' && (
                                    <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-xl">
                                       <AlertTriangle className="h-8 w-8" />
                                       <div>
                                         <div className="font-black text-lg">En Disputa Legal</div>
                                         <div className="text-xs font-bold">Fondos congelados. Soporte revisará el caso en 24h.</div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Client Scanning QR (Mock) */}
        {scanMode && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] max-w-sm w-full text-center space-y-6">
                <Camera className="h-20 w-20 mx-auto text-slate-400 animate-pulse" />
                <h3 className="text-2xl font-black">Escaneando Checkout Físico...</h3>
                <p className="text-sm text-slate-500">Apunta la cámara al dispositivo del freelancer.</p>
                 <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                   <button onClick={() => { advanceJobStatus(scanMode, 'completed'); setScanMode(null); }} className="btn-primary w-full">Simular Escaneo Exitoso</button>
                   <button onClick={() => setScanMode(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Cancelar</button>
                 </div>
             </div>
           </div>
        )}

        {/* Modal: payment Disclaimer for Abstract */}
        {showDisclaimerModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] max-w-lg w-full space-y-8">
               <div className="flex items-center gap-4 text-amber-500">
                 <AlertTriangle className="h-12 w-12" />
                 <h3 className="text-3xl font-black">Aviso Categórico</h3>
               </div>
               <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                 Este servicio está clasificado como <strong>Abstracto / Entretenimiento</strong>. 
                 Al proceder, aceptas que los resultados no son médicamente, científicamente ni legalmente cuantificables, por lo que las políticas de disputa estándar <strong>se limitan únicamente a la no-entrega del servicio</strong>, no a la "satisfacción" del resultado (Ej. precisión de una lectura de tarot).
               </p>
               <div className="flex gap-4">
                  <button onClick={() => setShowDisclaimerModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button onClick={() => { setShowPaymentModal(true); setShowDisclaimerModal(false); }} className="btn-primary flex-1">Aceptar y Continuar</button>
               </div>
             </div>
          </div>
        )}

        {/* Payment Main Modal */}
        <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="relative h-48 bg-indigo-600 overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-40 animate-pulse" />
                 <div className="h-full flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/30 shadow-2xl flex flex-col items-center">
                      <Lock className="h-12 w-12 text-white mb-2" />
                      <span className="text-white font-black uppercase text-xs tracking-widest">Stripe Escrow Connect</span>
                    </div>
                 </div>
              </div>

              <div className="p-12 space-y-8">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Producto</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white truncate max-w-[200px]">{selectedGig?.title}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Retención de Seguridad</span>
                    <span className="text-5xl font-black text-indigo-600 tracking-tighter">${selectedGig?.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <button onClick={() => setShowPaymentModal(false)} className="py-5 font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs">Cancelar</button>
                   <button onClick={createEscrowJob} className="btn-primary py-5 text-lg">Pagar con Tarjeta</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        {/* Modal: Post New Gig */}
        {showPostGigModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-12 space-y-8 max-h-[90vh] overflow-y-auto">
               <h3 className="text-4xl font-black tracking-tight">Publicar Nuevo Servicio</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Título del Gig</label>
                   <input type="text" placeholder="Ej: Diseño de Logo Profesional" className="input-premium w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-0" onChange={e => setNewGigForm({...newGigForm, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Precio (USD)</label>
                      <input type="number" placeholder="50" className="input-premium w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-0" onChange={e => setNewGigForm({...newGigForm, price: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Categoría</label>
                      <select className="input-premium w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-0 outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewGigForm({...newGigForm, category: e.target.value})}>
                        <option>Diseño</option><option>Web</option><option>Oficios</option><option>Legal</option><option>Entretenimiento</option>
                      </select>
                    </div>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Tipo de Entrega</label>
                   <div className="flex gap-4">
                     {['digital', 'physical', 'abstract'].map(t => (
                       <button key={t} onClick={() => setNewGigForm({...newGigForm, type: t as any})} className={`flex-1 py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${newGigForm.type === t ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>{t}</button>
                     ))}
                   </div>
                 </div>
               </div>
               <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => setShowPostGigModal(false)} className="btn-secondary flex-1 py-4">Cancelar</button>
                  <button 
                    onClick={handlePostGig} 
                    className="btn-primary flex-1 py-4 shadow-xl shadow-indigo-500/20"
                  >
                    Publicar Ahora
                  </button>
               </div>
             </motion.div>
          </div>
        )}

        {/* Modal: KYC Identity */}
        {showKYCModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 text-center space-y-8">
              <div className="h-24 w-24 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black">Verifica tu Identidad</h3>
              <p className="text-slate-500">Para contratar o ofrecer servicios legales/premium, necesitamos confirmar que eres tú. Usamos Stripe Identity para máxima seguridad.</p>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Sube tu Identificación Oficial (ID/DNI)</span>
                </div>
                <button onClick={handleVerifyKYC} className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-2">
                  {loading ? "Procesando con IA..." : "Iniciar Verificación con Stripe"}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>
                <button onClick={() => setShowKYCModal(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Omitir por ahora</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Drawer: Chat de Seguridad */}
        <AnimatePresence>
          {showChatId && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChatId(null)} className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-[301] shadow-2xl flex flex-col">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
                   <div>
                     <h4 className="font-black text-xl">Chat de Seguridad</h4>
                     <p className="text-[10px] font-black uppercase opacity-60 tracking-widest flex items-center gap-1"><Lock className="h-3 w-3" /> Encriptación Escrow-Chat</p>
                   </div>
                   <button onClick={() => setShowChatId(null)} className="p-2 hover:bg-white/20 rounded-xl"><X /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                   {chatMessages[showChatId]?.length ? chatMessages[showChatId].map(m => (
                     <div key={m.id} className={`flex flex-col ${m.sender === user?.role ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm ${m.sender === user?.role ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'}`}>
                         {m.text}
                       </div>
                       <span className="text-[9px] font-black text-slate-400 mt-2 uppercase">{m.timestamp}</span>
                     </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <Globe className="h-20 w-20" />
                        <p className="font-black">No hay mensajes. <br/>Inicia la conversación para coordinar el trabajo.</p>
                     </div>
                   )}
                </div>

                <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                   <div className="flex gap-4">
                     <input 
                      type="text" 
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                      value={currentMessage}
                      onChange={e => setCurrentMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(showChatId)}
                     />
                     <button onClick={() => sendMessage(showChatId)} className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><ArrowRight /></button>
                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal: Gig Details */}
        <AnimatePresence>
          {viewDetailGig && (
            <div className="fixed inset-0 z-[260] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                 <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img src={viewDetailGig.image_url} alt={viewDetailGig.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                 </div>
                 <div className="md:w-1/2 p-12 space-y-6">
                    <div className="flex justify-between items-start">
                      <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{viewDetailGig.category}</span>
                      <button onClick={() => setViewDetailGig(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X /></button>
                    </div>
                    <h3 className="text-4xl font-black">{viewDetailGig.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{viewDetailGig.description}</p>
                    <div className="flex items-center gap-4 py-6 border-y border-slate-100 dark:border-slate-800">
                      <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-500"><User /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Freelancer ID: {viewDetailGig.owner_id}</p>
                        <p className="font-bold text-emerald-500 flex items-center gap-1 text-xs">Vendedor Verificado <ShieldCheck className="h-3 w-3" /></p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-4xl font-black tracking-tighter">${viewDetailGig.price}</span>
                      <button onClick={() => { handleHireClick(viewDetailGig); setViewDetailGig(null); }} className="btn-primary py-4 px-8 text-sm">Contratar Ahora</button>
                    </div>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Terms of Service */}
        <AnimatePresence>
          {showTermsModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-12 space-y-8 max-h-[80vh] overflow-y-auto relative">
                <button onClick={() => setShowTermsModal(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X /></button>
                <h3 className="text-3xl font-black">Términos y Condiciones</h3>
                <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <section>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase mb-2">1. Sistema Escrow</h4>
                    <p>ContrataMe retiene el 100% de los fondos hasta que el servicio sea entregado y aprobado por el cliente. Si hay una disputa, nuestro equipo legal revisará la evidencia en 48h.</p>
                  </section>
                  <section>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase mb-2">2. Verificación KYC</h4>
                    <p>Ciertos servicios exigen verificación de identidad mediante Stripe Identity para prevenir fraudes y asegurar la calidad profesional.</p>
                  </section>
                  <section>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase mb-2">3. Disputas para Servicios Abstractos</h4>
                    <p>En servicios como Tarot o Consultoría Energética, la disputa solo procede si el servicio no se realizó. No se aceptan reembolsos por insatisfacción con el resultado espiritual.</p>
                  </section>
                </div>
                <button onClick={() => setShowTermsModal(false)} className="btn-primary w-full py-4 uppercase tracking-widest text-xs font-black">Entendido</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Official Supabase Auth UI */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-12 relative shadow-2xl">
                 <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X /></button>
                 <div className="mb-8 text-center">
                    <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Sparkles className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-3xl font-black">Únete a Contratame</h3>
                    <p className="text-slate-500 text-sm mt-2">La red freelance más segura del mundo.</p>
                 </div>
                 
                 <Auth 
                    supabaseClient={supabase}
                    appearance={{ 
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#4f46e5',
                            brandAccent: '#4338ca',
                            inputText: '#1e293b',
                            inputBackground: 'transparent',
                            inputBorder: '#e2e8f0',
                            inputPlaceholder: '#94a3b8'
                          },
                          radii: {
                            borderRadiusButton: '1rem',
                          }
                        }
                      }
                    }}
                    theme="default"
                    providers={[]}
                    redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
                    localization={{
                      variables: {
                        sign_in: {
                          email_label: 'Correo Electrónico',
                          password_label: 'Contraseña',
                          button_label: 'Entrar'
                        },
                        sign_up: {
                          email_label: 'Correo Electrónico',
                          password_label: 'Contraseña',
                          button_label: 'Crear Mi Cuenta'
                        }
                      }
                    }}
                 />
                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center justify-center gap-2">
                       <Lock className="h-3 w-3" /> Conexión 128-bit SSL v3 Active
                    </p>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white h-4 w-4" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Contrata<span className="text-indigo-600">Me</span>
              </span>
            </div>
            <div className="flex gap-8 text-xs font-black text-slate-500 uppercase tracking-widest">
              <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-600 transition-colors">Términos</button>
              <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-600 transition-colors">Política de Escrow</button>
              <a href="#" className="hover:text-indigo-600 transition-colors">Soporte</a>
            </div>
            <div className="text-xs font-bold text-slate-400">
              © 2026 ContrataMe. Todos los derechos reservados.
            </div>
        </div>
      </footer>
    </div>
  );
}
