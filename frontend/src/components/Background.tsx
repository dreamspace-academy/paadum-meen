const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: 5 + (i * 5.27) % 90,
  size: 6 + (i * 3.14) % 11,
  duration: 8 + (i * 2.71) % 13,
  delay: (i * 1.61) % 10,
  opacity: 0.15 + (i * 0.017) % 0.25,
}))

export default function Background() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(to bottom, var(--river-deep), var(--river-mid))' }}
    >
      {BUBBLES.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            bottom: 0,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: '50%',
            background: 'white',
            opacity: b.opacity,
            boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.3)',
            animation: `bubbleRise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
