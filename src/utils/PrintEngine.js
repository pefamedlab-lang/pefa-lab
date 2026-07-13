import html2pdf from "html2pdf.js";

const PrintEngine = {
  async print(id = "print-root") {
    const element = document.getElementById(id);

    if (!element) {
      console.error(`Print element "${id}" not found.`);
      return;
    }

    // Enable print layout
    document.body.classList.add("print-mode");

    // Wait for React rendering
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Wait for all images
    const images = element.querySelectorAll("img");

    await Promise.all(
      [...images].map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Small delay for browser layout
    await new Promise((resolve) => setTimeout(resolve, 300));

    window.print();

    window.onafterprint = () => {
      document.body.classList.remove("print-mode");
    };
  },

  async download(
    id = "print-root",
    filename = "Report.pdf"
  ) {
    const element = document.getElementById(id);

    if (!element) {
      console.error(`Print element "${id}" not found.`);
      return;
    }

    document.body.classList.add("pdf-mode");

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename,

          image: {
            type: "jpeg",
            quality: 1,
          },

          html2canvas: {
            scale: 4,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
            logging: false,
          },

          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },

          pagebreak: {
            mode: ["css", "legacy"],
          },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error(error);
      alert("Unable to generate PDF.");
    } finally {
      document.body.classList.remove("pdf-mode");
    }
  },
};

export default PrintEngine;