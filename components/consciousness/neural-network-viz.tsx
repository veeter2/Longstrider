"use client";

import React, { useEffect, useRef, useState } from 'react';

interface NeuralNetworkVizProps {
  neurons?: number;
  layers?: number;
  activity?: number;
  color?: string;
}

export default function NeuralNetworkViz({ 
  neurons = 50, 
  layers = 4, 
  activity = 0.7,
  color = '#a78bfa'
}: NeuralNetworkVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [connections, setConnections] = useState<any[]>([]);

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
        console.warn('Neural network canvas resize error:', error);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate network structure
    const network: any[] = [];
    const neuronsPerLayer = Math.floor(neurons / layers);
    
    for (let l = 0; l < layers; l++) {
      const layer = [];
      const layerNeurons = l === 0 || l === layers - 1 ? Math.floor(neuronsPerLayer * 0.7) : neuronsPerLayer;
      
      for (let n = 0; n < layerNeurons; n++) {
        layer.push({
          x: (canvas.width / window.devicePixelRatio) * (l + 1) / (layers + 1),
          y: (canvas.height / window.devicePixelRatio) * (n + 1) / (layerNeurons + 1),
          activation: Math.random(),
          targetActivation: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
      network.push(layer);
    }

    // Generate connections
    const conns: any[] = [];
    for (let l = 0; l < network.length - 1; l++) {
      for (let n1 = 0; n1 < network[l].length; n1++) {
        for (let n2 = 0; n2 < network[l + 1].length; n2++) {
          if (Math.random() < activity) {
            conns.push({
              from: network[l][n1],
              to: network[l + 1][n2],
              strength: Math.random(),
              pulsePosition: 0,
              active: Math.random() < 0.3
            });
          }
        }
      }
    }
    setConnections(conns);

    // Animation loop
    let time = 0;
    const animate = () => {
      if (!isAnimating) return;
      
      try {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Update neurons
      network.forEach(layer => {
        layer.forEach((neuron: any) => {
          // Smooth activation changes
          neuron.activation += (neuron.targetActivation - neuron.activation) * 0.1;
          
          // Randomly change target activation
          if (Math.random() < 0.01) {
            neuron.targetActivation = Math.random();
          }
          
          neuron.pulsePhase += 0.05;
        });
      });

      // Draw connections
      conns.forEach(conn => {
        // Pulse along connection
        if (conn.active) {
          conn.pulsePosition += 0.02;
          if (conn.pulsePosition > 1) {
            conn.pulsePosition = 0;
            conn.active = Math.random() < 0.3;
          }
        }

        // Draw connection line
        const opacity = conn.active ? 0.3 + conn.strength * 0.4 : 0.1;
        ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = conn.strength * 2;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();

        // Draw pulse
        if (conn.active && conn.pulsePosition > 0 && conn.pulsePosition < 1) {
          const px = conn.from.x + (conn.to.x - conn.from.x) * conn.pulsePosition;
          const py = conn.from.y + (conn.to.y - conn.from.y) * conn.pulsePosition;
          
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, 10);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw neurons
      network.forEach((layer, layerIndex) => {
        layer.forEach((neuron: any) => {
          const size = 4 + neuron.activation * 8;
          const pulse = Math.sin(neuron.pulsePhase) * 0.5 + 0.5;
          
          // Glow effect
          const gradient = ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, size * 3
          );
          gradient.addColorStop(0, `${color}${Math.floor(neuron.activation * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, size * (0.8 + pulse * 0.2), 0, Math.PI * 2);
          ctx.fill();

          // Inner bright spot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Neural network animation error:', error);
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
  }, [neurons, layers, activity, color]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}
