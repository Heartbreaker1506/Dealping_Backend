const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm Lazada qua cộng đồng AddLiveTag
 * @param {string} url - URL sản phẩm Lazada
 */
async function fetchCurrentPrice(url = "") {
  const apiKey = process.env.ADDLIVETAG_API_KEY || "d6a8444ee2905b22025df808705841ce5a0e5f168dc3f83b";
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/lazada/product.php?url=${encodeURIComponent(url)}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price,
        productName: data.productInfo.productName,
        variants: ["Mặc định (Tất cả phân loại)"],
        flashSalePrice: null,
        cashbackCommission: Math.round((data.productInfo.price || 0) * 0.05), // Hoa hồng chuẩn
        discountCodes: [],
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá Lazada qua AddLiveTag:", err.message);
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
