const { describe, it } = require("node:test");
const assert = require("node:assert");
const { fetchCurrentPrice: fetchShopeePrice } = require("../src/services/shopeePriceService");
const { fetchCurrentPrice: fetchTikTokPrice, generateTikTokDeeplink, ACCESSTRADE_CONFIG } = require("../src/services/tiktokPriceService");
const { previewTrackingItem } = require("../src/services/trackingItems.service");

describe("1. Kiểm tra Shopee Price Service (Open API + Fallback thông minh)", () => {
  it("Không bao giờ trả về giá 0đ khi gọi itemId/shopId/URL bất kỳ", async () => {
    const testUrl = "https://shopee.vn/Tai-Nghe-Bluetooth-Khong-Day-i.123456.789012";
    const result = await fetchShopeePrice("789012", "123456", testUrl);

    console.log("\n[TEST RESULT] Shopee Price Info:", result);

    assert.ok(result.price > 0, "Giá phải lớn hơn 0");
    assert.strictEqual(typeof result.price, "number", "Giá phải là dạng số");
    assert.ok(result.productName.includes("Tai Nghe Bluetooth"), "Tên sản phẩm phải được bóc tách từ URL");
    assert.ok(Array.isArray(result.variants) && result.variants.length > 0, "Phải có danh sách phân loại variants");
    assert.ok(result.cashbackCommission > 0, "Hoa hồng cashback phải lớn hơn 0");
  });
});

describe("2. Kiểm tra TikTok Price Service + AccessTrade", () => {
  it("Cấu hình AccessTrade chứa đúng Key & Publisher ID của Phúc", () => {
    assert.strictEqual(ACCESSTRADE_CONFIG.API_KEY, "Q-1gz0bt4_eBxoTgIYSVv42-d47fKK0_");
    assert.strictEqual(ACCESSTRADE_CONFIG.PUBLISHER_ID, "7071757960571128506");
    assert.strictEqual(ACCESSTRADE_CONFIG.TIKTOK_CAMPAIGN_ID, "6648523843406889655");
  });

  it("Tạo được deeplink affiliate TikTok Shop và lấy giá + hoa hồng", async () => {
    const tiktokUrl = "https://www.tiktok.com/view/product/172948291048201";
    const deeplink = await generateTikTokDeeplink(tiktokUrl);
    console.log("\n[TEST RESULT] Generated TikTok Deeplink:", deeplink);

    assert.ok(deeplink.length > 0, "Deeplink không được rỗng");

    const tiktokInfo = await fetchTikTokPrice(tiktokUrl, "172948291048201");
    console.log("\n[TEST RESULT] TikTok Shop Price Info:", tiktokInfo);

    assert.ok(tiktokInfo.price > 0, "Giá TikTok Shop phải lớn hơn 0");
    assert.ok(tiktokInfo.offerLink.length > 0, "Phải có offerLink affiliate");
    assert.ok(tiktokInfo.cashbackCommission > 0, "Phải tính được cashbackCommission");
  });
});

describe("3. Kiểm tra previewTrackingItem tích hợp cả Shopee & TikTok", () => {
  it("Preview link Shopee trả về đủ tên, giá > 0 và biến thể", async () => {
    const res = await previewTrackingItem("https://shopee.vn/Ao-Thun-Cotton-Nam-Nu-i.8888.99999");
    console.log("\n[TEST RESULT] Preview Shopee Item:", res);
    assert.ok(res.currentPrice > 0);
    assert.ok(res.productName.length > 0);
  });

  it("Preview link TikTok Shop trả về đủ tên, giá > 0 và biến thể", async () => {
    const res = await previewTrackingItem("https://www.tiktok.com/view/product/172948291048201");
    console.log("\n[TEST RESULT] Preview TikTok Shop Item:", res);
    assert.ok(res.currentPrice > 0);
    assert.ok(res.productName.length > 0);
  });
});
