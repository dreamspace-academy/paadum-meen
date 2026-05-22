interface SubtitlesProps {
  text: string
  visible: boolean
}

export default function Subtitles({ text, visible }: SubtitlesProps) {
  return (
    <div
      className="fixed bottom-[12%] left-1/2 -translate-x-1/2 max-w-[80%] w-max"
      style={{
        opacity: visible && text ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <p
        className="text-white text-center leading-relaxed m-0"
        style={{
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '18px',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {text}
      </p>
    </div>
  )
}
