'use client'

import React, { useRef, useEffect } from 'react'

interface RibbonsProps {
  baseThickness?: number
  colors?: string[]
  speedMultiplier?: number
  maxAge?: number
  enableFade?: boolean
  enableShaderEffect?: boolean
}

interface Ribbon {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  thickness: number
  colorIndex: number
  points: { x: number; y: number; age: number }[]
}

export default function Ribbons({
  baseThickness = 30,
  colors = ['#667eea', '#764ba2', '#f093fb'],
  speedMultiplier = 0.5,
  maxAge = 500,
  enableFade = true,
  enableShaderEffect = true,
}: RibbonsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ribbonsRef = useRef<Ribbon[]>([])
  const animationFrameRef = useRef<number>()
  const lastFrameTime = useRef<number>(0)
  const frameInterval = 1000 / 30 // 30 FPS instead of 60 for performance

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let isMouseMoving = false
    let mouseTimeout: NodeJS.Timeout

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    const createRibbon = (x: number, y: number): Ribbon => {
      const angle = Math.random() * Math.PI * 2
      const speed = (Math.random() * 2 + 1) * speedMultiplier
      
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        thickness: baseThickness * (Math.random() * 0.5 + 0.75),
        colorIndex: Math.floor(Math.random() * colors.length),
        points: [{ x, y, age: 0 }],
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      isMouseMoving = true

      clearTimeout(mouseTimeout)
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false
      }, 100)

      // Create new ribbons on mouse move (heavily optimized)
      if (ribbonsRef.current.length < 5 && Math.random() < 0.08) {
        ribbonsRef.current.push(createRibbon(mouseX, mouseY))
      }
    }

    const updateRibbon = (ribbon: Ribbon) => {
      // Update position
      ribbon.x += ribbon.vx
      ribbon.y += ribbon.vy

      // Add slight curve
      ribbon.vx += (Math.random() - 0.5) * 0.2
      ribbon.vy += (Math.random() - 0.5) * 0.2

      // Limit velocity
      const speed = Math.sqrt(ribbon.vx * ribbon.vx + ribbon.vy * ribbon.vy)
      if (speed > 5 * speedMultiplier) {
        ribbon.vx = (ribbon.vx / speed) * 5 * speedMultiplier
        ribbon.vy = (ribbon.vy / speed) * 5 * speedMultiplier
      }

      ribbon.age++

      // Add new point
      ribbon.points.push({
        x: ribbon.x,
        y: ribbon.y,
        age: ribbon.age,
      })

      // Remove old points (heavily optimized)
      if (ribbon.points.length > 20) {
        ribbon.points.shift()
      }
    }

    const drawRibbon = (ribbon: Ribbon) => {
      if (ribbon.points.length < 2) return

      const gradient = ctx.createLinearGradient(
        ribbon.points[0].x,
        ribbon.points[0].y,
        ribbon.points[ribbon.points.length - 1].x,
        ribbon.points[ribbon.points.length - 1].y
      )

      const baseColor = colors[ribbon.colorIndex]
      
      if (enableShaderEffect) {
        gradient.addColorStop(0, baseColor + '00')
        gradient.addColorStop(0.5, baseColor + (enableFade ? 'AA' : 'FF'))
        gradient.addColorStop(1, baseColor + '00')
      } else {
        gradient.addColorStop(0, baseColor + (enableFade ? '88' : 'FF'))
        gradient.addColorStop(1, baseColor + '00')
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = ribbon.thickness * (1 - ribbon.age / maxAge)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(ribbon.points[0].x, ribbon.points[0].y)

      for (let i = 1; i < ribbon.points.length; i++) {
        const point = ribbon.points[i]
        ctx.lineTo(point.x, point.y)
      }

      ctx.stroke()

      // Glow effect disabled for performance
    }

    const animate = (currentTime: number) => {
      // Throttle to 30 FPS for better performance
      if (currentTime - lastFrameTime.current < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime.current = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw ribbons (limit processing)
      ribbonsRef.current = ribbonsRef.current.filter((ribbon) => {
        updateRibbon(ribbon)
        drawRibbon(ribbon)
        return ribbon.age < maxAge
      })

      // Ambient ribbons completely disabled for performance

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Throttle mouse events for performance
    let mouseMoveTimeout: NodeJS.Timeout
    const throttledMouseMove = (e: MouseEvent) => {
      if (mouseMoveTimeout) return
      mouseMoveTimeout = setTimeout(() => {
        handleMouseMove(e)
        mouseMoveTimeout = null as any
      }, 50) // Only handle mouse every 50ms
    }

    window.addEventListener('mousemove', throttledMouseMove)
    window.addEventListener('resize', resizeCanvas)
    
    animate(0)

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove)
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      clearTimeout(mouseTimeout)
      if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout)
    }
  }, [baseThickness, colors, speedMultiplier, maxAge, enableFade, enableShaderEffect])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }} // Reduced opacity for subtle effect
    />
  )
}

