import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Page from '@/components/Layout/Page';
import { useLanguage } from '@/context/LanguageContext';

type TStats = { value: string; label: string };

type TPhase = {
  id: string;
  desc: string;
  path: string;
  title: string;
  modules: number;
  label?: string;
};

type TContent = {
  az: {
    title: string;
    badge: string;
    hero: string;
    desc: string;
    cta1: string;
    cta2: string;
    stats: TStats[];
    mapTitle: string;
    mapDesc: string;
    modules: string;
  };
  en: {
    title: string;
    badge: string;
    hero: string;
    desc: string;
    cta1: string;
    cta2: string;
    stats: TStats[];
    mapTitle: string;
    mapDesc: string;
    modules: string;
  };
};

const CONTENT: TContent = {
  az: {
    title: 'Engineering Curriculum — No frameworks. Engineering.',
    badge: 'Pulsuz · Giriş tələb etmir · Açıq mənbə',
    hero: 'No frameworks.\nEngineering.',
    desc: 'Tranzistordan paylanmış sistemlərə qədər — hər şeyin içindən keçirik. Əsasları anlamadan framework öyrənmək bəs deyil.',
    cta1: 'İlk Dərsdən Başla',
    cta2: 'Bütün Kurslar',
    stats: [
      { value: '12', label: 'Faza' },
      { value: '50+', label: 'Modul' },
      { value: '150+', label: 'Dərs' },
      { value: '0₼', label: 'Ödəniş' },
    ],
    mapTitle: 'Kurrikulumun Xəritəsi',
    mapDesc: 'Əsasdan zirvəyə — sıra ilə, kümülatif',
    modules: 'modul',
  },
  en: {
    title: 'Engineering Curriculum — No frameworks. Engineering.',
    badge: 'Free · No login required · Open source',
    hero: 'No frameworks.\nEngineering.',
    desc: 'From transistors to distributed systems — we go through the inside of everything. Learning frameworks without understanding the foundations is not enough.',
    cta1: 'Start First Lesson',
    cta2: 'All Courses',
    stats: [
      { value: '12', label: 'Phases' },
      { value: '50+', label: 'Modules' },
      { value: '150+', label: 'Lessons' },
      { value: 'Free', label: 'Payment' },
    ],
    mapTitle: 'Curriculum Map',
    mapDesc: 'From foundations to the summit — sequential, cumulative',
    modules: 'modules',
  },
};

const PHASES: { az: TPhase[]; en: TPhase[] } = {
  az: [
    { id: '0', title: 'Kompüter necə işləyir', desc: 'Transistordan CPU-ya, RAM-dan diskə — metal səviyyəsindən başla.', modules: 5, path: '/learn/faza-0/modul-0-1/bit-ve-byte' },
    { id: '1', title: 'Proqramlaşdırma təməlləri', desc: 'Data strukturlar, alqoritmlər, proqram anlayışları — dilsiz, konsept olaraq.', modules: 3, path: '/learn' },
    { id: '2', title: 'Əməliyyat Sistemləri', desc: 'Proseslər, thread-lər, concurrency, yaddaş, fayl sistemi, Linux.', modules: 6, path: '/learn' },
    { id: '3', title: 'Şəbəkələr', desc: 'TCP/IP, DNS, HTTP, TLS, WebSocket — protokolların içindən keç.', modules: 6, path: '/learn' },
    { id: '4', title: 'Verilənlər bazası', desc: 'SQL, B-tree indeks, ACID, NoSQL, Redis caching, sharding.', modules: 6, path: '/learn' },
    { id: '5', title: 'Backend Engineering', desc: 'API dizaynı, auth, load balancer, rate limiting, async işlər.', modules: 4, path: '/learn' },
    { id: '6', title: 'Frontend daxildən', desc: 'Browser, event loop, rendering, CSR/SSR, CORS, XSS.', modules: 5, path: '/learn' },
    { id: '7', title: 'Paylanmış Sistemlər', desc: 'Mikroservislər, Kafka, event-driven, circuit breaker, Raft.', modules: 6, path: '/learn' },
    { id: '8', title: 'DevOps və İnfrastruktur', desc: 'Docker, Kubernetes, CI/CD, cloud, observability, IaC.', modules: 7, path: '/learn' },
    { id: '9', title: 'Təhlükəsizlik', desc: 'Kriptoqrafiya, OWASP, firewall, zero trust, secrets management.', modules: 3, path: '/learn' },
    { id: '10', title: 'AI Engineering', desc: 'ML əsasları, LLM-lər, RAG, vector DB, agent sistemləri.', modules: 3, path: '/learn' },
    { id: '11', title: 'System Design', desc: 'URL shortener-dən payment sistemə — bütün biliklər birləşir.', modules: 12, label: 'Finallar', path: '/learn' },
  ],
  en: [
    { id: '0', title: 'How Computers Work', desc: 'From transistors to CPUs, from RAM to disk — start at the metal level.', modules: 5, path: '/learn/faza-0/modul-0-1/bit-ve-byte' },
    { id: '1', title: 'Programming Fundamentals', desc: 'Data structures, algorithms, program concepts — language-agnostic.', modules: 3, path: '/learn' },
    { id: '2', title: 'Operating Systems', desc: 'Processes, threads, concurrency, memory, file system, Linux.', modules: 6, path: '/learn' },
    { id: '3', title: 'Networks', desc: 'TCP/IP, DNS, HTTP, TLS, WebSocket — go through the protocols.', modules: 6, path: '/learn' },
    { id: '4', title: 'Databases', desc: 'SQL, B-tree index, ACID, NoSQL, Redis caching, sharding.', modules: 6, path: '/learn' },
    { id: '5', title: 'Backend Engineering', desc: 'API design, auth, load balancer, rate limiting, async jobs.', modules: 4, path: '/learn' },
    { id: '6', title: 'Frontend Internals', desc: 'Browser, event loop, rendering, CSR/SSR, CORS, XSS.', modules: 5, path: '/learn' },
    { id: '7', title: 'Distributed Systems', desc: 'Microservices, Kafka, event-driven, circuit breaker, Raft.', modules: 6, path: '/learn' },
    { id: '8', title: 'DevOps & Infrastructure', desc: 'Docker, Kubernetes, CI/CD, cloud, observability, IaC.', modules: 7, path: '/learn' },
    { id: '9', title: 'Security', desc: 'Cryptography, OWASP, firewall, zero trust, secrets management.', modules: 3, path: '/learn' },
    { id: '10', title: 'AI Engineering', desc: 'ML basics, LLMs, RAG, vector DB, agent systems.', modules: 3, path: '/learn' },
    { id: '11', title: 'System Design', desc: 'From URL shortener to payment systems — all knowledge comes together.', modules: 12, label: 'Finals', path: '/learn' },
  ],
};

