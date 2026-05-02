export const typography = {
  family: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  style: {
    'heading/3xl': { fontSize: '32px', lineHeight: '40px', fontWeight: 700, letterSpacing: '-0.5px' },
    'heading/2xl': { fontSize: '24px', lineHeight: '32px', fontWeight: 700, letterSpacing: '-0.3px' },
    'heading/xl':  { fontSize: '20px', lineHeight: '28px', fontWeight: 600 },
    'heading/lg':  { fontSize: '18px', lineHeight: '24px', fontWeight: 600 },
    'heading/md':  { fontSize: '16px', lineHeight: '24px', fontWeight: 600 },
    'heading/sm':  { fontSize: '14px', lineHeight: '20px', fontWeight: 600 },
    'body/xl':    { fontSize: '18px', lineHeight: '28px', fontWeight: 400 },
    'body/lg':    { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
    'body/md':    { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
    'body/sm':    { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
    'caption':    { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
  },
} as const;

export function getTypographyStyle(name: keyof typeof typography.style): React.CSSProperties {
  return typography.style[name];
}

export function typographyClass(name: keyof typeof typography.style): string {
  return `typography-${name.replace('/', '-')}`;
}
