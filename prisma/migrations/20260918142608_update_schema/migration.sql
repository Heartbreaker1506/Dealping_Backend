-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "tracking_item_id" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_history_tracking_item_id_timestamp_idx" ON "price_history"("tracking_item_id", "timestamp");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_tracking_item_id_fkey" FOREIGN KEY ("tracking_item_id") REFERENCES "tracking_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
