export default function sitemap() {
  const baseUrl = "https://fitness.resence.in";
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/demo`, lastModified: new Date() },
    { url: `${baseUrl}/features/ai-workout-plans`, lastModified: new Date() },
    { url: `${baseUrl}/features/body-assessment`, lastModified: new Date() },
    { url: `${baseUrl}/features/nutrition-tracking`, lastModified: new Date() },
    { url: `${baseUrl}/features/sleep-recovery`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date() },
    { url: `${baseUrl}/cookie-policy`, lastModified: new Date() },
  ];
}
