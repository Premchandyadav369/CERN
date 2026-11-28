import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { TopBar } from '@/components/navigation/TopBar';
import { Footer } from '@/components/navigation/Footer';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { CitationDrawer } from '@/components/provenance/CitationDrawer';
import { MissionsDrawer } from '@/components/ui/MissionsDrawer';
import { MissMinutesCompanion } from '@/components/ui/MissMinutesCompanion';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { ScrollBeamProgress } from '@/components/motion/CernMotionPrimitives';
import { ShortcutHudModal } from '@/components/ui/ShortcutHudModal';

export const metadata: Metadata = {
  title: 'PARTON | Interactive Particle Physics & Accelerator Digital Twin',
  description:
    'PARTON is an interactive, open-source particle physics digital twin and simulation laboratory modeling CERN accelerators, 3D detectors, Parton distributions, Open Data, and ML trigger pipelines.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-canvas text-text-primary antialiased selection:bg-cern-cyan selection:text-black">
        <MotionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-3 focus:py-2 focus:bg-cern-cyan focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:border-2 focus:border-black focus:shadow-[3px_3px_0px_#000]"
          >
            Skip to main content
          </a>
          <ScrollBeamProgress />
          <TopBar />
          <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
            {children}
          </main>
          <Footer />
          <CommandPalette />
          <CitationDrawer />
          <MissionsDrawer />
          <MissMinutesCompanion />
          <ShortcutHudModal />
        </MotionProvider>
      </body>
    </html>
  );
}
