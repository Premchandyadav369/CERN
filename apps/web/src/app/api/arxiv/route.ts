import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('query') || '';
  const maxResults = searchParams.get('max_results') || '12';

  // Construct category filter for export.arxiv.org
  const catQuery =
    category === 'all'
      ? '(cat:hep-ex OR cat:hep-ph OR cat:physics.acc-ph OR cat:nucl-ex)'
      : `cat:${category}`;

  const fullSearchTerm = query.trim()
    ? `${catQuery} AND all:${query.trim()}`
    : catQuery;

  const apiUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(
    fullSearchTerm
  )}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PARTON-Web/1.0 (Educational open science portal; mailto:parton-lab@users.noreply.github.com)',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `arXiv API returned HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const xml = await res.text();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch from arXiv API' },
      { status: 502 }
    );
  }
}
