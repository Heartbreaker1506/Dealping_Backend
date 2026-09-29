const fs = require('fs');
const readline = require('readline');
const { parseProductLink } = require('./src/services/linkParser.service');
const { fetchCurrentPrice: fetchShopee } = require('./src/services/shopeePriceService');
const { fetchCurrentPrice: fetchTikTok } = require('./src/services/tiktokPriceService');
const { fetchCurrentPrice: fetchLazada } = require('./src/services/lazadaPriceService');

async function bulkTest() {
  const filePath = 'links.txt';
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Không tìm thấy file ${filePath}. Vui lòng tạo file này và dán 100 link vào (mỗi dòng 1 link).`);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let total = 0;
  let successShopee = 0;
  let failShopee = 0;
  let successTikTok = 0;
  let failTikTok = 0;
  let successLazada = 0;
  let failLazada = 0;

  console.log("🚀 Đang bắt đầu kiểm tra hàng loạt...\n");

  for await (const line of rl) {
    const link = line.trim();
    if (!link) continue;
    
    total++;
    try {
      const parsed = await parseProductLink(link);
      let priceInfo = null;

      if (parsed.platform === 'SHOPEE') {
        priceInfo = await fetchShopee(parsed.itemId, parsed.shopId, parsed.resolvedUrl);
        if (priceInfo && priceInfo.price > 0) successShopee++;
        else failShopee++;
      } else if (parsed.platform === 'TIKTOK') {
        priceInfo = await fetchTikTok(parsed.resolvedUrl, null);
        if (priceInfo && priceInfo.price > 0) successTikTok++;
        else failTikTok++;
      } else if (parsed.platform === 'LAZADA') {
        priceInfo = await fetchLazada(parsed.resolvedUrl);
        if (priceInfo && priceInfo.price > 0) successLazada++;
        else failLazada++;
      }
      
      console.log(`[${parsed.platform}] ${link.substring(0, 50)}... -> Giá: ${priceInfo ? priceInfo.price : 0} đ`);
    } catch (e) {
      console.log(`[LỖI] ${link.substring(0, 50)}... -> ${e.message}`);
    }
  }

  console.log("\n========================================================");
  console.log("📊 KẾT QUẢ KIỂM TRA HÀNG LOẠT");
  console.log("========================================================");
  console.log(`Tổng số link đã kiểm tra: ${total}`);
  console.log(`- Shopee: ${successShopee} thành công, ${failShopee} thất bại.`);
  console.log(`- TikTok Shop: ${successTikTok} thành công, ${failTikTok} thất bại.`);
  console.log(`- Lazada: ${successLazada} thành công, ${failLazada} thất bại.`);
  console.log("========================================================");
  
  if (failTikTok > 0 || failLazada > 0) {
    console.log("⚠️ Chú ý: Các link TikTok và Lazada thất bại khả năng cao do API của addlivetag.com không hỗ trợ lấy giá hoặc không tìm thấy sản phẩm.");
  }
}

bulkTest();
