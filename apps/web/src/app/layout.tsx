import type { Metadata } from 'next';
import './globals.css';
import { TopBar } from '@/components/navigation/TopBar';
import { Footer } from '@/components/navigation/Footer';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { CitationDrawer } from '@/components/provenance/CitationDrawer';

export const metadata: Metadata = {
  title: 'CERN-X | The Interactive Digital Universe of CERN',
  description:
    'An interactive, open-source scientific digital twin and simulation laboratory modeling CERN accelerators, detectors, trigger pipelines, computing, and research experiments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-canvas text-text-primary antialiased selection:bg-cern-blue selection:text-white">
        <TopBar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <CommandPalette />
        <CitationDrawer />
      </body>
    </html>
  );
}
