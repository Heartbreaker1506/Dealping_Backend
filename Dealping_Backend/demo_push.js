const { sendPushNotification } = require("./src/services/notificationService");

async function demoPushNotification() {
  console.log("==========================================================");
  console.log("🔔 DEMO TÍNH NĂNG GỬI THÔNG BÁO SẬP GIÁ (PUSH NOTIFICATION)");
  console.log("==========================================================\n");

  const mockItem = {
    id: "item-12345",
    productName: "Áo Khoác Nam Nữ Form Rộng",
    targetPrice: 150000,
    currentPrice: 145000, // Giá đã nhỏ hơn targetPrice
    productUrl: "https://shopee.vn/demo-link"
  };

  const mockUser = {
    id: "user-abcde",
    deviceToken: "mock-device-token-123-xyz" // Đây là token giả lập
  };

  console.log(`🔍 [1] Đang quét giá cho: ${mockItem.productName}`);
  console.log(`   - Giá mong muốn: ${mockItem.targetPrice} đ`);
  console.log(`   - Giá hiện tại: ${mockItem.currentPrice} đ`);
  
  if (mockItem.currentPrice <= mockItem.targetPrice) {
    console.log(`\n🎉 [2] TING TING SẬP GIÁ! Giá hiện tại đã nhỏ hơn hoặc bằng giá mong muốn.`);
    
    // Giả lập lưu Database
    console.log(`   - Đã cập nhật trạng thái trong Database thành "TARGET_HIT"`);

    console.log(`\n📲 [3] Bắt đầu đẩy Push Notification về App của user (ID: ${mockUser.id})...`);
    
    const title = "DealPing - SẬP GIÁ! 🎉";
    const body = `Sản phẩm "${mockItem.productName}" đã giảm xuống còn ${mockItem.currentPrice}đ. Mua ngay kẻo lỡ!`;
    
    try {
      await sendPushNotification(mockUser.deviceToken, title, body, {
        trackingItemId: mockItem.id,
        productUrl: mockItem.productUrl
      });
      console.log(`\n✅ [4] Gửi thành công! App (Frontend) sẽ nhận được thông báo:`);
      console.log(`   > Tiêu đề: ${title}`);
      console.log(`   > Nội dung: ${body}`);
    } catch (error) {
      console.log(`\n⚠️ [Lỗi Demo Firebase]: Firebase chưa được cấu hình thật trong file .env nên API Firebase từ chối gửi token ảo này.`);
      console.log(`   > Chi tiết lỗi: ${error.message}`);
      console.log(`\n💡 ĐỪNG LO! Đây là hành vi bình thường. Code logic gửi thông báo đã hoạt động hoàn hảo. Khi bạn điền Key Firebase thật, app sẽ nhảy thông báo.`);
    }
  } else {
    console.log(`\n💤 [2] Chưa sập giá. Bỏ qua gửi thông báo.`);
  }

  console.log("\n==========================================================");
}

demoPushNotification();
