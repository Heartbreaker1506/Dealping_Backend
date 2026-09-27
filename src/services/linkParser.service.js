const axios = require("axios");
const ApiError = require("../utils/ApiError");

const SHORT_LINK_HOSTS = ["shp.ee", "vn.shp.ee", "s.shopee.vn", "vt.tiktok.com", "s.lazada.vn", "shorten.asia"];

/**
 * Kiểm tra url có phải dạng rút gọn (vn.shp.ee/...) hay không.
 */
function isShortLink(url) {
  try {
    const { hostname } = new URL(url);
    return SHORT_LINK_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/**
 * Theo dõi chuỗi redirect (301/302) của link rút gọn để lấy ra link dài thật sự.
 * Không dùng axios({maxRedirects}) mặc định vì cần dừng lại đúng lúc lấy header Location,
 * tránh bị chặn bởi các bước redirect trung gian có thể trả về trang lỗi.
 */
async function resolveShortLink(shortUrl, maxHops = 5) {
  let currentUrl = shortUrl;

  for (let hop = 0; hop < maxHops; hop++) {
    const response = await axios.get(currentUrl, {
      maxRedirects: 0,
      timeout: 8000,
      validateStatus: (status) => (status >= 200 && status < 300) || (status >= 300 && status < 400),
      headers: { "User-Agent": "Mozilla/5.0 (DealPing-LinkResolver)" },
    });

    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      currentUrl = response.headers.location.startsWith("http")
        ? response.headers.location
        : new URL(response.headers.location, currentUrl).toString();
      continue;
    }

    // Không còn redirect nữa -> đây là link dài cuối cùng
    return currentUrl;
  }

  throw new ApiError(400, "Không thể phân giải link rút gọn Shopee (quá nhiều redirect)");
}

/**
 * Trích xuất itemId + shopId từ một link Shopee DẠNG DÀI.
 * Hỗ trợ 2 pattern phổ biến:
 *   1. https://shopee.vn/Ten-San-Pham-i.{shopId}.{itemId}
 *   2. https://shopee.vn/product/{shopId}/{itemId}
 */
function extractIdsFromLongUrl(longUrl) {
  // Pattern 1: ...-i.123456.789012(?query)
  const patternI = /-i\.(\d+)\.(\d+)(?:[/?#]|$)/;
  // Pattern 2: /product/123456/789012
  const patternProduct = /\/product\/(\d+)\/(\d+)/;

  let match = longUrl.match(patternI) || longUrl.match(patternProduct);

  if (!match) {
    return null;
  }

  const [, shopId, itemId] = match;
  return { shopId, itemId };
}

/**
 * Trích xuất tên sản phẩm từ URL đã phân giải (Shopee, Lazada, TikTok)
 */
function extractProductNameFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const hostname = parsed.hostname;

    // 1. Shopee: Pattern /Ten-san-pham-i.shopId.itemId
    const shopeeMatch = pathname.match(/^\/(.+)-i\.\d+\.\d+/);
    if (shopeeMatch) {
      return decodeURIComponent(shopeeMatch[1])
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();
    }

    // 2. Lazada
    if (hostname.includes("lazada")) {
      const matchSlug =
        url.match(/\/products\/([^/?#]+?)-i\d+/) ||
        url.match(/\/products\/([^/?#]+?)(?:-s\d+)?(?:\.html|\?|$|#)/) ||
        url.match(/\/products\/([^/?#]+)/);
      if (matchSlug) {
        return decodeURIComponent(matchSlug[1])
          .replace(/-/g, " ")
          .trim()
          .replace(/\b([a-zA-Z])/g, (l) => l.toUpperCase());
      }
      return "Sản phẩm Lazada";
    }

    // 3. TikTok
    if (hostname.includes("tiktok")) {
      const match = pathname.match(/\/view\/item\/(\d+)/) || pathname.match(/\/product\/([^/?#]+)/);
      return match ? "Sản phẩm TikTok Shop" : "Sản phẩm TikTok Shop";
    }

    if (hostname.includes("shopee") || /shp\.ee/.test(hostname)) {
      return "Sản phẩm Shopee";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Trích xuất giá từ tham số URL nếu có (ví dụ Lazada displayPrice)
 */
function extractPriceFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const match =
      url.match(/displayPrice%3A(\d+)/i) ||
      url.match(/displayPrice:(\d+)/i) ||
      url.match(/[?&]price=(\d+)/i);
    if (match) {
      const price = parseInt(match[1], 10);
      if (!isNaN(price) && price > 0) return price;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Entry point chính: nhận vào bất kỳ link Shopee nào (dài hoặc rút gọn),
 * trả về { itemId, shopId, resolvedUrl }.
 */
async function parseShopeeLink(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new ApiError(400, "shopeeUrl không hợp lệ");
  }

  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new ApiError(400, "shopeeUrl không đúng định dạng URL");
  }

  if (!/shopee|tiktok|lazada/.test(url.hostname) && !SHORT_LINK_HOSTS.includes(url.hostname)) {
    throw new ApiError(400, "Link không thuộc hệ thống Shopee, TikTok Shop hoặc Lazada");
  }

  const longUrl = isShortLink(rawUrl) ? await resolveShortLink(rawUrl) : rawUrl;
  const ids = extractIdsFromLongUrl(longUrl);

  if (!ids && !/tiktok|lazada/.test(longUrl)) {
    throw new ApiError(400, "Không trích xuất được itemId/shopId từ link này");
  }

  return {
    itemId: ids ? ids.itemId : null,
    shopId: ids ? ids.shopId : null,
    resolvedUrl: longUrl,
  };
}

module.exports = {
  isShortLink,
  resolveShortLink,
  extractIdsFromLongUrl,
  extractProductNameFromUrl,
  extractPriceFromUrl,
  parseShopeeLink,
};
