document.addEventListener("DOMContentLoaded", function () {
  /* -----------------------------------------------
   * 1. PARSE CSV STRINGS INTO ARRAYS
   * --------------------------------------------- */
  function parseCSV(str) {
    return str
      ? str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }

  /* -----------------------------------------------
   * 2. LOAD ALL PRODUCTS FROM HTML DATA
   * --------------------------------------------- */
  const products = [];
  document.querySelectorAll(".product-data").forEach((el) => {
    const product = {
      pattern: el.dataset.pattern,
      slug: el.dataset.slug,
      serialNo: parseFloat(el.dataset.serialno) || 0,
      category: parseCSV(el.dataset.category),
      equipment: parseCSV(el.dataset.equipment),
      rim: parseCSV(el.dataset.rim),
      size: parseCSV(el.dataset.size),
    };
    products.push(product);
  });
  console.log("Loaded products:", products);

  /* -----------------------------------------------
   * 3. DOM REFERENCES
   * --------------------------------------------- */
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const equipmentSelect = document.getElementById("equipment");
  const rimSelect = document.getElementById("rim");
  const sizeSelect = document.getElementById("size");
  const patternSelect = document.getElementById("pattern");
  const searchBtn = document.getElementById("searchBtn");
  const resultCount = document.getElementById("result-count");

  /* -----------------------------------------------
   * 4. HELPER FUNCTIONS
   * --------------------------------------------- */
  function resetSelect(select, placeholderText = "Select Option") {
    select.innerHTML = `<option value="">${placeholderText}</option>`;
    select.disabled = true;
  }

  function populateSelect(
    select,
    options,
    placeholderText = "Select Option",
    type = "default"
  ) {
    let uniqueOptions = [...new Set(options)];

    if (type === "rim") {
      uniqueOptions = sortRim(uniqueOptions);
    } else if (type === "size") {
      uniqueOptions = sortSize(uniqueOptions);
    } else {
      uniqueOptions = uniqueOptions.sort();
    }

    select.innerHTML = `<option value="">${placeholderText}</option>`;
    uniqueOptions.forEach((value) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    });
    select.disabled = uniqueOptions.length === 0;
  }

  function sortRim(options) {
    return options
      .map((v) => ({ value: v, num: parseFloat(v.replace(/[^0-9.]/g, "")) }))
      .sort((a, b) => a.num - b.num)
      .map((item) => item.value);
  }

  function sortSize(options) {
    return options
      .map((v) => {
        const match = v.match(/^([\d\.]+)/);
        const num = match ? parseFloat(match[1]) : Number.MAX_VALUE;
        return { value: v, num };
      })
      .sort((a, b) => {
        if (a.num !== b.num) {
          return a.num - b.num;
        }
        return a.value.localeCompare(b.value);
      })
      .map((item) => item.value);
  }

  function populatePatternSelect(
    select,
    options,
    placeholderText = "Select Pattern"
  ) {
    // Sort the pattern options by serialNo in ascending order
    const sortedOptions = options.sort((a, b) => a.serialNo - b.serialNo);

    select.innerHTML = `<option value="">${placeholderText}</option>`;
    sortedOptions.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.pattern;
      opt.textContent = item.pattern;
      select.appendChild(opt);
    });
    select.disabled = sortedOptions.length === 0;
  }

  function getSelectedCategory() {
    return (
      document.querySelector('input[name="category"]:checked')?.value || null
    );
  }

  function getCurrentSelections() {
    return {
      category: getSelectedCategory(),
      equipment: equipmentSelect.value || null,
      rim: rimSelect.value || null,
      size: sizeSelect.value || null,
      pattern: patternSelect.value || null,
    };
  }

  function normalizeCategory(cat) {
    return cat
      .toLowerCase()
      .replace(/\s*\/\s*/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  }

  function filterProducts() {
    const { category, equipment, rim, size, pattern } = getCurrentSelections();
    return products.filter((p) => {
      const normalizedCategories = p.category.map((c) => normalizeCategory(c));
      const matchCategory = category && normalizedCategories.includes(category);
      const matchEquipment = !equipment || p.equipment.includes(equipment);
      const matchRim = !rim || p.rim.includes(rim);
      const matchSize = !size || p.size.includes(size);
      const matchPattern = !pattern || p.pattern === pattern;
      return (
        matchCategory && matchEquipment && matchRim && matchSize && matchPattern
      );
    });
  }

  function updateResultCount(filtered) {
    resultCount.textContent = filtered.length;
  }

  function updateAllSelects() {
    const filtered = filterProducts();
    updateResultCount(filtered);

    const equipmentOptions = filtered.flatMap((p) =>
      p.equipment.length ? p.equipment : ["No Equipment Available"]
    );
    const rimOptions = filtered.flatMap((p) =>
      p.rim.length ? p.rim : ["No Rim Available"]
    );
    const sizeOptions = filtered.flatMap((p) =>
      p.size.length ? p.size : ["No Size Available"]
    );
    const patternOptions = filtered.map((p) => ({
      pattern: p.pattern,
      serialNo: p.serialNo,
    }));

    const selections = getCurrentSelections();

    populateSelect(equipmentSelect, equipmentOptions, "Select Equipment");
    populateSelect(rimSelect, rimOptions, "Select Rim", "rim");
    populateSelect(sizeSelect, sizeOptions, "Select Size", "size");
    populatePatternSelect(patternSelect, patternOptions, "Select Pattern");

    if (
      selections.equipment &&
      equipmentOptions.includes(selections.equipment)
    ) {
      equipmentSelect.value = selections.equipment;
    }
    if (selections.rim && rimOptions.includes(selections.rim)) {
      rimSelect.value = selections.rim;
    }
    if (selections.size && sizeOptions.includes(selections.size)) {
      sizeSelect.value = selections.size;
    }
    if (
      selections.pattern &&
      patternOptions.some((p) => p.pattern === selections.pattern)
    ) {
      patternSelect.value = selections.pattern;
    }
  }

  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      console.log("Category changed:", radio.value);

      document.querySelectorAll(".find-tyre---radio").forEach((label) => {
        label.classList.remove("active");
      });

      if (radio.checked) {
        radio.closest(".find-tyre---radio").classList.add("active");
      }

      // Reset selects with placeholder text
      resetSelect(equipmentSelect, "Select Equipment");
      resetSelect(rimSelect, "Select Rim");
      resetSelect(sizeSelect, "Select Size");
      resetSelect(patternSelect, "Select Pattern");

      // Enable search button
      searchBtn.disabled = false;
      console.log("Search button enabled");

      updateAllSelects();
    });
  });

  [equipmentSelect, rimSelect, sizeSelect, patternSelect].forEach((select) => {
    select.addEventListener("change", () => {
      updateAllSelects();
    });
  });

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const { category, equipment, rim, size, pattern } = getCurrentSelections();

    if (pattern) {
      const match = products.find((p) => p.pattern === pattern);
      if (match && match.slug) {
        window.location.href = `/product/${match.slug}`;
        return;
      }
    }

    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (equipment) params.append("equipment", equipment);
    if (rim) params.append("rim", rim);
    if (size) params.append("size", size);
    const redirectUrl = `/products?${params.toString()}`;
    window.location.href = redirectUrl;
  });

  console.log("Initializing form...");
  resetSelect(equipmentSelect, "Select Equipment");
  resetSelect(rimSelect, "Select Rim");
  resetSelect(sizeSelect, "Select Size");
  resetSelect(patternSelect, "Select Pattern");
  searchBtn.disabled = true;
  resultCount.textContent = "0";
});
