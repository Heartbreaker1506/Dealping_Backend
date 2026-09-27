const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm Shopee qua cộng đồng AddLiveTag (Bỏ qua 403)
 * @param {string|number} itemId 
 * @param {string|number} shopId 
 * @param {string} url 
 * @returns 
 */
async function fetchCurrentPrice(itemId, shopId, url = "") {
  const apiKey = process.env.ADDLIVETAG_API_KEY || "d6a8444ee2905b22025df808705841ce5a0e5f168dc3f83b";
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/product-data/product-data.php?item_id=${itemId}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price, // Giá thật
        productName: data.productInfo.productName,
        variants: ["Mặc định (Tất cả phân loại)"],
        flashSalePrice: null,
        cashbackCommission: Math.round((data.productInfo.price || 0) * 0.05),
        discountCodes: []
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá Shopee qua AddLiveTag:", err.message);
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

module.exports = { fetchCurrentPrice };
