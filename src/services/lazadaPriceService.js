const axios = require("axios");

/**
 * Fetch Lazada title and try to extract price from URL.
 * Lazada HTML is complex and heavily minified, so price might not be in HTML.
 */
async function fetchLazadaInfo(url) {
  let productName = "Sản phẩm Lazada";
  let price = 0;
  
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 5000
    });
    
    const html = res.data;
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      productName = titleMatch[1].split(' | ')[0];
      productName = productName.replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    }
  } catch (err) {
    console.error("Lazada fetch error:", err.message);
  }

  // Try to extract price from URL query (e.g., displayPrice%3A416000)
  const priceMatch = url.match(/displayPrice%3A(\d+)/) || url.match(/displayPrice:(\d+)/);
  if (priceMatch) {
    price = parseInt(priceMatch[1], 10);
  }

  return {
    price,
    productName,
    variants: ["Mặc định (Tất cả phân loại)"],
    flashSalePrice: null,
    cashbackCommission: null,
    discountCodes: []
  };
}

module.exports = { fetchLazadaInfo };
