document.addEventListener("DOMContentLoaded", function () {
  const mainImg = document.querySelector(".main-image"); // main display image
  const thumbsContainer = document.querySelector(".collection-list-thumb"); // thumbs wrapper
  let thumbs = thumbsContainer.querySelectorAll(".thumb"); // all thumbs

  if (!mainImg || thumbs.length === 0) return;

  // Create a new thumb for the main image and insert it at first position
  const mainThumb = document.createElement("img");
  mainThumb.src = mainImg.src; // use the main image src
  mainThumb.classList.add("thumb");
  thumbsContainer.insertBefore(mainThumb, thumbsContainer.firstChild);

  // Refresh thumbs NodeList to include the new main thumb
  thumbs = thumbsContainer.querySelectorAll(".thumb");

  // Default: first thumb (the main image one) is active
  let activeThumb = thumbs[0];
  activeThumb.classList.add("active-thumb");

  thumbs.forEach((thumb) => {
    // Hover effect
    thumb.addEventListener("mouseenter", () => {
      thumb.style.cursor = "pointer";
      thumb.style.opacity = "0.8";
    });
    thumb.addEventListener("mouseleave", () => {
      thumb.style.opacity = "1";
    });

    // Click event
    thumb.addEventListener("click", () => {
      // const newSrc = thumb.src;

      // get correct URL from thumb
      const newSrc =
        thumb.getAttribute("data-src") || thumb.getAttribute("src");

      // Do nothing if the same thumb is clicked
      // if (thumb === activeThumb) return;
      if (thumb === activeThumb || newSrc === mainImg.getAttribute("src"))
        return;

      // fade out
      mainImg.style.opacity = 0;

      setTimeout(() => {
        // update src and srcset
        mainImg.setAttribute("src", newSrc);
        mainImg.setAttribute("srcset", newSrc);

        // fade back in
        mainImg.style.opacity = 1;
      }, 300);

      // Update active border
      activeThumb.classList.remove("active-thumb");
      thumb.classList.add("active-thumb");
      activeThumb = thumb;
    });
  });
});
