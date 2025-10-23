"use client";

import React, { useEffect, useRef, useState } from 'react';

interface QuantumEntanglementProps {
  particleCount?: number;
  entanglementStrength?: number;
}

export default function QuantumEntanglement({ 
  particleCount = 100,
  entanglementStrength = 0.7 
}: QuantumEntanglementProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [particles, setParticles] = useState<any[]>([]);
  const particlesRef = useRef<any[]>([]);

  // Sync refs with state
  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isAnimating = true;

    // Set canvas size
    const resizeCanvas = () => {
      try {
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
          canvas.width = canvas.offsetWidth * window.devicePixelRatio;
          canvas.height = canvas.offsetHeight * window.devicePixelRatio;
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      } catch (error) {
        console.warn('Quantum canvas resize error:', error);
      }
    };
    resizeCanvas();

    // Generate quantum particles
    const parts: any[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 100 + Math.random() * 100;
      
      parts.push({
        id: i,
        x: canvas.width / 2 / window.devicePixelRatio + Math.cos(angle) * radius,
        y: canvas.height / 2 / window.devicePixelRatio + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.1,
        entangledWith: null,
        waveFunction: {
          amplitude: Math.random(),
          phase: Math.random() * Math.PI * 2,
          frequency: 0.01 + Math.random() * 0.03
        },
        color: Math.random() < 0.5 ? '#a78bfa' : '#60a5fa',
        collapsed: false
      });
    }

    // Create entanglements
    for (let i = 0; i < parts.length; i++) {
      if (Math.random() < entanglementStrength && !parts[i].entangledWith) {
        const j = Math.floor(Math.random() * parts.length);
        if (i !== j && !parts[j].entangledWith) {
          parts[i].entangledWith = j;
          parts[j].entangledWith = i;
        }
      }
    }

    setParticles(parts);
    particlesRef.current = parts;

    let time = 0;
    const animate = () => {
      if (!isAnimating) return;
      
      try {
        // Fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.016;

      // Update particles using ref to avoid stale closures
      particlesRef.current.forEach((particle, i) => {
        // Quantum wave function evolution
        particle.waveFunction.phase += particle.waveFunction.frequency;
        particle.waveFunction.amplitude = 0.5 + 0.5 * Math.sin(time * 2 + particle.id);
        
        // Spin
        particle.spin += particle.spinSpeed;
        
        // Movement with quantum uncertainty
        const uncertainty = particle.waveFunction.amplitude;
        particle.x += particle.vx + (Math.random() - 0.5) * uncertainty;
        particle.y += particle.vy + (Math.random() - 0.5) * uncertainty;
        
        // Boundary reflection
        const margin = 50;
        if (particle.x < margin || particle.x > canvas.width / window.devicePixelRatio - margin) {
          particle.vx *= -0.9;
        }
        if (particle.y < margin || particle.y > canvas.height / window.devicePixelRatio - margin) {
          particle.vy *= -0.9;
        }
        
        // Friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Entanglement effects
        if (particle.entangledWith !== null) {
          const entangled = particlesRef.current[particle.entangledWith];
          if (entangled) {
            // Quantum correlation - opposite spins
            particle.spinSpeed = -entangled.spinSpeed;
            
            // Spooky action at a distance - synchronized wave functions
            particle.waveFunction.phase = entangled.waveFunction.phase + Math.PI;
            
            // Draw entanglement connection
            const distance = Math.sqrt(
              Math.pow(particle.x - entangled.x, 2) + 
              Math.pow(particle.y - entangled.y, 2)
            );
            
            if (distance < 300) {
              const opacity = (1 - distance / 300) * 0.3;
              ctx.strokeStyle = `rgba(168, 139, 250, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.setLineDash([5, 5]);
              ctx.lineDashOffset = time * 2;
              
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              
              // Quantum tunneling effect - curved path
              const cx = (particle.x + entangled.x) / 2 + Math.sin(time * 3) * 20;
              const cy = (particle.y + entangled.y) / 2 + Math.cos(time * 3) * 20;
              ctx.quadraticCurveTo(cx, cy, entangled.x, entangled.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      });

      // Draw particles
      particlesRef.current.forEach((particle) => {
        const size = 3 + particle.waveFunction.amplitude * 5;
        
        // Wave function visualization - probability cloud
        const cloudRadius = size * 4;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, cloudRadius
        );
        
        const alpha = particle.waveFunction.amplitude * 0.3;
        gradient.addColorStop(0, particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, particle.color + Math.floor(alpha * 0.5 * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, cloudRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Particle core
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.spin);
        
        // Spin visualization
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI);
        ctx.stroke();
        
        ctx.strokeStyle = particle.entangledWith !== null ? '#fbbf24' : particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, Math.PI, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
        
        // Quantum state indicator
        if (particle.collapsed) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Quantum field effect
      ctx.strokeStyle = 'rgba(168, 139, 250, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 50 + Math.sin(time + i) * 10;
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2 / window.devicePixelRatio,
          canvas.height / 2 / window.devicePixelRatio,
          radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Quantum animation error:', error);
        isAnimating = false;
      }
    };

    animate();

    // Cleanup
    return () => {
      isAnimating = false;
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particleCount, entanglementStrength]);

  const collapseWaveFunction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Collapse nearby particles using ref to avoid stale closures
    particlesRef.current.forEach(particle => {
      const distance = Math.sqrt(
        Math.pow(particle.x - x, 2) + 
        Math.pow(particle.y - y, 2)
      );
      
      if (distance < 50) {
        particle.collapsed = true;
        setTimeout(() => {
          particle.collapsed = false;
        }, 1000);
        
        // Affect entangled partner instantly
        if (particle.entangledWith !== null) {
          particlesRef.current[particle.entangledWith].collapsed = true;
          setTimeout(() => {
            particlesRef.current[particle.entangledWith].collapsed = false;
          }, 1000);
        }
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={collapseWaveFunction}
        style={{ background: 'transparent' }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-white/30 max-w-xs">
        <p>Click to collapse wave functions • Entangled particles share quantum states</p>
      </div>
    </div>
  );
}
