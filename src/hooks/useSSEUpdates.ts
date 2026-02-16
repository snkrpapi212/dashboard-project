import { useState, useEffect, useRef, useCallback } from 'react';

/* ==========================================================================
   useSSEUpdates
   Server-Sent Events hook for real-time dashboard updates.
   Handles connection lifecycle, multiple event types, and auto-reconnect.
   ========================================================================== */

export type SSEStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface SSEOptions {
  /** Whether to connect immediately (default: true) */
  autoConnect?: boolean;
  /** Custom event types to listen for */
  eventTypes?: string[];
  /** Whether to use withCredentials (default: false) */
  withCredentials?: boolean;
}

export interface SSEResult<T = any> {
  /** Latest received data */
  data: T | null;
  /** Connection status */
  status: SSEStatus;
  /** Last error */
  error: Event | null;
  /** Connect / reconnect */
  connect: () => void;
  /** Disconnect */
  disconnect: () => void;
}

export function useSSEUpdates<T = any>(
  endpoint: string,
  options: SSEOptions = {},
): SSEResult<T> {
  const {
    autoConnect = true,
    eventTypes = [],
    withCredentials = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<SSEStatus>('closed');
  const [error, setError] = useState<Event | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    // Close existing connection
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    setStatus('connecting');
    setError(null);

    const eventSource = new EventSource(endpoint, { withCredentials });

    eventSource.onopen = () => {
      setStatus('open');
      setError(null);
    };

    // Default message handler
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch {
        setData(event.data as unknown as T);
      }
    };

    // Custom event type handlers
    eventTypes.forEach((type) => {
      eventSource.addEventListener(type, (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
        } catch {
          setData(event.data as unknown as T);
        }
      });
    });

    eventSource.onerror = (err) => {
      setError(err);
      setStatus('error');
      // EventSource will auto-reconnect by default
    };

    sourceRef.current = eventSource;
  }, [endpoint, eventTypes, withCredentials]);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setStatus('closed');
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { data, status, error, connect, disconnect };
}
