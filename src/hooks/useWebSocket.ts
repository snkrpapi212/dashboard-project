import { useState, useEffect, useRef, useCallback } from 'react';

/* ==========================================================================
   useWebSocket
   WebSocket hook with automatic reconnection, heartbeat, and message typing.
   ========================================================================== */

export type ReadyState = 'connecting' | 'open' | 'closing' | 'closed';

export interface WebSocketOptions {
  /** Max reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Base reconnect interval in ms (default: 3000) */
  reconnectInterval?: number;
  /** Heartbeat interval in ms; 0 disables (default: 30000) */
  heartbeatInterval?: number;
  /** Heartbeat message to send (default: "ping") */
  heartbeatMessage?: string;
  /** Protocols to pass to WebSocket constructor */
  protocols?: string | string[];
  /** Whether to connect immediately (default: true) */
  autoConnect?: boolean;
}

export interface WebSocketResult<T = any> {
  lastMessage: T | null;
  readyState: ReadyState;
  sendMessage: (data: any) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket<T = any>(
  url: string,
  options: WebSocketOptions = {},
): WebSocketResult<T> {
  const {
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30_000,
    heartbeatMessage = JSON.stringify({ type: 'ping' }),
    protocols,
    autoConnect = true,
  } = options;

  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [readyState, setReadyState] = useState<ReadyState>('closed');

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval <= 0) return;
    clearHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(heartbeatMessage);
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, heartbeatMessage, clearHeartbeat]);

  const connect = useCallback(() => {
    // Clean up existing
    if (socketRef.current) {
      socketRef.current.close();
    }

    setReadyState('connecting');

    try {
      const ws = protocols
        ? new WebSocket(url, protocols)
        : new WebSocket(url);

      ws.onopen = () => {
        setReadyState('open');
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // Ignore heartbeat responses
          if (parsed.type === 'pong') return;
          setLastMessage(parsed);
        } catch {
          // If not JSON, set raw data
          setLastMessage(event.data as unknown as T);
        }
      };

      ws.onclose = () => {
        setReadyState('closed');
        clearHeartbeat();

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        setReadyState('closed');
      };

      socketRef.current = ws;
    } catch {
      setReadyState('closed');
    }
  }, [url, protocols, maxReconnectAttempts, reconnectInterval, startHeartbeat, clearHeartbeat]);

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    clearHeartbeat();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setReadyState('closed');
  }, [maxReconnectAttempts, clearHeartbeat]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        typeof data === 'string' ? data : JSON.stringify(data),
      );
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { lastMessage, readyState, sendMessage, reconnect, disconnect };
}
