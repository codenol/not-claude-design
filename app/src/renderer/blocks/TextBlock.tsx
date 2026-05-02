import type { TextBlock } from '../../types/screen'

const variantStyle: Record<string, React.CSSProperties> = {
  body: { fontSize: 14, lineHeight: '20px', color: 'var(--table-text-primary)' },
  caption: { fontSize: 12, lineHeight: '16px', color: 'var(--breadcrumbs-text-secondary)' },
  subtle: { fontSize: 14, lineHeight: '20px', color: 'var(--breadcrumbs-text-secondary)' },
}

export function TextBlock({ config }: { config: TextBlock }) {
  const { content, variant = 'body' } = config

  return <p style={variantStyle[variant] || variantStyle.body}>{content}</p>
}
