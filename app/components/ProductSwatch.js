export function ProductSwatch({ color, bg, size = 80 }) {
  const petal = ['darkgrey', 'maroon', 'blue', 'teal'].includes(color) ? '#e8c0c8' : '#d4808a';
  const leaf = '#8aaa7a';
  return (
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"
      width={size} height={size * 1.2} style={{ display: 'block' }}>
      <rect width="100" height="120" fill={bg} />
      {color === 'darkgrey' && Array.from({ length: 20 }).map((_, i) => (
        <circle key={i} cx={(i % 5) * 18 + 10} cy={Math.floor(i / 5) * 18 + 10}
          r="2" fill="#6a6a6a" opacity="0.35" />
      ))}
      <line x1="50" y1="110" x2="50" y2="50" stroke={leaf} strokeWidth="1.2" />
      <ellipse cx="38" cy="75" rx="8" ry="4" fill={leaf} transform="rotate(-25 38 75)" opacity="0.7" />
      <ellipse cx="62" cy="68" rx="8" ry="4" fill={leaf} transform="rotate(25 62 68)" opacity="0.7" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse key={i} cx="50" cy="48" rx="5" ry="12"
          fill={petal} opacity="0.82" transform={`rotate(${angle} 50 48)`} />
      ))}
      <circle cx="50" cy="48" r="5" fill="#f5e6b0" />
    </svg>
  );
}
