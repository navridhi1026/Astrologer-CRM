import { getZodiacByName } from '../utils/zodiac';

export default function ZodiacBadge({ sign, size = 'md' }) {
  if (!sign) return null;
  const z = getZodiacByName(sign);
  if (!z) return null;
  const pad = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs = size === 'sm' ? '11px' : '13px';
  return (
    <span
      className="badge"
      style={{
        background: `${z.color}20`,
        color: z.color,
        border: `1px solid ${z.color}40`,
        padding: pad,
        fontSize: fs,
        fontWeight: 700,
      }}
    >
      {z.symbol} {z.name}
    </span>
  );
}
