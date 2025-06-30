-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('LOGIN_SUCCESS', 'EDIT_THEME', 'EDIT_IMAGE', 'EDIT_LANGAGE', 'EDIT_PASSWORD', 'RESET_PASSWORD', 'FORGOT_PASSWORD', 'LOGIN_FAILURE', 'USER_SIGNUP', 'PLAN_UPGRADE', 'PROFILE_UPDATE', 'DELETE_ACCOUNT', 'PAYMENT_SUCCESS', 'SESSION_TERMINATED', 'SESSIONS_TERMINATED', 'ADMIN_SESSION_TERMINATED', 'ADMIN_USER_SESSIONS_TERMINATED', 'UPLOADED_IMAGE', 'UPDATE_PROFILE_PICTURE', 'EMAIL_VERIFIED', 'VERIFICATION_EMAIL_SENT');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'DEV', 'MODERATOR', 'SUPERADMIN', 'MONITOR');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "action" "Actions" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceOs" TEXT NOT NULL,
    "deviceModel" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "authType" TEXT NOT NULL DEFAULT 'classic',
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_sessionId_idx" ON "Activity"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSession_token_key" ON "ClientSession"("token");

-- CreateIndex
CREATE INDEX "ClientSession_userId_idx" ON "ClientSession"("userId");

-- CreateIndex
CREATE INDEX "ClientSession_token_idx" ON "ClientSession"("token");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClientSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSession" ADD CONSTRAINT "ClientSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
