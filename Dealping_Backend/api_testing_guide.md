# 🧪 Hướng dẫn Test API DealPing bằng Bruno

> **Base URL:** `http://localhost:3000`
> **Auth:** JWT Bearer Token (lấy từ bước đăng nhập)

---

## 🔑 Bước 0 — Lấy JWT Token (Bắt buộc trước khi test)

API `unlock-slot-2` cần JWT. Các API `tracking-items` hiện chưa yêu cầu auth nhưng cần `userId`.

### POST `/api/auth/verify-token`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/auth/verify-token` |
| **Headers** | `Content-Type: application/json` |

**Body (JSON):**
```json
{
  "idToken": "<Firebase ID Token từ client>"
}
```

**Response mẫu (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",   // ← COPY CÁI NÀY
  "user": {
    "id": "abc-123-uuid",                // ← VÀ COPY CÁI NÀY
    "email": "test@gmail.com",
    "unlockedSlot2": false
  }
}
```

> [!TIP]
> Trong Bruno, tạo **Environment Variable**:
> - `token` = giá trị `token` trả về
> - `userId` = giá trị `user.id` trả về
> - `baseUrl` = `http://localhost:3000`
>
> Sau đó dùng `{{token}}`, `{{userId}}`, `{{baseUrl}}` trong các request tiếp theo.

---

## 1️⃣ POST `/api/tracking-items` — Lưu món theo dõi

> Lưu sản phẩm Shopee kèm link. Server tự parse ra `itemId`, `shopId` và tên sản phẩm.

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{baseUrl}}/api/tracking-items` |
| **Headers** | `Content-Type: application/json` |

**Body (JSON):**
```json
{
  "userId": "{{userId}}",
  "shopeeUrl": "https://shopee.vn/product/123456/789012",
  "targetPrice": 150000
}
```

**Response thành công (201):**
```json
{
  "success": true,
  "data": {
    "id": "item-uuid-xxx",
    "userId": "abc-123-uuid",
    "productName": "Áo thun đen size L",
    "itemId": "789012",
    "shopId": "123456",
    "originalPrice": "199000.00",
    "targetPrice": "150000.00",
    "shopeeUrl": "https://shopee.vn/product/123456/789012",
    "status": "TRACKING",
    "selectedModelId": null,
    "variantName": null,
    "createdAt": "2026-09-19T..."
  }
}
```

### Các case lỗi cần test:

| Case | Expected |
|---|---|
| Thiếu `userId` / `shopeeUrl` / `targetPrice` | `400` — "Thiếu userId, shopeeUrl hoặc targetPrice" |
| `userId` không tồn tại | `404` — "Không tìm thấy user" |
| Đã theo dõi sản phẩm này rồi | `400` — "Bạn đã theo dõi sản phẩm này rồi" |
| Chưa unlock slot 2, tạo item thứ 2 | `400` — "Bạn đã đạt giới hạn 1 sản phẩm..." |
| Đã unlock slot 2, tạo item thứ 3 | `400` — "Bạn đã đạt giới hạn 2 sản phẩm..." |

---

## 2️⃣ PATCH `/api/users/unlock-slot-2` — Mở ô thứ 2

> Gọi khi user nổ đủ 10 bóng → mở khóa slot theo dõi thứ 2.
>
> ⚠️ **Cần JWT Token** trong header `Authorization`.

| Field | Value |
|---|---|
| **Method** | `PATCH` (hoặc `POST` đều được) |
| **URL** | `{{baseUrl}}/api/users/unlock-slot-2` |
| **Headers** | `Authorization: Bearer {{token}}` |

**Body:** Không cần body.

> [!IMPORTANT]
> Lưu ý: Route là `/api/users/unlock-slot-2` — **KHÔNG** có `:id` trên URL.
> Server tự lấy `userId` từ JWT token đã decode (`req.user.id`).

**Response lần đầu (200):**
```json
{
  "success": true,
  "message": "Chúc mừng! Bạn đã mở khóa thành công Ô theo dõi thứ 2."
}
```

**Response nếu đã unlock rồi (200):**
```json
{
  "success": true,
  "message": "Bạn đã mở khóa Ô số 2 từ trước rồi!"
}
```

### Các case lỗi cần test:

| Case | Expected |
|---|---|
| Không gửi header `Authorization` | `401` — "Bạn chưa đăng nhập hoặc token không đúng định dạng" |
| Token sai / giả | `401` — "Token không hợp lệ" |
| Token hết hạn (sau 7 ngày) | `401` — "Phiên đăng nhập đã hết hạn" |

---

## 3️⃣ DELETE `/api/tracking-items/:id` — Xóa món khi đổi món

> Xóa 1 sản phẩm đang theo dõi. Truyền `id` của item trên URL và `userId` trong body.

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `{{baseUrl}}/api/tracking-items/{{itemId}}` |
| **Headers** | `Content-Type: application/json` |

> Thay `{{itemId}}` bằng `id` trả về từ bước POST ở trên (ví dụ: `item-uuid-xxx`).

**Body (JSON):**
```json
{
  "userId": "{{userId}}"
}
```

**Response thành công:** `204 No Content` (không có body trả về)

### Các case lỗi cần test:

| Case | Expected |
|---|---|
| `id` không tồn tại | `404` — "Không tìm thấy item để xoá" |
| `id` của user khác (không phải mình) | `404` — "Không tìm thấy item để xoá" |

---

## 📋 Flow test đề xuất (theo thứ tự)

```
1. POST /api/auth/verify-token     → Lấy token + userId
2. POST /api/tracking-items        → Tạo item #1 ✅
3. POST /api/tracking-items        → Tạo item #2 ❌ (chưa unlock, bị chặn)
4. PATCH /api/users/unlock-slot-2  → Unlock slot 2 ✅
5. POST /api/tracking-items        → Tạo item #2 ✅ (đã unlock)
6. POST /api/tracking-items        → Tạo item #3 ❌ (hard cap = 2)
7. DELETE /api/tracking-items/:id  → Xóa item #1 ✅
8. POST /api/tracking-items        → Tạo item mới thay thế ✅
```

---

## 🔧 Cấu hình Environment trong Bruno

Tạo Environment **"Local"** với các variable:

| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:3000` |
| `token` | *(paste từ response login)* |
| `userId` | *(paste từ response login)* |

> [!NOTE]
> **Nếu chưa setup Firebase** để lấy `idToken`, có thể tạo JWT test thủ công bằng cách chạy trong Node.js:
> ```js
> const jwt = require("jsonwebtoken");
> const token = jwt.sign(
>   { id: "<userId trong DB>", email: "test@gmail.com", unlockedSlot2: false },
>   process.env.JWT_SECRET || "fallback_secret",
>   { expiresIn: "7d" }
> );
> console.log(token);
> ```
> Copy token này paste vào Bruno để test mà không cần Firebase.
