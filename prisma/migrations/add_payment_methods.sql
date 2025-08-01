-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'card', 'paypal', 'bank_account'
    "provider" TEXT NOT NULL, -- 'stripe', 'paypal', etc.
    "providerPaymentMethodId" TEXT NOT NULL, -- ID del método en el proveedor
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" TEXT, -- JSON con datos adicionales (últimos 4 dígitos, marca, etc.)
    "expiresAt" DATETIME, -- Para tarjetas
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");
CREATE INDEX "PaymentMethod_userId_isDefault_idx" ON "PaymentMethod"("userId", "isDefault");
CREATE UNIQUE INDEX "PaymentMethod_userId_provider_providerPaymentMethodId_key" ON "PaymentMethod"("userId", "provider", "providerPaymentMethodId");

