# ZARA Fashion Product Scraper Chrome Extension

This Chrome extension extracts product information (such as name, image, price, and product link) from the **ZARA Fashion** website and displays the products in a popup. The extension also allows users to find similar products using the Google Custom Search API.

## Features

- Extracts product information from **ZARA Fashion**'s product pages.
- Displays the extracted products in a neat, easy-to-navigate popup.
- Redirect to the product page on clicking the product card.
- Enables users to search for similar products using Google’s Custom Search Engine.

## Prerequisites

1. Google Chrome browser.
2. Basic understanding of Chrome extensions.
3. Google API Key and Custom Search Engine (CSE) ID.

## Installation

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/your-repo/zara-product-scraper-extension.git
cd zara-product-scraper-extension
```

### 2. Load the Extension in Chrome

1. Open Chrome and navigate to chrome://extensions/.
2. Enable Developer mode (toggle in the top-right corner).
3. Click Load unpacked and select the folder where you cloned the extension.
4. The extension will appear in your list of installed extensions.

### 3. Setting Up Google Cloud Console and Custom Search Engine

You need to create a Google API Key and a Custom Search Engine (CSE) to enable the search functionality for similar products.

1. Create a Google Cloud API Key

   - Go to the Google Cloud Console (create account in it if you don't have) .
   - Select an existing project or create a new one.
   - Navigate to APIs & Services > Library.
   - Search for the Custom Search API and enable it for your project.
   - After enabling, go to APIs & Services > Credentials.
   - Click Create Credentials and choose API Key.
   - Copy the generated API key for later use.

2. Create a Google Custom Search Engine (CSE)

   - Go to Google Custom Search Engine.
   - Click New Search Engine.
   - Under Sites to Search, add Search the entire web (this allows Google to search on entire internet or you can add specific website also to search on the specific website).
   - Complete the rest of the fields and click Create.
   - Go to the Control Panel of the newly created search engine and copy the Search Engine ID (CX) for later use.

### 4. Configure the Extension with API Key and CX

- Open the popup.js file in the extension's folder.
- Locate the following lines:

```
const apiKey = "YOUR_GOOGLE_API_KEY"; // Replace with your Google API key
const cx = "YOUR_CUSTOM_SEARCH_ENGINE_ID"; // Replace with your Search Engine ID
```

- Replace "YOUR_GOOGLE_API_KEY" with the Google API Key you generated earlier.
- Replace "YOUR_CUSTOM_SEARCH_ENGINE_ID" with the CX ID of your Custom Search Engine.

## Usage and Testing Instructions

- After loading the extension, navigate to the ZARA Fashion website (https://www.zara.com).
- Browse to a page with product listings.
- Click on the extension icon in the Chrome toolbar.
- The extension will extract and display the product information in the popup.
- Each product will have a Find Similar button. Click it to search for similar products via Google Custom Search.

## Known Issues

- Missing Products Details: If some products details or whole product is not being extracted, this might be due to changes in the HTML structure of the ZARA Fashion website which will be some exceptional products or even due to the unavailability of the details on ZARA website only. Like the home page of zara only have advertizements so not product details over there.

- API Errors: Ensure that your API key and Custom Search Engine ID are correctly set. If your API quota exceeds, you may need to apply for a higher quota in the Google Cloud Console.

- Some product details in full page view is not visible because it is not present on the ZARA website only but when changing to multiple view we can have all the product details and other things.
