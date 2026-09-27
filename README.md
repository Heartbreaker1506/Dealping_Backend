# DealPing Backend

Backend cho DealPing (EXE101) — Express.js + PostgreSQL (Prisma ORM).

## Cấu trúc

```
dealping-backend/
├── prisma/
│   └── schema.prisma          # Users, TrackingItems (database siêu nhẹ)
├── src/
│   ├── app.js                 # Khởi tạo Express app + middleware
│   ├── server.js              # Entry point
│   ├── config/prisma.js       # Prisma client singleton
│   ├── routes/                # Định nghĩa route
│   ├── controllers/           # Xử lý request/response
│   ├── services/
│   │   ├── linkParser.service.js    # Module bóc tách link Shopee (dài + rút gọn)
│   │   ├── shopeePriceService.js  # Gọi API lấy giá hiện tại
│   │   └── trackingItems.service.js  # Nghiệp vụ + validation giới hạn slot
│   ├── middlewares/errorHandler.js
│   └── utils/
└── tests/
    └── linkParser.service.test.js   # Test thuần logic, không cần network/DB
```

## Cài đặt

```bash
npm install
cp .env.example .env
# sửa DATABASE_URL trong .env trỏ tới PostgreSQL của bạn

npx prisma migrate dev --name init   # tạo bảng users, tracking_items
npx prisma generate
npm run dev                          # chạy tại http://localhost:3000
```

## Chạy test (không cần DB)

```bash
npm test
```

Test hiện tại kiểm tra `linkParser.service` — bóc tách `itemId`/`shopId` từ cả link dài
(`shopee.vn/...-i.{shopId}.{itemId}`) lẫn nhận diện đúng link rút gọn (`vn.shp.ee/...`).

## API

### `POST /api/tracking-items`
Tạo item theo dõi giá mới.

```json
{
  "userId": "uuid-của-user",
  "shopeeUrl": "https://shopee.vn/San-pham-i.123456.789012",
  "targetPrice": 199000
}
```

- Trả về **400** nếu user đã đạt giới hạn slot (mặc định 1, `unlockedSlot2=true` thì 2).
- Trả về **400** nếu không bóc tách được itemId/shopId từ link.
- Tự động gọi Shopee lấy giá hiện tại để lưu vào `originalPrice` (không chặn tạo item nếu Shopee tạm lỗi).

### `GET /api/tracking-items?userId=...`
Danh sách item đang theo dõi của user.

### `DELETE /api/tracking-items/:id`
Xoá 1 item (body cần `userId` để xác thực quyền sở hữu).

### `GET /api/test/simulate-price-drop`
API giả lập sập giá phục vụ pitch/demo và kiểm thử âm thanh báo động trên web client.

**Response mẫu (200):**
```json
{
  "status": "success",
  "isPriceDrop": true,
  "message": "Báo động sập giá! Nút test gọi thành công.",
  "data": {
    "productName": "Chuột không dây Logitech (Test)",
    "oldPrice": 350000,
    "newPrice": 99000,
    "flashSalePrice": 99000,
    "cashbackCommission": 5000,
    "discountCodes": ["GIAM99K", "FREESHIP"],
    "timestamp": "2026-09-23T..."
  }
}
```

## Lưu ý quan trọng — Rủi ro kỹ thuật & Q&A Defense

1. **Hệ thống THẬT 100%:**
   - **Luồng dữ liệu:** Frontend $\to$ Backend Express $\to$ PostgreSQL qua Prisma ORM.
   - **Cron job ngầm:** `cronService.js` tự động quét mỗi 30 phút (`*/30 * * * *`), lưu biến động vào bảng `PriceHistory` và chuyển trạng thái `TARGET_HIT` khi đạt giá mục tiêu.
   - **Trích xuất link:** `linkParser.service.js` bóc tách `itemId`, `shopId` và tên sản phẩm từ URL thật (Shopee, Lazada, TikTok Shop).

2. **Cơ chế Fallback & Demo Trigger:**
   - `shopeePriceService.js` hiện gọi endpoint của Shopee. Khi chạy trên cloud, Shopee kích hoạt tường lửa chống bot (WAF/Cloudflare) chặn IP. Hệ thống xử lý theo hướng **Graceful Degradation**: tự động bóc tách tên sản phẩm từ URL slug để lưu vào DB và tiếp tục theo dõi thay vì gián đoạn. Về lâu dài sẽ tích hợp Shopee Affiliate Open API chính thức.
   - `GET /api/test/simulate-price-drop` hỗ trợ nhận query `productName` và `targetPrice` để phục vụ **Smart Demo Trigger** khi thuyết trình 5 phút trên lớp học, giúp mô phỏng chuẩn xác sự kiện sập giá cho đúng món đang theo dõi.
