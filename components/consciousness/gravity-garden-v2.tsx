"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Brain, Code, Database, GitBranch, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface MemoryNode {
  id: string;
  title: string;
  type: 'project' | 'idea' | 'memory' | 'conversation' | 'milestone';
  gravity: number; // 0-1, based on time invested, importance, frequency
  timeInvested: number; // hours
  aiContribution: number; // percentage
  lastAccessed: Date;
  created: Date;
  children?: MemoryNode[];
  branches?: {
    name: string;
    progress: number;
    issues?: string[];
  }[];
  patterns?: string[];
  connections: string[]; // IDs of related nodes
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  expanded?: boolean;
}

// Mock data structure for IVY project
const generateMemoryGraph = (): MemoryNode[] => {
  return [
    {
      id: 'ivy-main',
      title: 'Building IVY',
      type: 'project',
      gravity: 1.0, // Maximum gravity - 8 months of work
      timeInvested: 1920, // 8 months * 30 days * 8 hours
      aiContribution: 65,
      lastAccessed: new Date('2024-09-05'),
      created: new Date('2024-01-01'),
      branches: [
        { name: 'Frontend Development', progress: 85, issues: ['Performance optimization needed'] },
        { name: 'Backend Architecture', progress: 75 },
        { name: 'Database Design', progress: 90 },
        { name: 'AI Integration', progress: 70, issues: ['Context window limitations', 'Response latency'] },
        { name: 'Testing & QA', progress: 60, issues: ['More unit tests needed'] }
      ],
      patterns: ['Iterative refinement', 'AI-assisted coding', 'User-centric design'],
      connections: ['consciousness-lab', 'ai-philosophy', 'future-vision'],
      children: [
        {
          id: 'consciousness-lab',
          title: 'Consciousness Lab',
          type: 'milestone',
          gravity: 0.7,
          timeInvested: 120,
          aiContribution: 80,
          lastAccessed: new Date('2024-09-05'),
          created: new Date('2024-08-01'),
          patterns: ['Experimental UI', 'Metaphorical interfaces'],
          connections: ['ivy-main']
        }
      ]
    },
    {
      id: 'daily-gpt',
      title: 'Daily GPT Interactions',
      type: 'conversation',
      gravity: 0.2, // Low gravity - scattered, unfocused
      timeInvested: 50,
      aiContribution: 100,
      lastAccessed: new Date('2024-09-05'),
      created: new Date('2024-06-01'),
      patterns: ['Quick questions', 'Random topics'],
      connections: []
    },
    {
      id: 'ai-philosophy',
      title: 'AI Consciousness Philosophy',
      type: 'idea',
      gravity: 0.6,
      timeInvested: 200,
      aiContribution: 45,
      lastAccessed: new Date('2024-09-01'),
      created: new Date('2024-03-01'),
      patterns: ['Deep thinking', 'Ethical considerations'],
      connections: ['ivy-main', 'future-vision']
    },
    {
      id: 'future-vision',
      title: 'Future of Human-AI Interaction',
      type: 'idea',
      gravity: 0.5,
      timeInvested: 80,
      aiContribution: 55,
      lastAccessed: new Date('2024-08-15'),
      created: new Date('2024-04-01'),
      connections: ['ivy-main', 'ai-philosophy']
    }
  ];
};

// This should connect to real memory data - for now using mock
interface GravityGardenProps {
  memories?: MemoryNode[];
  onLoadMore?: () => void;
}

