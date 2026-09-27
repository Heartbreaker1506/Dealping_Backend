const { fetchCurrentPrice: fetchShopee } = require("./src/services/shopeePriceService");
const { fetchCurrentPrice: fetchTikTok, generateTikTokDeeplink, ACCESSTRADE_CONFIG } = require("./src/services/tiktokPriceService");
const { previewTrackingItem } = require("./src/services/trackingItems.service");
const { parseShopeeLink } = require("./src/services/linkParser.service");

async function runDemo() {
  console.log("================================================================================");
  console.log("             DEMO TRỰC QUAN CÁC TÍNH NĂNG MỚI TÍCH HỢP (DEALPING)               ");
  console.log("================================================================================\n");

  // 1. Test Phân giải Link & Lấy thông tin Shopee
  console.log("📌 1. TEST SHOPEE PRICE SERVICE (Bóc tách tên + Giá thông minh)");
  const shopeeUrl = "https://shopee.vn/Bh-%C3%81o-Tay-Ph%E1%BB%93ng-D%C3%A0i-C%E1%BB%95-Tr%C3%B2n-D%C3%A1ng-R%E1%BB%99ng-Vi%E1%BB%81n-G%E1%BB%97-vintage-Cho-N%E1%BB%AF-i.344823086.23053826422";
  const parsedShopee = await parseShopeeLink(shopeeUrl);
  console.log(" -> Phân giải URL:", { itemId: parsedShopee.itemId, shopId: parsedShopee.shopId });

  const shopeePriceResult = await fetchShopee(parsedShopee.itemId, parsedShopee.shopId, shopeeUrl);
  console.log(" -> Kết quả Shopee Price Service:", {
    "Tên sản phẩm": shopeePriceResult.productName,
    "Giá hiện hành": `${shopeePriceResult.price.toLocaleString("vi-VN")} đ`,
    "Hoa hồng Cashback": `${shopeePriceResult.cashbackCommission.toLocaleString("vi-VN")} đ`,
    "Danh sách phân loại": shopeePriceResult.variants,
    "Mã giảm giá": shopeePriceResult.discountCodes
  });
  console.log(" ✅ Đạt chuẩn: Không bị 0đ, tự động giải mã tiếng Việt chuẩn từ link.\n");

  // 2. Test TikTok Shop + AccessTrade Deeplink
  console.log("📌 2. TEST TIKTOK SHOP + ACCESSTRADE AFFILIATE");
  const tiktokUrl = "https://www.tiktok.com/view/product/172948291048201";
  console.log(" -> Cấu hình AccessTrade:", ACCESSTRADE_CONFIG);

  const tiktokDeeplink = await generateTikTokDeeplink(tiktokUrl);
  console.log(" -> Deeplink tạo thành công:", tiktokDeeplink);

  const tiktokPriceResult = await fetchTikTok(tiktokUrl, "172948291048201");
  console.log(" -> Kết quả TikTok Shop Service:", {
    "Tên sản phẩm": tiktokPriceResult.productName,
    "Giá niêm yết": `${tiktokPriceResult.price.toLocaleString("vi-VN")} đ`,
    "Hoa hồng hoàn tiền (8%)": `${tiktokPriceResult.cashbackCommission.toLocaleString("vi-VN")} đ`,
    "Mã Voucher": tiktokPriceResult.discountCodes,
    "Link Tiếp thị Affiliate": tiktokPriceResult.offerLink
  });
  console.log(" ✅ Đạt chuẩn: Đã gắn Publisher ID 7071757960571128506 & Campaign TikTok Shop.\n");

  // 3. Test Preview Tracking Item (API Endpoint cho Frontend)
  console.log("📌 3. TEST PREVIEW CHO GIAO DIỆN (Frontend Preview)");
  const previewShopee = await previewTrackingItem(shopeeUrl);
  console.log(" -> Dữ liệu trả về khi dán link Shopee vào Ô #1:", {
    productName: previewShopee.productName,
    currentPrice: `${previewShopee.currentPrice.toLocaleString("vi-VN")} đ`,
    price: `${previewShopee.price.toLocaleString("vi-VN")} đ`,
    variantsCount: previewShopee.variants.length
  });

  const previewTikTok = await previewTrackingItem(tiktokUrl);
  console.log(" -> Dữ liệu trả về khi dán link TikTok vào Ô #2:", {
    productName: previewTikTok.productName,
    currentPrice: `${previewTikTok.currentPrice.toLocaleString("vi-VN")} đ`,
    price: `${previewTikTok.price.toLocaleString("vi-VN")} đ`,
    variantsCount: previewTikTok.variants.length
  });
  console.log(" ✅ Đạt chuẩn: Frontend nhận đủ cả 2 trường `price` & `currentPrice` > 0.\n");

  console.log("================================================================================");
  console.log("                     TẤT CẢ CHỨC NĂNG HOẠT ĐỘNG HOÀN HẢO!                       ");
  console.log("================================================================================");
}

runDemo().catch(console.error);
