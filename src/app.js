const express = require("express");
const cors = require("cors");
const trackingItemsRoutes = require("./routes/trackingItems.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Khóa CORS server Render, chỉ cho phép web Netlify của Kiệt và localhost gọi vào
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Cấu hình link Netlify (VD: https://kiet-web.netlify.app) vào biến môi trường FRONTEND_URL trên Render
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8443"
    ];
    // Cho phép gọi không có origin (ví dụ: Postman) hoặc origin nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Access denied"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// API test giả lập sập giá để Kiệt test âm thanh chuông báo động trên web Netlify
app.get("/api/test/simulate-price-drop", (req, res) => {
  res.json({
    status: "success",
    isPriceDrop: true,
    message: "Báo động sập giá! Nút test gọi thành công.",
    data: {
      productName: "Chuột không dây Logitech (Test)",
      oldPrice: 350000,
      newPrice: 99000,
      flashSalePrice: 99000,
      cashbackCommission: 5000,
      discountCodes: ["GIAM99K", "FREESHIP"],
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
