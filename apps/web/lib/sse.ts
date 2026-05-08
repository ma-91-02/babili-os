'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface OrderEvent {
  type: string;
  orderId: string;
  restaurantId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function useOrderEvents(restaurantId?: string) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource('/api/orders/events');

    es.onopen = () => {
      setConnected(true);
    };

    es.addEventListener('order.created', (e) => {
      const event: OrderEvent = JSON.parse(e.data);
      if (!restaurantId || event.restaurantId === restaurantId) {
        setEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    es.addEventListener('order.updated', (e) => {
      const event: OrderEvent = JSON.parse(e.data);
      if (!restaurantId || event.restaurantId === restaurantId) {
        setEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    es.addEventListener('order.status', (e) => {
      const event: OrderEvent = JSON.parse(e.data);
      if (!restaurantId || event.restaurantId === restaurantId) {
        setEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    es.addEventListener('order.kitchen', (e) => {
      const event: OrderEvent = JSON.parse(e.data);
      if (!restaurantId || event.restaurantId === restaurantId) {
        setEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    es.addEventListener('order.cashier', (e) => {
      const event: OrderEvent = JSON.parse(e.data);
      if (!restaurantId || event.restaurantId === restaurantId) {
        setEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    eventSourceRef.current = es;
  }, [restaurantId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, connected, clearEvents };
}
