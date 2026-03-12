"use client";

import { motion } from "framer-motion";
import { Flame, Monitor, Tablet, Smartphone, Terminal, Layout, Share2, ExternalLink, Mail, Twitter, Github, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import FireBackground from "@/components/FireBackground";
import { useState, useEffect } from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 pt-32 relative font-sans overflow-hidden">
      <FireBackground />
      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center max-w-6xl w-full"
      >
        <div className="flex items-center gap-4 md:gap-8 mb-8">
          <Flame className="w-12 h-12 md:w-24 md:h-24 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" strokeWidth={1.5} />
          <h1 className="text-5xl md:text-[6rem] font-fustat font-black tracking-tighter uppercase leading-none">
            BOILER™
          </h1>
        </div>

        <div className="flex items-center gap-4 mb-20">
          <p className="text-white/40 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
            Universal Substrate for Modern Innovation
          </p>
        </div>

        {/* Image Carousel */}
        <section className="w-full mb-24 relative">
          <BoilerCarousel />
        </section>

        {/* Boilerplates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-32 z-10 relative">
          <ModuleCard
            icon={<Share2 className="w-6 h-6" />}
            title="Next.js"
            desc="The ultimate foundation for modern web applications. High performance, SEO-friendly, and pre-configured for speed."
            url="https://github.com/ralphdp/Boiler-Next.js"
            isActive={true}
            isPurple={true}
            version="v2.4.0"
          />
          <ModuleCard
            icon={<Tablet className="w-6 h-6" />}
            title="iOS iPad"
            desc="Build native iPadOS experiences with a streamlined architecture optimized for tablet performance."
            version="v1.1.2"
          />
          <ModuleCard
            icon={<Smartphone className="w-6 h-6" />}
            title="iOS iPhone"
            desc="Craft premium mobile applications with our standardized mobile substrate, ready for deployment."
            version="v1.0.8"
          />
          <ModuleCard
            icon={<Terminal className="w-6 h-6" />}
            title="Linux"
            desc="Deploy high-performance headless services with a minimal footprint, perfect for edge computing."
            version="v1.3.0"
          />
          <ModuleCard
            icon={<Monitor className="w-6 h-6" />}
            title="macOS"
            desc="Create powerful native desktop applications for iMac and MacBook Pro with our unified foundation."
            version="v2.0.1"
          />
          <ModuleCard
            icon={<Layout className="w-6 h-6" />}
            title="Microsoft"
            desc="Robust and compliant Windows OS solutions for enterprise-grade applications."
            version="v1.0.0"
          />
        </div>



        <Footer />
      </motion.div>

      {/* Grid Backdrop */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>
    </div>
  );
}

function ModuleCard({ icon, title, desc, isPurple, url, isActive, version }: { icon: React.ReactNode, title: string, desc: string, isPurple?: boolean, url?: string, isActive?: boolean, version?: string }) {
  const CardContent = (
    <div className={`p-10 border ${isPurple ? 'border-purple-500/20' : 'border-white/5'} ${isPurple ? 'bg-purple-900/10' : 'bg-black/40'} backdrop-blur-md flex flex-col gap-6 group hover:border-white/20 transition-all h-full ${isActive ? 'cursor-pointer hover:-translate-y-1' : 'opacity-50'} relative`}>
      {version && (
        <span className="absolute top-4 right-4 text-[8px] font-black tracking-widest text-white/20 group-hover:text-purple-500 transition-colors">
          {version}
        </span>
      )}
      <div className="flex justify-between items-start">
        <div className={`${isPurple ? 'text-purple-500' : 'text-white/20'} group-hover:text-white transition-colors`}>
          {icon}
        </div>
        {isActive && <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white" />}
      </div>
      <div>
        <h3 className="text-lg font-fustat font-black uppercase tracking-widest mb-3">{title}</h3>
        <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

function BoilerCarousel() {
  const [index, setIndex] = useState(0);
  const slides = [
    { title: "Next.js Substrate", color: "from-purple-500/20 to-blue-500/20", image: "/images/nextjs_substrate.png", id: "01" },
    { title: "iOS Node System", color: "from-blue-500/20 to-cyan-500/20", image: "/images/ios_node.png", id: "02" },
    { title: "Linux Edge Registry", color: "from-cyan-500/20 to-teal-500/20", image: "/images/linux_edge.png", id: "03" },
    { title: "macOS Foundation", color: "from-teal-500/20 to-green-500/20", image: "/images/macos_foundation.png", id: "04" },
    { title: "iPadOS Interface", color: "from-orange-500/20 to-amber-500/20", image: "/images/ipados_interface.png", id: "05" },
    { title: "Microsoft Substrate", color: "from-blue-600/20 to-indigo-600/20", image: "/images/microsoft_substrate.png", id: "06" },
  ];

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm aspect-[21/9] flex items-center justify-center shadow-2xl">
      {/* Background Image with Overlay */}
      <img
        src={slides[index].image}
        alt={slides[index].title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-700"
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[index].color} mix-blend-overlay opacity-80`} />
      <div className="absolute inset-0 bg-black/20" />

      <div className="z-10 text-center px-20">
        <motion.h2
          key={slides[index].title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl md:text-5xl font-black uppercase tracking-[0.25em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        >
          {slides[index].title}
        </motion.h2>
        <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mt-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full inline-block border border-white/5">
          Visual_Manifest // Boilerplate_{slides[index].id}
        </p>
      </div>

      <button onClick={prev} className="absolute left-6 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className={`w-12 h-1 ${i === index ? 'bg-purple-500' : 'bg-white/10'} transition-colors`} />
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full max-w-6xl mt-16 py-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-12 font-sans">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <Flame size={24} className="text-purple-500" />
          <span className="text-xl font-black tracking-tighter uppercase">Boiler™</span>
        </div>
        <p className="text-sm text-white/40 max-w-sm leading-relaxed mb-8">
          The ultimate universal substrate for modern software architecture. Built for speed, compliance, and sovereign deployment across all major platforms.
        </p>
        <div className="flex gap-6">
          <Twitter size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
          <Github size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
          <Linkedin size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
          <Mail size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-8 font-fustat">Contact</h4>
        <a href="mailto:hi@boiler.click" className="text-sm text-white/40 hover:text-purple-500 transition-colors underline decoration-purple-500/30 underline-offset-8">
          hi@boiler.click
        </a>
      </div>

      <div className="text-right flex flex-col items-end">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-8 font-fustat">Legal</h4>
        <a href="/legal" className="text-sm text-white/40 hover:text-white transition-colors block mb-4">Terms & Privacy</a>
        <p className="text-[10px] text-white/20 font-black tracking-widest mt-auto uppercase">
          © {new Date().getFullYear()} Boiler Labs // All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
