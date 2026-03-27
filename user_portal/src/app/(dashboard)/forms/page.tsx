"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, Search, FileText, AlertCircle, Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormDefinition {
  id: number;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  return {
    label,
    isExpiringSoon: diff <= 3 && diff >= 0,
    isExpired: diff < 0,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FormsPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/form/getPublicForms");  // ← updated route

        if (!res.ok) throw new Error(`Failed to fetch forms (${res.status})`);

        const data = await res.json();
        setForms(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const filtered = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading forms…</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  // ── Page ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Available Forms</h1>
          <p className="text-sm text-muted-foreground">
            {forms.length} active form{forms.length !== 1 ? "s" : ""} open for submission.
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Form cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((form, i) => {
          const deadline = formatDeadline(form.deadline);
          return (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col border-0 shadow-card form-card-hover overflow-hidden">
                {/* Active indicator bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
                />

                <CardContent className="flex flex-1 flex-col p-5">
                  {/* Title */}
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-sm font-semibold leading-tight line-clamp-2 pt-1">
                      {form.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="flex-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {form.description}
                  </p>

                  {/* Deadline */}
                  <div className={`mt-4 flex items-center gap-1.5 text-xs ${deadline.isExpired
                      ? "text-rose-500"
                      : deadline.isExpiringSoon
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    }`}>
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {deadline.isExpired
                        ? `Deadline passed · ${deadline.label}`
                        : deadline.isExpiringSoon
                          ? `Closing soon · ${deadline.label}`
                          : `Due ${deadline.label}`}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link href={`/forms/${form.id}`} className="mt-4">
                    <Button
                      size="sm"
                      className="w-full rounded-xl"
                      disabled={deadline.isExpired}
                    >
                      {deadline.isExpired ? "Closed" : "Fill Form"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No forms found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}