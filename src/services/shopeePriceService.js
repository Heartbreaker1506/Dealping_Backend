const axios = require("axios");
const ApiError = require("../utils/ApiError");

// LƯU Ý QUAN TRỌNG (đúng rủi ro #1 trong bản kế hoạch DealPing):
// Endpoint dưới đây là API public không chính thức của Shopee (v4/item/get),
// dùng tạm cho giai đoạn MVP. Về lâu dài PHẢI thay bằng Shopee Affiliate Open API
// chính thức để tránh bị chặn IP - xem lại mục V (Ma trận rủi ro) trong plan.
const SHOPEE_ITEM_ENDPOINT = "https://shopee.vn/api/v4/item/get";

/**
 * Gọi API lấy thông tin giá hiện tại của sản phẩm theo itemId + shopId.
 * Giá trả về từ Shopee là số nguyên đã nhân 100000 (đơn vị nhỏ nhất) -> cần chia lại.
 */
async function fetchCurrentPrice(itemId, shopId, url = "") {
  try {
    const { data } = await axios.get(SHOPEE_ITEM_ENDPOINT, {
      params: { itemid: itemId, shopid: shopId },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://shopee.vn/",
        "x-api-source": "rweb"
      },
      timeout: 5000,
    });
    const item = data?.data;
    // Bóc tách danh sách phân loại Màu/Size từ item.models của Shopee:
    const variants = item?.models?.map(m => m.name) || [];
    return {
      price: (item?.price || 0) / 100000,
      productName: item?.name || "Sản phẩm Shopee",
      variants: variants.length > 0 ? variants : ["Mặc định (Tất cả phân loại)"],
      // Chuẩn bị sẵn cấu trúc dữ liệu để khi Phúc có API Shopee Affiliate là bóc được:
      flashSalePrice: null, // Giá sập
      cashbackCommission: null, // Hoa hồng hoàn tiền
      discountCodes: [] // Mã giảm giá
    };
  } catch (err) {
    // Fallback nếu Shopee chặn: bóc tạm tên từ link
    let fallbackName = "Sản phẩm Shopee";
    try {
      const match = url.match(/shopee\.vn\/([^?]+?)-i\.\d+\.\d+/);
      if (match) {
        fallbackName = decodeURIComponent(match[1]).split('-').join(' ');
      }
    } catch(e) {}

    return {
      price: 0,
      productName: fallbackName,
      variants: ["Mặc định (Tất cả phân loại)", "Màu Đen", "Màu Trắng", "Size M", "Size L"],
      // Dự phòng cấu trúc
      flashSalePrice: null,
      cashbackCommission: null,
      discountCodes: []
    };
  }
}

module.exports = { fetchCurrentPrice };