export default function GravityGardenV2({ memories, onLoadMore }: GravityGardenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const nodesRef = useRef<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [expandedNode, setExpandedNode] = useState<MemoryNode | null>(null);
  const [viewMode, setViewMode] = useState<'gravity' | 'timeline' | 'connections'>('gravity');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Use stable initial positions
  const initialNodes = useMemo(() => {
    const memoryNodes = memories || generateMemoryGraph();
    
    // Initialize positions based on gravity with better spacing
    memoryNodes.forEach((node, i) => {
      const angle = (i / memoryNodes.length) * Math.PI * 2;
      const distance = 150 + (1 - node.gravity) * 250; // Better spacing
      node.x = Math.cos(angle) * distance;
      node.y = Math.sin(angle) * distance;
      node.vx = 0;
      node.vy = 0;
    });
    
    return memoryNodes;
  }, [memories]);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Sync refs with state
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isAnimating = true;

    const resizeCanvas = () => {
      try {
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        }
      } catch (error) {
        console.warn('Canvas resize error:', error);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationTime = 0;
    const animate = () => {
      if (!isAnimating) return;
      
      try {
        animationTime += 0.016; // Fixed time increment instead of Date.now()
        
        // Clear with full opacity for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX + offset.x, centerY + offset.y);
      ctx.scale(zoom, zoom);

      // Update physics using ref to avoid stale closures
      nodesRef.current.forEach((node, i) => {
        // Apply gravity between nodes based on their connections and weight
        nodesRef.current.forEach((other, j) => {
          if (i !== j) {
            const dx = (other.x || 0) - (node.x || 0);
            const dy = (other.y || 0) - (node.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 20 && dist < 400) {
              // Connection strength affects attraction
              const isConnected = node.connections.includes(other.id) || other.connections.includes(node.id);
              const force = isConnected ? 
                (other.gravity * node.gravity * 50) / (dist * dist) :
                (other.gravity * node.gravity * 10) / (dist * dist);
              
              node.vx = (node.vx || 0) + dx * force * 0.01;
              node.vy = (node.vy || 0) + dy * force * 0.01;
            }
          }
        });

        // Central gravity well - pull everything slightly toward center
        const centerDx = -(node.x || 0);
        const centerDy = -(node.y || 0);
        const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy);
        if (centerDist > 50) {
          node.vx = (node.vx || 0) + centerDx * 0.001;
          node.vy = (node.vy || 0) + centerDy * 0.001;
        }

        // Update position
        node.x = (node.x || 0) + (node.vx || 0);
        node.y = (node.y || 0) + (node.vy || 0);
        node.vx = (node.vx || 0) * 0.98; // Friction
        node.vy = (node.vy || 0) * 0.98;
      });

      // Draw connections (now relative to origin after transformation)
      ctx.strokeStyle = 'rgba(168, 139, 250, 0.2)';
      ctx.lineWidth = 1;
      nodesRef.current.forEach(node => {
        node.connections.forEach(targetId => {
          const target = nodesRef.current.find(n => n.id === targetId);
          if (target) {
            ctx.beginPath();
            ctx.moveTo(node.x || 0, node.y || 0);
            ctx.lineTo(target.x || 0, target.y || 0);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodesRef.current.forEach(node => {
        const x = node.x || 0;
        const y = node.y || 0;
        const baseSize = 10 + node.gravity * 40;
        const pulseSize = baseSize + Math.sin(animationTime * 3 + node.gravity * Math.PI) * 3;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
        const alpha = node.gravity * 0.5;
        
        // Color based on type
        let color = '#a78bfa'; // purple default
        if (node.type === 'project') color = '#60a5fa'; // blue
        if (node.type === 'milestone') color = '#34d399'; // green
        if (node.type === 'conversation') color = '#fbbf24'; // amber
        
        gradient.addColorStop(0, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core with AI contribution indicator
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // AI contribution ring
        if (node.aiContribution > 0) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, pulseSize + 5, 0, (Math.PI * 2 * node.aiContribution) / 100);
          ctx.stroke();
        }

      });

        ctx.restore(); // Restore transformation

        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Animation error:', error);
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
  }, [nodes, zoom, offset]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Account for zoom and offset
    const x = ((e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom);
    const y = ((e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom);

    // Find clicked node using ref to avoid stale closures
    const clicked = nodesRef.current.find(node => {
      const dist = Math.sqrt(
        Math.pow((node.x || 0) - x, 2) + 
        Math.pow((node.y || 0) - y, 2)
      );
      const nodeSize = 10 + node.gravity * 40;
      return dist < nodeSize + 10;
    });

    if (clicked) {
      setSelectedNode(clicked);
      if (clicked.gravity > 0.5) { // Only expand significant nodes
        setExpandedNode(clicked);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.3, zoom + delta), 3);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && e.shiftKey) { // Shift+click to drag
      isDragging.current = true;
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />


      {/* View Mode Selector */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        <div className="flex gap-2">
          {(['gravity', 'timeline', 'connections'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === mode 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 w-96 max-h-[60vh] overflow-y-auto bg-black/80 backdrop-blur-md rounded-lg p-6 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-light text-white">{selectedNode.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                  {selectedNode.type}
                </span>
                <span className="text-xs text-white/50">
                  Gravity: {(selectedNode.gravity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/5 rounded p-3">
              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                <Calendar className="w-3 h-3" />
                Time Invested
              </div>
              <div className="text-lg text-white">{selectedNode.timeInvested}h</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                <Brain className="w-3 h-3" />
                AI Contribution
              </div>
              <div className="text-lg text-white">{selectedNode.aiContribution}%</div>
            </div>
          </div>

          {/* Branches for major projects */}
          {selectedNode.branches && selectedNode.branches.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-white/50 mb-2">Project Branches</div>
              <div className="space-y-2">
                {selectedNode.branches.map((branch, i) => (
                  <div key={i} className="bg-white/5 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/70">{branch.name}</span>
                      <span className="text-xs text-white/50">{branch.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
                        style={{ width: `${branch.progress}%` }}
                      />
                    </div>
                    {branch.issues && (
                      <div className="mt-2 space-y-1">
                        {branch.issues.map((issue, j) => (
                          <div key={j} className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {selectedNode.patterns && selectedNode.patterns.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-white/50 mb-2">Patterns Detected</div>
              <div className="flex flex-wrap gap-2">
                {selectedNode.patterns.map((pattern, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expand to explore */}
          {selectedNode.gravity > 0.5 && (
            <button className="w-full mt-4 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors">
              Expand & Explore Deeper
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div className="text-xs text-white/50 mb-2">Memory Weight</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/50" />
            <span className="text-xs text-white/70">Major Project (months of work)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500/50" />
            <span className="text-xs text-white/70">Significant Idea</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <span className="text-xs text-white/70">Daily Interaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
