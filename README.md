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
│   │   ├── shopeeLinkParser.js    # Module bóc tách link Shopee (dài + rút gọn)
│   │   ├── shopeePriceService.js  # Gọi API lấy giá hiện tại
│   │   └── trackingItems.service.js  # Nghiệp vụ + validation giới hạn slot
│   ├── middlewares/errorHandler.js
│   └── utils/
└── tests/
    └── shopeeLinkParser.test.js   # Test thuần logic, không cần network/DB
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

Test hiện tại kiểm tra `shopeeLinkParser` — bóc tách `itemId`/`shopId` từ cả link dài
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

## Lưu ý quan trọng — rủi ro kỹ thuật

`shopeePriceService.js` hiện gọi endpoint public không chính thức của Shopee
(`shopee.vn/api/v4/item/get`). Đây chỉ là giải pháp tạm cho MVP.

Theo đúng Ma trận rủi ro trong bản kế hoạch DealPing (rủi ro #1 — Shopee chặn IP
khi cào dữ liệu), **về lâu dài cần thay bằng Shopee Affiliate Open API chính thức**
+ proxy xoay vòng + caching. Khi Phúc đăng ký xong tài khoản Affiliate Partner,
chỉ cần thay nội dung hàm `fetchCurrentPrice` trong file này, phần còn lại của
hệ thống không cần đổi.

## Việc tiếp theo (chưa nằm trong scope hôm nay)

- Cron job `PriceCheckerService.runDailyCheck()` để check giá định kỳ + bắn FCM
  (đã có sẵn ở sequence diagram/ERD trong các lần trao đổi trước).
- Bảng `PriceHistory` để vẽ biểu đồ 90 ngày + phát hiện sale ảo.
