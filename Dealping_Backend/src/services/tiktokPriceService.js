const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Lấy giá và thông tin sản phẩm TikTok qua ScraperAPI
 * @param {string} url - URL sản phẩm TikTok Shop
 * @param {string|number} itemId - Mã item (nếu có)
 */
async function fetchCurrentPrice(url = "", itemId = null) {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    console.error("SCRAPER_API_KEY is not set in environment variables");
    return defaultFallback();
  }

  try {
    const scraperUrl = `http://api.scrape.do?token=${apiKey}&url=${encodeURIComponent(url)}&super=true&render=true`;
    const { data: html } = await axios.get(scraperUrl, { timeout: 30000 });
    
    const $ = cheerio.load(html);
    let productName = "";
    let price = 0;
    let imageUrl = "";

    // 1. Get Title and Image from Meta tags
    productName = $('meta[property="og:title"]').attr('content') || $('title').text();
    if (productName && productName.includes(" - TikTok Shop Vietnam")) {
      productName = productName.replace(" - TikTok Shop Vietnam", "");
    }
    imageUrl = $('meta[property="og:image"]').attr('content') || "";

    // 2. Extract Price from __MODERN_ROUTER_DATA__
    const routerDataStr = $('#__MODERN_ROUTER_DATA__').text();
    if (routerDataStr) {
      try {
        const routerData = JSON.parse(routerDataStr);
        let foundPrice = null;
        function findPriceInRouter(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.real_price) { // "90.191₫"
             const clean = obj.real_price.toString().replace(/[^\d]/g, '');
             if (clean) {
                 foundPrice = parseInt(clean, 10);
                 return;
             }
          }
          if (obj.sale_price_format) {
             const clean = obj.sale_price_format.toString().replace(/[^\d]/g, '');
             if (clean) {
                 foundPrice = parseInt(clean, 10);
                 return;
             }
          }
          if (obj.price && obj.price.min_sku_price) {
             const clean = obj.price.min_sku_price.toString().replace(/[^\d]/g, '');
             if (clean) {
                 foundPrice = parseInt(clean, 10);
                 return;
             }
          }
          if (obj.sale_price_decimal) {
             foundPrice = parseFloat(obj.sale_price_decimal);
             return;
          }
          for (let k in obj) {
             if (foundPrice) return;
             if (typeof obj[k] === 'object') findPriceInRouter(obj[k]);
          }
        }
        findPriceInRouter(routerData);
        if (foundPrice) price = foundPrice;
      } catch (e) {}
    }
    
    const sigiMatch = html.match(/id="SIGI_STATE"\>(.*?)\<\/script\>/);
    if (sigiMatch && sigiMatch[1]) {
       try {
           const state = JSON.parse(sigiMatch[1]);
           if (state.ProductModule) {
               const p = state.ProductModule;
               if (p.title) productName = p.title;
               if (p.price && p.price.realPrice) price = parseFloat(p.price.realPrice);
               if (p.images && p.images[0]) imageUrl = p.images[0];
           }
       } catch (e) {}
    }

    if (!productName) {
      productName = $('meta[property="og:title"]').attr('content') || $('title').text();
      productName = productName.replace(/\| TikTok Shop$/, '').trim();
    }
    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr('content');
    }

    if (price > 0 || productName) {
      return {
        price: price || 0,
        productName: productName || "Không thể lấy tên sản phẩm",
        variants: [],
        flashSalePrice: null,
        cashbackCommission: 0,
        discountCodes: [],
        imageUrl: imageUrl || null,
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá TikTok qua ScraperAPI:", err.message);
  }

  return defaultFallback();
}

function defaultFallback() {
  return {
    price: 0,
    productName: "Không thể lấy tên sản phẩm",
    variants: [],
    flashSalePrice: null,
    cashbackCommission: 0,
    discountCodes: [],
    imageUrl: null
  };
}

module.exports = {
  fetchCurrentPrice
};
