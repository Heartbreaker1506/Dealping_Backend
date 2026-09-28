# 📱 DealPing Frontend — Trợ Lý Săn Deal Đáy

<div align="center">

![DealPing Banner](https://img.shields.io/badge/DealPing-Trợ_Lý_Săn_Deal-ec4899?style=for-the-badge&logo=radar&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **"Dán link. Đặt giá mục tiêu. Radar quét 24/7 và hú chuông khi sàn sập giá!"**

</div>

---

## 📖 Giới Thiệu

**DealPing Frontend** là giao diện web app mobile-first mô phỏng trải nghiệm ứng dụng iOS hiện đại (Apple Glassmorphism / Dynamic Island). Ứng dụng giúp người tiêu dùng theo dõi biến động giá tự động trên các sàn thương mại điện tử hàng đầu (**Shopee**, **TikTok Shop**, **Lazada**), giải quyết triệt để nỗi đau bị "hớ giá", "sale ảo", và mất thời gian canh flash sale thủ công.

Sản phẩm được xây dựng trong khuôn khổ dự án **EXE101 — Khởi Nghiệp Đổi Mới Sáng Tạo (FA26)** tại Trường Đại học FPT.

---

## ✨ Tính Năng Nổi Bật

### 1. 📡 Radar Săn Deal Đáy 24/7 & Quét Đa Sàn (Shopee, TikTok Shop, Lazada)
- Quét giá tự động liên tục theo thời gian thực.
- Tự động nhận diện nền tảng khi người dùng dán bất kỳ link sản phẩm nào.
- Trích xuất tự động **Tên sản phẩm**, **Hình ảnh thật từ CDN**, và **Giá sale thực tế sau Voucher / Flash Sale**.

### 2. 🚨 Chuông Báo Động Sập Giá & Top Deals Xếp Hạng
- Nút tròn mini `🚨` trên radar kích hoạt chế độ quét các deal giảm sâu nhất thị trường.
- Tự động luân chuyển tuần tự các Top Deal sập sàn trên cả 3 nền tảng:
  - 🔵 **Lazada**: Tai Nghe Không Dây X55 Bluetooth 5.3 *(Giảm 54%)*
  - 🟠 **Shopee Mall**: Áo Tay Phồng Vintage Cho Nữ *(Giảm 28%)*
  - ⚫ **TikTok Shop**: Váy Yếm Jean Ngắn 2 Màu *(Giảm 18%)*
- Kèm âm thanh còi hụ báo động dồn dập (Web Audio API Synthesizer) và popup chốt đơn trực tiếp không qua trung gian.

### 3. 🫧 Gamification: Mini-game Bắn Bóng Mở Khóa Ô #2
- Giao diện bong bóng deal trôi nổi quanh Radar với hiệu ứng vật lý và âm thanh pop sinh động.
- Người dùng chạm nổ đủ **10 bong bóng** để tự tay mở khóa Ô theo dõi thứ 2 (Slot #2).

### 4. 🔔 Hệ Thống Thông Báo Đa Tầng Chuẩn iOS
- **iOS Push Banner**: Thanh thông báo đẩy trôi mượt từ đỉnh màn hình xuống (chuẩn Dynamic Island của iPhone).
- **Web Audio Siren Synthesizer**: Tự động tổng hợp âm thanh còi hụ khẩn cấp đa tầng (550Hz – 1250Hz) kết hợp chuông Ping điện tử.
- **Web Push Notification & Haptic**: Đồng bộ với hệ thống thông báo gốc của hệ điều hành và rung phản hồi trên thiết bị di động.

---

## 🛠️ Cấu Trúc Mã Nguồn

```
Dealping_Frontend/
├── src/
│   ├── App.tsx          # Toàn bộ logic giao diện, Web Audio, Radar, Real-time Link Resolver
│   ├── main.tsx         # Entry point React
│   ├── index.css        # Glassmorphism, animations và design system
│   └── assets/          # Logo và hình ảnh tĩnh
├── public/              # Favicon, robots.txt, PWA assets
├── package.json
└── vite.config.ts
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18.x trở lên
- **npm** hoặc `yarn` / `pnpm`

### Các Bước Thực Hiện

```bash
# 1. Di chuyển vào thư mục Frontend
cd Dealping_Frontend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo file cấu hình môi trường (.env)
echo "VITE_API_URL=http://localhost:3000" > .env

# 4. Khởi chạy dev server
npm run dev
```

Mở trình duyệt tại: `http://localhost:8443` hoặc `http://localhost:5173`

### Đóng Gói Bản Build Production

```bash
npm run build
```

---

## 👥 Đội Ngũ Phát Triển (Team DealPing - FA26)
- Dự án EXE101: Ứng Dụng Trợ Lý Săn Deal Sập Giá Đa Sàn TMĐT.
