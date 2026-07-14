import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Page } from '@/components/Layout/Page';

const LearnIndex: NextPage = () => {
  return (
    <Page>
      <Head>
        <title>Öyrən — Engineering Curriculum</title>
      </Head>
      <div className="py-4">
        <h1 className="text-4xl font-bold text-[#23272F] dark:text-[#F6F7F9] mb-4">
          Engineering Curriculum
        </h1>
        <p className="text-xl text-[#404756] dark:text-[#99A1B3] leading-relaxed mb-8">
          Tranzistordan paylanmış sistemlərə qədər — sol tərəfdəki menyudan bir faza seç
          və öyrənməyə başla.
        </p>

        <div className="rounded-xl border border-[#C6E4F0] dark:border-[#1C4F6B] bg-[#EDF5FA] dark:bg-[#0F2537] p-6">
          <h2 className="font-bold text-[#087EA4] dark:text-[#149ECA] mb-2">Haradan başlamalı?</h2>
          <p className="text-[#404756] dark:text-[#d4e5f0]">
            FAZA 0-dan başlamağı tövsiyə edirik. Hər faza əvvəlkinin üzərində qurulur.
            İlk dərs:
          </p>
          <Link
            href="/learn/faza-0/modul-0-1/bit-ve-byte"
            className="inline-flex items-center gap-1 mt-3 text-[#087EA4] dark:text-[#149ECA] font-medium hover:underline"
          >
            Bit və byte: informasiya nədir →
          </Link>
        </div>
      </div>
    </Page>
  );
};

export default LearnIndex;
