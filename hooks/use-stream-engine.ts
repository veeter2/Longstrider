/**
 * Stream Engine Hook
 * Real SSE streaming engine for handling AI responses
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamOptions {
  endpoint: string;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

interface StreamState {
  isStreaming: boolean;
  content: string;
  error: Error | null;
}

export function useStreamEngine(options: StreamOptions) {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    content: '',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const startStream = useCallback(async (payload: any) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      isStreaming: true,
      content: '',
      error: null,
    });

    try {
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      readerRef.current = reader;
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setState((prev) => ({
          ...prev,
          content: accumulatedContent,
        }));

        options.onChunk?.(chunk);
      }

      setState((prev) => ({
        ...prev,
        isStreaming: false,
      }));

      options.onComplete?.(accumulatedContent);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was intentionally cancelled
        setState((prev) => ({
          ...prev,
          isStreaming: false,
        }));
        return;
      }

      const error = err instanceof Error ? err : new Error('Unknown streaming error');
      setState({
        isStreaming: false,
        content: '',
        error,
      });

      options.onError?.(error);
    }
  }, [options]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  const resetStream = useCallback(() => {
    stopStream();
    setState({
      isStreaming: false,
      content: '',
      error: null,
    });
  }, [stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    isStreaming: state.isStreaming,
    content: state.content,
    error: state.error,
    startStream,
    stopStream,
    resetStream,
  };
}
