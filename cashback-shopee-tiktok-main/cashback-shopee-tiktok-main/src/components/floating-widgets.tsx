'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, Phone, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* Contact Group */}
      <div className="relative flex flex-col items-end">
        
        {/* Expanded items */}
        <div 
          className={cn(
            "flex flex-col items-end gap-4 transition-all duration-300 origin-bottom absolute bottom-full mb-4",
            isContactOpen ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
          )}
        >
          {/* Zalo */}
          <div className="relative flex items-center justify-end group">
            <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-lg border border-white/10">
              Hỗ trợ Zalo
            </span>
            <a
              href="https://zalo.me/0369143082"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer relative z-10 hover:shadow-[#0068FF]/30 hover:shadow-xl"
            >
              <span className="font-bold text-2xl font-sans">Z</span>
            </a>
          </div>

          {/* Phone */}
          <div className="relative flex items-center justify-end group">
            <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 shadow-lg border border-white/10">
              Hotline: 0369143082
            </span>
            <a
              href="tel:0369143082"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer relative z-10 hover:shadow-green-500/30 hover:shadow-xl"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsContactOpen(!isContactOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:scale-110 transition-transform cursor-pointer relative z-20"
        >
          <div className={cn("absolute transition-all duration-300", isContactOpen ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")}>
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className={cn("absolute transition-all duration-300", isContactOpen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0")}>
            <X className="h-6 w-6" />
          </div>
        </button>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-lg hover:bg-white/20 hover:scale-110 transition-all duration-300 cursor-pointer relative z-10",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none hidden"
        )}
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
}
