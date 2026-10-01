const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Lấy giá và thông tin sản phẩm Shopee qua ScraperAPI
 * @param {string|number} itemId 
 * @param {string|number} shopId 
 * @param {string} url 
 * @returns 
 */
async function fetchCurrentPrice(itemId, shopId, url = "") {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    console.error("SCRAPER_API_KEY is not set in environment variables");
    return defaultFallback();
  }

  if (!url) {
    if (itemId && shopId) {
      url = `https://shopee.vn/product/${shopId}/${itemId}`;
    } else {
      return defaultFallback();
    }
  }

  try {
    const scraperUrl = `http://api.scrape.do?token=${apiKey}&url=${encodeURIComponent(url)}&super=true`;
    const { data: html } = await axios.get(scraperUrl, { timeout: 30000 });
    const $ = cheerio.load(html);
    
    let productName = "";
    let price = 0;
    let imageUrl = "";
    let variants = [];
    
    // Try application/ld+json
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json && json["@type"] === "Product") {
          if (json.name) productName = json.name;
          if (json.image) imageUrl = Array.isArray(json.image) ? json.image[0] : json.image;
          if (json.offers) {
            if (json.offers.price) {
              price = parseFloat(json.offers.price);
            } else if (json.offers.lowPrice) {
              price = parseFloat(json.offers.lowPrice);
            }
          }
        }
      } catch (e) {}
    });

    // Try finding shopee state (window.__SHOPEE_ITEM_V2__)
    const stateMatch = html.match(/window\.__SHOPEE_ITEM_V2__\s*=\s*({.*?});/);
    if (stateMatch && stateMatch[1]) {
      try {
        const state = JSON.parse(stateMatch[1]);
        const item = state.item;
        if (item) {
          if (!productName) productName = item.name;
          if (!price) price = item.price / 100000;
          if (!imageUrl && item.image) imageUrl = `https://cf.shopee.vn/file/${item.image}`;
        }
      } catch(e) {}
    }

    if (!price) {
      let minPrice = Infinity;
      $('*').each((i, el) => {
        const t = $(el).text().trim();
        if (t.length < 50) {
          const match = t.match(/(?:₫\s*([\d\.,]+)|([\d\.,]+)\s*[₫đ])/);
          if (match) {
            const numStr = match[1] || match[2];
            const p = parseInt(numStr.replace(/[^\d]/g, ''), 10);
            if (p > 1000 && p < minPrice) minPrice = p;
          }
        }
      });
      if (minPrice !== Infinity) price = minPrice;
    }
    
    if (!productName) {
      productName = $('meta[property="og:title"]').attr('content') || $('title').text();
      productName = productName.replace(/\| Shopee Việt Nam$/, '').trim();
    }
    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr('content');
    }

    if (price > 0 || productName) {
       return {
         price: price || 0,
         productName: productName || "Không thể lấy tên sản phẩm",
         imageUrl: imageUrl || null,
         isXtra: false,
         sellerComFinal: 0,
         variants: variants,
         flashSalePrice: null,
         cashbackCommission: 0,
         discountCodes: []
       };
    }
    
  } catch (err) {
    console.error("Lỗi khi lấy giá Shopee qua ScraperAPI:", err.message);
  }

  return defaultFallback();
}

function defaultFallback() {
  return {
    price: 0,
    productName: "Không thể lấy tên sản phẩm",
    imageUrl: null,
    isXtra: false,
    sellerComFinal: 0,
    variants: [],
    flashSalePrice: null,
    cashbackCommission: 0,
    discountCodes: []
  };
}

module.exports = { fetchCurrentPrice };
