/**
 * MOCK SERVICE: Extract TikTok Shop product name from URL and return mock data.
 * TikTok API is not integrated yet in MVP, so we fallback to URL parsing.
 */
function fetchTiktokInfo(url) {
  let productName = "Sản phẩm TikTok Shop";
  try {
    const match = url.match(/\/pdp\/([^?]+)/);
    if (match) {
      let raw = match[1].replace(/-\d{10,}$/, '');
      productName = raw.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  } catch (err) {
    console.error("TikTok name extraction error:", err.message);
  }

  return {
    price: 159000,
    productName,
    variants: ["Mặc định (Tất cả phân loại)"],
    flashSalePrice: null,
    cashbackCommission: null,
    discountCodes: []
  };
}

module.exports = { fetchTiktokInfo };
