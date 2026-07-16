import * as React from 'react';

import NextLink from 'next/link';

import IconLogo from '@/components/Icon/IconLogo';
import IconGithub from '@/components/Icon/IconGithub';

import FooterLink from './ui/FooterLink';

const Footer = () => {
  return (
    <footer className="text-[#404756] dark:text-[#99A1B3]">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-12 gap-y-8 max-w-7xl mx-auto">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 justify-items-start mt-3.5">
          <NextLink href="/" className="flex items-center gap-2 group mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#087EA4] group-hover:bg-[#149ECA] transition-colors flex items-center justify-center flex-shrink-0">
              <IconLogo />
            </div>
            <div className="font-bold  leading-5 text-[#23272F] dark:text-[#F6F7F9] text-base">
              Engineering Curriculum
            </div>
          </NextLink>
          <div className="text-xs mt-2 pe-0.5">No frameworks. Engineering.</div>
        </div>

        {/* Kurslar I */}
        <div className="flex flex-col">
          <FooterLink isHeader>Kurslar I</FooterLink>
          <FooterLink href="/learn/faza-0/modul-0-1/bit-ve-byte">FAZA 0 — Kompüter</FooterLink>
          <FooterLink href="/learn">FAZA 1 — Proqramlaşdırma</FooterLink>
          <FooterLink href="/learn">FAZA 2 — Əməliyyat Sistemləri</FooterLink>
          <FooterLink href="/learn">FAZA 3 — Şəbəkələr</FooterLink>
          <FooterLink href="/learn">FAZA 4 — Verilənlər bazası</FooterLink>
          <FooterLink href="/learn">FAZA 5 — Backend</FooterLink>
        </div>

        {/* Kurslar II */}
        <div className="flex flex-col">
          <FooterLink isHeader>Kurslar II</FooterLink>
          <FooterLink href="/learn">FAZA 6 — Frontend</FooterLink>
          <FooterLink href="/learn">FAZA 7 — Paylanmış Sistemlər</FooterLink>
          <FooterLink href="/learn">FAZA 8 — DevOps</FooterLink>
          <FooterLink href="/learn">FAZA 9 — Təhlükəsizlik</FooterLink>
          <FooterLink href="/learn">FAZA 10 — AI Engineering</FooterLink>
          <FooterLink href="/learn">FAZA 11 — System Design</FooterLink>
        </div>

        {/* Əlaqə */}
        <div className="md:col-start-2 xl:col-start-4 flex flex-col">
          <FooterLink isHeader>Əlaqə</FooterLink>
          <FooterLink href="https://github.com/hesenv07/engineering-curriculum">GitHub Reposu</FooterLink>
          <FooterLink href="https://github.com/hesenv07/engineering-curriculum/issues">Xəta bildiriş</FooterLink>
          <FooterLink href="https://github.com/hesenv07/engineering-curriculum/blob/main/README.md">Töhfə ver</FooterLink>
          <FooterLink href="https://www.linkedin.com/in/arifhesenov/">LinkedIn</FooterLink>
        </div>

        {/* Digər */}
        <div className="flex flex-col">
          <FooterLink isHeader>Digər</FooterLink>
          <FooterLink href="https://github.com/hesenv07/engineering-curriculum/blob/main/LICENSE">MIT Lisenziyası</FooterLink>
          <FooterLink href="https://github.com/hesenv07/engineering-curriculum/blob/main/README.md">README</FooterLink>

          <div className="flex flex-row items-center mt-8 gap-x-2">
            <a
              aria-label="GitHub"
              href="https://github.com/hesenv07/engineering-curriculum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#087EA4] dark:text-[#99A1B3] transition-colors"
            >
              <IconGithub />
            </a>
            <a
              aria-label="LinkedIn"
              href="https://www.linkedin.com/in/arifhesenov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#087EA4] dark:text-[#99A1B3] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
