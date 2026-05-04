import React from 'react'

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: 18,
  lineHeight: '22px',
  color: 'var(--table-text-primary)',
  margin: 0,
}

export function ContainerBlock({
  direction,
  gap = 8,
  children,
}: {
  direction: 'row' | 'col'
  gap?: number
  children?: React.ReactNode
}) {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'col' ? 'column' : direction,
    gap: gap,
    flexWrap: direction === 'row' ? 'wrap' : undefined,
  }
  return <div style={style}>{children}</div>
}

export function SectionBlock({
  heading,
  direction = 'row',
  gap = 8,
  children,
}: {
  heading?: string
  direction?: 'row' | 'col'
  gap?: number
  children?: React.ReactNode
}) {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'col' ? 'column' : direction,
    gap: gap,
    flexWrap: direction === 'row' ? 'wrap' : undefined,
    marginTop: heading ? 12 : 0,
  }
  return (
    <section>
      {heading && <h2 style={sectionHeadingStyle}>{heading}</h2>}
      <div style={style}>{children}</div>
    </section>
  )
}

export function FormBlock({
  gap = 12,
  children,
}: {
  gap?: number
  children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, maxWidth: 320 }}>
      {children}
    </div>
  )
}
