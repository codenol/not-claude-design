export interface PinMarkerProps {
  x: number
  y: number
  color: string
  initials: string
  size?: number
}

export function PinMarker({ x, y, color, initials, size = 24 }: PinMarkerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        border: '2px solid white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'inherit',
        lineHeight: 1,
        transition: 'transform 0.1s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      {initials}
    </div>
  )
}
