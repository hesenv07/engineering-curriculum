import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Page from '@/components/Layout/Page';
import { resolveLocale } from '@/utils/locale';
import { parseSidebar, getSidebarRouteTree } from '@/utils/sidebar';

import type { ISidebarStats } from '@/utils/sidebar';

const CONTENT = {
  az: {
    title: 'Engineering Curriculum — No frameworks. Engineering.',
    badge: 'Pulsuz · Giriş tələb etmir · Açıq mənbə',
    hero: 'No frameworks.\nEngineering.',
    desc: 'Tranzistordan paylanmış sistemlərə qədər — hər şeyin içindən keçirik. Əsasları anlamadan framework öyrənmək bəs deyil.',
    cta1: 'İlk Dərsdən Başla',
    cta2: 'Bütün Kurslar',
    mapTitle: 'Kurrikulumun Xəritəsi',
    mapDesc: 'Əsasdan zirvəyə — sıra ilə, kümülatif',
    stat: { phases: 'Faza', modules: 'Modul', lessons: 'Dərs', payment: 'Ödəniş', free: '0₼' },
    lessonSuffix: 'dərs',
  },
  en: {
    title: 'Engineering Curriculum — No frameworks. Engineering.',
    badge: 'Free · Engineering · Open source',
    hero: 'No frameworks.\nEngineering.',
    desc: 'From transistors to distributed systems — we go through the inside of everything. Learning frameworks without understanding the foundations is not enough.',
    cta1: 'Start First Lesson',
    cta2: 'All Courses',
    mapTitle: 'Curriculum Map',
    mapDesc: 'From foundations to the summit — sequential, cumulative',
    stat: { phases: 'Phases', modules: 'Modules', lessons: 'Lessons', payment: 'Payment', free: 'Free' },
    lessonSuffix: 'lessons',
  },
};

export const getStaticProps: GetStaticProps<ISidebarStats> = async ({ locale }) => {
  const routes = getSidebarRouteTree(locale).routes ?? [];
  return { props: parseSidebar(routes) };
};

const Home: NextPage<ISidebarStats> = ({ phases, totalPhases, totalModules, totalLessons }) => {
  const { locale } = useRouter();
  const lang = resolveLocale(locale);
  const t = CONTENT[lang];
  const heroLines = t.hero.split('\n');

  const stats = [
    { value: String(totalPhases), label: t.stat.phases },
    { value: String(totalModules), label: t.stat.modules },
    { value: String(totalLessons), label: t.stat.lessons },
    { value: t.stat.free, label: t.stat.payment },
  ];

  return (
    <Page showSidebar={false}>
      <Head>
        <title>{t.title}</title>
      </Head>

      <section className="py-20 px-6 text-center border-b border-border dark:border-border-dark">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-link dark:bg-link-dark" />
            {t.badge}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary dark:text-primary-dark leading-[1.1] mb-6 tracking-tight">
            {heroLines.map((line, i) => (
              <span key={line}>
                {i === 0 ? (
                  <span className="text-link dark:text-link-dark">{line}</span>
                ) : (
                  line
                )}
                {i < heroLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="text-xl text-secondary dark:text-secondary-dark leading-relaxed mb-10 max-w-2xl mx-auto">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={phases[0]?.path ?? '/learn'}
              className="bg-link hover:bg-link-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-sm"
            >
              {t.cta1} →
            </Link>
            <Link
              href="/learn"
              className="border border-border dark:border-border-dark text-secondary dark:text-secondary-dark hover:border-link hover:text-link dark:hover:text-link-dark dark:hover:border-link-dark font-semibold px-8 py-3.5 rounded-xl transition-colors text-base bg-white dark:bg-transparent"
            >
              {t.cta2}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 border-b border-border dark:border-border-dark bg-wash dark:bg-wash-dark">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-20">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-link dark:text-link-dark tabular-nums">
                {value}
              </div>
              <div className="text-sm text-secondary dark:text-secondary-dark mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-primary dark:text-primary-dark mb-2 text-center tracking-tight">
            {t.mapTitle}
          </h2>
          <p className="text-secondary dark:text-secondary-dark text-center mb-12 text-base">
            {t.mapDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <Link
                key={phase.id}
                href={phase.path}
                className="group rounded-xl border border-border dark:border-border-dark bg-white dark:bg-card-dark p-5 hover:border-link dark:hover:border-link-dark hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark rounded-full px-2.5 py-1 leading-none">
                    {phase.badgeText}
                  </span>
                  <span className="text-xs text-tertiary dark:text-tertiary-dark">
                    {phase.lessonCount} {t.lessonSuffix}
                  </span>
                </div>
                <h3 className="font-bold text-primary dark:text-primary-dark mb-1.5 group-hover:text-link dark:group-hover:text-link-dark transition-colors leading-snug">
                  {phase.title}
                </h3>
                <p className="text-sm text-secondary dark:text-secondary-dark leading-relaxed">
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
