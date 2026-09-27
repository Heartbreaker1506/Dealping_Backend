const axios = require("axios");

async function run() {
  const itemId = "23053826422";
  const shopId = "344823086";
  const url = "https://shopee.vn/Bh-%C3%81o-Tay-Ph%E1%BB%93ng-D%C3%A0i-C%E1%BB%95-Tr%C3%B2n-D%C3%A1ng-R%E1%BB%99ng-Vi%E1%BB%81n-G%E1%BB%97-vintage-Cho-N%E1%BB%AF-i.344823086.23053826422";

  // Test 1: Mobile App API
  try {
    const res = await axios.get(`https://mall.shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`, {
      headers: {
        "User-Agent": "Shopee/3.15.20 (Android 12; Mobile)",
        "x-api-source": "rn",
        "Accept": "application/json",
      },
      timeout: 5000,
    });
    console.log("Mobile mall.shopee.vn status:", res.status, "data:", res.data);
  } catch (e) {
    console.log("Mobile mall.shopee.vn error:", e.response?.status, e.message);
  }

  // Test 2: Search by itemid
  try {
    const res = await axios.get("https://shopee.vn/api/v4/search/search_items", {
      params: { keyword: itemId, limit: 1, newest: 0, by: "relevancy", order: "desc", page_type: "search", scenario: "PAGE_GLOBAL_SEARCH", version: 2 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "x-api-source": "rweb",
        "Referer": "https://shopee.vn/search?keyword=" + itemId,
      },
      timeout: 5000,
    });
    console.log("Search API status:", res.status, "items count:", res.data?.items?.length);
    if (res.data?.items?.[0]?.item_basic) {
      const basic = res.data.items[0].item_basic;
      console.log("Found item in search!", {
        name: basic.name,
        price: basic.price / 100000,
        price_min: basic.price_min / 100000,
        price_max: basic.price_max / 100000,
        price_before_discount: basic.price_before_discount / 100000,
      });
    }
  } catch (e) {
    console.log("Search API error:", e.response?.status, e.message);
  }

  // Test 3: Search by Shop ID & Item ID or product title keywords
  try {
    const keywords = "Bh Áo Tay Phồng Dài Cổ Tròn Dáng Rộng Viền Gỗ vintage Cho Nữ";
    const res = await axios.get("https://shopee.vn/api/v4/search/search_items", {
      params: { keyword: keywords, limit: 5, newest: 0, by: "relevancy", order: "desc", page_type: "search", scenario: "PAGE_GLOBAL_SEARCH", version: 2 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "x-api-source": "rweb",
        "Referer": "https://shopee.vn/",
      },
      timeout: 5000,
    });
    console.log("Search by title status:", res.status, "items count:", res.data?.items?.length);
    if (res.data?.items) {
      const matched = res.data.items.find(i => String(i.item_basic?.itemid) === itemId || String(i.item_basic?.shopid) === shopId) || res.data.items[0];
      if (matched?.item_basic) {
        console.log("Matched item from Search API:", {
          name: matched.item_basic.name,
          price: matched.item_basic.price / 100000,
          price_min: matched.item_basic.price_min / 100000,
          price_before_discount: matched.item_basic.price_before_discount / 100000,
        });
      }
    }
  } catch (e) {
    console.log("Search by title error:", e.response?.status, e.message);
  }
}

run();
