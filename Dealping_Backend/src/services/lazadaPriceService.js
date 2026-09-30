const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm Lazada qua cộng đồng AddLiveTag
 * @param {string} url - URL sản phẩm Lazada
 */
async function fetchCurrentPrice(url = "") {
  const apiKey = process.env.ADDLIVETAG_API_KEY;
  if (!apiKey) {
    console.error("ADDLIVETAG_API_KEY is not set in environment variables");
    return { price: 0, productName: null, imageUrl: null, variants: [], flashSalePrice: null, cashbackCommission: 0, discountCodes: [] };
  }
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/lazada/product.php?url=${encodeURIComponent(url)}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price,
        productName: data.productInfo.productName,
        imageUrl: data.productInfo.imageUrl || data.productInfo.image || null,
        variants: data.productInfo.variants || [],
        flashSalePrice: data.productInfo.flashSalePrice || null,
        cashbackCommission: data.productInfo.cashbackCommission || 0,
        discountCodes: data.productInfo.discountCodes || [],
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá Lazada qua AddLiveTag:", err.message);
  }

  return {
    price: 0,
    productName: null,
    imageUrl: null,
    variants: [],
    flashSalePrice: null,
    cashbackCommission: 0,
    discountCodes: []
  };
}

module.exports = {
  fetchCurrentPrice
};
