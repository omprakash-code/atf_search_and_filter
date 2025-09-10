// Author: Omprakash Kumar
// Version: 1.1
// Dependencies: None (vanilla JS), expects proper data-* attributes in HTML as provided

document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("categorySelect");
  const applicationSelect = document.getElementById("applicationSelect");
  const tyreSizeSelect = document.getElementById("tyreSizeSelect");
  const rimSizeSelect = document.getElementById("rimSizeSelect");
  const traCodeSelect = document.getElementById("traCodeSelect");
  const patternSelect = document.getElementById("patternSelect");
  const productCount = document.getElementById("productCount");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  let hasInteracted = false;
  let filteredProducts;

  const allProducts = Array.from(document.querySelectorAll(".product-data"));
  console.log("Total products loaded:", allProducts.length);

  function getSelectedFilters() {
    return {
      category: categorySelect.value,
      application: applicationSelect.value,
      size: tyreSizeSelect.value,
      rim: rimSizeSelect.value,
      traCode: traCodeSelect.value,
      pattern: patternSelect.value,
    };
  }

  function filterProducts() {
    const filters = getSelectedFilters();
    console.log("Current filters:", filters);

    return allProducts.filter((product) => {
      if (filters.category && product.dataset.category !== filters.category)
        return false;
      if (
        filters.application &&
        product.dataset.equipment !== filters.application
      )
        return false;
      if (
        filters.size &&
        !product.dataset.size.split(",").includes(filters.size)
      )
        return false;
      if (filters.rim && !product.dataset.rim.split(",").includes(filters.rim))
        return false;
      if (filters.traCode && product.dataset.tracode !== filters.traCode)
        return false;
      if (filters.pattern && product.dataset.pattern !== filters.pattern)
        return false;
      return true;
    });
  }

  // Updated updateCounts function to accept optional pre-counted value
  function updateCounts(filteredProducts, initialVisibleCount = null) {
    let visibleCount;

    if (initialVisibleCount !== null) {
      // Use initial visible count on page load
      visibleCount = initialVisibleCount;
    } else {
      // Use filtered products count after user interaction
      visibleCount = filteredProducts.length;
    }

    const totalProducts = allProducts.length;
    productCount.textContent = `Showing ${visibleCount} of ${totalProducts} products`;
    console.log("Updated product count:", visibleCount);
  }
  // Instead, just update count based on current visible patterns after small delay
  function updateInitialVisibleCount() {
    const visibleCount = Array.from(
      document.querySelectorAll(".collection-list-item")
    ).filter((item) => !item.classList.contains("hidden")).length;

    const totalProducts = allProducts.length;
    productCount.textContent = `Showing ${visibleCount} of ${totalProducts} products`;
    console.log("Initial visible product count:", visibleCount);
  }

  // Run after short delay to let Webflow finish rendering
  setTimeout(updateInitialVisibleCount, 200);

  function getUniqueOptions(filteredProducts, key) {
    const optionSet = new Set();
    filteredProducts.forEach((product) => {
      if (product.dataset[key]) {
        if (key === "size" || key === "rim" || key === "equipment") {
          product.dataset[key].split(",").forEach((val) => {
            val = val.trim();
            if (val) optionSet.add(val);
          });
        } else {
          const val = product.dataset[key].trim();
          if (val) optionSet.add(val);
        }
      }
    });
    return Array.from(optionSet);
  }

  function sortNumericOptions(options) {
    return options.sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  }

  function populateSelect(selectElement, options, currentValue, sortFn = null) {
    const defaultText = selectElement.options[0]?.text || "Select option";
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultText;
    selectElement.appendChild(defaultOption);

    if (sortFn) {
      options = sortFn(options);
    }

    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });

    if (currentValue && options.includes(currentValue)) {
      selectElement.value = currentValue;
    } else {
      selectElement.value = "";
    }
  }

  function updateSelectOptions(filteredProducts) {
    const filters = getSelectedFilters();

    console.log("Updating selects based on filtered products");

    // Always show all category options, don't filter them based on selection
    const allCategories = getUniqueOptions(allProducts, "category");
    populateSelect(categorySelect, allCategories, filters.category);

    // Other selects filtered based on current selection
    const applications = getUniqueOptions(filteredProducts, "equipment");
    const sizes = getUniqueOptions(filteredProducts, "size");
    const rims = getUniqueOptions(filteredProducts, "rim");
    const traCodes = getUniqueOptions(filteredProducts, "tracode");
    const patterns = getUniqueOptions(filteredProducts, "pattern");

    populateSelect(applicationSelect, applications, filters.application);
    populateSelect(
      tyreSizeSelect,
      sortNumericOptions(sizes),
      filters.size,
      sortNumericOptions
    );
    populateSelect(
      rimSizeSelect,
      sortNumericOptions(rims),
      filters.rim,
      sortNumericOptions
    );
    populateSelect(traCodeSelect, traCodes, filters.traCode);
    populateSelect(patternSelect, patterns, filters.pattern, (opts) => {
      return opts.sort((a, b) => {
        const serialA =
          parseFloat(
            allProducts.find((p) => p.dataset.pattern === a)?.dataset.serialno
          ) || Infinity;
        const serialB =
          parseFloat(
            allProducts.find((p) => p.dataset.pattern === b)?.dataset.serialno
          ) || Infinity;
        return serialA - serialB;
      });
    });
  }

  function updateProductVisibility(filteredProducts) {
    console.log("Updating product visibility");
    allProducts.forEach((product) => {
      const container = product.closest(".collection-list-item");
      if (!container) return;
      if (hasInteracted) {
        container.style.display = filteredProducts.includes(product)
          ? "block"
          : "none";
      } else {
        container.style.display = "";
      }
    });
  }

  function handleFilterChange() {
    filteredProducts = filterProducts();
    updateSelectOptions(filteredProducts);
    updateProductVisibility(filteredProducts);
  }

  function clearFilters() {
    categorySelect.value = "";
    applicationSelect.value = "";
    tyreSizeSelect.value = "";
    rimSizeSelect.value = "";
    traCodeSelect.value = "";
    patternSelect.value = "";
    handleFilterChange();
    updateCounts(filteredProducts);
  }

  // Attach event listeners
  [
    categorySelect,
    applicationSelect,
    tyreSizeSelect,
    rimSizeSelect,
    traCodeSelect,
    patternSelect,
  ].forEach((select) => {
    select.addEventListener("change", () => {
      hasInteracted = true;
      handleFilterChange();
      updateCounts(filteredProducts);
    });
  });

  clearFiltersBtn.addEventListener("click", function (e) {
    e.preventDefault();
    hasInteracted = true;
    clearFilters();
  });

  // Initialize selects without filtering categories
  handleFilterChange();
});
