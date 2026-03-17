import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formsService } from "@/lib/services";
import type { FormDefinition } from "@/lib/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Upload, Pen, ArrowLeft, Eye } from "lucide-react";

export default function FormFillPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload" | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!formId) return;
    formsService.getById(formId).then((data) => {
      setForm(data || null);
      setLoading(false);
    });
  }, [formId]);

  const updateField = (id: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (docName: string, fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => ({ ...prev, [docName]: Array.from(fileList) }));
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await formsService.submit({
        form_id: formId,
        fields: formData,
        files: Object.keys(files),
        has_signature: signatureMode !== null,
      });
      toast.success("Form submitted successfully!");
      navigate("/dashboard");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return <p className="py-12 text-center text-muted-foreground">Form not found.</p>;
  }

  // Preview mode
  if (showPreview) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-2xl font-bold">Preview: {form.form_name}</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="font-heading text-lg font-bold">Indian Institute of Technology Ropar</h2>
              <p className="text-sm text-muted-foreground">रूपनगर, पंजाब – 140001</p>
              <p className="mt-1 font-heading text-sm font-semibold text-primary">{form.form_name}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {form.fields.map((field) => (
                <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium border-b border-dashed border-border pb-1 min-h-[1.5rem]">
                    {String(formData[field.id] || "—")}
                  </p>
                </div>
              ))}
            </div>

            {form.required_documents.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Attached Documents</p>
                {form.required_documents.map((doc) => (
                  <p key={doc} className="text-sm">
                    {doc}: {files[doc]?.map((f) => f.name).join(", ") || "Not uploaded"}
                  </p>
                ))}
              </div>
            )}

            {form.signature_required && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Signature</p>
                <p className="text-sm">{signatureMode ? "✔ Provided" : "Not provided"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(false)}>Edit</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">{form.form_name}</h1>
          <p className="text-sm text-muted-foreground">{form.description}</p>
        </div>
      </div>

      {/* Dynamic Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.fields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-sm">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>

              {field.type === "text" || field.type === "email" || field.type === "number" || field.type === "date" ? (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={String(formData[field.id] || "")}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="mt-1"
                />
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={String(formData[field.id] || "")}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              ) : field.type === "dropdown" ? (
                <Select
                  value={String(formData[field.id] || "")}
                  onValueChange={(v) => updateField(field.id, v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "checkbox" ? (
                <div className="mt-1 flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={Boolean(formData[field.id])}
                    onCheckedChange={(v) => updateField(field.id, Boolean(v))}
                  />
                  <Label htmlFor={field.id} className="text-sm font-normal">{field.label}</Label>
                </div>
              ) : field.type === "file" ? (
                <Input
                  id={field.id}
                  type="file"
                  onChange={(e) => handleFileChange(field.id, e.target.files)}
                  className="mt-1"
                />
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      {form.required_documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Supporting Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.required_documents.map((doc) => (
              <div key={doc}>
                <Label className="text-sm">{doc}</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileChange(doc, e.target.files)}
                  className="mt-1"
                />
                {files[doc] && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {files[doc].map((f) => f.name).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Signature */}
      {form.signature_required && (
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
              >
                Draw Signature
              </Button>
              <Button
                variant={signatureMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setSignatureMode("upload")}
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
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="mr-2 h-4 w-4" /> Preview Final Form
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit
        </Button>
      </div>
    </motion.div>
  );
}
