"use client"

/**
 * Knowledge Importer
 * Import chat histories and conversations into LongStrider's knowledge base
 * Cognitive Band: Chi-Cyan (χ) - Creative synthesis and knowledge integration
 */

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  FolderOpen,
  MessageSquare,
  Calendar,
  Brain,
  Sparkles,
  Target,
  StopCircle,
  Pause,
  Play,
  Shield,
  User,
  Building2,
  Cpu
} from "lucide-react"

// KNOWLEDGE TIERS
type KnowledgeTier = 'personal' | 'corp-ip' | 'ls-training'

interface TierConfig {
  id: KnowledgeTier
  label: string
  icon: any
  color: string
  colorRgb: string
  description: string
  badge: string
}

const TIER_CONFIGS: Record<KnowledgeTier, TierConfig> = {
  'personal': {
    id: 'personal',
    label: 'Personal Knowledge',
    icon: User,
    color: 'var(--band-chi-cyan)',
    colorRgb: 'rgb(var(--band-chi-cyan))',
    description: 'ChatGPT exports, Claude chats, personal notes',
    badge: 'Personal'
  },
  'corp-ip': {
    id: 'corp-ip',
    label: 'Domain/Corp IP',
    icon: Building2,
    color: 'var(--band-xi)',
    colorRgb: 'rgb(var(--band-xi))',
    description: 'Business docs, proprietary data, company knowledge',
    badge: 'Corp IP'
  },
  'ls-training': {
    id: 'ls-training',
    label: 'LS Training Knowledge',
    icon: Cpu,
    color: 'var(--band-psi)',
    colorRgb: 'rgb(var(--band-psi))',
    description: 'System training data, base knowledge (stored in Cortex)',
    badge: 'LS Training'
  }
}

// SAFETY LIMITS
const MAX_FILE_SIZE_MB = 100 // 100MB max file size
const MAX_CONVERSATIONS = 10000 // 10k conversations max
const WARN_CONVERSATIONS = 1000 // Warn above 1k
const CHUNK_SIZE = 50 // Smaller chunks for safety (was 100)
const CHUNK_DELAY_MS = 200 // Longer delay between chunks

type ImportStage = 'idle' | 'parsing' | 'uploading' | 'processing' | 'paused' | 'cancelled' | 'complete'

interface ImportProgress {
  current: number
  total: number
  phase: string
}

interface ImportStats {
  patterns: number
  highGravity: number
  identityAnchors: number
}

interface ImportedFile {
  id: string
  name: string
  size: number
  tier: KnowledgeTier
  status: 'pending' | 'processing' | 'success' | 'error' | 'cancelled' | 'paused'
  stage?: ImportStage
  progress?: ImportProgress
  stats?: ImportStats
  messageCount?: number
  dateRange?: string
  errorMessage?: string
  abortController?: AbortController
  isPaused?: boolean
}

interface KnowledgeImporterProps {
  uploadedFiles?: ImportedFile[]
  onImport?: (files: File[]) => void
}

interface ConversationPreview {
  file: File
  data: any[]
  analysis: {
    totalConversations: number
    dateRange: { earliest: string, latest: string }
    format: 'chatgpt' | 'claude' | 'generic' | 'unknown'
    participants: string[]
    messageCount: number
    userMessages: number
    assistantMessages: number
    averageLength: number
    hasTimestamps: boolean
    hasTitles: boolean
    sample: any[]
  }
}

