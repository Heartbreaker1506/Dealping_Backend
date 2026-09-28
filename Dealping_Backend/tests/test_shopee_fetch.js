const axios = require("axios");

async function testShopee() {
  const itemId = "23053826422";
  const shopId = "344823086";
  const url = "https://shopee.vn/Bh-%C3%81o-Tay-Ph%E1%BB%93ng-D%C3%A0i-C%E1%BB%95-Tr%C3%B2n-D%C3%A1ng-R%E1%BB%99ng-Vi%E1%BB%81n-G%E1%BB%97-vintage-Cho-N%E1%BB%AF-i.344823086.23053826422";

  console.log("--- 1. Testing Shopee Public API v4 ---");
  try {
    const res = await axios.get("https://shopee.vn/api/v4/item/get", {
      params: { itemid: itemId, shopid: shopId },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://shopee.vn/",
        "x-api-source": "rweb",
        "Accept": "application/json",
      },
      timeout: 5000,
    });
    console.log("v4 API Response data:", res.data);
  } catch (e) {
    console.log("v4 API Error:", e.response?.status, e.message);
  }

  console.log("--- 2. Testing Shopee PDP get_pc API ---");
  try {
    const res = await axios.get("https://shopee.vn/api/v4/pdp/get_pc", {
      params: { item_id: itemId, shop_id: shopId },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://shopee.vn/",
        "x-api-source": "rweb",
        "Accept": "application/json",
      },
      timeout: 5000,
    });
    console.log("PDP get_pc Response:", res.data?.data ? JSON.stringify(res.data.data).slice(0, 300) : res.data);
  } catch (e) {
    console.log("PDP get_pc Error:", e.response?.status, e.message);
  }

  console.log("--- 3. Testing Shopee HTML Scraping ---");
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      },
      timeout: 8000,
    });
    console.log("HTML status:", res.status, "length:", res.data?.length);
    const jsonLdMatches = res.data.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
    if (jsonLdMatches) {
      jsonLdMatches.forEach((m, idx) => console.log(`JSON-LD [${idx}]:`, m.slice(0, 200)));
    }
  } catch (e) {
    console.log("HTML Error:", e.response?.status, e.message);
  }
}

testShopee();
