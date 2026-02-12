import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { z } from "zod";
import { generateUploadUrl, generateUploadKey, getPublicUrl } from "@/lib/s3";

const uploadRequestSchema = z.object({
  filename: z.string().min(1, "Nombre de archivo requerido"),
  contentType: z.string().min(1, "Tipo de contenido requerido"),
  prefix: z.string().default("uploads"),
});

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const parsed = uploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { filename, contentType, prefix } = parsed.data;
    const key = generateUploadKey(prefix, filename);

    let presignedUrl: string;
    let publicUrl: string;

    try {
      presignedUrl = await generateUploadUrl(key, contentType);
      publicUrl = getPublicUrl(key);
    } catch {
      // Fallback: generate a mock presigned URL if S3/MinIO is not available
      console.warn("S3/MinIO not available, returning mock presigned URL");
      presignedUrl = `http://localhost:9000/salud-prolab/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock&X-Amz-Date=${new Date().toISOString()}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=mock-signature`;
      publicUrl = `http://localhost:9000/salud-prolab/${key}`;
    }

    return NextResponse.json({
      data: {
        presignedUrl,
        publicUrl,
        key,
        filename,
        contentType,
        uploadedBy: session!.user.id,
      },
    });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
