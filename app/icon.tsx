import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';

// 192px is a multiple of 48, which Google asks for in search-result favicons
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BrandMark size={192} />, size);
}
