'use client';

import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 12, 2026">
      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">1. Personal Project Scope</h2>
        <p>
          Resence Fitness is a private personal training application built for self-use and a small group of friends. 
          It is not a commercial service, SaaS product, or registered business entity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">2. Data We Collect</h2>
        <p>
          To compile baseline metrics and adjust training schedules, we process:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li><strong>Profile Info</strong>: Age, gender, height, weight, and fitness goals.</li>
          <li><strong>Physique Photos</strong>: Physique images uploaded for custom AI posture evaluations.</li>
          <li><strong>Workout & Nutrition Logs</strong>: Exercise tick-offs, sleep logs, and meal macro estimations.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">3. Storage & Security</h2>
        <p>
          All data elements, logs, and photos are stored securely using Supabase databases and storage buckets. 
          To protect user privacy:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-400">
          <li>Physique photos are kept in private buckets with no public URLs. They are accessed using 1-hour expiring signed tokens.</li>
          <li>No human administrators review or inspect your uploaded photos; they are processed programmatically by the Google Gemini API.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">4. Third Party Data Policy</h2>
        <p>
          We do not sell, rent, share, or monetize your metrics, log items, or physique photos with any third-party brokers, advertisers, or analytics networks. 
          Data is sent securely to Google Gemini API endpoints strictly to execute coaching generation and is not used for training general public models.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-white font-bold text-lg border-l-2 border-orange-500 pl-3">5. Data Deletion & Account Deletion</h2>
        <p>
          You can delete your account profile at any time inside the Settings section, which permanently purges all profile configurations, logs, history, and uploaded files from our Supabase servers. 
          For questions, contact the author at <a href="mailto:hello@resence.in" className="text-orange-400 hover:underline">hello@resence.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
