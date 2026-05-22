interface ResetButtonProps {
  onClick: () => void
  label: string
}

export default function ResetButton({ onClick, label }: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 rounded text-white cursor-pointer border-0 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.1)',
        fontSize: '12px',
        padding: '6px 12px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
      }}
    >
      {label}
    </button>
  )
}
