import * as React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#23272F] text-[#99A1B3] text-sm mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#087EA4] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-white">Engineering Curriculum</span>
            </div>
            <p className="text-xs leading-relaxed">
              No frameworks. Engineering. A public, free, login-free site for
              software engineers who want to understand how things actually work —
              from transistors to distributed systems.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-widest">
                Məzmun
              </h5>
              <ul className="space-y-2">
                <li><Link href="/learn" className="hover:text-white transition-colors">Öyrən</Link></li>
                <li><Link href="/learn/faza-0/modul-0-1/bit-ve-byte" className="hover:text-white transition-colors">İlk Dərs</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-widest">
                Əlaqə
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#343A46] text-xs text-[#404756]">
          Engineering Curriculum — Pulsuz, açıq, giriş tələb etmir.
        </div>
      </div>
    </footer>
  );
}
