-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "method" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "statusCode" INTEGER,
    "requestBody" JSONB,
    "requestHeaders" JSONB,
    "environment" TEXT NOT NULL,
    "tags" TEXT[],
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolution" TEXT,
    "additionalData" TEXT,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);
