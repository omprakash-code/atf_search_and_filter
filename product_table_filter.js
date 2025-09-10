document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("res_table");
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const sizeSelect = document.getElementById("filter-size");
  const plySelect = document.getElementById("filter-ply");

  // Utility to get unique values from filtered rows
  function getUniqueFromRows(rows, attr) {
    return [
      ...new Set(rows.map((row) => row.dataset[attr]).filter(Boolean)),
    ].sort();
  }

  // Populate dropdown with options
  function updateDropdown(select, values, selectedValue) {
    const current = selectedValue || select.value;
    select.innerHTML = '<option value="">All</option>';
    values.forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      if (val === current) opt.selected = true;
      select.appendChild(opt);
    });
  }

  // Filter rows and update opposite dropdown dynamically
  function filterAndSync() {
    const selectedSize = sizeSelect.value;
    const selectedPly = plySelect.value;

    // Filter rows
    rows.forEach((row) => {
      const size = row.dataset.size;
      const ply = row.dataset.pr;
      const matchSize = !selectedSize || size === selectedSize;
      const matchPly = !selectedPly || ply === selectedPly;
      row.style.display = matchSize && matchPly ? "" : "none";
    });

    // Filter visible rows to update dropdown options
    const visibleRows = rows.filter((r) => r.style.display !== "none");

    // Sync dropdowns
    if (document.activeElement === sizeSelect) {
      updateDropdown(
        plySelect,
        getUniqueFromRows(
          rows.filter((r) => !selectedSize || r.dataset.size === selectedSize),
          "pr"
        ),
        selectedPly
      );
    } else if (document.activeElement === plySelect) {
      updateDropdown(
        sizeSelect,
        getUniqueFromRows(
          rows.filter((r) => !selectedPly || r.dataset.pr === selectedPly),
          "size"
        ),
        selectedSize
      );
    }
  }

  // Initial population
  const allSizes = getUniqueFromRows(rows, "size");
  const allPlys = getUniqueFromRows(rows, "pr");
  updateDropdown(sizeSelect, allSizes);
  updateDropdown(plySelect, allPlys);

  // Event listeners
  sizeSelect.addEventListener("change", filterAndSync);
  plySelect.addEventListener("change", filterAndSync);
});
