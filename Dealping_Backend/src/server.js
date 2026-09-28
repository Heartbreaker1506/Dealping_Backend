require("dotenv").config();
const app = require("./app");
const { startCronJobs } = require("./services/cronService");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DealPing backend đang chạy tại http://localhost:${PORT}`);
  // Khởi động cron jobs tự động lấy giá
  startCronJobs();
});
