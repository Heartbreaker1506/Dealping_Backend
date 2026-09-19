-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('TRACKING', 'TARGET_HIT', 'PAUSED', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "device_token" TEXT,
    "unlocked_slot_2" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_name" TEXT,
    "item_id" BIGINT,
    "shop_id" BIGINT,
    "original_price" DECIMAL(12,2),
    "target_price" DECIMAL(12,2) NOT NULL,
    "shopee_url" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'TRACKING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_items_user_id_item_id_key" ON "tracking_items"("user_id", "item_id");

-- AddForeignKey
ALTER TABLE "tracking_items" ADD CONSTRAINT "tracking_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
