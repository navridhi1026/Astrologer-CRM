import { ZODIAC_SIGNS } from '../utils/zodiac';

export default function ZodiacSelector({ value, onChange }) {
  return (
    <div>
      <div className="zodiac-grid">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.name}
            type="button"
            className={`zodiac-item${value === sign.name ? ' selected' : ''}`}
            onClick={() => onChange(value === sign.name ? '' : sign.name)}
            style={value === sign.name ? { borderColor: sign.color, boxShadow: `0 0 12px ${sign.color}40` } : {}}
            title={`${sign.name} – ${sign.dateRange}`}
          >
            <span className="zodiac-symbol" style={{ color: value === sign.name ? sign.color : undefined }}>
              {sign.symbol}
            </span>
            <span className="zodiac-name">{sign.name}</span>
          </button>
        ))}
      </div>
      {value && (() => {
        const s = ZODIAC_SIGNS.find(z => z.name === value);
        return s ? (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: `${s.color}15`, border: `1px solid ${s.color}40`, fontSize: 13, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{s.emoji} <strong style={{ color: s.color }}>{s.name}</strong></span>
            <span>🌍 {s.element}</span>
            <span>📅 {s.dateRange}</span>
            <span>💎 {s.gemstone}</span>
            <span>🪐 {s.rulingPlanet}</span>
          </div>
        ) : null;
      })()}
    </div>
  );
}
