// hooks/useVerifierNotifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type VerifierNotifType = "new_submission" | "resubmission" | "deadline" | "info";

export interface VerifierNotification {
  id:           string;
  type:         VerifierNotifType;
  title:        string;
  description:  string;
  time:         string;
  read:         boolean;
  submissionId: string | null;
  formId:       number | null;
  formTitle:    string | null;
}

const LAST_SEEN_KEY  = "verifier_notif_last_seen_at";
const POLL_INTERVAL  = 30_000;

export function useVerifierNotifications() {
  const [notifications, setNotifications] = useState<VerifierNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getLastSeen = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LAST_SEEN_KEY);
  };

  const saveLastSeen = () => {
    if (typeof window !== "undefined")
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const since = getLastSeen();
      const url   = `/api/verifier/notifications${since ? `?since=${encodeURIComponent(since)}` : ""}`;
      const res   = await fetch(url);
      const json  = await res.json();
      if (!json.success) return;

      const lastSeen = getLastSeen();
      const shaped: VerifierNotification[] = json.data.notifications.map((n: any) => ({
        ...n,
        read: lastSeen ? new Date(n.time) <= new Date(lastSeen) : false,
      }));

      setNotifications(shaped);
      setUnreadCount(json.data.unreadCount);
    } catch (err) {
      console.error("useVerifierNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const pollUnreadCount = useCallback(async () => {
    try {
      const since = getLastSeen();
      const url   = `/api/verifier/notifications/unread-count${since ? `?since=${encodeURIComponent(since)}` : ""}`;
      const res   = await fetch(url);
      const json  = await res.json();
      if (json.success) setUnreadCount(json.data.unreadCount);
    } catch {}
  }, []);

  const markAllRead = useCallback(() => {
    saveLastSeen();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(pollUnreadCount, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNotifications, pollUnreadCount]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}