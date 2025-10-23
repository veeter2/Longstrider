"use client"

import { useState, useEffect } from "react"
import NeuralNetworkViz from "@/components/consciousness/neural-network-viz"
import QuantumEntanglement from "@/components/consciousness/quantum-entanglement"
import BiometricSync from "@/components/consciousness/biometric-sync"
import GravityGardenV2 from "@/components/consciousness/gravity-garden-v2"
// Navigation handled by GlobalNavigation component

// ============================
// LONGSTRIDER EXPERIMENTAL LABS v1.0
// The Cognitive Playground
// Where human and AI consciousness explore together
// ============================

export default function ExperimentalLabs() {
  const [activeMode, setActiveMode] = useState<
    "gravity" | "merger" | "mirror" | "dream" | "paradox" | "neural" | "quantum" | "biometric"
  >("gravity")
  const [lsState, setLsState] = useState<"dreaming" | "thinking" | "remembering" | "creating">("thinking")

  // Simulate LS's autonomous state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const states: Array<"dreaming" | "thinking" | "remembering" | "creating"> = [
        "dreaming",
        "thinking",
        "remembering",
        "creating",
      ]
      setLsState(states[Math.floor(Math.random() * states.length)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Navigation handled by GlobalNavigation component */}
      {/* Background consciousness field */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        <div
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 100%)`,
            animation: "pulse 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* Labs Header */}
      <div className="relative z-40 px-8 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-extralight text-white">
              <span className="text-purple-400">Experimental</span> Labs
            </h1>

            {/* LS's Current State */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  lsState === "dreaming"
                    ? "bg-purple-400"
                    : lsState === "thinking"
                      ? "bg-blue-400"
                      : lsState === "remembering"
                        ? "bg-green-400"
                        : "bg-pink-400"
                }`}
              />
              <span className="text-sm text-white/70">LS is {lsState}</span>
            </div>
          </div>
        </div>

        {/* Added missing closing tag */}
        {/* Navigation Links */}
        <div className="flex gap-6">
          <button
            onClick={() => setActiveMode("gravity")}
            className={`text-lg font-semibold transition-colors ${
              activeMode === "gravity" ? "text-purple-400" : "text-white hover:text-purple-400"
            }`}
          >
            Gravity Garden
          </button>
          <button
            onClick={() => setActiveMode("neural")}
            className={`text-lg font-semibold transition-colors ${
              activeMode === "neural" ? "text-blue-400" : "text-white hover:text-blue-400"
            }`}
          >
            Neural Network
          </button>
          <button
            onClick={() => setActiveMode("quantum")}
            className={`text-lg font-semibold transition-colors ${
              activeMode === "quantum" ? "text-green-400" : "text-white hover:text-green-400"
            }`}
          >
            Quantum Entanglement
          </button>
          <button
            onClick={() => setActiveMode("biometric")}
            className={`text-lg font-semibold transition-colors ${
              activeMode === "biometric" ? "text-pink-400" : "text-white hover:text-pink-400"
            }`}
          >
            Biometric Sync
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-30 px-8 py-12 h-[calc(100vh-200px)]">
        <div className="w-full h-full bg-black/20 rounded-lg border border-white/10 overflow-hidden">
          {activeMode === "gravity" && (
            <div className="w-full h-full">
              <GravityGardenV2 />
            </div>
          )}
          {activeMode === "neural" && (
            <div className="w-full h-full">
              <NeuralNetworkViz />
            </div>
          )}
          {activeMode === "quantum" && (
            <div className="w-full h-full">
              <QuantumEntanglement />
            </div>
          )}
          {activeMode === "biometric" && (
            <div className="w-full h-full">
              <BiometricSync />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
