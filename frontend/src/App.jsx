import React, { useState, useEffect } from 'react';
import Converter from './components/Converter';
import ConvertifyLogo from './components/Logo';
import { Moon, Sun, ShieldCheck } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ConvertifyLogo size={42} showText={true} />
        </div>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors bg-slate-100 dark:bg-slate-800/50"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 sm:pt-20 px-4 pb-20 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[5%] left-[10%] w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[30rem] h-[30rem] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="text-center mb-10 z-10 max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
            Seamless File <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-400">
              Format Conversion
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 font-medium">
            Transform PDF, DOCX, and Images instantly. Private and secure &mdash; processed entirely in memory, deleted instantly. No tracking, no storage.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100/50 dark:bg-emerald-900/30 px-5 py-2 rounded-full w-fit mx-auto border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm backdrop-blur-sm">
            <ShieldCheck size={18} /> Architecture built for 100% Privacy
          </div>
        </div>

        <Converter />
      </main>

      <footer className="py-6 text-center text-slate-500 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} Convertify. All conversions run locally. Built by AI.
      </footer>
    </div>
  );
}

export default App;
