document.addEventListener("DOMContentLoaded", function () {
  fetchProductData();
  setInterval(fetchProductData, 1000); // Fetch every 2 seconds
});

function fetchProductData() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: extractProductsInfo,
      },
      ([result]) => {
        if (result && result.result) {
          updateProductList(result.result);
        }
      }
    );
  });
}

function updateProductList(products) {
  const productListDiv = document.getElementById("product-list");
  productListDiv.innerHTML = ""; // Clear existing content

  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product-item";
    productDiv.innerHTML = `
        <a href="${product.link}" target="_blank" class="product-link">
          <div class="product-details">
            <img src="${product.image}" alt="${product.name}" class="product-image"/>
            <div class="product-info">
              <div class="product-title">${product.name}</div>
              <div class="product-price">${product.price}</div>
              <br>
              <button class="similar-products-btn" data-product-name="${product.name}">Find Similar</button>
            </div>
          </div>
        </a>
      `;
    productListDiv.appendChild(productDiv);
  });

  // Attach event listeners to the dynamically created buttons
  document.querySelectorAll(".similar-products-btn").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the link click
      const productName = button.getAttribute("data-product-name");
      fetchSimilarProducts(productName);
    });
  });
}

function fetchSimilarProducts(productName) {
  if (productName === "Name not found") return;
  const apiKey = "You Serach API key"; // Replace with your Google API key
  const cx = "You Engine ID"; // Replace with your Search Engine ID
  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=products+similar+to+${encodeURIComponent(
    productName
  )}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        displayResultsInPopup(data.items); // Display results in the popup
      } else {
        console.log("No similar products found.");
      }
    })
    .catch((error) => console.error("Error fetching similar products:", error));
}

// Function to display search results in the popup window
function displayResultsInPopup(searchResults) {
  const resultDiv = document.getElementById("similar-products");
  resultDiv.innerHTML = ""; // Clear existing content

  const similarHeading = document.getElementsByTagName("h3");
  similarHeading[0].innerHTML = "Similar Products";

  searchResults.forEach((result) => {
    const productTitle = result.title || "No title found";
    const productUrl = result.link || "#";
    const snippet = result.snippet || "";
    const productImage = result.image || "https://via.placeholder.com/150"; // Fallback image

    const productItem = document.createElement("div");
    productItem.className = "product-item";
    productItem.innerHTML = `
      <div class="product-info">
        <div class="product-title">${productTitle}</div>
        <div class="product-snippet">${snippet}</div>
        <br>
        <a href="${productUrl}" target="_blank" class="product-link visit-class">Visit</a>
      </div>
    `;
    resultDiv.appendChild(productItem);
  });
}

function extractProductsInfo() {
  let products = [];

  // View 1: Product Extraction from Grid Blocks ----------------------------------------------------------
  const allGrid = document.querySelectorAll(".products-category-grid-block");

  allGrid.forEach((grid) => {
    // Get all the <ul> elements with the class 'product-grid-block-dynamic__row'
    const ulElements = grid.querySelectorAll(
      "ul.product-grid-block-dynamic__row"
    );
    index = 0;
    // Ensure that there are at least two <ul> elements (one for images/links, one for name/price)
    while (ulElements.length < index)
      if (ulElements.length >= 3) {
        // Get the 2nd and 3rd <ul> elements (images/links, names/prices)
        const imageUl = ulElements[index + 1]; // For images and links
        const namePriceUl = ulElements[index + 2]; // For names and prices

        // Get all the <li> elements in both <ul>s
        const imageLis = imageUl.querySelectorAll("li");
        const namePriceLis = namePriceUl.querySelectorAll("li");

        // Iterate over both <li> elements in parallel
        for (let i = 0; i < imageLis.length && i < namePriceLis.length; i++) {
          const product = {};

          // Extract image and link from the image <li>
          const imageElement = imageLis[i].querySelector("img");
          const linkElement = imageLis[i].querySelector("a");

          product.image = imageElement ? imageElement.src : "Image not found";
          product.link = linkElement ? linkElement.href : "#";

          // Extract name and price from the name/price <li>
          const nameElement = namePriceLis[i].querySelector(
            ".product-grid-product-info__name"
          );
          const priceElement = namePriceLis[i].querySelector(
            ".money-amount__main"
          );

          product.name = nameElement
            ? nameElement.textContent.trim()
            : "Name not found";
          product.price = priceElement
            ? priceElement.textContent.trim()
            : "Price not found";

          // Add the product even if it has missing fields
          products.push(product);
        }
        index += 3;
      }
  });

  // View 2 & 3: Product Extraction from Carousel/Other Views -----------------------------------------------
  const productItems = document.querySelectorAll(
    ".carousel__item, .product-grid-product"
  );

  // Iterate over the selected elements for other views
  productItems.forEach((item) => {
    const product = {};

    // Extract product details
    let nameElement = item.querySelector(".product-grid-product-info__name");

    let name = nameElement ? nameElement.textContent.trim() : "Name not found";

    product.name = name;

    const priceElement = item.querySelector(".money-amount__main");
    product.price = priceElement
      ? priceElement.textContent.trim()
      : "Price not found";

    const imageElement = item.querySelector("img.media-image__image");
    product.image = imageElement ? imageElement.src : "Image not found";

    const linkElement = item.querySelector("a.product-link");
    product.link = linkElement ? linkElement.href : "#";

    // Create a unique identifier for the product (e.g., using the product name and price)
    const productId = `${product.name}-${product.price}`;

    // Add the product to the list if it hasn't been added already (no duplicates)

    products.push(product);
  });

  return products;
}
