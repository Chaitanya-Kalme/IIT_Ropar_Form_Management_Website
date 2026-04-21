// hooks/useNotifications.ts
// Drop-in hook for your NotificationBell component

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type NotifType = "approved" | "rejected" | "pending" | "review";

export interface Notification {
  id:           string;
  type:         NotifType;
  title:        string;
  description:  string;
  time:         string;
  submissionId: string | null;
  formId:       number | null;
  formTitle:    string | null;
  read:         boolean;        // derived client-side
}

const LAST_SEEN_KEY = "notif_last_seen_at";
const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── helpers ────────────────────────────────────────────────
  const getLastSeen = () => localStorage.getItem(LAST_SEEN_KEY);

  const saveLastSeen = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  };

  // ── fetch full list ────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const since = getLastSeen();
      const url   = `/api/notifications${since ? `?since=${encodeURIComponent(since)}` : ""}`;
      const res   = await fetch(url);
      const json  = await res.json();

      if (!json.success) return;

      const lastSeen = getLastSeen();

      const shaped: Notification[] = json.data.notifications.map((n: any) => ({
        ...n,
        read: lastSeen ? new Date(n.time) <= new Date(lastSeen) : false,
      }));

      setNotifications(shaped);
      setUnreadCount(json.data.unreadCount);
    } catch (err) {
      console.error("useNotifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── lightweight poll for badge ─────────────────────────────
  const pollUnreadCount = useCallback(async () => {
    try {
      const since = getLastSeen();
      const url   = `/api/notifications/unread-count${since ? `?since=${encodeURIComponent(since)}` : ""}`;
      const res   = await fetch(url);
      const json  = await res.json();
      if (json.success) setUnreadCount(json.data.unreadCount);
    } catch (err) {
      console.error("pollUnreadCount error:", err);
    }
  }, []);

  // ── mark all read (client-side) ────────────────────────────
  const markAllRead = useCallback(() => {
    saveLastSeen();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── mark single read ───────────────────────────────────────
  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  // ── on mount: fetch + start polling ───────────────────────
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(pollUnreadCount, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications, pollUnreadCount]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}