export default function KnowledgeImporter({
  uploadedFiles = [],
  onImport
}: KnowledgeImporterProps) {
  const [activeTier, setActiveTier] = useState<KnowledgeTier>('personal')
  const [files, setFiles] = useState<ImportedFile[]>(uploadedFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<{file: File, conversationCount: number} | null>(null)
  const [previewData, setPreviewData] = useState<ConversationPreview | null>(null)
  const pauseFlags = useRef<Map<string, boolean>>(new Map())

  const currentTierConfig = TIER_CONFIGS[activeTier]
  const tierFiles = files.filter(f => f.tier === activeTier)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(file => validateAndQueueFile(file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      selectedFiles.forEach(file => validateAndQueueFile(file))
    }
  }

  const analyzeConversations = (data: any[]): ConversationPreview['analysis'] => {
    let totalMessages = 0
    let userMessages = 0
    let assistantMessages = 0
    let totalLength = 0
    let earliestDate: Date | null = null
    let latestDate: Date | null = null
    let format: 'chatgpt' | 'claude' | 'generic' | 'unknown' = 'unknown'
    const participants = new Set<string>()

    // Detect format and analyze
    data.forEach(conv => {
      // ChatGPT format detection
      if (conv.mapping && typeof conv.mapping === 'object') {
        format = 'chatgpt'
        Object.values(conv.mapping).forEach((node: any) => {
          if (node?.message?.content?.parts) {
            totalMessages++
            const role = node.message.author?.role
            if (role === 'user') userMessages++
            if (role === 'assistant') assistantMessages++
            participants.add(role || 'unknown')
            totalLength += node.message.content.parts.join('').length
          }
          if (node?.message?.create_time) {
            const date = new Date(node.message.create_time * 1000)
            if (!earliestDate || date < earliestDate) earliestDate = date
            if (!latestDate || date > latestDate) latestDate = date
          }
        })
      }
      // Claude format detection
      else if (conv.chat_messages && Array.isArray(conv.chat_messages)) {
        format = 'claude'
        conv.chat_messages.forEach((msg: any) => {
          totalMessages++
          if (msg.sender === 'human') userMessages++
          if (msg.sender === 'assistant') assistantMessages++
          participants.add(msg.sender || 'unknown')
          totalLength += (msg.text || '').length
          if (msg.created_at) {
            const date = new Date(msg.created_at)
            if (!earliestDate || date < earliestDate) earliestDate = date
            if (!latestDate || date > latestDate) latestDate = date
          }
        })
      }
      // Generic message array
      else if (Array.isArray(conv)) {
        format = 'generic'
        conv.forEach((msg: any) => {
          totalMessages++
          const role = msg.role || msg.type || msg.sender
          if (role === 'user' || role === 'human') userMessages++
          if (role === 'assistant' || role === 'ai') assistantMessages++
          participants.add(role || 'unknown')
          totalLength += (msg.content || msg.text || '').length
          if (msg.timestamp || msg.created_at) {
            const date = new Date(msg.timestamp || msg.created_at)
            if (!earliestDate || date < earliestDate) earliestDate = date
            if (!latestDate || date > latestDate) latestDate = date
          }
        })
      }
    })

    return {
      totalConversations: data.length,
      dateRange: {
        earliest: earliestDate?.toISOString() || 'Unknown',
        latest: latestDate?.toISOString() || 'Unknown'
      },
      format,
      participants: Array.from(participants),
      messageCount: totalMessages,
      userMessages,
      assistantMessages,
      averageLength: totalMessages > 0 ? Math.round(totalLength / totalMessages) : 0,
      hasTimestamps: earliestDate !== null,
      hasTitles: data.some(c => c.title || c.name || c.conversation_name),
      sample: data.slice(0, 3) // First 3 conversations
    }
  }

  const validateAndQueueFile = async (file: File) => {
    // Safety Check 1: File type
    if (!file.name.endsWith('.json')) {
      alert('⚠️ SAFETY: Only JSON files are allowed')
      return
    }

    // Safety Check 2: File size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`⚠️ SAFETY: File too large (${fileSizeMB.toFixed(1)}MB). Maximum is ${MAX_FILE_SIZE_MB}MB`)
      return
    }

    // Safety Check 3: Parse and analyze
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const conversations = data.conversations || data || []

      if (!Array.isArray(conversations)) {
        alert('⚠️ SAFETY: Invalid format - expected array of conversations')
        return
      }

      const conversationCount = conversations.length

      // Safety Check 4: Hard limit
      if (conversationCount > MAX_CONVERSATIONS) {
        alert(`⚠️ SAFETY: Too many conversations (${conversationCount}). Maximum is ${MAX_CONVERSATIONS}.\n\nPlease split your file into smaller chunks.`)
        return
      }

      // Analyze the data
      const analysis = analyzeConversations(conversations)

      // Show preview dialog
      setPreviewData({
        file,
        data: conversations,
        analysis
      })
      setShowPreviewDialog(true)

    } catch (error) {
      alert('⚠️ SAFETY: Failed to parse JSON file. Please check the format.')
      return
    }
  }

  const confirmPreview = () => {
    if (!previewData) return

    const { file, data, analysis } = previewData

    // Check if needs large import confirmation
    if (analysis.totalConversations > WARN_CONVERSATIONS) {
      setPendingFile({ file, conversationCount: analysis.totalConversations })
      setShowPreviewDialog(false)
      setShowConfirmDialog(true)
      return
    }

    // Safe to proceed directly
    setShowPreviewDialog(false)
    processFile(file, data)
    setPreviewData(null)
  }

  const cancelPreview = () => {
    setShowPreviewDialog(false)
    setPreviewData(null)
  }

  const confirmLargeImport = () => {
    if (pendingFile) {
      // Re-parse and process
      pendingFile.file.text().then(text => {
        const data = JSON.parse(text)
        const conversations = data.conversations || data || []
        processFile(pendingFile.file, conversations)
      })
    }
    setShowConfirmDialog(false)
    setPendingFile(null)
  }

  const cancelLargeImport = () => {
    setShowConfirmDialog(false)
    setPendingFile(null)
  }

  const processFile = async (file: File, conversations: any[]) => {
    const fileId = Math.random().toString(36).substr(2, 9)
    const abortController = new AbortController()
    pauseFlags.current.set(fileId, false)

    // Add file to list with initial state
    const newFile: ImportedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      tier: activeTier, // Add current tier
      status: 'processing',
      stage: 'processing',
      progress: { current: 0, total: conversations.length, phase: 'Starting import...' },
      stats: { patterns: 0, highGravity: 0, identityAnchors: 0 },
      messageCount: conversations.length,
      abortController,
      isPaused: false
    }

    setFiles(prev => [...prev, newFile])

    try {
      // Prepare chunks
      const chunks: any[] = []
      for (let i = 0; i < conversations.length; i += CHUNK_SIZE) {
        chunks.push(conversations.slice(i, i + CHUNK_SIZE))
      }

      let totalProcessed = 0

      // Process chunks with abort and pause support
      for (const [index, chunk] of chunks.entries()) {
        // Check for abort
        if (abortController.signal.aborted) {
          throw new Error('Import cancelled by user')
        }

        // Check for pause
        while (pauseFlags.current.get(fileId)) {
          await new Promise(resolve => setTimeout(resolve, 500))
          if (abortController.signal.aborted) {
            throw new Error('Import cancelled by user')
          }
        }

        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                progress: {
                  current: totalProcessed,
                  total: conversations.length,
                  phase: `Processing chunk ${index + 1}/${chunks.length} (${Math.round((totalProcessed / conversations.length) * 100)}%)`
                }
              }
            : f
        ))

        // Send chunk to backend with abort signal
        const response = await fetch('/api/import-chatgpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversations: chunk,
            mode: 'full', // 'full' for CCE-O, 'fast' for direct
            user_id: 'default_user', // TODO: Get from config
            tier: activeTier // Add tier parameter
          }),
          signal: abortController.signal
        })

        if (!response.ok) {
          throw new Error(`Import failed: ${response.statusText}`)
        }

        const result = await response.json()
        totalProcessed += result.results?.processed || chunk.length

        // Update stats
        setFiles(prev => prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                progress: {
                  current: totalProcessed,
                  total: conversations.length,
                  phase: `Processed ${totalProcessed}/${conversations.length} conversations`
                },
                stats: {
                  patterns: (f.stats?.patterns || 0) + (result.results?.patterns_detected || 0),
                  highGravity: (f.stats?.highGravity || 0) + (result.results?.high_gravity_moments || 0),
                  identityAnchors: (f.stats?.identityAnchors || 0) + (result.results?.identity_anchors || 0)
                }
              }
            : f
        ))

        // Safety delay between chunks
        await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY_MS))
      }

      // Stage 4: Complete
      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? {
              ...f,
              status: 'success',
              stage: 'complete',
              progress: { current: conversations.length, total: conversations.length, phase: 'Import complete!' }
            }
          : f
      ))

      pauseFlags.current.delete(fileId)

    } catch (error) {
      console.error('Import failed:', error)

      const isCancelled = error instanceof Error && error.message.includes('cancelled')

      setFiles(prev => prev.map(f =>
        f.id === fileId
          ? {
              ...f,
              status: isCancelled ? 'cancelled' : 'error',
              stage: isCancelled ? 'cancelled' : f.stage,
              errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          : f
      ))

      pauseFlags.current.delete(fileId)
    }

    if (onImport) {
      onImport([file])
    }
  }

  const cancelImport = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file?.abortController) {
      file.abortController.abort()
    }
    pauseFlags.current.delete(fileId)
  }

  const pauseImport = (fileId: string) => {
    pauseFlags.current.set(fileId, true)
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, isPaused: true, stage: 'paused', status: 'paused' }
        : f
    ))
  }

  const resumeImport = (fileId: string) => {
    pauseFlags.current.set(fileId, false)
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, isPaused: false, stage: 'processing', status: 'processing' }
        : f
    ))
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: ImportedFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="w-4 h-4 text-gray-400" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-[rgb(var(--band-chi-cyan))] animate-spin" />
      case 'paused':
        return <Pause className="w-4 h-4 text-[rgb(var(--band-xi))]" />
      case 'cancelled':
        return <StopCircle className="w-4 h-4 text-gray-500" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-[rgb(var(--band-beta-high))]" />
    }
  }

  const getStatusColor = (status: ImportedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'border-white/10'
      case 'processing':
        return 'border-[rgba(var(--band-chi-cyan),0.5)]'
      case 'paused':
        return 'border-[rgba(var(--band-xi),0.5)]'
      case 'cancelled':
        return 'border-gray-500/30'
      case 'success':
        return 'border-emerald-500/30'
      case 'error':
        return 'border-[rgba(var(--band-beta-high),0.5)]'
    }
  }

  const successCount = tierFiles.filter(f => f.status === 'success').length
  const errorCount = tierFiles.filter(f => f.status === 'error').length
  const processingCount = tierFiles.filter(f => f.status === 'processing').length

  return (
    <div className="space-y-6">
      {/* Tier Selection Tabs */}
      <div className="flex gap-3">
        {Object.values(TIER_CONFIGS).map((tier) => {
          const Icon = tier.icon
          const isActive = activeTier === tier.id
          const tierFileCount = files.filter(f => f.tier === tier.id).length

          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`flex-1 p-4 rounded-macos-xl transition-all duration-200 ${
                isActive
                  ? `bg-[rgba(${tier.color},0.2)] border-2 border-[rgba(${tier.color},0.5)]`
                  : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-macos-lg ${
                  isActive
                    ? `bg-[rgba(${tier.color},0.3)] border border-[rgba(${tier.color},0.5)]`
                    : 'bg-white/10 border border-white/20'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? tier.colorRgb : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {tier.label}
                  </div>
                  {tierFileCount > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {tierFileCount} file{tierFileCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              <p className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                {tier.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Safety Banner */}
      <div className="bg-[rgba(var(--band-xi),0.1)] backdrop-blur-macos rounded-macos-xl p-4 border border-[rgba(var(--band-xi),0.3)]">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[rgb(var(--band-xi))] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[rgb(var(--band-xi))] mb-1">Safety Controls Active</h4>
            <p className="text-xs text-gray-400">
              Max file size: {MAX_FILE_SIZE_MB}MB • Max conversations: {MAX_CONVERSATIONS.toLocaleString()} • Chunk size: {CHUNK_SIZE} • All imports can be paused or cancelled at any time
            </p>
          </div>
        </div>
      </div>

      {/* Preview/Analysis Dialog */}
      <AnimatePresence>
        {showPreviewDialog && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelPreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] rounded-macos-2xl p-8 border border-[rgba(var(--band-chi-cyan),0.5)] max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-macos-lg bg-[rgba(var(--band-chi-cyan),0.2)] border border-[rgba(var(--band-chi-cyan),0.3)]">
                  <Brain className="w-6 h-6 text-[rgb(var(--band-chi-cyan))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">Import Preview & Analysis</h3>
                  <p className="text-sm text-gray-400">
                    {previewData.file.name}
                  </p>
                </div>
                <button
                  onClick={cancelPreview}
                  className="p-2 hover:bg-white/10 rounded-macos-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Analysis Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Format Detected</div>
                  <div className="text-lg font-medium text-[rgb(var(--band-chi-cyan))]">
                    {previewData.analysis.format.toUpperCase()}
                  </div>
                </div>

                <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Total Conversations</div>
                  <div className="text-lg font-medium text-white">
                    {previewData.analysis.totalConversations.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Total Messages</div>
                  <div className="text-lg font-medium text-white">
                    {previewData.analysis.messageCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Message Breakdown</div>
                  <div className="text-sm text-gray-300">
                    {previewData.analysis.userMessages} user • {previewData.analysis.assistantMessages} AI
                  </div>
                </div>
              </div>

              {/* Date Range */}
              {previewData.analysis.hasTimestamps && (
                <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-psi),0.1)] border border-[rgba(var(--band-psi),0.3)] mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[rgb(var(--band-psi))]" />
                    <span className="text-xs text-[rgb(var(--band-psi))] font-medium">Date Range</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {new Date(previewData.analysis.dateRange.earliest).toLocaleDateString()} → {new Date(previewData.analysis.dateRange.latest).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2">Participants Detected</div>
                <div className="flex flex-wrap gap-2">
                  {previewData.analysis.participants.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-macos-sm bg-white/5 border border-white/10 text-xs text-gray-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Format Warnings */}
              {previewData.analysis.format === 'unknown' && (
                <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-beta-high),0.1)] border border-[rgba(var(--band-beta-high),0.3)] mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[rgb(var(--band-beta-high))] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-[rgb(var(--band-beta-high))] mb-1">Unknown Format</div>
                      <div className="text-xs text-gray-400">
                        The format was not recognized. Import may require custom backend mapping.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!previewData.analysis.hasTimestamps && (
                <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-xi),0.1)] border border-[rgba(var(--band-xi),0.3)] mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[rgb(var(--band-xi))] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-[rgb(var(--band-xi))] mb-1">No Timestamps Found</div>
                      <div className="text-xs text-gray-400">
                        Original creation dates may not be preserved.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Preview */}
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-3">Sample Data (first conversation)</div>
                <div className="p-4 rounded-macos-lg bg-black/40 border border-white/10 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {JSON.stringify(previewData.analysis.sample[0], null, 2).slice(0, 1000)}
                    {JSON.stringify(previewData.analysis.sample[0], null, 2).length > 1000 && '\n...(truncated)'}
                  </pre>
                </div>
              </div>

              {/* Backend Info */}
              <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-chi-cyan),0.05)] border border-[rgba(var(--band-chi-cyan),0.2)] mb-6">
                <div className="text-xs font-medium text-[rgb(var(--band-chi-cyan))] mb-2">Backend Processing</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• Endpoint: <code className="text-gray-300">/api/import-chatgpt</code></div>
                  <div>• Format: LSMessage schema transformation</div>
                  <div>• Chunk size: {CHUNK_SIZE} conversations per batch</div>
                  <div>• User/Assistant roles will be auto-detected</div>
                  <div>• Original timestamps will be preserved (if available)</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelPreview}
                  className="flex-1 px-4 py-2 rounded-macos-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPreview}
                  className="flex-1 px-4 py-2 rounded-macos-lg bg-[rgba(var(--band-chi-cyan),0.2)] border border-[rgba(var(--band-chi-cyan),0.5)] text-[rgb(var(--band-chi-cyan))] hover:bg-[rgba(var(--band-chi-cyan),0.3)] transition-colors font-medium"
                >
                  Begin Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && pendingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelLargeImport}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] rounded-macos-2xl p-8 border border-[rgba(var(--band-xi),0.5)] max-w-md"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-macos-lg bg-[rgba(var(--band-xi),0.2)] border border-[rgba(var(--band-xi),0.3)]">
                  <AlertTriangle className="w-6 h-6 text-[rgb(var(--band-xi))]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Large Import Warning</h3>
                  <p className="text-sm text-gray-400">
                    You're about to import <span className="text-[rgb(var(--band-xi))] font-medium">{pendingFile.conversationCount.toLocaleString()} conversations</span>.
                    This is above the recommended threshold of {WARN_CONVERSATIONS.toLocaleString()}.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-macos-lg p-4 mb-6 space-y-2">
                <p className="text-xs text-gray-400">
                  • Processing will be done in chunks of {CHUNK_SIZE}
                </p>
                <p className="text-xs text-gray-400">
                  • You can pause or cancel at any time
                </p>
                <p className="text-xs text-gray-400">
                  • Estimated time: ~{Math.ceil(pendingFile.conversationCount / CHUNK_SIZE * CHUNK_DELAY_MS / 1000 / 60)} minutes
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelLargeImport}
                  className="flex-1 px-4 py-2 rounded-macos-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLargeImport}
                  className="flex-1 px-4 py-2 rounded-macos-lg bg-[rgba(var(--band-chi-cyan),0.2)] border border-[rgba(var(--band-chi-cyan),0.5)] text-[rgb(var(--band-chi-cyan))] hover:bg-[rgba(var(--band-chi-cyan),0.3)] transition-colors font-medium"
                >
                  Proceed Safely
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card */}
      <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-macos-lg bg-[rgba(${currentTierConfig.color},0.2)] border border-[rgba(${currentTierConfig.color},0.3)]`}>
              {React.createElement(currentTierConfig.icon, { className: `w-6 h-6 ${currentTierConfig.colorRgb}` })}
            </div>
            <div>
              <h3 className="text-xl font-light text-white mb-1">{currentTierConfig.label}</h3>
              <p className="text-sm text-gray-400">
                {currentTierConfig.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-macos-sm bg-[rgba(${currentTierConfig.color},0.1)] border border-[rgba(${currentTierConfig.color},0.3)]`}>
              <span className={`text-xs ${currentTierConfig.colorRgb}`}>
                {tierFiles.length} file{tierFiles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative p-12 border-2 border-dashed rounded-macos-xl transition-all duration-200 ${
            isDragging
              ? 'border-[rgba(var(--band-chi-cyan),0.8)] bg-[rgba(var(--band-chi-cyan),0.15)]'
              : 'border-[rgba(var(--band-chi-cyan),0.3)] bg-[rgba(var(--band-chi-cyan),0.05)]'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".json,.txt,.csv"
          />
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="p-4 rounded-macos-lg bg-[rgba(var(--band-chi-cyan),0.1)] border border-[rgba(var(--band-chi-cyan),0.2)]">
              <Upload className="w-8 h-8 text-[rgb(var(--band-chi-cyan))]" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports JSON, TXT, CSV formats
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-light text-emerald-400 mb-1">{successCount}</div>
              <div className="text-xs text-gray-400">Imported</div>
            </div>
            <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-light text-[rgb(var(--band-chi-cyan))] mb-1">{processingCount}</div>
              <div className="text-xs text-gray-400">Processing</div>
            </div>
            <div className="p-4 rounded-macos-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-light text-[rgb(var(--band-beta-high))] mb-1">{errorCount}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* File List */}
      {tierFiles.length > 0 && (
        <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-8 border border-white/10">
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-4`} style={{ color: currentTierConfig.colorRgb }}>
            {currentTierConfig.badge} Import Queue
          </h4>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tierFiles.map((file) => {
                const fileTierConfig = TIER_CONFIGS[file.tier]
                return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 bg-white/5 rounded-macos-lg border ${getStatusColor(file.status)} transition-colors duration-200`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(file.status)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-medium text-white truncate">
                              {file.name}
                            </h5>
                            {/* Tier Badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap bg-[rgba(${fileTierConfig.color},0.2)] border border-[rgba(${fileTierConfig.color},0.4)]`} style={{ color: fileTierConfig.colorRgb }}>
                              {fileTierConfig.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatFileSize(file.size)}
                            {file.messageCount && <span className="mx-1">•</span>}
                            {file.messageCount && <span>{file.messageCount} conversations</span>}
                          </p>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Status Badge */}
                          <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            file.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : file.status === 'error'
                              ? 'bg-[rgba(var(--band-beta-high),0.2)] text-[rgb(var(--band-beta-high))] border border-[rgba(var(--band-beta-high),0.3)]'
                              : file.status === 'cancelled'
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : file.status === 'paused'
                              ? 'bg-[rgba(var(--band-xi),0.2)] text-[rgb(var(--band-xi))] border border-[rgba(var(--band-xi),0.3)]'
                              : file.status === 'processing'
                              ? 'bg-[rgba(var(--band-chi-cyan),0.2)] text-[rgb(var(--band-chi-cyan))] border border-[rgba(var(--band-chi-cyan),0.3)]'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            {file.stage || file.status}
                          </div>

                          {/* Pause/Resume Button */}
                          {(file.status === 'processing' || file.status === 'paused') && (
                            <button
                              onClick={() => file.isPaused ? resumeImport(file.id) : pauseImport(file.id)}
                              className="p-1.5 hover:bg-[rgba(var(--band-xi),0.2)] rounded transition-colors"
                              title={file.isPaused ? 'Resume import' : 'Pause import'}
                            >
                              {file.isPaused ? (
                                <Play className="w-4 h-4 text-[rgb(var(--band-xi))]" />
                              ) : (
                                <Pause className="w-4 h-4 text-[rgb(var(--band-xi))]" />
                              )}
                            </button>
                          )}

                          {/* Cancel Button */}
                          {(file.status === 'processing' || file.status === 'paused') && (
                            <button
                              onClick={() => cancelImport(file.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                              title="Cancel import"
                            >
                              <StopCircle className="w-4 h-4 text-red-400" />
                            </button>
                          )}

                          {/* Remove Button */}
                          {(file.status === 'success' || file.status === 'error' || file.status === 'cancelled') && (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1.5 hover:bg-white/10 rounded transition-colors"
                              title="Remove from list"
                            >
                              <X className="w-4 h-4 text-gray-500 hover:text-white" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Section */}
                      {file.status === 'processing' && file.progress && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 pb-3 border-b border-white/10"
                        >
                          {/* Progress Text */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{file.progress.phase}</span>
                            <span className="text-[rgb(var(--band-chi-cyan))]">
                              {file.progress.total > 0 && `${file.progress.current} / ${file.progress.total}`}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {file.progress.total > 0 && (
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(file.progress.current / file.progress.total) * 100}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[rgb(var(--band-chi-cyan))] to-[rgb(var(--band-psi))]"
                              />
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Stats Grid - Show during processing and after success */}
                      {(file.status === 'processing' || file.status === 'success') && file.stats && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-3 gap-3 pt-3"
                        >
                          <div className="p-2 rounded-macos-sm bg-[rgba(var(--band-psi),0.1)] border border-[rgba(var(--band-psi),0.3)]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Brain className="w-3 h-3 text-[rgb(var(--band-psi))]" />
                              <span className="text-xs text-gray-400">Patterns</span>
                            </div>
                            <div className="text-lg font-light text-[rgb(var(--band-psi))]">
                              {file.stats.patterns}
                            </div>
                          </div>

                          <div className="p-2 rounded-macos-sm bg-[rgba(var(--band-xi),0.1)] border border-[rgba(var(--band-xi),0.3)]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3 h-3 text-[rgb(var(--band-xi))]" />
                              <span className="text-xs text-gray-400">High Gravity</span>
                            </div>
                            <div className="text-lg font-light text-[rgb(var(--band-xi))]">
                              {file.stats.highGravity}
                            </div>
                          </div>

                          <div className="p-2 rounded-macos-sm bg-[rgba(var(--band-chi-cyan),0.1)] border border-[rgba(var(--band-chi-cyan),0.3)]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Target className="w-3 h-3 text-[rgb(var(--band-chi-cyan))]" />
                              <span className="text-xs text-gray-400">Identity</span>
                            </div>
                            <div className="text-lg font-light text-[rgb(var(--band-chi-cyan))]">
                              {file.stats.identityAnchors}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && file.errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-3 border-t border-white/10"
                        >
                          <p className="text-xs text-[rgb(var(--band-beta-high))]">
                            {file.errorMessage}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tierFiles.length === 0 && (
        <div className="bg-white/5 backdrop-blur-macos rounded-macos-2xl p-12 border border-white/10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={`p-4 rounded-macos-lg bg-[rgba(${currentTierConfig.color},0.1)] border border-[rgba(${currentTierConfig.color},0.3)]`}>
              {React.createElement(currentTierConfig.icon, { className: `w-8 h-8 ${currentTierConfig.colorRgb}` })}
            </div>
            <div>
              <p className="text-gray-400 mb-2">No {currentTierConfig.badge.toLowerCase()} files imported yet</p>
              <p className="text-sm text-gray-500">
                {currentTierConfig.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
