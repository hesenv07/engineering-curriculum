const THEME_INIT_SCRIPT = `(function(){try{var q=window.matchMedia('(prefers-color-scheme: dark)');var prefersDark=localStorage.theme==='dark'||(!('theme' in localStorage)&&q.matches);document.documentElement.classList.toggle('dark',prefersDark);window.__setPreferredTheme=function(t){localStorage.theme=t;document.documentElement.classList.toggle('dark',t==='dark')};}catch(e){}})();`;

const ThemeInitScript = () => {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
};

export default ThemeInitScript;
