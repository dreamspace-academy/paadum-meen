export const IDLE_TIMEOUT_MS = 30_000

export const AppState = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  THINKING: 'THINKING',
  SPEAKING: 'SPEAKING',
  RETURNING: 'RETURNING',
  ERROR: 'ERROR',
} as const

export type AppState = (typeof AppState)[keyof typeof AppState]

export const SUGGESTED_QUESTIONS = [
  'What is MakerSpace?',
  'Tell me about DreamSpace.',
  'Who are you, Paadum Meen?',
  'What can I build here?',
  'What are the library opening hours?',
] as const

export type Language = 'en' | 'ta' | 'si'

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
    holdToTalk: 'பேச Space பிடி',
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
