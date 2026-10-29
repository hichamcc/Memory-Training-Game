import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';

// Large app icons for the web app manifest (installing to a home screen)
const ICONS: Record<string, { size: number; maskable: boolean }> = {
  'icon-512.png': { size: 512, maskable: false },
  'maskable-512.png': { size: 512, maskable: true },
};

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { size, maskable } = ICONS[(await params).name];
  return new ImageResponse(<BrandMark size={size} maskable={maskable} />, { width: size, height: size });
}
