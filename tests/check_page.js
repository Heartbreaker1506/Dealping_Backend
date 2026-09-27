const fs = require("fs");

const html = fs.readFileSync("shopee_page.html", "utf8");
const scripts = html.match(/<script[^>]*>(.*?)<\/script>/gs) || [];
console.log("Total scripts:", scripts.length);

scripts.forEach((s, idx) => {
  if (s.includes("application/ld+json")) {
    console.log(`=== JSON-LD [${idx}] ===`);
    console.log(s);
  }
});

// Search for any JSON state or pricing in html
const jsonMatches = html.match(/\{"props":\{.*?\}\}/s) || html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);
if (jsonMatches) {
  console.log("Found Initial state JSON!");
}

// Search for keywords
const lines = html.split("\n");
lines.forEach((line, i) => {
  if (/offers|lowPrice|highPrice|priceCurrency|"price":|itemOffered/i.test(line)) {
    console.log(`Line ${i}:`, line.slice(0, 300));
  }
});
