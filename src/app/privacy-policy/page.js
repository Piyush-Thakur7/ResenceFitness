'use client';

import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 12, 2026">
      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">1. Data We Collect</h2>
        <p>
          Resence Fitness collects and processes user metrics strictly to compute body statistics and adjust exercise splits. 
          The data elements we collect are:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Profile Data</strong>: Age/Date of Birth, gender, current weight, height, and fitness goals.</li>
          <li><strong>Physique Photos</strong>: Front, side, and back body photos uploaded for AI analysis.</li>
          <li><strong>Workout Logs</strong>: Exercise names, set reps, and day completion checkboxes.</li>
          <li><strong>Diet & Nutrition Logs</strong>: Consumed meal descriptions, calories, and protein/carb/fat macros.</li>
          <li><strong>Sleep & Rest Logs</strong>: Daily bedtime duration and rest timelines.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">2. How We Use Artificial Intelligence</h2>
        <p>
          Our application implements generative artificial intelligence models to customize your fitness regimens.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Gemini 3.5 Flash Model</strong>: Calibrates workout volume, counts weekly targets, and adjusts caloric intakes.</li>
          <li><strong>Gemini Vision API</strong>: Critiques posture, fat distribution, and muscle density from physique uploads.</li>
          <li><strong>Zero Human Review</strong>: All vision reviews are processed programmatically. No human employees, contractors, or administrators ever inspect or critique your physique photos.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">3. Photo Storage & Military-Grade Security</h2>
        <p>
          We employ state-of-the-art security measures to protect user privacy. All uploaded photos are placed into a locked, non-public Supabase Storage bucket.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Private Buckets</strong>: The storage directories block all direct HTTP request access. Photos do not have static public URLs.</li>
          <li><strong>Authenticated Signed URLs</strong>: Photos are retrieved exclusively using dynamically-generated signed URLs that expire automatically after one hour (3600 seconds).</li>
          <li><strong>Encryption at Rest</strong>: All uploaded image files are stored using industry-standard Advanced Encryption Standard (AES-256) encryption-at-rest.</li>
          <li><strong>30-Day Auto-Deletion</strong>: Image backups are permanently removed from database storage 30 days after creation.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">4. Data Retention Limits</h2>
        <p>
          We apply strict data retention policies:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Physique Photos</strong>: Permanently deleted from storage servers after 30 days.</li>
          <li><strong>Workout, Sleep, and Nutrition Logs</strong>: Retained indefinitely to populate history curves until you choose to delete your account.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">5. Your Privacy Rights (GDPR & CCPA)</h2>
        <p>
          Under international privacy regulations (including General Data Protection Regulation and California Consumer Privacy Act), you retain:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li>The right to request an export of all metrics and logs saved on our servers.</li>
          <li>The right to delete your profile, purging all associated logs, weight history, and image blocks.</li>
          <li>To request data deletion or exports, contact our privacy officer at <a href="mailto:privacy@resence.in" className="text-orange-400 hover:underline">privacy@resence.in</a>.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">6. Third Party Integrations</h2>
        <p>
          We rely on secure partners to deliver AI features:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Supabase Inc.</strong>: Relational database hosting and private storage buckets.</li>
          <li><strong>Google Gemini API</strong>: Processes text profiles and base64 image strings. No user data is sent for general model training.</li>
          <li><strong>No Ad Trackers</strong>: We do not sell, barter, or transfer logs to advertisement brokers or data harvesting agencies.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">7. Cookies</h2>
        <p>
          We utilize essential cookies solely for session storage and user authentication (keeping you signed in). 
          We do not run advertising trackers or third-party cookies on our site.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">8. Monetization & Passion Project Disclosure</h2>
        <p>
          Resence is, and will remain, 100% free to use. We do not sell your personal data. 
          This is a pure passion project developed to build a secure, intelligent, and highly customizable fitness experience.
        </p>
      </section>
    </LegalPageLayout>
  );
}
