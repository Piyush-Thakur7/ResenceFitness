'use client';

import FeaturePageLayout from '@/components/FeaturePageLayout';

export default function NutritionTrackingFeature() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does food photo recognition work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'You snap or upload a photo of your meal. The Gemini Vision API processes the image, identifies the ingredients, and computes estimated calories, protein, carbohydrates, and fats.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I track vegetarian or vegan diets?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Resence is fully customizable. You can configure your profile to Veg, Vegan, Eggetarian, or Non-Veg, and the AI coach will suggest plan recommendations based on your preferences.'
        }
      }
    ]
  };

  return (
    <FeaturePageLayout
      title="Nutrition Tracking"
      tagline="Snap, Log, Optimize — All Free"
      description="No more manual searches through database lists. Snap a picture of your plate and let the AI estimate macronutrients and log calories instantly."
      schemaStructuredData={faqSchema}
    >
      {/* 1. Core Explanation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">📸</span>
          <h3 className="font-bold text-white text-xs">Photo Recognition</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Upload a plate picture and the AI estimates serving weights and ingredient volumes.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">📊</span>
          <h3 className="font-bold text-white text-xs">Macronutrient Splits</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">View protein, carbohydrate, and fat balances plotted dynamically on metrics cards.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">🥗</span>
          <h3 className="font-bold text-white text-xs">Diet Profiles</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Fully supports Veg, Vegan, Eggetarian, and Non-Veg preferences for plan suggestions.</p>
        </div>
      </section>

      {/* 2. Visual Macro Breakdown Widget */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-md max-w-md mx-auto">
        <div>
          <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block">Interactive Visualizer</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Sample Meal Macro Breakdown</h3>
          <p className="text-zinc-400 text-[11px] mt-0.5">Estimated metrics for a standard Grilled Paneer/Chicken salad bowl.</p>
        </div>

        <div className="space-y-4 bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
          {/* Calorie Card */}
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <span className="text-xs text-zinc-300 font-semibold">Total Calories</span>
            <span className="text-xs font-bold text-orange-400">450 kcal</span>
          </div>

          <div className="space-y-3">
            {/* Protein bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-400">Protein (Slight Surplus Target)</span>
                <span className="text-green-400">35g (31%)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[70%]" />
              </div>
            </div>

            {/* Carbs bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-400">Carbohydrates</span>
                <span className="text-blue-400">25g (22%)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[45%]" />
              </div>
            </div>

            {/* Fats bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-zinc-400">Healthy Fats</span>
                <span className="text-yellow-500">20g (47%)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
