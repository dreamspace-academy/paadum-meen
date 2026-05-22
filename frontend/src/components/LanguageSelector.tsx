import type { Language } from '../lib/constants'

interface LanguageSelectorProps {
  current: Language
  onChange: (lang: Language) => void
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'si', label: 'සිංහල' },
]

export default function LanguageSelector({ current, onChange }: LanguageSelectorProps) {
  return (
    <div className="fixed top-4 right-4 flex gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className="px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer border-0"
          style={{
            background: current === code ? 'white' : 'transparent',
            color: current === code ? '#0a1628' : 'white',
          }}
          onMouseEnter={(e) => {
            if (current !== code) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (current !== code) {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
