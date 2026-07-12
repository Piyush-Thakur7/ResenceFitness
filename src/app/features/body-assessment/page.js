'use client';

import { useState } from 'react';
import FeaturePageLayout from '@/components/FeaturePageLayout';

export default function BodyAssessmentFeature() {
  const [sliderPos, setSliderPos] = useState(50);

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to run an AI Body Assessment',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Upload Physique Photos',
        'text': 'Take front, side, or back photos in consistent lighting and upload them to the private storage bucket.'
      },
      {
        '@type': 'HowToStep',
        'name': 'AI Analysis',
        'text': 'Gemini Vision critiques body posture, fat distributions, and skeletal alignments.'
      },
      {
        '@type': 'HowToStep',
        'name': 'Personalized Report',
        'text': 'Receive a comprehensive breakdown of muscle density imbalances and target focus areas.'
      }
    ]
  };

  return (
    <FeaturePageLayout
      title="Body Assessment"
      tagline="See Your Progress, Not Just Your Weight"
      badge="🛡️ FREE — NO LIMITS"
      description="Track fat loss, posture corrections, and muscle gains. Our vision-based critique engine parses your photos and logs progress without exposing your data."
      schemaStructuredData={howToSchema}
    >
      {/* 1. How it works 3-step visual */}
      <section className="space-y-6">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider text-center">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-2">
            <span className="text-xl">1. 📸</span>
            <h4 className="font-bold text-white text-xs">Upload Physique</h4>
            <p className="text-zinc-500 text-[10px] leading-relaxed">Snapshot front, side, or back poses inside your private dashboard panel.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-2">
            <span className="text-xl">2. 🧠</span>
            <h4 className="font-bold text-white text-xs">AI Posture Critique</h4>
            <p className="text-zinc-500 text-[10px] leading-relaxed">Gemini Vision identifies bone angles, pelvic tilts, and fat distribution splits.</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-2">
            <span className="text-xl">3. 📝</span>
            <h4 className="font-bold text-white text-xs">Personalized Report</h4>
            <p className="text-zinc-500 text-[10px] leading-relaxed">Get specific targeting splits (e.g. rear-delt focuses to balance pushing volume).</p>
          </div>
        </div>
      </section>

      {/* 2. Before/After Interactive Slider */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div className="text-center">
          <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block">Interactive Preview</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Before & After Progression Slider</h3>
          <p className="text-zinc-400 text-[11px] mt-0.5">Drag the slider horizontally to compare physique changes over a 12-week split.</p>
        </div>

        {/* Visual Slider Wrapper */}
        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 select-none">
          {/* Before image */}
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
            <span className="text-3xl block mb-2">🏋️</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">After State</h4>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-[150px]">Increased shoulder mass and balanced chest lines after 12 weeks of training.</p>
          </div>
          
          {/* After image overlay controlled by slider */}
          <div 
            className="absolute inset-y-0 left-0 bg-zinc-950 border-r-2 border-orange-500 overflow-hidden" 
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute inset-y-0 left-0 w-[384px] h-[512px] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <span className="text-3xl block mb-2">🛋️</span>
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Before State</h4>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-[150px]">Loose posture, minor anterior pelvic tilt, and low deltoid definition.</p>
            </div>
          </div>

          {/* Slider input control */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderPos} 
            onChange={(e) => setSliderPos(parseInt(e.target.value))}
            className="absolute inset-x-0 bottom-6 mx-auto w-[80%] h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 outline-none"
          />
        </div>
      </section>

      {/* 3. Privacy Policy Callout */}
      <section className="bg-orange-500/5 border border-orange-950 rounded-2xl p-6 space-y-3">
        <h3 className="text-orange-400 font-bold text-xs uppercase tracking-wider flex items-center">
          <span className="mr-2">🛡️</span> Privacy-First Guarantee
        </h3>
        <p className="text-zinc-300 text-xs leading-relaxed">
          We understand that physique photos are highly private. That is why your uploads do not have static public URLs, are stored using <strong>AES-256 encryption-at-rest</strong>, and are accessed strictly via expiring tokens. 
          Furthermore, our pipelines are completely automated — <strong>no human review team ever views your images</strong>.
        </p>
      </section>
    </FeaturePageLayout>
  );
}
