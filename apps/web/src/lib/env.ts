import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
    NEXTAUTH_SECRET: z.string().min(1).default("dev-secret"),
    S3_ENDPOINT: z.string().default("http://localhost:9000"),
    S3_ACCESS_KEY: z.string().default("minioadmin"),
    S3_SECRET_KEY: z.string().default("minioadmin123"),
    S3_BUCKET: z.string().default("saludprolab"),
    S3_REGION: z.string().default("us-east-1"),
    // Resend (email marketing)
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional().default("noreply@saludprolab.com"),
    RESEND_WEBHOOK_SECRET: z.string().optional(),
    // WhatsApp (Meta Cloud API)
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
    WHATSAPP_APP_SECRET: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !process.env.DATABASE_URL,
});
