import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FieldValue {
    label: string;
    value: string | boolean;
}

// ── File upload helper ────────────────────────────────────────────────────────
async function saveFile(file: File, submissionId: string): Promise<string> {
    const uploadDir = join(process.cwd(), "public", "uploads", submissionId);

    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Return public URL path
    return `/uploads/${submissionId}/${filename}`;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        // ── Auth ────────────────────────────────────────────────────────
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Please sign in.",
            }, { status: 401 });
        }

        const userId = session.user.id;

        // ── Parse multipart form data ────────────────────────────────────
        const formDataRaw = await req.formData();

        const formIdRaw = formDataRaw.get("formId");
        const fieldsRaw = formDataRaw.get("fields");   // JSON string
        const signatureRaw = formDataRaw.get("signature"); // File | null

        // ── Validate inputs ──────────────────────────────────────────────
        if (!formIdRaw || !fieldsRaw) {
            return NextResponse.json({
                success: false,
                message: "formId and fields are required.",
            }, { status: 400 });
        }

        const formId = parseInt(formIdRaw.toString());

        if (isNaN(formId)) {
            return NextResponse.json({
                success: false,
                message: "Invalid form ID.",
            }, { status: 400 });
        }

        // ── Check form exists and is active ─────────────────────────────
        const form = await prisma.form.findUnique({
            where: { id: formId },
            select: {
                id: true,
                title: true,
                formStatus: true,
                deadline: true,
                formFields: true,
                verifiersList: {
                    orderBy: { level: "asc" },
                    select: { level: true },
                },
            },
        });

        if (!form) {
            return NextResponse.json({
                success: false,
                message: "Form not found.",
            }, { status: 404 });
        }

        if (!form.formStatus) {
            return NextResponse.json({
                success: false,
                message: "This form is currently inactive.",
            }, { status: 403 });
        }

        if (new Date() > new Date(form.deadline)) {
            return NextResponse.json({
                success: false,
                message: "The deadline for this form has passed.",
            }, { status: 403 });
        }

        // ── Check for duplicate submission ───────────────────────────────
        const existing = await prisma.formSubmissions.findFirst({
            where: { userId, formId },
        });

        if (existing) {
            return NextResponse.json({
                success: false,
                message: "You have already submitted this form.",
            }, { status: 409 });
        }

        // ── Parse fields JSON ────────────────────────────────────────────
        let fields: Record<string, FieldValue>;
        try {
            fields = JSON.parse(fieldsRaw.toString());
        } catch {
            return NextResponse.json({
                success: false,
                message: "Invalid fields format. Expected JSON.",
            }, { status: 400 });
        }

        // ── Validate required fields against formFields schema ───────────
        const formFields = form.formFields as Array<{
            id: string;
            label: string;
            required: boolean;
            type: string;
        }>;

        const missingRequired = formFields
            .filter((f) => f.required && f.type !== "file")
            .filter((f) => {
                const val = fields[f.id]?.value;
                return val === undefined || val === null || val === "";
            })
            .map((f) => f.label);

        if (missingRequired.length > 0) {
            return NextResponse.json({
                success: false,
                message: `Missing required fields: ${missingRequired.join(", ")}`,
            }, { status: 400 });
        }

        // ── Create submission record first (need ID for file paths) ──────
        const submission = await prisma.formSubmissions.create({
            data: {
                userId,
                formId,
                formData: fields,   // saved as-is, files added below
                currentLevel: form.verifiersList[0]?.level ?? 1,
                overallStatus: "Pending",
            },
        });

        // ── Handle file uploads ──────────────────────────────────────────
        const fileUrls: Record<string, string> = {};

        // Collect all file fields from formData (fieldId prefixed with "file_")
        for (const [key, value] of formDataRaw.entries()) {
            if (key.startsWith("file_") && value instanceof File && value.size > 0) {
                const fieldId = key.replace("file_", "");
                const url = await saveFile(value, submission.id);
                fileUrls[fieldId] = url;
            }
        }

        // Handle signature separately
        let signatureUrl: string | null = null;
        if (signatureRaw instanceof File && signatureRaw.size > 0) {
            signatureUrl = await saveFile(signatureRaw, submission.id);
        }

        // ── Merge file URLs into formData and update ─────────────────────
        const enrichedFields: Record<string, FieldValue | { label: string; value: string; url: string }> = {
            ...fields,
        };

        for (const [fieldId, url] of Object.entries(fileUrls)) {
            const matchedField = formFields.find((f) => f.id === fieldId);
            enrichedFields[fieldId] = {
                label: matchedField?.label ?? fieldId,
                value: url,      // store the file URL as the value
                url,
            };
        }

        // Update submission with file URLs + signature merged in
        const updatedSubmission = await prisma.formSubmissions.update({
            where: { id: submission.id },
            data: {
                formData: {
                    ...enrichedFields,
                    ...(signatureUrl && {
                        __signature__: {
                            label: "Signature",
                            value: signatureUrl,
                            url: signatureUrl,
                        },
                    }),
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Form submitted successfully.",
            data: {
                submissionId: updatedSubmission.id,
                overallStatus: updatedSubmission.overallStatus,
                currentLevel: updatedSubmission.currentLevel,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error("[POST /api/form/submitForm]", error);
        return NextResponse.json({
            success: false,
            message: error.message ?? "Internal server error.",
        }, { status: 500 });
    }
}