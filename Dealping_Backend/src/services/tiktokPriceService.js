const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm TikTok qua cộng đồng AddLiveTag
 * @param {string} url - URL sản phẩm TikTok Shop
 * @param {string|number} itemId - Mã item (nếu có)
 */
async function fetchCurrentPrice(url = "", itemId = null) {
  const apiKey = process.env.ADDLIVETAG_API_KEY || "d6a8444ee2905b22025df808705841ce5a0e5f168dc3f83b";
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/tiktok/product.php?url=${encodeURIComponent(url)}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price,
        productName: data.productInfo.productName,
        variants: ["Mặc định (Tất cả phân loại)"],
        flashSalePrice: null,
        cashbackCommission: Math.round((data.productInfo.price || 0) * 0.08),
        discountCodes: [],
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
