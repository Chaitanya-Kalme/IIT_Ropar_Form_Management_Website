"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Pen, ArrowLeft, Eye,
  AlertCircle, Clock, CheckCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormField {
  id: string;
  type: "text" | "email" | "number" | "date" | "textarea" | "dropdown" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface VerifierLevel {
  level: number;
  verifier: {
    userName: string;
    role: string;
    department: string;
  };
}

interface FormDetail {
  id: number;
  title: string;
  description: string;
  deadline: string;
  formStatus: boolean;
  formFields: FormField[];
  verifiersList: VerifierLevel[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDeadline(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  return { label, isExpired: diff < 0, isExpiringSoon: diff <= 3 && diff >= 0 };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FormFillPage() {
  const params = useParams<{ formId: string }>();
  const router = useRouter();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload" | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ── Fetch form ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!params.formId) return;
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/form/getForm/${params.formId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
        setForm(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [params.formId]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const updateField = (id: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [id]: value }));

  const handleFileChange = (key: string, fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => ({ ...prev, [key]: Array.from(fileList) }));
  };

  // ── Canvas ──────────────────────────────────────────────────────────
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!ctx || !rect) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!ctx || !rect) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // ── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate required fields
    const missing = form?.formFields
      .filter((f) => f.required && !formData[f.id])
      .map((f) => f.label);

    if (missing && missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();

      // formId
      fd.append("formId", String(form!.id));

      // Build { fieldId: { label, value } } structure
      const enrichedFields: Record<string, { label: string; value: string | boolean }> = {};
      for (const field of form!.formFields) {
        if (field.type !== "file") {
          enrichedFields[field.id] = {
            label: field.label,
            value: formData[field.id] ?? "",
          };
        }
      }
      fd.append("fields", JSON.stringify(enrichedFields));

      // Append file fields prefixed with "file_"
      for (const [fieldId, fileList] of Object.entries(files)) {
        if (fileList.length > 0) {
          fd.append(`file_${fieldId}`, fileList[0]); // first file per field
        }
      }

      // Append signature
      if (signatureMode === "upload" && signatureFile) {
        fd.append("signature", signatureFile);
      } else if (signatureMode === "draw" && canvasRef.current) {
        // Convert canvas drawing to blob
        await new Promise<void>((resolve) => {
          canvasRef.current!.toBlob((blob) => {
            if (blob) fd.append("signature", blob, "signature.png");
            resolve();
          }, "image/png");
        });
      }

      const res = await fetch("/api/form/submitForm", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? "Submission failed");

      toast.success("Form submitted successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading form…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <p className="text-sm text-destructive font-medium">{error}</p>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (!form) return null;

  const deadline = formatDeadline(form.deadline);
  const isLocked = deadline.isExpired || !form.formStatus;

  // ── Preview ─────────────────────────────────────────────────────────
  if (showPreview) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-2xl font-bold">Preview: {form.title}</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Letterhead */}
            <div className="text-center border-b pb-4">
              <h2 className="font-heading text-lg font-bold">
                Indian Institute of Technology Ropar
              </h2>
              <p className="text-sm text-muted-foreground">रूपनगर, पंजाब – 140001</p>
              <p className="mt-1 font-heading text-sm font-semibold text-primary">
                {form.title}
              </p>
            </div>

            {/* Field values */}
            <div className="grid gap-4 sm:grid-cols-2">
              {form.formFields.map((field) => (
                <div
                  key={field.id}
                  className={field.type === "textarea" ? "sm:col-span-2" : ""}
                >
                  <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                  <p className="text-sm font-medium border-b border-dashed border-border pb-1 min-h-[1.5rem]">
                    {field.type === "checkbox"
                      ? formData[field.id] ? "Yes" : "No"
                      : String(formData[field.id] || "—")}
                  </p>
                </div>
              ))}
            </div>

            {/* Approval chain */}
            {form.verifiersList.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Approval Chain
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {form.verifiersList.map((v, i) => (
                    <div key={v.level} className="flex items-center gap-1">
                      <div className="rounded-lg border border-border px-2.5 py-1.5 text-xs">
                        <span className="font-semibold text-primary">L{v.level} · </span>
                        <span>{v.verifier.userName}</span>
                        <span className="text-muted-foreground"> · {v.verifier.department}</span>
                      </div>
                      {i < form.verifiersList.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Signature</p>
              <p className="text-sm">
                {signatureMode === "draw" ? "✔ Drawn signature provided" :
                  signatureMode === "upload" ? `✔ ${signatureFile?.name ?? "Uploaded"}` :
                    "Not provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Edit
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Submit
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{form.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{form.description}</p>
          <div className={`mt-2 inline-flex items-center gap-1.5 text-xs ${deadline.isExpired ? "text-rose-500" :
            deadline.isExpiringSoon ? "text-amber-500" :
              "text-muted-foreground"
            }`}>
            <Clock className="h-3.5 w-3.5" />
            <span>
              {deadline.isExpired
                ? `Deadline passed · ${deadline.label}`
                : deadline.isExpiringSoon
                  ? `Closing soon · ${deadline.label}`
                  : `Due ${deadline.label}`}
            </span>
          </div>
        </div>
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {!form.formStatus
            ? "This form is currently inactive and not accepting submissions."
            : "This form is closed and no longer accepting submissions."}
        </div>
      )}

      {/* Approval chain — read only for user, shows who will approve */}
      {form.verifiersList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Approval Chain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Your submission will be reviewed in the following order:
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {form.verifiersList.map((v, i) => (
                <div key={v.level} className="flex items-center gap-1.5">
                  <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                    <span className="font-semibold text-primary">Level {v.level} · </span>
                    <span className="font-medium">{v.verifier.userName}</span>
                    <Badge variant="outline" className="ml-1.5 text-[10px]">
                      {v.verifier.role}
                    </Badge>
                    <span className="ml-1 text-muted-foreground">
                      · {v.verifier.department}
                    </span>
                  </div>
                  {i < form.verifiersList.length - 1 && (
                    <span className="text-muted-foreground text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic fields */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {form.formFields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-sm">
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>

              {(field.type === "text" ||
                field.type === "email" ||
                field.type === "number" ||
                field.type === "date") && (
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={String(formData[field.id] || "")}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    className="mt-1"
                    disabled={isLocked}
                  />
                )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={String(formData[field.id] || "")}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="mt-1"
                  rows={3}
                  disabled={isLocked}
                />
              )}

              {field.type === "dropdown" && (
                <Select
                  value={String(formData[field.id] || "")}
                  onValueChange={(v) => updateField(field.id, v)}
                  disabled={isLocked}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={Boolean(formData[field.id])}
                    onCheckedChange={(v) => updateField(field.id, Boolean(v))}
                    disabled={isLocked}
                  />
                  <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              )}

              {field.type === "file" && (
                <div className="mt-1">
                  <Input
                    id={field.id}
                    type="file"
                    onChange={(e) => handleFileChange(field.id, e.target.files)}
                    disabled={isLocked}
                  />
                  {files[field.id] && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {files[field.id].map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Pen className="h-4 w-4" /> Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={signatureMode === "draw" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("draw")}
              disabled={isLocked}
            >
              Draw Signature
            </Button>
            <Button
              variant={signatureMode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setSignatureMode("upload")}
              disabled={isLocked}
            >
              Upload Signature
            </Button>
          </div>

          {signatureMode === "draw" && (
            <div>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full max-w-[400px] rounded-lg border border-border bg-card cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              />
              <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-2">
                Clear
              </Button>
            </div>
          )}

          {signatureMode === "upload" && (
            <div>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
              />
              {signatureFile && (
                <p className="mt-1 text-xs text-muted-foreground">{signatureFile.name}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={isLocked}
        >
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Button>
        <Button onClick={handleSubmit} disabled={submitting || isLocked}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLocked ? "Form Closed" : "Submit"}
        </Button>
      </div>

    </motion.div>
  );
}