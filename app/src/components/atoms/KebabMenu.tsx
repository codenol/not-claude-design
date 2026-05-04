import { useState, useRef, useEffect, useCallback } from 'react'

export interface KebabMenuItem {
  label: string
  danger?: boolean
  onClick: () => void
}

export interface KebabMenuProps {
  items: KebabMenuItem[]
}

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; flipUp: boolean }>({ top: 0, left: 0, flipUp: false })
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      const flipUp = r.bottom + 200 > window.innerHeight
      setPos({ top: flipUp ? r.top : r.bottom, left: r.right, flipUp })
    }
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div style={{ display: 'inline-flex' }} ref={ref}>
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
          fontSize: 16, lineHeight: 1, color: 'var(--color-neutral-400, #9ca3af)',
          borderRadius: 4, fontFamily: 'inherit',
        }}
        title="Меню"
      >
        ⋮
      </button>
      {open && (
        <div style={{
          position: 'fixed', zIndex: 9999,
          top: pos.flipUp ? pos.top : pos.top,
          left: pos.left + 4,
          transform: pos.flipUp ? 'translateY(-100%)' : 'none',
          minWidth: 180, background: 'var(--color-bg-default, #ffffff)',
          border: '1px solid var(--color-neutral-200, #e5e7eb)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          padding: 4, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); item.onClick(); close() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 10px', fontSize: 13, textAlign: 'left',
                borderRadius: 4, fontFamily: 'inherit',
                color: item.danger ? '#ef4444' : 'var(--color-text-default, #111827)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-neutral-50, #f9fafb)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
