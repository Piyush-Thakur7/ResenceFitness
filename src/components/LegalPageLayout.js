'use client';

import Link from 'next/link';

export default function LegalPageLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen premium-mesh-bg text-white flex flex-col items-center p-6 md:p-12 relative overflow-y-auto selection:bg-orange-500/30">
      {/* Sticky Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/"
          className="bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-300 shadow-md shadow-orange-500/5 hover:border-orange-500/50 flex items-center space-x-2"
        >
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-3xl w-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-2xl rounded-2xl p-6 md:p-10 shadow-xl space-y-6 mt-12 mb-12 relative">
        {/* Glow corner decorations */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent blur-xl pointer-events-none rounded-tr-2xl" />
        
        <div className="border-b border-zinc-800 pb-5">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block">Legal Agreements</span>
          <h1 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight font-sans uppercase tracking-wide">{title}</h1>
          <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">Last Updated: {lastUpdated}</p>
        </div>

        <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
