// The "MC" mark drawn for generated images (favicon, Apple icon, share card).
// Plain inline styles only: ImageResponse doesn't support Tailwind classes.
// `maskable` fills the square edge to edge and keeps the letters inside the
// middle 80%, since Android crops app icons to its own shape.
export default function BrandMark({ size, maskable = false }: { size: number; maskable?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: maskable ? 0 : size * 0.22,
        background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
        color: 'white',
        fontSize: size * (maskable ? 0.34 : 0.46),
        fontWeight: 800,
        letterSpacing: -size * 0.02,
      }}
    >
      MC
    </div>
  );
}
