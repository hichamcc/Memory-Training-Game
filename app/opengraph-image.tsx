import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';
import { SITE_NAME } from '@/lib/site';

// The preview card shown when the site is shared (Instagram, WhatsApp, X...)
export const alt = `${SITE_NAME}: free memory training games and techniques`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#f9fafb',
          color: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <BrandMark size={120} />
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 44, fontWeight: 700, color: '#2563eb' }}>
          Train your memory like a champion
        </div>
        <div style={{ marginTop: 20, fontSize: 32, color: '#475569', maxWidth: 960 }}>
          Memory palace, Major System, PAO and more. Learn each technique, then practice it with free games.
        </div>
      </div>
    ),
    size,
  );
}
