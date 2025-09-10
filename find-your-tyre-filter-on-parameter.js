/**
 * Feature: URL-based Product Filtering for Webflow CMS
 * Description: Dynamically filters product list based on query parameters (category, equipment, rim, size, pattern).
 * Author: Deepu Singh
 * Version: 1.1.0
 *
 * Use: Add query parameters in the URL (e.g. ?category=car&size=16) to auto-filter product cards on page load.
 * Location: Webflow "Products" page where all tyre products are listed (typically /products or /tyres).
 *
 * Notes:
 * - Requires each CMS item to have a `.product-data` element with data-category, data-equipment, data-rim, data-size, and data-pattern attributes.
 * - Each `.product-data` should be wrapped inside a `.collection-list-item` element.
 * - Displays the #no-results-message element if no products match.
 * - Uses a 200ms delay to wait for CMS content rendering (Webflow-specific behavior).
 */

(function () {
  // Safely decode URI components and handle '+' as space
  function safeDecode(str) {
    try {
      return decodeURIComponent(str.replace(/\+/g, " ")) || "";
    } catch (e) {
      return str;
    }
  }

  // Parse query parameters from URL
  function getQueryParameters() {
    const params = {};
    const queryString = window.location.search.substring(1);
    queryString.split("&").forEach(function (part) {
      if (!part) return;
      const item = part.split("=");
      const key = safeDecode(item[0]);
      const value = safeDecode(item[1] || "");
      if (value) {
        params[key] = value;
      }
    });
    return params;
  }

  // Normalize category strings for comparison
  function normalizeCategory(cat) {
    return cat
      .toLowerCase()
      .replace(/\s*\/\s*/g, "-") // Replace slashes with hyphen
      .replace(/\s+/g, "-") // Replace spaces with hyphen
      .replace(/[^a-z0-9\-]/g, ""); // Remove unwanted characters
  }

  // Check if attribute matches the selected value
  function attributeMatches(productAttr, selectedValue) {
    if (!selectedValue) return true;
    if (!productAttr) return false;
    const attrArr = productAttr.split(",").map((s) => s.trim());
    return attrArr.includes(selectedValue);
  }

  // Filter products based on parameters
  function filterProducts(params) {
    const products = document.querySelectorAll(".product-data");
    let anyVisible = false;

    products.forEach((productData) => {
      const parentItem = productData.closest(".collection-list-item");
      if (!parentItem) return;

      const cat = productData.getAttribute("data-category")?.trim() || "";
      const equip = productData.getAttribute("data-equipment")?.trim() || "";
      const rim = productData.getAttribute("data-rim")?.trim() || "";
      const size = productData.getAttribute("data-size")?.trim() || "";
      const pattern = productData.getAttribute("data-pattern")?.trim() || "";

      const normalizedCategories = cat
        .split(",")
        .map((c) => normalizeCategory(c));
      const matchCategory =
        params.category &&
        normalizedCategories.includes(normalizeCategory(params.category));

      const matchEquipment = attributeMatches(equip, params.equipment);
      const matchRim = attributeMatches(rim, params.rim);
      const matchSize = attributeMatches(size, params.size);
      const matchPattern = attributeMatches(pattern, params.pattern);

      const isVisible =
        (!params.category || matchCategory) &&
        matchEquipment &&
        matchRim &&
        matchSize &&
        matchPattern;

      if (isVisible) {
        parentItem.classList.remove("hidden");
        parentItem.style.display = "block"; // Show before animating
      } else {
        parentItem.classList.add("hidden");
        parentItem.addEventListener("transitionend", function handler() {
          parentItem.style.display = "none"; // Hide after animation ends
          parentItem.removeEventListener("transitionend", handler);
        });
      }

      if (isVisible) {
        anyVisible = true;
      }
    });

    const noResults = document.getElementById("no-results-message");
    if (noResults) {
      noResults.style.display = anyVisible ? "none" : "flex";
    }
  }

  // Apply filters when the page is loaded
  document.addEventListener("DOMContentLoaded", function () {
    const params = getQueryParameters();
    if (Object.keys(params).length > 0) {
      setTimeout(() => filterProducts(params), 200);
    }
  });
})();
