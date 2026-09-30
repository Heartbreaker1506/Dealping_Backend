const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm TikTok qua cộng đồng AddLiveTag
 * @param {string} url - URL sản phẩm TikTok Shop
 * @param {string|number} itemId - Mã item (nếu có)
 */
async function fetchCurrentPrice(url = "", itemId = null) {
  const apiKey = process.env.ADDLIVETAG_API_KEY;
  if (!apiKey) {
    console.error("ADDLIVETAG_API_KEY is not set in environment variables");
    return { price: 0, productName: null, imageUrl: null, variants: [], flashSalePrice: null, cashbackCommission: 0, discountCodes: [] };
  }
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/tiktok/product.php?url=${encodeURIComponent(url)}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price,
        productName: data.productInfo.productName,
        variants: data.productInfo.variants || [],
        flashSalePrice: data.productInfo.flashSalePrice || null,
        cashbackCommission: data.productInfo.cashbackCommission || 0,
        discountCodes: data.productInfo.discountCodes || [],
        imageUrl: data.productInfo.imageUrl || null,
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá TikTok qua AddLiveTag:", err.message);
  }

  return {
    price: 0,
    productName: "Không thể lấy tên sản phẩm",
    variants: [],
    flashSalePrice: null,
    cashbackCommission: 0,
    discountCodes: []
  };
}

module.exports = {
  fetchCurrentPrice
};
