import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="az">
      <Head>
        <meta
          name="description"
          content="No frameworks. Engineering. A public, free, login-free site for software engineers who want to understand how things actually work — from transistors to distributed systems."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var q=window.matchMedia('(prefers-color-scheme: dark)');var prefersDark=localStorage.theme==='dark'||(!('theme' in localStorage)&&q.matches);document.documentElement.classList.toggle('dark',prefersDark);window.__setPreferredTheme=function(t){localStorage.theme=t;document.documentElement.classList.toggle('dark',t==='dark')};}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
