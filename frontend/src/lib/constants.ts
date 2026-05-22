export const IDLE_TIMEOUT_MS = 30_000

export const THINKING_TIMEOUT_MS = 10_000

export const AppState = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  THINKING: 'THINKING',
  SPEAKING: 'SPEAKING',
  RETURNING: 'RETURNING',
  ERROR: 'ERROR',
} as const

export type AppState = (typeof AppState)[keyof typeof AppState]

export type Language = 'en' | 'ta' | 'si'

export const SUGGESTED_QUESTIONS_BY_LANG: Record<Language, readonly string[]> = {
  en: [
    'What is MakerSpace?',
    'Tell me about DreamSpace.',
    'Who are you, Paadum Meen?',
    'What can I build here?',
    'What are the library opening hours?',
  ],
  ta: [
    'மேக்கர்ஸ்பேஸ் என்றால் என்ன?',
    'டிரீம்ஸ்பேஸ் பற்றி சொல்லுங்கள்.',
    'நீ யார், பாடும் மீன்?',
    'இங்கே என்ன உருவாக்கலாம்?',
    'நூலகம் திறக்கும் நேரம் என்ன?',
  ],
  si: [
    'MakerSpace කියන්නේ මොකක්ද?',
    'DreamSpace ගැන කියන්න.',
    'ඔයා කවුද, Paadum Meen?',
    'මෙහිදී මොනවා හදන්න පුළුවන්ද?',
    'පුස්තකාලය විවෘත වන වේලාවන් මොනවාද?',
  ],
}

export const UI_STRINGS: Record<
  Language,
  {
    holdToTalk: string
    reset: string
    errorMessage: string
    thinking: string
  }
> = {
  en: {
    holdToTalk: 'Hold Space to talk',
    reset: 'Reset',
    errorMessage: 'Something went wrong. Please try again.',
    thinking: 'Thinking…',
  },
  ta: {
    holdToTalk: 'AIயுடன் கதைக்க Space அழுத்திப் பிடியுங்கள் ',
    reset: 'மீண்டும்',
    errorMessage: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
    thinking: 'யோசிக்கிறேன்…',
  },
  si: {
    holdToTalk: 'කතා කිරීමට Space ඔබාගන්න',
    reset: 'නැවත',
    errorMessage: 'යමක් වැරදී ගියා. නැවත උත්සාහ කරන්න.',
    thinking: 'සිතමින්…',
  },
}
