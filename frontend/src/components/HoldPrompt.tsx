interface HoldPromptProps {
  text: string
  visible: boolean
}

export default function HoldPrompt({ text, visible }: HoldPromptProps) {
  return (
    <p
      className="fixed bottom-[22%] left-0 right-0 text-center text-white text-lg m-0 pointer-events-none"
      style={{
        opacity: visible ? 0.7 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      {text}
    </p>
  )
}
