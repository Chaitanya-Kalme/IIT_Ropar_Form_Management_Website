"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formsService } from "@/lib/services";
import type { Submission } from "@/lib/mockApi";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [recent, setRecent] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formsService.getRecent().then((data) => {
      setRecent(data);
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: "Total Submitted", value: recent.length, icon: FileText, cardClass: "card-stat-blue", iconColor: "text-indigo-600", iconBg: "bg-indigo-100" },
    { label: "Pending", value: recent.filter((r) => r.status === "Pending" || r.status === "Under Review").length, icon: Clock, cardClass: "card-stat-amber", iconColor: "text-amber-600", iconBg: "bg-amber-100" },
    { label: "Approved", value: recent.filter((r) => r.status === "Approved").length, icon: CheckCircle2, cardClass: "card-stat-teal", iconColor: "text-emerald-600", iconBg: "bg-emerald-100" },
    { label: "Rejected", value: recent.filter((r) => r.status === "Rejected").length, icon: AlertCircle, cardClass: "card-stat-rose", iconColor: "text-rose-600", iconBg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-hero p-6 sm:p-8"
        style={{ boxShadow: "var(--shadow-primary)" }}
      >
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <div className="absolute right-[-20%] top-[-20%] h-64 w-64 rounded-full bg-white" />
          <div className="absolute bottom-[-10%] right-[20%] h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <span className="text-sm font-medium text-white/80">Welcome back</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Forms Dashboard</h1>
          <p className="mt-2 text-sm text-white/70 max-w-lg">
            Manage your forms, track approvals, and stay updated on your submissions — all in one place.
          </p>
          <Link href="/forms" className="mt-4 inline-block">
            <Button variant="accent" size="sm" className="gap-2">
              Browse Forms <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border ${stat.cardClass} hover:scale-[1.02] transition-transform duration-200`}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl ${stat.iconBg} p-3 ${stat.iconColor}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Submissions */}
      <Card className="shadow-card border-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="font-heading text-lg">Recent Submissions</CardTitle>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                    <th className="px-6 py-3 font-semibold">Form Name</th>
                    <th className="px-6 py-3 font-semibold hidden sm:table-cell">Date</th>
                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Time</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{sub.form_name}</td>
                      <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">{sub.submitted_date}</td>
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">{sub.submitted_time}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/submission/${sub.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">View</Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
