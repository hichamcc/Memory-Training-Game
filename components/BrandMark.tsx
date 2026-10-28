// The "MC" mark drawn for generated images (favicon, Apple icon, share card).
// Plain inline styles only: ImageResponse doesn't support Tailwind classes.
export default function BrandMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size * 0.22,
        background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
        color: 'white',
        fontSize: size * 0.46,
        fontWeight: 800,
        letterSpacing: -size * 0.02,
      }}
    >
      MC
    </div>
  );
}
