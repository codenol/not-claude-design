import type { HeadingBlock } from '../../types/screen'

const h2Style: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: 18,
  lineHeight: '22px',
  color: 'var(--table-text-primary)',
  margin: 0,
}

const h3Style: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: 16,
  lineHeight: '20px',
  color: 'var(--table-text-primary)',
  margin: 0,
}

export function HeadingBlock({ config }: { config: HeadingBlock }) {
  const { content, level = 2 } = config

  if (level === 3) {
    return <h3 style={h3Style}>{content}</h3>
  }

  return <h2 style={h2Style}>{content}</h2>
}
