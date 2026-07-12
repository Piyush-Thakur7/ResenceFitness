'use client';

import Link from 'next/link';

export default function FeaturePageLayout({ 
  title, 
  tagline, 
  badge = "🤖 ADAPTIVE INTENSITY", 
  description,
  schemaStructuredData = null,
  children 
}) {
  return (
    <div className="min-h-screen premium-mesh-bg text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-orange-500/30 pb-28">
      {/* Schema.org Structured Data */}
      {schemaStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
        />
      )}

      {/* Background Glow Elements */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky Header Navbar */}
      <header className="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-45">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center">
            <img src="/logos/logo_2.jpg" alt="Resence Logo" className="w-full h-full object-cover" />
          </div>
          <Link href="/">
            <span className="font-display font-extrabold tracking-widest text-white uppercase text-xs md:text-sm block cursor-pointer">
              Resence <span className="text-orange-500 font-extrabold">Fitness</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xs text-zinc-300 hover:text-white font-medium transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-xs text-zinc-300 hover:text-white font-medium transition-colors">
            About
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 relative z-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-400">Features</span>
          <span>/</span>
          <span className="text-orange-400">{title}</span>
        </nav>

        {/* Hero Section */}
        <section className="space-y-4">
          <span className="inline-block text-[9px] bg-orange-950/40 text-orange-400 border border-orange-900 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
            {badge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white uppercase">
            {tagline}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {description}
          </p>
        </section>

        {/* Custom Section Contents */}
        <div className="space-y-12 pt-4">
          {children}
        </div>

        {/* Related Features Cross Linking */}
        <section className="border-t border-zinc-850 pt-10 space-y-4">
          <h3 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Explore Other Free Core Capabilities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Workout Splits', path: '/features/ai-workout-plans', icon: '🏋️' },
              { label: 'Body Critique', path: '/features/body-assessment', icon: '📸' },
              { label: 'Nutrition Vision', path: '/features/nutrition-tracking', icon: '🥚' },
              { label: 'Sleep Recovery', path: '/features/sleep-recovery', icon: '🌙' },
            ].map((f) => (
              <Link
                key={f.label}
                href={f.path}
                className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform block">{f.icon}</span>
                <span className="text-[10px] text-zinc-300 font-semibold group-hover:text-white transition-colors">{f.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Call-To-Action Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-850 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto rounded-t-2xl shadow-xl shadow-orange-500/5">
        <div>
          <h3 className="text-white font-bold text-xs">Transform your routine today.</h3>
          <p className="text-[10px] text-zinc-400">Complete assessments, track nutrition, and adapt splits — 100% Free.</p>
        </div>
        <Link 
          href="/"
          className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 whitespace-nowrap cursor-pointer uppercase tracking-wider"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