const Home: NextPage = () => {
  const { lang } = useLanguage();
  const t = CONTENT[lang];
  const phaseList = PHASES[lang];
  const heroLines = t.hero.split('\n');

  return (
    <Page showSidebar={false}>
      <Head>
        <title>{t.title}</title>
      </Head>

      {/* Hero */}
      <section className="py-20 px-6 text-center border-b border-[#EBECF0] dark:border-[#343A46]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#087EA4]/10 text-[#087EA4] dark:text-[#149ECA] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087EA4] dark:bg-[#149ECA]" />
            {t.badge}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#23272F] dark:text-[#F6F7F9] leading-[1.1] mb-6 tracking-tight">
            {heroLines.map((line, i) => (
              <span key={line}>
                {i === 0 ? <span className="text-[#087EA4] dark:text-[#149ECA]">{line}</span> : line}
                {i < heroLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="text-xl text-[#404756] dark:text-[#99A1B3] leading-relaxed mb-10 max-w-2xl mx-auto">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/learn/faza-0/modul-0-1/bit-ve-byte"
              className="bg-[#087EA4] hover:bg-[#149ECA] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-sm"
            >
              {t.cta1} →
            </Link>
            <Link
              href="/learn"
              className="border border-[#EBECF0] dark:border-[#343A46] text-[#404756] dark:text-[#99A1B3] hover:border-[#087EA4] hover:text-[#087EA4] dark:hover:text-[#149ECA] dark:hover:border-[#149ECA] font-semibold px-8 py-3.5 rounded-xl transition-colors text-base bg-white dark:bg-transparent"
            >
              {t.cta2}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 border-b border-[#EBECF0] dark:border-[#343A46] bg-[#F6F7F9] dark:bg-[#1A2333]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-20">
          {t.stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-[#087EA4] dark:text-[#149ECA] tabular-nums">{value}</div>
              <div className="text-sm text-[#404756] dark:text-[#99A1B3] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Phase grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#23272F] dark:text-[#F6F7F9] mb-2 text-center tracking-tight">
            {t.mapTitle}
          </h2>
          <p className="text-[#404756] dark:text-[#99A1B3] text-center mb-12 text-base">
            {t.mapDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phaseList.map((phase) => (
              <Link
                key={phase.id}
                href={phase.path}
                className="group rounded-xl border border-[#EBECF0] dark:border-[#343A46] bg-white dark:bg-[#2B3245] p-5 hover:border-[#087EA4] dark:hover:border-[#149ECA] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold bg-[#EDF5FA] dark:bg-[#1A3344] text-[#087EA4] dark:text-[#149ECA] rounded-full px-2.5 py-1 leading-none">
                    {phase.label ?? `FAZA ${phase.id}`}
                  </span>
                  <span className="text-xs text-[#99A1B3]">{phase.modules} {t.modules}</span>
                </div>
                <h3 className="font-bold text-[#23272F] dark:text-[#F6F7F9] mb-1.5 group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] transition-colors leading-snug">
                  {phase.title}
                </h3>
                <p className="text-sm text-[#404756] dark:text-[#99A1B3] leading-relaxed">
                  {phase.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
};

export default Home;
