import './HoldPrompt.css'

interface HoldPromptProps {
  text: string
  visible: boolean
}

export default function HoldPrompt({ text, visible }: HoldPromptProps) {
  const idx = text.indexOf('Space')

  return (
    <div
      className="fixed bottom-[22%] left-0 right-0 text-center pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <span className="hold-prompt-pill">
        {idx === -1 ? (
          text
        ) : (
          <>
            {text.slice(0, idx)}
            <kbd className="hold-prompt-key">Space</kbd>
            {text.slice(idx + 5)}
          </>
        )}
      </span>
    </div>
  )
}
