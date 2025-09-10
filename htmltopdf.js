document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("pdf-download")
    .addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "instant" }); // scroll instantly

      setTimeout(() => {
        const element = document.getElementById("res_table");

        html2canvas(element).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jspdf.jsPDF("p", "mm", "a4");

          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("download.pdf");
        });
      }, 300); // Delay for scroll to finish
    });
});
