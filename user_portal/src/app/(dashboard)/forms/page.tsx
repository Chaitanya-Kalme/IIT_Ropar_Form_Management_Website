"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formsService } from "@/lib/services";
import type { FormDefinition } from "@/lib/mockApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, Stethoscope, GraduationCap, Building2, Wallet, Home as HomeIcon } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Medical Forms": Stethoscope,
  "Academic Forms": GraduationCap,
  "Administrative Forms": Building2,
  "Finance Forms": Wallet,
  "Hostel Forms": HomeIcon,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Medical Forms": { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" },
  "Academic Forms": { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" },
  "Administrative Forms": { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" },
  "Finance Forms": { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" },
  "Hostel Forms": { bg: "bg-sky-100", text: "text-sky-600", border: "border-sky-200" },
};

const categoryGradients: Record<string, string> = {
  "Medical Forms": "linear-gradient(90deg, #f43f5e, #fb7185)",
  "Academic Forms": "linear-gradient(90deg, #6366f1, #818cf8)",
  "Administrative Forms": "linear-gradient(90deg, #14b8a6, #2dd4bf)",
  "Finance Forms": "linear-gradient(90deg, #f59e0b, #fbbf24)",
  "Hostel Forms": "linear-gradient(90deg, #0ea5e9, #38bdf8)",
};

export default function FormsPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    formsService.getAll().then((data) => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(forms.map((f) => f.category)))];

  const filtered = forms.filter((f) => {
    const matchSearch =
      f.form_name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Available Forms</h1>
          <p className="text-sm text-muted-foreground">Browse and fill forms from various departments.</p>
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

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const colors = cat !== "All" ? categoryColors[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? cat === "All"
                    ? "gradient-primary text-white border-transparent shadow-primary"
                    : `${colors?.bg} ${colors?.text} ${colors?.border}`
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {cat !== "All" && (() => {
                const Icon = categoryIcons[cat] || FileText;
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Form Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((form, i) => {
          const colors = categoryColors[form.category] || { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" };
          const Icon = categoryIcons[form.category] || FileText;
          return (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col border-0 shadow-card form-card-hover overflow-hidden">
                <div
                  className="h-1.5 w-full"
                  style={{ background: categoryGradients[form.category] || categoryGradients["Academic Forms"] }}
                />
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`rounded-xl ${colors.bg} p-2.5`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-sm font-semibold leading-tight">{form.form_name}</h3>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                        {form.department}
                      </span>
                    </div>
                  </div>
                  <p className="flex-1 text-xs text-muted-foreground leading-relaxed">{form.description}</p>
                  <Link href={`/forms/${form.id}`} className="mt-4">
                    <Button size="sm" className="w-full rounded-xl">Fill Form</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No forms found matching your search.</p>
        </div>
      )}
    </div>
  );
}
