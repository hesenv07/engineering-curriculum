import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="az">
      <Head>
        <meta name="description" content="No frameworks. Engineering. A public, free, login-free site for software engineers who want to understand how things actually work — from transistors to distributed systems." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-white dark:bg-[#23272F] text-[#23272F] dark:text-[#F6F7F9]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
