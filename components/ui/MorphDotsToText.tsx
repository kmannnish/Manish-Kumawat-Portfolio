'use client'

import { useEffect, useRef, useState } from 'react'

interface MorphDotsToTextProps {
  words?: string[]
  className?: string
  height?: number
}

const DEFAULT_WORDS = ['DESIGN', 'SYSTEMS', 'CRAFT', 'AI & ART']

export function MorphDotsToText({
  words = DEFAULT_WORDS,
  className = '',
  height = 220,
}: MorphDotsToTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentWordIdx, setCurrentWordIdx] = useState(0)
  const currentWord = words[currentWordIdx]

  const animRef = useRef<number | null>(null)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    targetX: number
    targetY: number
    originX: number
    originY: number
    radius: number
    color: string
    alpha: number
  }>>([])

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  })

  // Cycle to next word
  function nextWord(idx?: number) {
    setCurrentWordIdx((prev) => (idx !== undefined ? idx : (prev + 1) % words.length))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700)
    let h = (canvas.height = height)

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    function sampleTextCoordinates(text: string): Array<{ x: number; y: number }> {
      const offscreen = document.createElement('canvas')
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return []

      offscreen.width = width
      offscreen.height = h

      // Responsive font sizing based on container width & word length
      const fontSize = Math.min(
        Math.floor(width / (text.length * 0.72)),
        Math.floor(h * 0.55),
        88
      )

      offCtx.font = `900 ${fontSize}px "Instrument Sans", -apple-system, sans-serif`
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'
      offCtx.fillStyle = '#000'
      offCtx.fillText(text, width / 2, h / 2)

      const imgData = offCtx.getImageData(0, 0, width, h)
      const data = imgData.data
      const points: Array<{ x: number; y: number }> = []

      // Sample density based on screen size
      const step = width < 500 ? 6 : 7
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4
          const alpha = data[index + 3]
          if (alpha > 128) {
            points.push({ x, y })
          }
        }
      }

      return points
    }

    const targetCoords = sampleTextCoordinates(currentWord)
    const totalParticles = Math.max(targetCoords.length, 500)

    // Palette: ink with signal blue & mark accents
    const colors = ['#111A16', '#111A16', '#111A16', '#2743E8', '#C8156B']

    // Initialize or re-target particles
    if (particlesRef.current.length === 0) {
      const parts = []
      for (let i = 0; i < totalParticles; i++) {
        const target = targetCoords[i % targetCoords.length] || {
          x: Math.random() * width,
          y: Math.random() * h,
        }
        parts.push({
          x: Math.random() * width,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          targetX: target.x,
          targetY: target.y,
          originX: target.x,
          originY: target.y,
          radius: Math.random() < 0.15 ? 2.6 : 1.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.85 + Math.random() * 0.15,
        })
      }
      particlesRef.current = parts
    } else {
      // Re-target existing particles
      const currentParts = particlesRef.current
      while (currentParts.length < totalParticles) {
        currentParts.push({
          x: Math.random() * width,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          targetX: width / 2,
          targetY: h / 2,
          originX: width / 2,
          originY: h / 2,
          radius: 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.9,
        })
      }

      for (let i = 0; i < currentParts.length; i++) {
        const target = targetCoords[i % targetCoords.length]
        if (target) {
          currentParts[i].targetX = target.x + (Math.random() - 0.5) * 1.5
          currentParts[i].targetY = target.y + (Math.random() - 0.5) * 1.5
        } else {
          // Extra particles float softly around the periphery
          currentParts[i].targetX = Math.random() * width
          currentParts[i].targetY = Math.random() * h
        }
      }
    }

    let isRunning = true
    const mouse = mouseRef.current

    function render() {
      if (!isRunning || !ctx) return
      ctx.clearRect(0, 0, width, h)

      const particles = particlesRef.current
      const mouseRadius = 65
      const mouseForce = 4.5

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Spring toward target
        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        p.vx += dx * 0.08
        p.vy += dy * 0.08

        // Mouse repulsion
        if (mouse.active) {
          const mdx = p.x - mouse.x
          const mdy = p.y - mouse.y
          const dist = Math.hypot(mdx, mdy)
          if (dist < mouseRadius && dist > 0) {
            const force = (1 - dist / mouseRadius) * mouseForce
            p.vx += (mdx / dist) * force * 5
            p.vy += (mdy / dist) * force * 5
          }
        }

        // Friction / Damping
        p.vx *= 0.8
        p.vy *= 0.8

        p.x += p.vx
        p.y += p.vy

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
      }

      ctx.globalAlpha = 1.0
      animRef.current = requestAnimationFrame(render)
    }

    render()

    // Resize listener
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.parentElement.clientWidth
      h = height
      canvas.width = width * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      isRunning = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentWord, height])

  // Mouse / Touch handlers for magnetic ripple
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    }
  }

  function handleMouseLeave() {
    mouseRef.current.active = false
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
        active: true,
      }
    }
  }

  function handleTouchEnd() {
    mouseRef.current.active = false
  }

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Interactive Canvas */}
      <div className="relative rounded-xs border border-rule/80 bg-rule/15 p-2 sm:p-4 backdrop-blur-xs">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full block cursor-crosshair touch-none"
          style={{ height }}
          title="Interactive Morphing Dots — Hover or click pills to morph"
        />

        {/* Word Switcher & Hint Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 px-2 border-t border-rule/50">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
            <span className="text-xxs font-mono text-graphite tracking-tight uppercase">
              Dot Matrix Morph // Graphic System
            </span>
          </div>

          <div className="flex items-center gap-1">
            {words.map((w, idx) => {
              const active = idx === currentWordIdx
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => nextWord(idx)}
                  className={`px-2 py-0.5 rounded-xs text-xxs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-ink text-paper font-semibold shadow-xs'
                      : 'text-graphite hover:text-ink hover:bg-rule/40'
                  }`}
                >
                  {w}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
