'use client';

import LegalPageLayout from '@/components/LegalPageLayout';

export default function TermsOfService() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="July 12, 2026">
      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">1. Personal Tool Usage</h2>
        <p>
          Resence is a free personal utility built for the author and friends. 
          By logging in, you acknowledge that this is a hobbyist project provided on an as-is basis without commercial SLAs, guarantees, or formal business commitments.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">2. Medical Disclaimer</h2>
        <div className="p-4 bg-orange-950/20 border border-orange-900 text-orange-400 text-xs rounded-xl leading-relaxed">
          <strong>⚠️ Disclaimer</strong>: The fitness logs, workout splits, nutritional calorie suggestions, and body postures compiled by the Gemini AI are for general reference only. 
          They are not professional medical advice, physical therapy routines, or healthcare plans. 
          Please consult a physician before beginning any training.
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">3. Uptime & Maintenance</h2>
        <p>
          As a personal hobby project, we make no commitments regarding server uptime, data longevity, or feature availability. 
          We reserve the right to change hosting setups, adjust AI features, or close down database configurations at any time.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">4. Limitation of Liability</h2>
        <p>
          The author and hosting providers make no guarantees about the tool's accuracy and assume no liability for physical injury, health issues, or database errors encountered during training. 
          Your use of this application is completely at your own risk.
        </p>
      </section>
    </LegalPageLayout>
  );
}
