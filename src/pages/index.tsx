import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Page } from '@/components/Layout/Page';

const phases = [
  { id: '0', title: 'Kompüter necə işləyir', desc: 'Transistordan CPU-ya, RAM-dan diskə — metal səviyyəsindən başla.', modules: 5 },
  { id: '1', title: 'Proqramlaşdırma təməlləri', desc: 'Data strukturlar, alqoritmlər, proqram anlayışları — dilsiz, konsept olaraq.', modules: 3 },
  { id: '2', title: 'Əməliyyat Sistemləri', desc: 'Proseslər, thread-lər, concurrency, yaddaş, fayl sistemi, Linux.', modules: 6 },
  { id: '3', title: 'Şəbəkələr', desc: 'TCP/IP, DNS, HTTP, TLS, WebSocket — protokolların içindən keç.', modules: 6 },
  { id: '4', title: 'Verilənlər bazası', desc: 'SQL, B-tree indeks, ACID, NoSQL, Redis caching, sharding.', modules: 6 },
  { id: '5', title: 'Backend Engineering', desc: 'API dizaynı, auth, load balancer, rate limiting, async işlər.', modules: 4 },
  { id: '6', title: 'Frontend daxildən', desc: 'Browser, event loop, rendering, CSR/SSR, CORS, XSS.', modules: 5 },
  { id: '7', title: 'Paylanmış Sistemlər', desc: 'Mikroservislər, Kafka, event-driven, circuit breaker, Raft.', modules: 6 },
  { id: '8', title: 'DevOps və İnfrastruktur', desc: 'Docker, Kubernetes, CI/CD, cloud, observability, IaC.', modules: 7 },
  { id: '9', title: 'Təhlükəsizlik', desc: 'Kriptoqrafiya, OWASP, firewall, zero trust, secrets management.', modules: 3 },
  { id: '10', title: 'AI Engineering', desc: 'ML əsasları, LLM-lər, RAG, vector DB, agent sistemləri.', modules: 3 },
  { id: '11', title: 'System Design', desc: 'URL shortener-dən payment sistemə — bütün biliklər birləşir.', modules: 12, label: 'Finallar' },
];

const Home: NextPage = () => {
  return (
    <Page showSidebar={false}>
      <Head>
        <title>Engineering Curriculum — No frameworks. Engineering.</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#EDF5FA] dark:from-[#1A2333] to-white dark:to-[#23272F] pt-20 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#087EA4]/10 text-[#087EA4] dark:text-[#149ECA] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087EA4] dark:bg-[#149ECA]" />
            Pulsuz · Giriş tələb etmir · Açıq
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#23272F] dark:text-[#F6F7F9] leading-tight mb-6">
            Engineering<br />
            <span className="text-[#087EA4] dark:text-[#149ECA]">Curriculum</span>
          </h1>
          <p className="text-xl text-[#404756] dark:text-[#99A1B3] leading-relaxed mb-10 max-w-xl mx-auto">
            No frameworks. Engineering. Tranzistordan paylanmış sistemlərə qədər
            — hər şeyin içindən keçirik.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/learn/faza-0/modul-0-1/bit-ve-byte"
              className="bg-[#087EA4] hover:bg-[#149ECA] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-base"
            >
              İlk Dərsdən Başla →
            </Link>
            <Link
              href="/learn"
              className="border border-[#EBECF0] dark:border-[#343A46] text-[#404756] dark:text-[#99A1B3] hover:border-[#087EA4] hover:text-[#087EA4] font-semibold px-6 py-3 rounded-xl transition-colors text-base"
            >
              Bütün Kurslar
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#EBECF0] dark:border-[#343A46] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-10">
          {[
            { value: '12', label: 'Faza' },
            { value: '50+', label: 'Modul' },
            { value: '150+', label: 'Dərs' },
            { value: '0₼', label: 'Ödəniş' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-[#087EA4] dark:text-[#149ECA]">{value}</div>
              <div className="text-sm text-[#404756] dark:text-[#99A1B3] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Phases grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#23272F] dark:text-[#F6F7F9] mb-2 text-center">
            Kurrikulumun Xəritəsi
          </h2>
          <p className="text-[#404756] dark:text-[#99A1B3] text-center mb-10">
            Əsasdan zirvəyə — sırayla hər şeyi öyrən
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <Link
                key={phase.id}
                href={`/learn`}
                className="group rounded-xl border border-[#EBECF0] dark:border-[#343A46] bg-white dark:bg-[#2B3245] p-5 hover:border-[#087EA4] dark:hover:border-[#149ECA] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold bg-[#EDF5FA] dark:bg-[#1A3344] text-[#087EA4] dark:text-[#149ECA] rounded-full px-2.5 py-1">
                    {phase.label || `FAZA ${phase.id}`}
                  </span>
                  <span className="text-xs text-[#99A1B3]">{phase.modules} modul</span>
                </div>
                <h3 className="font-bold text-[#23272F] dark:text-[#F6F7F9] mb-1.5 group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] transition-colors">
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

      {/* Philosophy */}
      <section className="bg-[#EDF5FA] dark:bg-[#1A2333] py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#23272F] dark:text-[#F6F7F9] mb-4">
            Niyə bu kurs?
          </h2>
          <p className="text-[#404756] dark:text-[#99A1B3] leading-relaxed text-lg">
            Framework öyrənmək asan. Lakin {"\"niyə işləyir\""} sualını cavablamaq çətindir.
            Bu kurs React, Next.js, Django, ya Spring öyrətmir —{' '}
            <strong className="text-[#23272F] dark:text-[#F6F7F9]">
              kompüterin, şəbəkənin, əməliyyat sisteminin içini
            </strong>{' '}
            anlatır. Sonra bütün bu frameworklər öz-özünə aydın olur.
          </p>
        </div>
      </section>
    </Page>
  );
};

export default Home;
