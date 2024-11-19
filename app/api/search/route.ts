import { NextResponse } from 'next/server'

const navigationItems = [
  { id: 'nav-1', title: 'Home', type: 'navigation', url: '/' },
  { id: 'nav-2', title: 'Report Waste', type: 'navigation', url: '/report' },
  { id: 'nav-3', title: 'Collect Waste', type: 'navigation', url: '/collect' },
  { id: 'nav-4', title: 'Rewards', type: 'navigation', url: '/rewards' },
  { id: 'nav-5', title: 'Leaderboard', type: 'navigation', url: '/leaderboard' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  // Search through navigation items only
  const results = navigationItems.filter(item =>
    item.title.toLowerCase().includes(query)
  );

  return NextResponse.json(results);
} 