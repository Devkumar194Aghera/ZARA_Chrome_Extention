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
  const apiKey = "Replace with your Google API key"; // Replace with your Google API key
  const cx = "Replace with your Search Engine ID"; // Replace with your Search Engine ID
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
  // Get all elements containing product listings
  let allList = document.querySelectorAll(".product-grid__product-list");

  let V1Products = 0;
  let products = [];
  let seenImages = new Set();

  // Iterate over each product grid list
  allList.forEach((list) => {
    // Get all the <ul> elements with class 'product-grid-block-dynamic__row'
    const ulElements = list.querySelectorAll(
      "ul.product-grid-block-dynamic__row"
    );

    let index = 0;

    while (index + 2 < ulElements.length) {
      const imageUl = ulElements[index + 1]; // For images and links
      const namePriceUl = ulElements[index + 2]; // For names and prices

      // Check if there is any 'li' element with class 'product-grid-block-dynamic__spacer'
      // If so, skip this pair and move on
      if (
        imageUl.querySelector("li.product-grid-block-dynamic__spacer") ||
        namePriceUl.querySelector("li.product-grid-block-dynamic__spacer")
      ) {
        index++; // Skip to the next ul set
        continue;
      }

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

        // Ensure that the product is not added if its image has already been seen
        if (
          !seenImages.has(product.image) &&
          product.image !== "Image not found" &&
          product.link != "#"
        ) {
          seenImages.add(product.image); // Mark the image as seen
          products.push(product); // Add the product to the list
          V1Products++;
        }
      }

      // Move to the next set of ul elements
      index += 3;
    }

    // View 2 & 3: Product Extraction from Carousel/Other Views -----------------------------------------------
    let allGridProd = document.querySelectorAll(".product-grid-product");
    let allCarouselProd = document.querySelectorAll(
      ".product-secondary-product"
    );

    // Combine them into one array
    let productItems = Array.from(allCarouselProd).concat(
      Array.from(allGridProd)
    );

    // Iterate over the selected elements for other views
    productItems.forEach((item) => {
      const product = {};

      // Extract product details
      let nameElement = item.querySelector(".product-grid-product-info__name");

      if (!nameElement) {
        nameElement = item.querySelector(
          ".product-detail-secondary-product-info__detail-name"
        );
      }

      if (!nameElement) {
        nameElement = item.querySelector(
          ".product-grid-block-product-extended-info__name"
        );
      }

      let name = nameElement
        ? nameElement.textContent.trim()
        : "Name not found";
      product.name = name;

      const priceElement = item.querySelector(".money-amount__main");
      product.price = priceElement
        ? priceElement.textContent.trim()
        : "Price not found";

      const imageElement = item.querySelector("img.media-image__image");
      product.image = imageElement ? imageElement.src : "Image not found";

      const linkElement = item.querySelector("a.product-link");
      product.link = linkElement ? linkElement.href : "#";

      // Ensure that the product is not added if its image has already been seen
      if (
        !seenImages.has(product.image) &&
        product.image !== "Image not found" &&
        product.link != "#"
      ) {
        seenImages.add(product.image); // Mark the image as seen
        products.push(product);
      }
    });
  });

  return products;
}
