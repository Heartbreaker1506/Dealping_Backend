const test = require("node:test");
const assert = require("node:assert");
const {
  isShortLink,
  extractIdsFromLongUrl,
  extractProductNameFromUrl,
  extractPriceFromUrl,
} = require("../src/services/linkParser.service");

test("isShortLink nhận diện đúng link rút gọn vn.shp.ee, tiktok và lazada", () => {
  assert.strictEqual(isShortLink("https://vn.shp.ee/abc123"), true);
  assert.strictEqual(isShortLink("https://shp.ee/abc123"), true);
  assert.strictEqual(isShortLink("https://vt.tiktok.com/ZSjR1/"), true);
  assert.strictEqual(isShortLink("https://s.lazada.vn/s.XyZ123"), true);
  assert.strictEqual(isShortLink("https://shopee.vn/San-pham-i.123.456"), false);
});

test("extractIdsFromLongUrl bóc tách đúng pattern -i.{shopId}.{itemId}", () => {
  const url = "https://shopee.vn/Tai-nghe-Bluetooth-Cao-Cap-i.123456.789012";
  const result = extractIdsFromLongUrl(url);
  assert.deepStrictEqual(result, { shopId: "123456", itemId: "789012" });
});

test("extractIdsFromLongUrl bóc tách đúng pattern -i.{shopId}.{itemId} có query string", () => {
  const url = "https://shopee.vn/San-pham-i.111.222?sp_atk=xyz&xptdk=abc";
  const result = extractIdsFromLongUrl(url);
  assert.deepStrictEqual(result, { shopId: "111", itemId: "222" });
});

test("extractIdsFromLongUrl bóc tách đúng pattern /product/{shopId}/{itemId}", () => {
  const url = "https://shopee.vn/product/333/444";
  const result = extractIdsFromLongUrl(url);
  assert.deepStrictEqual(result, { shopId: "333", itemId: "444" });
});

test("extractIdsFromLongUrl trả về null nếu link không đúng định dạng Shopee", () => {
  const url = "https://shopee.vn/some-random-page";
  const result = extractIdsFromLongUrl(url);
  assert.strictEqual(result, null);
});

test("extractProductNameFromUrl bóc tách đúng tên sản phẩm từ URL Shopee, Lazada, TikTok", () => {
  const shopeeUrl = "https://shopee.vn/Chuot-Khong-Day-Logitech-G304-Lightspeed-i.123.456";
  assert.strictEqual(extractProductNameFromUrl(shopeeUrl), "Chuot Khong Day Logitech G304 Lightspeed");

  const lazadaUrl = "https://www.lazada.vn/products/ban-phim-co-dareu-ek87-i539784851.html";
  assert.strictEqual(extractProductNameFromUrl(lazadaUrl), "Ban Phim Co Dareu Ek87");

  const tiktokUrl = "https://www.tiktok.com/view/item/123456789";
  assert.strictEqual(extractProductNameFromUrl(tiktokUrl), "Sản phẩm TikTok Shop");
});

test("extractPriceFromUrl bóc tách đúng giá từ URL Lazada", () => {
  const lazadaUrl = "https://www.lazada.vn/products/pdp-i123.html?displayPrice%3A14000&scm=1";
  assert.strictEqual(extractPriceFromUrl(lazadaUrl), 14000);
});
