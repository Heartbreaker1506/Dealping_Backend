const test = require("node:test");
const assert = require("node:assert");
const {
  isShortLink,
  extractIdsFromLongUrl,
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
