import { useRef, useEffect } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  getFrequencyData: () => Uint8Array
}

const BAR_COUNT = 64
const GLOW_BLUE = 'rgba(74, 159, 212, 0.8)'
const GLOW_BLUE_FADE = 'rgba(74, 159, 212, 0)'

export default function AudioVisualizer({ isActive, getFrequencyData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!isActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    let rafId: number

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const data = getFrequencyData()

      ctx.clearRect(0, 0, width, height)

      const barWidth = width / BAR_COUNT
      const step = Math.floor(data.length / BAR_COUNT)

      for (let i = 0; i < BAR_COUNT; i++) {
        const amplitude = data[i * step] / 255
        const barHeight = amplitude * height

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
        gradient.addColorStop(0, GLOW_BLUE)
        gradient.addColorStop(1, GLOW_BLUE_FADE)

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, getFrequencyData])

  return (
    <div className="fixed bottom-[20%] left-1/2 -translate-x-1/2 w-[60%] max-w-lg opacity-80">
      <canvas ref={canvasRef} className="w-full" style={{ height: '80px' }} />
    </div>
  )
}
