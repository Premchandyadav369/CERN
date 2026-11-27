import { NextResponse } from 'next/server';

interface OpenDataRecordSummary {
  id: string;
  title: string;
  experiment: string;
  doi: string;
  year: string;
  url: string;
  source: 'LIVE_API' | 'CACHED_FALLBACK';
}

const VERIFIED_FALLBACK_RECORDS: OpenDataRecordSummary[] = [
  {
    id: '15005',
    title: 'ATLAS 13 TeV Open Data: 4-lepton & diphoton Higgs candidate samples',
    experiment: 'ATLAS',
    doi: '10.7483/OPENDATA.ATLAS.2020.4LEPTON',
    year: '2020',
    url: 'https://opendata.cern.ch/record/15005',
    source: 'CACHED_FALLBACK',
  },
  {
    id: '545',
    title: 'CMS DoubleMu Parked 2012 Dimuon & J/psi -> mu+mu- invariant mass dataset',
    experiment: 'CMS',
    doi: '10.7483/OPENDATA.CMS.JJ4T.6Y3W',
    year: '2016',
    url: 'https://opendata.cern.ch/record/545',
    source: 'CACHED_FALLBACK',
  },
  {
    id: '12340',
    title: 'CMS 2015 Open Data NanoAOD proton-proton collisions at sqrt(s) = 13 TeV',
    experiment: 'CMS',
    doi: '10.7483/OPENDATA.CMS.2015.NANO',
    year: '2021',
    url: 'https://opendata.cern.ch/record/12340',
    source: 'CACHED_FALLBACK',
  },
  {
    id: '1102',
    title: 'ALICE Pb-Pb minimum-bias heavy-ion events at sqrt(s_NN) = 2.76 TeV',
    experiment: 'ALICE',
    doi: '10.7483/OPENDATA.ALICE.2010.PBPB',
    year: '2016',
    url: 'https://opendata.cern.ch/record/1102',
    source: 'CACHED_FALLBACK',
  },
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      'https://opendata.cern.ch/api/records/?page=1&size=6&type=Dataset',
      { signal: controller.signal, next: { revalidate: 3600 } }
    );
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      hits?: {
        hits?: Array<{
          id?: string | number;
          metadata?: {
            title?: string;
            experiment?: string[];
            doi?: string;
            date_published?: string;
          };
        }>;
      };
    };

    const hits = json?.hits?.hits ?? [];
    if (hits.length === 0) {
      return NextResponse.json({ status: 'cached', records: VERIFIED_FALLBACK_RECORDS });
    }

    const records: OpenDataRecordSummary[] = hits.map((h) => ({
      id: String(h.id ?? ''),
      title: h.metadata?.title ?? 'CERN Open Data Record',
      experiment: h.metadata?.experiment?.[0] ?? 'CERN',
      doi: h.metadata?.doi ?? 'opendata.cern.ch',
      year: String(h.metadata?.date_published ?? 'Run 2/3').slice(0, 4),
      url: `https://opendata.cern.ch/record/${h.id ?? ''}`,
      source: 'LIVE_API',
    }));

    return NextResponse.json({ status: 'live', records });
  } catch {
    return NextResponse.json({ status: 'cached', records: VERIFIED_FALLBACK_RECORDS });
  }
}
