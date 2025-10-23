"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

// Brainwave frequencies - consciousness awakening
const brainWaves = [
  { name: "δ", freq: "0.5–4 Hz", label: "Deep Sleep", color: "#1e40af", opacity: 0.15, scale: 1.0, speed: 0.8 },
  { name: "θ", freq: "4–8 Hz", label: "Meditation", color: "#7c3aed", opacity: 0.12, scale: 1.2, speed: 1.2 },
  { name: "α", freq: "8–13 Hz", label: "Relaxed", color: "#0891b2", opacity: 0.18, scale: 1.4, speed: 1.6 },
  { name: "β", freq: "13–30 Hz", label: "Active", color: "#db2777", opacity: 0.1, scale: 1.6, speed: 2.2 },
  { name: "γ", freq: "30–100 Hz", label: "Peak Focus", color: "#f0abfc", opacity: 0.08, scale: 1.8, speed: 3.0 },
]

export default function HomePage() {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [oscillation, setOscillation] = useState(0)
  const router = useRouter()

  // Gentle awakening animation (3 seconds)
  useEffect(() => {
    const startTime = Date.now()
    const duration = 3000 // 3 seconds to full awakening

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const newProgress = Math.min(1, elapsed / duration)
      setProgress(newProgress)

      // Calculate oscillation for wave animations - increased frequency for more visible movement
      const osc = Math.sin(now * 0.002) * 8
      setOscillation(osc)

      if (newProgress >= 1) {
        setIsReady(true)
      }

      // Continue animation loop even after ready for ongoing oscillation
      requestAnimationFrame(animate)
    }

    const frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleEnter = () => {
    // Always go to onboarding for testing (removed profile check)
    router.push("/onboarding")
  }

  // Smooth easing
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easedProgress = easeOutCubic(progress)

  return (
    <div
      className="relative flex items-center justify-center h-screen bg-black overflow-hidden cursor-pointer"
      onClick={handleEnter}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black" />

      {/* Brainwave frequency rings */}
      <div className="relative w-full h-full flex items-center justify-center">
        {brainWaves.map((wave, index) => {
          const waveProgress = Math.max(0, Math.min(1, easedProgress * 1.3 - index * 0.15))
          const baseSize = 200 + index * 120

          return (
            <motion.div
              key={wave.name}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: baseSize * wave.scale,
                height: baseSize * wave.scale,
                background: `radial-gradient(circle at 35% 35%, ${wave.color}40, ${wave.color}10)`,
                backdropFilter: "blur(2px)",
                border: `1px solid ${wave.color}15`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: waveProgress > 0 ? [
                  waveProgress * 0.98,
                  waveProgress * 1.02,
                  waveProgress * 0.98
                ] : 0,
                opacity: waveProgress > 0 ? [
                  waveProgress * wave.opacity * 0.8,
                  waveProgress * wave.opacity * 1.2,
                  waveProgress * wave.opacity * 0.8
                ] : 0,
                boxShadow: waveProgress > 0 ? [
                  `0 0 40px ${wave.color}40, inset 0 0 20px ${wave.color}20`,
                  `0 0 70px ${wave.color}60, inset 0 0 40px ${wave.color}30`,
                  `0 0 40px ${wave.color}40, inset 0 0 20px ${wave.color}20`,
                ] : `0 0 0px ${wave.color}00`,
                y: [0, oscillation * 0.5, 0],
              }}
              transition={{
                scale: {
                  duration: 3 + index * 0.5,
                  delay: index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 3 + index * 0.5,
                  delay: index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                boxShadow: {
                  duration: 3 + index * 0.5,
                  delay: index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          )
        })}

        {/* Central consciousness core */}
        <motion.div
          className="absolute w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 40%, transparent 70%)",
            backdropFilter: "blur(20px)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={easedProgress > 0.5 ? {
            scale: [0.95, 1.08, 0.95],
            opacity: [0.7, 0.9, 0.7],
            boxShadow: [
              "0 0 50px rgba(255,255,255,0.25), 0 0 25px rgba(255,255,255,0.15), inset 0 0 15px rgba(255,255,255,0.1)",
              "0 0 80px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.25), inset 0 0 30px rgba(255,255,255,0.2)",
              "0 0 50px rgba(255,255,255,0.25), 0 0 25px rgba(255,255,255,0.15), inset 0 0 15px rgba(255,255,255,0.1)",
            ],
          } : {
            scale: 0.3 + easedProgress * 0.7,
            opacity: 0.5 + easedProgress * 0.3,
          }}
          transition={easedProgress > 0.5 ? {
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          } : {
            duration: 2,
            ease: [0.16, 1, 0.3, 1]
          }}
        />

        {/* Chromatic aberration effect */}
        <div
          className="absolute w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)",
            opacity: easedProgress * 0.5,
            transform: `translate(-3px, -3px)`,
          }}
        />
        <div
          className="absolute w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)",
            opacity: easedProgress * 0.5,
            transform: `translate(3px, 3px)`,
          }}
        />

        {/* Orbiting particles - one for each brainwave */}
        {isReady && [
          { color: brainWaves[0].color, radius: 150, duration: 10, delay: 0, size: 10, clockwise: true, startAngle: 0 },
          { color: brainWaves[1].color, radius: 180, duration: 14, delay: 0.5, size: 11, clockwise: false, startAngle: 72 },
          { color: brainWaves[2].color, radius: 210, duration: 18, delay: 1, size: 12, clockwise: true, startAngle: 144 },
          { color: brainWaves[3].color, radius: 240, duration: 22, delay: 1.5, size: 11, clockwise: false, startAngle: 216 },
          { color: brainWaves[4].color, radius: 270, duration: 26, delay: 2, size: 10, clockwise: true, startAngle: 288 },
        ].map((orb, i) => {
          const direction = orb.clockwise ? 1 : -1
          const angleInRad = (orb.startAngle * Math.PI) / 180

          // Generate circular path coordinates
          const numPoints = 360
          const xPath = Array.from({ length: numPoints + 1 }, (_, i) => {
            const angle = (i / numPoints) * Math.PI * 2 * direction + angleInRad
            return Math.cos(angle) * orb.radius
          })
          const yPath = Array.from({ length: numPoints + 1 }, (_, i) => {
            const angle = (i / numPoints) * Math.PI * 2 * direction + angleInRad
            return Math.sin(angle) * orb.radius
          })

          return (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color}80, ${orb.color}20)`,
                boxShadow: `0 0 20px ${orb.color}60, inset 0 0 8px ${orb.color}40`,
                filter: "blur(1px)",
              }}
              initial={{ opacity: 0, x: xPath[0], y: yPath[0] }}
              animate={{
                opacity: [0, 0.5, 0.5],
                x: xPath,
                y: yPath,
              }}
              transition={{
                opacity: { duration: 1, delay: orb.delay },
                x: {
                  duration: orb.duration,
                  delay: orb.delay,
                  repeat: Infinity,
                  ease: "linear",
                },
                y: {
                  duration: orb.duration,
                  delay: orb.delay,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          )
        })}
      </div>

      {/* Title - appears after awakening */}
      <motion.div
        className="absolute top-[20%] text-center pointer-events-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: easedProgress > 0.5 ? 1 : 0,
          y: easedProgress > 0.5 ? 0 : 30
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-7xl md:text-9xl font-light tracking-tight text-white mb-4 [text-shadow:0_0_40px_rgba(255,255,255,0.3)]">
          LongStrider
        </h1>
        <p className="text-white/50 text-sm md:text-lg tracking-[0.3em] uppercase font-light">
          Living Memory
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: easedProgress, opacity: 0.6 }}
        transition={{ duration: 0.5 }}
      />

      {/* Frequency labels - subtle detail */}
      {isReady && (
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-8 text-xs text-white/20 font-light tracking-wider pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {brainWaves.map((wave, i) => (
            <motion.span
              key={i}
              style={{ color: wave.color }}
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: [0.7, 0.95, 0.7],
                textShadow: [
                  `0 0 8px ${wave.color}60`,
                  `0 0 16px ${wave.color}80`,
                  `0 0 8px ${wave.color}60`,
                ],
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {wave.name}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Call to action - appears when ready */}
      {isReady && (
        <motion.div
          className="absolute bottom-8 text-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-white/50 text-xs tracking-[0.4em] uppercase font-light">
            Enter
          </p>
        </motion.div>
      )}
    </div>
  )
}



