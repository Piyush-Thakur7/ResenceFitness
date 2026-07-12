import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Resence Fitness - Free AI Fitness Coach & Tracker",
  description: "Experience a 100% free AI fitness coach powered by Gemini 3.5. Securely track workouts, analyze body assessments, log diet macros, and calculate sleep recovery limits.",
  metadataBase: new URL("https://fitness.resence.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Resence Fitness - Free AI Fitness Coach & Tracker",
    description: "Adaptive training splits, macro photography logging, and encrypted photo posture critiques - always free.",
    url: "https://fitness.resence.in",
    siteName: "Resence Fitness",
    images: [
      {
        url: "/logos/logo_1.jpg",
        width: 800,
        height: 800,
        alt: "Resence Fitness Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resence Fitness - Free AI Fitness Coach & Tracker",
    description: "Adaptive training splits, macro photography logging, and encrypted photo posture critiques - always free.",
    images: ["/logos/logo_1.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
