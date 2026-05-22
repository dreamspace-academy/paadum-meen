import { SUGGESTED_QUESTIONS } from '../lib/constants'

interface SuggestedBubblesProps {
  visible: boolean
}

const POSITIONS: React.CSSProperties[] = [
  { top: '15%', left: '8%' },
  { top: '20%', right: '6%' },
  { top: '65%', left: '5%' },
  { top: '70%', right: '8%' },
  { top: '42%', left: '50%', transform: 'translateX(-50%)' },
]

const CHIP_ANIMATIONS = [
  { duration: '3.2s', delay: '0s' },
  { duration: '2.8s', delay: '0.6s' },
  { duration: '3.5s', delay: '1.1s' },
  { duration: '2.6s', delay: '0.3s' },
  { duration: '3.0s', delay: '0.9s' },
]

export default function SuggestedBubbles({ visible }: SuggestedBubblesProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      {SUGGESTED_QUESTIONS.slice(0, 5).map((question, i) => (
        <div
          key={question}
          style={{
            position: 'absolute',
            ...POSITIONS[i],
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '14px',
            padding: '8px 16px',
            whiteSpace: 'nowrap',
            animation: `chipFloat ${CHIP_ANIMATIONS[i].duration} ease-in-out ${CHIP_ANIMATIONS[i].delay} infinite`,
          }}
        >
          {question}
        </div>
      ))}
    </div>
  )
}
