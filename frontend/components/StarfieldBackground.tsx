'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkleSpeed: number
  twinklePhase: number
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let stars: Star[] = []
    let lastFrameTime = 0
    const frameInterval = 1000 / 30 // 30 FPS for performance

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = []
      const starCount = Math.floor((canvas.width * canvas.height) / 8000) // Even fewer stars
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 0.05 + 0.01,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }
    }

    const drawStar = (star: Star) => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      
      // Gradient for glow effect
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 3
      )
      
      const baseOpacity = star.opacity * (0.7 + Math.sin(star.twinklePhase) * 0.3)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${baseOpacity})`)
      gradient.addColorStop(0.4, `rgba(200, 210, 255, ${baseOpacity * 0.6})`)
      gradient.addColorStop(1, 'rgba(150, 180, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.fill()
    }

    const animate = (currentTime: number) => {
      // Throttle to 30 FPS
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Simplified background - no gradient for performance
      ctx.fillStyle = 'rgba(15, 12, 41, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      stars.forEach(star => {
        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed
        
        // Slow drift
        star.y -= star.speed
        if (star.y < 0) {
          star.y = canvas.height
          star.x = Math.random() * canvas.width
        }
        
        drawStar(star)
      })

      // Shooting stars completely disabled for performance

      animationFrameId = requestAnimationFrame(animate)
    }

    const drawShootingStar = () => {
      const startX = Math.random() * canvas.width
      const startY = Math.random() * canvas.height * 0.3
      const length = Math.random() * 80 + 60
      const angle = Math.PI / 4 + Math.random() * Math.PI / 4
      
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(
        startX + Math.cos(angle) * length,
        startY + Math.sin(angle) * length
      )
      
      const gradient = ctx.createLinearGradient(
        startX, startY,
        startX + Math.cos(angle) * length,
        startY + Math.sin(angle) * length
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.4)')
      gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()
    }

    resizeCanvas()
    animate(0)

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

