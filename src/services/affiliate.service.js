/**
 * Service to generate Affiliate Links for various platforms.
 */

/**
 * Generate AccessTrade Deep Link for TikTok Shop
 * @param {string} originalUrl The raw TikTok Shop URL
 * @returns {string} The affiliate deep link
 */
function generateTikTokAffiliateLink(originalUrl) {
  const pubId = process.env.ACCESSTRADE_PUB_ID;
  const campaignId = process.env.ACCESSTRADE_TIKTOK_CAMPAIGN_ID;

  if (!pubId || !campaignId) {
    console.warn('AccessTrade credentials are not configured in environment variables.');
    return originalUrl; // Fallback to original URL
  }

  const encodedUrl = encodeURIComponent(originalUrl);
  // Deep link format: https://go.isclix.com/deep_link/{pub_id}/{campaign_id}?url={encoded_url}&sub1=dealping
  const deepLink = `https://go.isclix.com/deep_link/${pubId}/${campaignId}?url=${encodedUrl}&sub1=dealping`;
  
  return deepLink;
}

/**
 * Generate Shopee Affiliate Link (Placeholder for now)
 * Wait for utm_source (an_...) to be provided by the user to replace it.
 * @param {string} originalUrl The raw Shopee URL
 * @returns {string} The affiliate deep link
 */
function generateShopeeAffiliateLink(originalUrl) {
  // TODO: Implement Shopee link generation once utm_source is provided.
  return originalUrl;
}

module.exports = {
  generateTikTokAffiliateLink,
  generateShopeeAffiliateLink
};
