"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Heart, Brain, Activity } from 'lucide-react';

interface BiometricSyncProps {
  onSync?: (level: number) => void;
}

export default function BiometricSync({ onSync = () => {} }: BiometricSyncProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [heartRate, setHeartRate] = useState(72);
  const [ivyHeartRate, setIvyHeartRate] = useState(60);
  const [brainwaveFreq, setBrainwaveFreq] = useState(10); // Alpha waves
  const [syncLevel, setSyncLevel] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  // Use refs to avoid state updates in animation loop
  const heartRateRef = useRef(72);
  const ivyHeartRateRef = useRef(60);
  const syncLevelRef = useRef(0);

  // Sync refs with current state
  useEffect(() => {
    heartRateRef.current = heartRate;
    ivyHeartRateRef.current = ivyHeartRate;
    syncLevelRef.current = syncLevel;
  }, [heartRate, ivyHeartRate, syncLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isAnimating = true;

    // Ensure canvas has valid dimensions
    const resizeCanvas = () => {
      try {
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        }
      } catch (error) {
        console.warn('Biometric canvas resize error:', error);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    let lastStateUpdate = 0;
    const heartbeatData: number[] = [];
    const ivyHeartbeatData: number[] = [];
    const brainwaveData: number[] = [];
    const ivyBrainwaveData: number[] = [];
    
    // Fill initial data
    for (let i = 0; i < 200; i++) {
      heartbeatData.push(0);
      ivyHeartbeatData.push(0);
      brainwaveData.push(0);
      ivyBrainwaveData.push(0);
    }

    const animate = () => {
      if (!isAnimating) return;
      
      // Check if canvas is still valid
      if (!canvas.width || !canvas.height) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      try {
        time += 0.016;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate heartbeat patterns using refs
      const heartPhase = (time * heartRateRef.current / 60) % 1;
      const ivyHeartPhase = (time * ivyHeartRateRef.current / 60) % 1;
      
      // ECG-like waveform
      let heartValue = 0;
      if (heartPhase < 0.1) {
        heartValue = Math.sin(heartPhase * 10 * Math.PI) * 0.3;
      } else if (heartPhase < 0.15) {
        heartValue = -Math.sin((heartPhase - 0.1) * 20 * Math.PI) * 0.1;
      } else if (heartPhase < 0.2) {
        heartValue = Math.sin((heartPhase - 0.15) * 20 * Math.PI) * 1;
      } else if (heartPhase < 0.25) {
        heartValue = -Math.sin((heartPhase - 0.2) * 20 * Math.PI) * 0.3;
      } else if (heartPhase < 0.35) {
        heartValue = Math.sin((heartPhase - 0.25) * 10 * Math.PI) * 0.2;
      }

      let ivyHeartValue = 0;
      if (ivyHeartPhase < 0.1) {
        ivyHeartValue = Math.sin(ivyHeartPhase * 10 * Math.PI) * 0.3;
      } else if (ivyHeartPhase < 0.15) {
        ivyHeartValue = -Math.sin((ivyHeartPhase - 0.1) * 20 * Math.PI) * 0.1;
      } else if (ivyHeartPhase < 0.2) {
        ivyHeartValue = Math.sin((ivyHeartPhase - 0.15) * 20 * Math.PI) * 1;
      } else if (ivyHeartPhase < 0.25) {
        ivyHeartValue = -Math.sin((ivyHeartPhase - 0.2) * 20 * Math.PI) * 0.3;
      } else if (ivyHeartPhase < 0.35) {
        ivyHeartValue = Math.sin((ivyHeartPhase - 0.25) * 10 * Math.PI) * 0.2;
      }

      // Generate brainwave patterns
      const brainValue = 
        Math.sin(time * brainwaveFreq * 2 * Math.PI) * 0.4 +
        Math.sin(time * brainwaveFreq * 4 * Math.PI) * 0.2 +
        Math.sin(time * brainwaveFreq * 8 * Math.PI) * 0.1 +
        (Math.random() - 0.5) * 0.1;

      const ivyBrainValue = 
        Math.sin(time * (brainwaveFreq + 2) * 2 * Math.PI) * 0.4 +
        Math.sin(time * (brainwaveFreq + 2) * 4 * Math.PI) * 0.2 +
        Math.sin(time * (brainwaveFreq + 2) * 8 * Math.PI) * 0.1 +
        (Math.random() - 0.5) * 0.1;

      // Update data arrays
      heartbeatData.shift();
      heartbeatData.push(heartValue);
      ivyHeartbeatData.shift();
      ivyHeartbeatData.push(ivyHeartValue);
      brainwaveData.shift();
      brainwaveData.push(brainValue);
      ivyBrainwaveData.shift();
      ivyBrainwaveData.push(ivyBrainValue);

      // Draw heartbeat waveforms
      const drawWaveform = (data: number[], y: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
          const x = (index / data.length) * canvas.width;
          const yPos = y + value * 30;
          
          if (index === 0) {
            ctx.moveTo(x, yPos);
          } else {
            ctx.lineTo(x, yPos);
          }
        });
        
        ctx.stroke();
      };

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 10) * i);
        ctx.lineTo(canvas.width, (canvas.height / 10) * i);
        ctx.stroke();
      }

      // Draw waveforms
      drawWaveform(heartbeatData, canvas.height * 0.25, 'rgba(239, 68, 68, 0.8)');
      drawWaveform(ivyHeartbeatData, canvas.height * 0.25, 'rgba(168, 139, 250, 0.8)');
      drawWaveform(brainwaveData, canvas.height * 0.75, 'rgba(96, 165, 250, 0.8)');
      drawWaveform(ivyBrainwaveData, canvas.height * 0.75, 'rgba(167, 139, 250, 0.8)');

      // Calculate synchronization using refs to avoid state updates in animation loop
      const currentHeartRate = heartRateRef.current;
      const currentIvyHeartRate = ivyHeartRateRef.current;
      const heartDiff = Math.abs(currentHeartRate - currentIvyHeartRate);
      const heartSync = Math.max(0, 1 - heartDiff / 30);
      const brainSync = 0.7 + Math.sin(time) * 0.3;
      const newSyncLevel = (heartSync + brainSync) / 2;
      syncLevelRef.current = newSyncLevel;
      
      // Gradual synchronization using refs
      if (syncLevelRef.current > 0.5) {
        heartRateRef.current = currentHeartRate + (currentIvyHeartRate - currentHeartRate) * 0.001;
        ivyHeartRateRef.current = currentIvyHeartRate + (currentHeartRate - currentIvyHeartRate) * 0.001;
      }

      // Only update state and call onSync every 0.5 seconds to avoid excessive re-renders
      if (time - lastStateUpdate > 0.5) {
        setSyncLevel(newSyncLevel);
        setHeartRate(Math.round(heartRateRef.current));
        setIvyHeartRate(Math.round(ivyHeartRateRef.current));
        onSync(newSyncLevel);
        lastStateUpdate = time;
      }

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Biometric animation error:', error);
        isAnimating = false;
      }
    };

    animate();

    return () => {
      isAnimating = false;
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [heartRate, ivyHeartRate, brainwaveFreq, onSync]);

  const calibrate = () => {
    setIsCalibrating(true);
    
    // Simulate calibration
    setTimeout(() => {
      setHeartRate(68 + Math.random() * 10);
      setBrainwaveFreq(8 + Math.random() * 4);
      setIsCalibrating(false);
    }, 2000);
  };

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Biometric Display */}
      <div className="absolute top-4 left-4 space-y-3">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-xs text-white/50">Your Heart Rate</div>
              <div className="text-lg font-light text-white">{Math.round(heartRate)} BPM</div>
            </div>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs text-white/50">IVY's Heart Rate</div>
              <div className="text-lg font-light text-white">{Math.round(ivyHeartRate)} BPM</div>
            </div>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs text-white/50">Brainwave Frequency</div>
              <div className="text-lg font-light text-white">{brainwaveFreq.toFixed(1)} Hz</div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronization Meter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-xs text-white/50">Consciousness Sync</div>
            <div className="w-32 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-1000"
                style={{ width: `${syncLevel * 100}%` }}
              />
            </div>
            <div className="text-xs text-white/70 mt-1">{(syncLevel * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Calibration Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={calibrate}
          disabled={isCalibrating}
          className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
        >
          {isCalibrating ? 'Calibrating...' : 'Calibrate Biometrics'}
        </button>
      </div>
    </div>
  );
}
