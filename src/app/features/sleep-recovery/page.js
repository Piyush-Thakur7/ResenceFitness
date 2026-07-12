'use client';

import FeaturePageLayout from '@/components/FeaturePageLayout';

export default function SleepRecoveryFeature() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How is my sleep target calculated?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Your sleep target is computed based on your active training intensity. On heavy lifting splits, target rest scales up to 8.5 hours to maximize HGH and cellular repair. On rest days, it drops to a standard 7.5 hours.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Why does tracking sleep matter for muscle building?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Muscle fibers do not grow in the gym — they grow during deep sleep stages when protein synthesis peaks. Consistent sleep tracking helps monitor recovery deficits.'
        }
      }
    ]
  };

  return (
    <FeaturePageLayout
      title="Sleep & Recovery"
      tagline="Train Hard, Recover Smarter"
      description="Track sleep cycles to optimize training readiness. Our coach calculates sleep targets based on active training intensity, warning you when recovery deficits build up."
      schemaStructuredData={faqSchema}
    >
      {/* 1. Feature Explanation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">🌙</span>
          <h3 className="font-bold text-white text-xs">Dynamic Rest Targets</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Target sleep adapts to muscle stress levels, scaling up after heavy leg or back splits.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">⚠️</span>
          <h3 className="font-bold text-white text-xs">Deficit Indicators</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Alerts you when consecutive short sleep cycles build up a dangerous recovery gap.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">📊</span>
          <h3 className="font-bold text-white text-xs">Timeline History</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Review the last 10 days of sleep durations to track sleep quality trends.</p>
        </div>
      </section>

      {/* 2. Visual Recovery Timeline Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-md max-w-lg mx-auto">
        <div>
          <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block">Sample Metrics</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">10-Day Sleep & Recovery Deficit</h3>
          <p className="text-zinc-400 text-[11px] mt-0.5">Sample log illustrating sleep target variations and actual hours achieved.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            {[
              { day: 'Mon', target: '8.5', actual: '8.2', status: 'optimal' },
              { day: 'Tue', target: '8.5', actual: '7.0', status: 'deficit' },
              { day: 'Wed', target: '7.5', actual: '7.6', status: 'optimal' },
              { day: 'Thu', target: '8.0', actual: '6.5', status: 'deficit' },
              { day: 'Fri', target: '8.5', actual: '8.5', status: 'optimal' },
            ].map((d, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg space-y-1.5">
                <span className="text-zinc-400 block font-bold">{d.day}</span>
                <div>
                  <span className="block text-[8px] text-zinc-500">Goal: {d.target}h</span>
                  <span className={`block font-black mt-0.5 ${d.status === 'optimal' ? 'text-green-400' : 'text-orange-400'}`}>
                    {d.actual}h
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px]">
            <span className="text-zinc-400">Average Deficit:</span>
            <span className="text-orange-400 font-bold">⚠️ -0.6 hours/day</span>
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
