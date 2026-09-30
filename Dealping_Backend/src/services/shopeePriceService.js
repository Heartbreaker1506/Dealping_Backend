const axios = require("axios");

/**
 * Lấy giá và thông tin sản phẩm Shopee qua cộng đồng AddLiveTag (Bỏ qua 403)
 * @param {string|number} itemId 
 * @param {string|number} shopId 
 * @param {string} url 
 * @returns 
 */
async function fetchCurrentPrice(itemId, shopId, url = "") {
  const apiKey = process.env.ADDLIVETAG_API_KEY;
  if (!apiKey) {
    console.error("ADDLIVETAG_API_KEY is not set in environment variables");
    return { price: 0, productName: null, imageUrl: null, isXtra: false, sellerComFinal: 0, variants: [], flashSalePrice: null, cashbackCommission: 0, discountCodes: [] };
  }
  try {
    const { data } = await axios.get(`https://data.addlivetag.com/product-data/product-data.php?item_id=${itemId}&key=${apiKey}`, {
      timeout: 10000,
    });
    
    if (data && data.productInfo) {
      return {
        price: data.productInfo.price, // Giá thật
        productName: data.productInfo.productName,
        imageUrl: data.productInfo.imageUrl || null,
        isXtra: data.productInfo.isXtra,
        sellerComFinal: data.productInfo.sellerComFinal,
        variants: data.productInfo.variants || [],
        flashSalePrice: data.productInfo.flashSalePrice || null,
        cashbackCommission: data.productInfo.cashbackCommission || 0,
        discountCodes: data.productInfo.discountCodes || []
      };
    }
  } catch (err) {
    console.error("Lỗi khi lấy giá Shopee qua AddLiveTag:", err.message);
  }

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
