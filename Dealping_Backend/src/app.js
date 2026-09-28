const express = require("express");
const cors = require("cors");
const trackingItemsRoutes = require("./routes/trackingItems.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// API test giả lập sập giá để test âm thanh chuông báo động trên web (Demo Trigger)
app.get("/api/test/simulate-price-drop", (req, res) => {
  const { productName, targetPrice } = req.query;
  const numTarget = Number(targetPrice);
  const hasTarget = !isNaN(numTarget) && numTarget > 0;

  const oldPrice = hasTarget ? Math.round(numTarget * 1.3) : 350000;
  const newPrice = hasTarget ? Math.round(numTarget * 0.8) : 99000;

  res.json({
    status: "success",
    isPriceDrop: true,
    message: "Báo động sập giá kích hoạt thành công.",
    data: {
      productName: productName || "Sản phẩm Shopee / TikTok Shop",
      oldPrice,
      newPrice,
      flashSalePrice: newPrice,
      cashbackCommission: Math.round(newPrice * 0.08),
      discountCodes: ["FREESHIP", "GIAM20K"],
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tracking-items", trackingItemsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
