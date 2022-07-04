/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Webhook_token_key" ON "Webhook"("token");
