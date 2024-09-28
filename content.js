function extractProductInfo() {
  const name =
    document.querySelector("h1.product-name")?.innerText || "Not found";
  const price = document.querySelector("span.price")?.innerText || "Not found";
  const image = document.querySelector("img.product-image")?.src || "";
  return { name, price, image };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getProductInfo") {
    sendResponse(extractProductInfo());
  }
});
