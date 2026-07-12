'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen premium-mesh-bg text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-orange-500/30 pb-16">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky Header Navbar */}
      <header className="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center">
            <img src="/logos/logo_1.jpg" alt="Resence Logo" className="w-full h-full object-cover" />
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
          <Link href="/privacy-policy" className="text-xs text-zinc-300 hover:text-white font-medium transition-colors">
            Privacy
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16 relative z-10">
        {/* Mission Statement */}
        <section className="text-center space-y-4 py-8 relative">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block">Project Intent</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">Personal Fitness Assistant</h1>
          <p className="max-w-2xl mx-auto text-zinc-300 text-sm sm:text-base leading-relaxed font-light italic">
            "Resence combines custom AI models with fitness tracking to deliver a clean, private, and customizable dashboard built for personal training and tracking."
          </p>
        </section>

        {/* The Story */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">The Story</h2>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            Resence was built as a clean, low-friction fitness dashboard to avoid subscription models, advertisements, and data sharing common in commercial apps.
          </p>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            The name <strong>Resence</strong> represents the <em>"Resourceful Essence"</em> of training — focusing strictly on logs, nutrition values, and progression curves.
          </p>
          
          {/* Story Timeline */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-850 text-center">
            <div>
              <span className="block text-xs font-bold text-orange-400">Q1 2026</span>
              <span className="block text-[10px] text-zinc-500 mt-0.5">Initial Concepts & DB Design</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-green-400">Q2 2026</span>
              <span className="block text-[10px] text-zinc-500 mt-0.5">Private Beta Testing</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-blue-400">Q3 2026</span>
              <span className="block text-[10px] text-zinc-500 mt-0.5">Personal Launch</span>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block">Modern Architecture</span>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mt-1">Our Technology Stack</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-855 p-5 rounded-xl text-center space-y-2 hover:border-orange-500/30 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform block">🤖</span>
              <h3 className="font-bold text-white text-xs">Gemini 3.5 Flash</h3>
              <p className="text-zinc-400 text-[10px] leading-relaxed">Runs dynamic calorie updates, text advice, and physique photo assessments.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-855 p-5 rounded-xl text-center space-y-2 hover:border-green-500/30 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform block">⚡</span>
              <h3 className="font-bold text-white text-xs">Supabase Storage & DB</h3>
              <p className="text-zinc-400 text-[10px] leading-relaxed">Manages RLS schemas, encrypted user storage, and private bucket file blocks.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-855 p-5 rounded-xl text-center space-y-2 hover:border-blue-500/30 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform block">⚛️</span>
              <h3 className="font-bold text-white text-xs">React & Next.js</h3>
              <p className="text-zinc-400 text-[10px] leading-relaxed">Delivers instant tab switches, SVG progress plotting, and responsive mobile interfaces.</p>
            </div>
          </div>
        </section>

        {/* Team / Founder Card */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">Creator</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-zinc-950 rounded-full border border-orange-500/20 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">PT</span>
              </div>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-bold text-white text-base">Piyush Thakur</h3>
              <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Hobbyist Developer</p>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
                Built this tool to optimize my own workout routines and macro logging splits. I hope it helps you track your parameters safely!
              </p>
              <p className="text-[10px] text-zinc-500">Contact: <a href="mailto:hello@resence.in" className="text-zinc-400 hover:underline">hello@resence.in</a></p>
            </div>
          </div>
        </section>

        {/* How We Host This & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-zinc-900/40 border border-zinc-855 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Hosting & Cost Transparency</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Resence is hosted privately using personal hosting limits and standard database free plans. It carries negligible operational overhead, meaning we don't need tracking pixels or subscription charges to keep it active.
            </p>
          </section>

          <section className="bg-zinc-900/40 border border-zinc-855 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Our Values</h3>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div><strong>Privacy First</strong>: Photos are stored securely in private buckets and never shared.</div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div><strong>Hobbyist-Built</strong>: Focused on clean layouts, speed, and real utility.</div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <div><strong>Always Ad-Free</strong>: No commercial tracking pixels or intrusive marketing tools.</div>
              </li>
            </ul>
          </section>
        </div>

        {/* Newsletter Box */}
        <section className="bg-gradient-to-r from-orange-500/5 to-purple-500/5 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-2xl rounded-full" />
          
          <div>
            <h3 className="text-white font-bold text-base">Stay Updated</h3>
            <p className="text-zinc-400 text-xs mt-1">Get clean fitness tips and product updates delivered directly to your inbox.</p>
          </div>

          {subscribed ? (
            <div className="p-3 bg-green-950/20 border border-green-900 text-green-400 text-xs rounded-xl font-bold max-w-sm mx-auto">
              ✓ Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                required
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
